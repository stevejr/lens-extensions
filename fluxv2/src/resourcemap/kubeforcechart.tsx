import "./KubeForceChart.scss";
import { Renderer } from "@k8slens/extensions";
import { comparer, makeObservable, observable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import React, { createRef, Fragment, MutableRefObject } from "react";
import { ForceGraph2D } from 'react-force-graph';
import * as d3 from "d3-force";
import ReactDOM from "react-dom";
// import { PodTooltip, ServiceTooltip, DeploymentTooltip, StatefulsetTooltip, DefaultTooltip} from "./tooltips";
import { ChartDataSeries, LinkObject, NodeObject } from "../helpers/types";
import { config } from "../helpers/config";
import { fluxKinds } from "../helpers/flux-config";
import { GitRepositoryStore, gitRepositoryStore } from "../source-controller/gitrepository-store";
import { helmChartStore } from "../source-controller/helmchart-store";
import { helmReleaseStore } from "../helm-controller/helmrelease-store";
import { helmRepositoryStore } from "../source-controller/helmrepository-store";
import { kustomizationStore } from "../kustomize-controller/kustomization-store";

import { GitRepository } from "../source-controller/gitrepository";
import { CrossNamespaceDependencyReference, CrossNamespaceSourceReference, Kustomization } from "../kustomize-controller/kustomization";
import { KubeObject } from "@k8slens/extensions/dist/src/renderer/api/kube-object";
import { HelmRelease } from "../helm-controller/helmrelease";
import { HelmChart } from "../source-controller/helmchart";
import { HelmRepository } from "../source-controller/helmrepository";

const d33d = require("d3-force-3d");

export interface KubeForceChartProps {
  id?: string; // html-id to bind chart
  width?: number;
  height?: number;
  widthRef?: string;
}

interface State {
  data: {
    nodes: ChartDataSeries[];
    links: LinkObject[];
  };
  highlightLinks?: Set<LinkObject>;
  hoverNode?: NodeObject;
}

@observer
export class KubeForceChart extends React.Component<KubeForceChartProps, State> {
  @observable static  isReady = false;
  @observable isUnmounting = false;
  @observable data: State;

  static defaultProps: KubeForceChartProps = {
    id: "kube-resources-map"
  }

  static config = config;

  protected links: LinkObject[] = [];
  protected nodes: ChartDataSeries[] = [];
  protected highlightLinks: Set<LinkObject> = new Set<LinkObject>();


  protected images: {[key: string]: HTMLImageElement; } = {}
  protected config = KubeForceChart.config
  private chartRef: MutableRefObject<any>;
  protected secretsData: any = [];
  protected configMapsData: any = [];
  protected helmData: any = [];

  protected namespaceStore = (Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.namespacesApi) as unknown) as Renderer.K8sApi.NamespaceStore;
  protected podsStore = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.podsApi) as Renderer.K8sApi.PodsStore;
  protected deploymentStore = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.deploymentApi) as Renderer.K8sApi.DeploymentStore;
  protected statefulsetStore = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.statefulSetApi) as Renderer.K8sApi.StatefulSetStore;
  protected daemonsetStore = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.daemonSetApi) as Renderer.K8sApi.DaemonSetStore;
  protected secretStore = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.secretsApi) as Renderer.K8sApi.SecretsStore;
  protected serviceStore = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.serviceApi) as Renderer.K8sApi.ServiceStore;
  protected pvcStore = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.pvcApi) as Renderer.K8sApi.VolumeClaimStore;
  protected ingressStore =  Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.ingressApi) as Renderer.K8sApi.IngressStore;
  protected configMapStore = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.configMapApi) as Renderer.K8sApi.ConfigMapsStore;
  protected crdStore = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.crdApi) as Renderer.K8sApi.CRDStore;

  private kubeObjectStores: Renderer.K8sApi.KubeObjectStore[] = []
  private watchDisposers: Function[] = [];

  state: Readonly<State> = {
    data: {
      nodes: [],
      links: []
    },
    highlightLinks: new Set<LinkObject>()
  }

  initZoomDone: boolean = false;

  constructor(props: KubeForceChartProps) {
    super(props);

    makeObservable(this);
    this.chartRef = createRef();
    this.generateImages();
  }

  async componentDidMount() {
    this.setState(this.state)
    this.kubeObjectStores = [
      this.podsStore,
      this.deploymentStore,
      this.statefulsetStore,
      this.daemonsetStore,
      this.serviceStore,
      this.ingressStore,
      this.pvcStore,
      this.configMapStore,
      this.secretStore,
      this.crdStore,
      gitRepositoryStore,
      kustomizationStore,
      helmChartStore,
      helmReleaseStore,
      helmRepositoryStore
    ]
    await this.loadData();

    this.displayChart();

    const fg = this.chartRef.current;
    fg.zoom(1.3, 1000);

    fg?.d3Force('link').strength(1.3).distance(() => 60)
    fg?.d3Force('charge', d33d.forceManyBody().strength(-60).distanceMax(250));
    fg?.d3Force('collide', d3.forceCollide(40));
    fg?.d3Force("center", d3.forceCenter());
    const reactionOpts = {
      equals: comparer.structural,
    }
    disposeOnUnmount(this, [
      reaction(() => this.namespaceStore.selectedNamespaces, this.namespaceChanged, reactionOpts),
      reaction(() => this.podsStore.items.toJSON(), () => { this.refreshItems(this.podsStore) }, reactionOpts),
      reaction(() => this.daemonsetStore.items.toJSON(), () => { this.refreshItems(this.daemonsetStore) }, reactionOpts),
      reaction(() => this.statefulsetStore.items.toJSON(), () => { this.refreshItems(this.statefulsetStore) }, reactionOpts),
      reaction(() => this.deploymentStore.items.toJSON(), () => { this.refreshItems(this.deploymentStore) }, reactionOpts),
      reaction(() => this.serviceStore.items.toJSON(), () => { this.refreshItems(this.serviceStore) }, reactionOpts),
      reaction(() => this.secretStore.items.toJSON(), () => { this.refreshItems(this.secretStore) }, reactionOpts),
      reaction(() => this.pvcStore.items.toJSON(), () => { this.refreshItems(this.pvcStore) }, reactionOpts),
      reaction(() => this.ingressStore.items.toJSON(), () => { this.refreshItems(this.ingressStore) }, reactionOpts),
      reaction(() => this.configMapStore.items.toJSON(), () => { this.refreshItems(this.configMapStore) }, reactionOpts),
      reaction(() => this.crdStore.items.toJSON(), () => { this.refreshItems(this.crdStore) }, reactionOpts),
      reaction(() => gitRepositoryStore.items.toJSON(), () => { this.refreshItems(gitRepositoryStore) }, reactionOpts),
      reaction(() => kustomizationStore.items.toJSON(), () => { this.refreshItems(kustomizationStore) }, reactionOpts),
      reaction(() => helmChartStore.items.toJSON(), () => { this.refreshItems(helmChartStore) }, reactionOpts),
      reaction(() => helmReleaseStore.items.toJSON(), () => { this.refreshItems(helmReleaseStore) }, reactionOpts),
      reaction(() => helmRepositoryStore.items.toJSON(), () => { this.refreshItems(helmRepositoryStore) }, reactionOpts),
    ])
  }

  namespaceChanged = () => {
    if (KubeForceChart.isReady) {
      this.displayChart();
    }
  }

  displayChart = () => {
    this.nodes = [];
    this.links = [];
    this.initZoomDone = false;
    this.generateChartDataSeries();
  }

  getLinksForNode(node: ChartDataSeries): LinkObject[] {
    return this.links.filter((link) => link.source == node || link.target == node )
  }

  handleNodeHover(node: ChartDataSeries) {
    const highlightLinks = new Set<LinkObject>();
    const elem = document.getElementById(this.props.id);
    elem.style.cursor = node ? 'pointer' : null
    if (node) {
      this.getLinksForNode(node).forEach(link => highlightLinks.add(link));
    }
    this.setState({ highlightLinks: highlightLinks, hoverNode: node})
  }

  generateImages() {
    Object.entries(this.config).forEach(value => {
      const img = new Image();
      img.src = value[1].icon;
      this.config[value[0]].img = img;
    })
  }

  componentWillUnmount() {
    this.isUnmounting = true;
    this.unsubscribeStores();
  }

  protected refreshItems(store: Renderer.K8sApi.KubeObjectStore) {
    // remove deleted objects
    this.nodes.filter(node => node.kind == store.api.kind).forEach(node => {
      if (!store.items.includes(node.object as Renderer.K8sApi.KubeObject)) {
        if (["DaemonSet", "StatefulSet", "Deployment"].includes(node.kind)) {
          const helmReleaseName = this.getHelmReleaseName(node.object)
          if (helmReleaseName) {
            const helmReleaseNode = this.getHelmReleaseChartNode(helmReleaseName, node.namespace)
            if (this.getLinksForNode(helmReleaseNode).length === 1) {
              this.deleteNode({ node: helmReleaseNode })
            }
          }
        }
        this.deleteNode(node);
      }
    })
    this.generateChartDataSeries()
  }

  protected unsubscribeStores() {
    this.watchDisposers.forEach(dispose => dispose());
    this.watchDisposers.length = 0;
  }

  protected async loadData() {
    this.unsubscribeStores();
    for (const store of this.kubeObjectStores) {
      try {
        if(!store.isLoaded) {
          await store.loadAll();
        }
        const unsuscribe = store.subscribe();
        this.watchDisposers.push(unsuscribe);
      } catch (error) {
        console.error("loading store error", error);
      }
    }
    KubeForceChart.isReady = true;
  }

  generateChartDataSeries = () => {
    const nodes = [...this.nodes];
    const links = [...this.links];

    this.generateGitRepositories();
    this.generateHelmRepositories();
    this.generateKustomizations();
    this.generateHelmCharts();
    this.generateHelmReleases();

    // this.generateSecrets();
    // this.generateVolumeClaims();
    this.generateDeployments();
    this.generateStatefulSets();
    // this.generateDaemonSets();
    this.generatePods();
    // this.generateServices();
    // this.generateIngresses();

    // this.generateCRDs();

    if (!nodes.length || nodes.length != this.nodes.length || links.length != this.links.length) { // TODO: Improve the logic
      this.setState({
        data: {
          nodes: this.nodes,
          links: this.links,
        },
        highlightLinks: new Set<LinkObject>()
      })
    }

  }

  protected generatePods() {
    const { podsStore } = this;
    const { selectedNamespaces} = this.namespaceStore;
    podsStore.getAllByNs(selectedNamespaces).map((pod: Renderer.K8sApi.Pod) => {
      this.getPodNode(pod);
    });
  }

  protected generateDeployments() {
    const { deploymentStore } = this;
    const { selectedNamespaces} = this.namespaceStore;

    deploymentStore.getAllByNs(selectedNamespaces).map((deployment: Renderer.K8sApi.Deployment) => {
      const pods = deploymentStore.getChildPods(deployment)
      this.getControllerChartNode(deployment, pods);
    });
  }

  protected generateStatefulSets() {
    const { statefulsetStore } = this;
    const { selectedNamespaces} = this.namespaceStore;

    statefulsetStore.getAllByNs(selectedNamespaces).map((statefulset: Renderer.K8sApi.StatefulSet) => {
      const pods = statefulsetStore.getChildPods(statefulset)
      this.getControllerChartNode(statefulset, pods);
    });
  }

  protected generateDaemonSets() {
    const { daemonsetStore } = this;
    const { selectedNamespaces} = this.namespaceStore;

    daemonsetStore.getAllByNs(selectedNamespaces).map((daemonset: Renderer.K8sApi.DaemonSet) => {
      const pods = daemonsetStore.getChildPods(daemonset)
      this.getControllerChartNode(daemonset, pods)
    });
  }

  protected generateSecrets() {
    const { secretStore } = this;
    const { selectedNamespaces} = this.namespaceStore;

    secretStore.getAllByNs(selectedNamespaces).forEach((secret: Renderer.K8sApi.Secret) => {
      // Ignore service account tokens and tls secrets
      if (["kubernetes.io/service-account-token", "kubernetes.io/tls"].includes(secret.type.toString())) return;

      const secretNode = this.generateNode(secret);

      if (secret.type.toString() === "helm.sh/release.v1") {
        const helmReleaseNode = this.getHelmReleaseChartNode(secret.metadata.labels.name, secret.getNs())
        this.addLink({source: secretNode.id, target: helmReleaseNode.id});
      }

      // search for container links
      this.nodes.filter(node => node.kind === "Pod" && node.namespace == secret.getNs()).forEach((podNode) => {
        const pod = (podNode.object as Renderer.K8sApi.Pod)
        pod.getContainers().forEach((container) => {
          container.env?.forEach((env) => {
            const secretName = env.valueFrom?.secretKeyRef?.name;
            if (secretName == secret.getName()) {
              this.addLink({
                source: podNode.id, target: secretNode.id
              })
            }
          })
          container.envFrom?.map(envFrom => {
            const secretName = envFrom.secretRef?.name;
            if (secretName && secretName == secret.getName()) {
              this.addLink({
                source: podNode.id, target: secretNode.id
              })
            }
          })
        })
      })
    })
  }

  protected generateVolumeClaims() {
    const { pvcStore } = this;
    const { selectedNamespaces} = this.namespaceStore;

    pvcStore.getAllByNs(selectedNamespaces).forEach((pvc: Renderer.K8sApi.PersistentVolumeClaim) => {
      this.generateNode(pvc);
    })
  }

  protected generateIngresses() {
    const { ingressStore } = this
    const { selectedNamespaces } = this.namespaceStore;
    ingressStore.getAllByNs(selectedNamespaces).forEach((ingress: Renderer.K8sApi.Ingress) => {

      const ingressNode = this.generateNode(ingress);
      ingress.spec.tls?.filter(tls => tls.secretName).forEach((tls) => {
        const secret = this.secretStore.getByName(tls.secretName, ingress.getNs());
        if (secret) {
          const secretNode = this.generateNode(secret)
          if (secretNode) {
            this.addLink({ source: ingressNode.id, target: secretNode.id })
          }
        }
      })
      ingress.spec.rules.forEach((rule) => {
        rule.http.paths.forEach((path) => {
          const serviceName = (path.backend as any).serviceName || (path.backend as any).service.name
          if (serviceName) {
            const service = this.serviceStore.getByName(serviceName, ingress.getNs());
            if (service) {
              const serviceNode = this.generateNode(service)
              if (serviceNode) {
                this.addLink({ source: ingressNode.id, target: serviceNode.id });
              }
            }
          }
        })
      })
    })
  }

  protected generateServices() {
    const { serviceStore, podsStore} = this
    const { selectedNamespaces } = this.namespaceStore;
    serviceStore.getAllByNs(selectedNamespaces).forEach((service: Renderer.K8sApi.Service) => {
      const serviceNode = this.generateNode(service);
      const selector = service.spec.selector;
      if (selector) {
        const pods = podsStore.items.filter((item: Renderer.K8sApi.Pod) => {
          const itemLabels = item.metadata.labels || {};
          let matches = item.getNs() == service.getNs()
          if (matches) {
            matches = Object.entries(selector)
              .every(([key, value]) => {
                return itemLabels[key] === value
              });
          }
          return matches
        });
        pods.forEach((pod: Renderer.K8sApi.Pod) => {
          const podNode = this.findNode(pod)
          if (podNode) {
            const serviceLink = { source: podNode.id, target: serviceNode.id}
            this.addLink(serviceLink);
          }
        })
      }
    })

  }

  protected generateGitRepositories() {
    const { selectedNamespaces} = this.namespaceStore;
    gitRepositoryStore.getAllByNs(selectedNamespaces).map((gitRepository: GitRepository) => {
      this.generateNode(gitRepository);
    });
  }

  protected generateKustomizations() {
    const { selectedNamespaces} = this.namespaceStore;
    kustomizationStore.getAllByNs(selectedNamespaces).map((kustomization: Kustomization) => {
      const ksNode = this.generateNode(kustomization);
      const sourceRefKs = kustomization.getSourceRef(kustomization.spec?.sourceRef.name, kustomization.spec?.sourceRef.kind);
      const sourceRefLink = { source: this.findNode(sourceRefKs).id, target: ksNode.id };
      this.addLink(sourceRefLink);
      });
  }

  protected generateHelmCharts() {
    const { selectedNamespaces} = this.namespaceStore;
    helmChartStore.getAllByNs(selectedNamespaces).map((helmChart: HelmChart) => {
      const helmChartNode = this.generateNode(helmChart);

      const helmChartSourceNode = this.nodes.find(node => node.kind == helmChart.spec.sourceRef.kind && node.name == helmChart.spec.sourceRef.name);

      if (helmChartSourceNode) {
        const helmChartControllerLink = { source: helmChartSourceNode.id, target: helmChartNode.id };
        this.addLink(helmChartControllerLink);
      }
    });
  }

  protected generateHelmReleases() {
    const { selectedNamespaces} = this.namespaceStore;
    helmReleaseStore.getAllByNs(selectedNamespaces).map((helmRelease: HelmRelease) => {
      const helmReleaseNode = this.generateNode(helmRelease);
      const ksControllerNode = this.findNode(kustomizationStore.getByName(helmRelease.metadata.labels["kustomize.toolkit.fluxcd.io/name"], helmRelease.metadata.labels["kustomize.toolkit.fluxcd.io/namespace"]));

      if (ksControllerNode) {
        const ksControllerLink = { source: ksControllerNode.id, target: helmReleaseNode.id };
        this.addLink(ksControllerLink);
      }

      const helmChartNode = this.nodes.find(node => node.kind == helmRelease.spec.chart.spec.sourceRef.kind && node.namespace && helmRelease.spec.chart.spec.sourceRef.namespace && node.name == helmRelease.spec.chart.spec.sourceRef.name);
      if (helmChartNode) {
        const helmChartControllerLink = { source: helmChartNode.id, target: helmReleaseNode.id };
        this.addLink(helmChartControllerLink);
      }
    });
  }

  protected generateHelmRepositories() {
    const { selectedNamespaces} = this.namespaceStore;
    helmRepositoryStore.getAllByNs(selectedNamespaces).map((helmRepository: HelmRepository) => {
      const helmReleaseNode = this.generateNode(helmRepository);
      const ksControllerNode = this.findNode(kustomizationStore.getByName(helmRepository.metadata.labels["kustomize.toolkit.fluxcd.io/name"], helmRepository.metadata.labels["kustomize.toolkit.fluxcd.io/namespace"]));

      if (ksControllerNode) {
        const ksControllerLink = { source: ksControllerNode.id, target: helmReleaseNode.id };
        this.addLink(ksControllerLink);
      }
    });
  }

  protected processKustomization(cr: KubeObject, ksNode: ChartDataSeries) {

    const ks = kustomizationStore.getByName(cr.getName(), cr.getNs());
    const sourceRefKs = ks.getSourceRef(ks.spec?.sourceRef.name, ks.spec?.sourceRef.kind);
    const sourceRefLink = { source: this.findNode(sourceRefKs).id, target: ksNode.id };

    this.addLink(sourceRefLink);

      // const { dependsOn } = kustomization.spec;

      // if (!dependsOn) return; 
      
      // dependsOn.forEach((kz: CrossNamespaceDependencyReference) => {
      //   const kzDependsOnNode = this.findNode(kustomizationStore.getByName(kz.name, kz.namespace));

      //   if (kzDependsOnNode) {
      //     const dependsOnLink = { source: kzDependsOnNode.id, target: kustomizeNode.id}
      //     this.addLink(dependsOnLink);
      //   }
      // });
  }

  protected generateCRDs() {
    const { selectedNamespaces} = this.namespaceStore;

    this.crdStore.items.forEach((crd: Renderer.K8sApi.CustomResourceDefinition) => {
      console.log(`Processing CRD Store: ${crd.getName()}, APIVersion: ${crd.apiVersion}, Kind: ${crd.kind}, ResourceApiBase: ${crd.getResourceApiBase()}`);

      const store = Renderer.K8sApi.apiManager.getStore(crd.getResourceApiBase());

      store.getAllByNs(selectedNamespaces).forEach((cr: Renderer.K8sApi.KubeObject ) => {
        console.log(`Processing CR: ${cr.getNs()}/${cr.getName()}, APIVersion: ${cr.apiVersion}, Kind: ${cr.kind}`);
        if(cr?.metadata?.labels && cr?.metadata?.labels["kustomize.toolkit.fluxcd.io/name"]) {
          console.log(`Processing CR under Flux control`);

          const isNonFluxCRD = !fluxKinds.includes(cr.kind) ? true : false; 
          const crNode = this.generateNode(cr, isNonFluxCRD);

          if (cr.kind === "Kustomization") {
            console.log(`Processing Kustomization: ${cr.getName()}`);
            // process kustomization
            this.processKustomization(cr, crNode);
          }
        }
      })
    })
  }

  protected addLink(link: LinkObject) {
    const linkExists = this.findLink(link);

    if (!linkExists) {
      this.links.push(link);
    }
  }

  protected findLink(link: LinkObject) {
    return this.links.find(existingLink => (existingLink.source === link.source || (existingLink.source as NodeObject).id === link.source) && (existingLink.target === link.target || (existingLink.target as NodeObject).id === link.target))
  }
  protected findNode(object: Renderer.K8sApi.KubeObject) {
    if (!object) {
      return null;
    }

    return this.nodes.find(node => node.kind == object.kind && node.namespace && object.getNs() && node.name == object.getName())
  }

  protected deleteNode(opts: {node?: ChartDataSeries; object?: Renderer.K8sApi.KubeObject}) {
    const node = opts.node || this.findNode(opts.object);

    if(!node) {
      return;
    }

    this.getLinksForNode(node).forEach(link => {
      this.links.splice(this.links.indexOf(link), 1);
    })

    this.nodes.splice(this.nodes.indexOf(node), 1);
  }

  generateNode(object: Renderer.K8sApi.KubeObject, isCRD: boolean = false): ChartDataSeries {
    const existingNode = this.findNode(object);

    if (existingNode) {
      return existingNode;
    }

    const id = `${object.kind}-${object.getName()}`;
    const { color, img, size } = isCRD == false ? this.config[object.kind.toLowerCase()] : this.config["customresourcedefinition"];

    const chartNode: ChartDataSeries = {
      id: id,
      object: object,
      kind: object.kind,
      name: object.getName(),
      namespace: object.getNs(),
      value: size,
      color: color,
      image: img,
      visible: true
    }

    this.nodes.push(chartNode)

    return chartNode;
  }

  getControllerChartNode(object: Renderer.K8sApi.KubeObject, pods: Renderer.K8sApi.Pod[]): ChartDataSeries {
    const controllerNode = this.generateNode(object);
    pods.forEach((pod: Renderer.K8sApi.Pod) => {
      const podNode = this.getPodNode(pod)
      this.addLink({ source: controllerNode.id, target: podNode.id})
    })
    // const releaseName = this.getHelmReleaseName(object);

    // if (releaseName) {
    //   const release = this.getHelmReleaseChartNode(releaseName, object.getNs())
    //   this.addLink({target: release.id, source: controllerNode.id})
    // }

    const fluxReleaseName = this.getFluxHelmReleaseName(object);

    if (fluxReleaseName) {
      const release = this.nodes.find(node => node.kind == HelmRelease.kind && node.namespace && object.metadata.labels["helm.toolkit.fluxcd.io/namespace"] && node.name == object.metadata.labels["helm.toolkit.fluxcd.io/name"]);
      this.addLink({target: release.id, source: controllerNode.id})
    }
    return controllerNode
  }

  getFluxHelmReleaseName(object: Renderer.K8sApi.KubeObject): string {
    if (object.metadata?.labels && object.metadata?.annotations && object.metadata?.labels["helm.toolkit.fluxcd.io/name"] && object.metadata?.annotations["meta.helm.sh/release-name"]) {
      return object.metadata.labels["helm.toolkit.fluxcd.io/name"]
    }
    return null
  }

  getHelmReleaseName(object: Renderer.K8sApi.KubeObject): string {
    if (object.metadata?.labels?.heritage === "Helm" && object.metadata?.labels?.release) {
      return object.metadata.labels.release
    }
    if (object.metadata?.labels && object.metadata?.annotations && object.metadata?.labels["app.kubernetes.io/managed-by"] == "Helm" && object.metadata?.annotations["meta.helm.sh/release-name"]) {
      return object.metadata.annotations["meta.helm.sh/release-name"]
    }
    return null
  }

  getKustomizeName(object: Renderer.K8sApi.KubeObject): string {
    if (object.metadata?.labels && object.metadata?.labels["kustomize.toolkit.fluxcd.io/name"]) {
      return object.metadata?.labels["kustomize.toolkit.fluxcd.io/name"]
    }
  }

  getPodNode(pod: Renderer.K8sApi.Pod): ChartDataSeries {
    const podNode = this.generateNode(pod);
    if (["Running", "Succeeded"].includes(pod.getStatusMessage())) {
      podNode.color = "#4caf50";
    }
    else if (["Terminating", "Terminated", "Completed"].includes(pod.getStatusMessage())) {
      podNode.color = "#9dabb5";
    }
    else if (["Pending", "ContainerCreating"].includes(pod.getStatusMessage())) {
      podNode.color = "#2F4F4F" // #ff9800"
    }
    else if (["CrashLoopBackOff", "Failed", "Error"].includes(pod.getStatusMessage())) {
      podNode.color = "#ce3933"
    }
    pod.getContainers().forEach((container) => {
      container.env?.forEach((env) => {
        const secretName = env.valueFrom?.secretKeyRef?.name;
        if (secretName) {
          const secret = this.secretStore.getByName(secretName, pod.getNs());
          if (secret) {
            const secretNode = this.generateNode(secret)
            this.addLink({
              source: podNode.id, target: secretNode.id
            })
          }
        }
      })
      container.envFrom?.forEach((envFrom) => {
        const configMapName = envFrom.configMapRef?.name;
        if (configMapName) {
          const configMap = this.configMapStore.getByName(configMapName, pod.getNs());
          if (configMap) {
            const configMapNode = this.generateNode(configMap);
            this.addLink({
              source: podNode.id, target: configMapNode.id
            })
          }
        }

        const secretName = envFrom.secretRef?.name;
        if (secretName) {
          const secret = this.secretStore.getByName(secretName, pod.getNs());
          if (secret) {
            const secretNode = this.generateNode(secret);
            this.addLink({
              source: podNode.id, target: secretNode.id
            })
          }
        }
      })
    })


    pod.getVolumes().filter(volume => volume.persistentVolumeClaim?.claimName).forEach((volume) => {
      const volumeClaim = this.pvcStore.getByName(volume.persistentVolumeClaim.claimName, pod.getNs())
      if (volumeClaim) {
        const volumeClaimNode = this.generateNode(volumeClaim);

        if (volumeClaimNode) {
          this.addLink({ target: podNode.id, source: volumeClaimNode.id});
        }
      }
    })


    pod.getVolumes().filter(volume => volume.configMap?.name).forEach((volume) => {
      const configMap = this.configMapStore.getByName(volume.configMap.name, pod.getNs());
      if (configMap) {
        const dataItem = this.generateNode(configMap);
        if (dataItem) {
          this.addLink({target: podNode.id, source: dataItem.id});
        }
      }
    })
    pod.getSecrets().forEach((secretName) => {
      const secret = this.secretStore.getByName(secretName, pod.getNs());
      if (secret && secret.type.toString() !== "kubernetes.io/service-account-token") {
        const dataItem = this.generateNode(secret)
        if (dataItem) {
          this.addLink({target: podNode.id, source: dataItem.id});
        }
      }
    })

    return podNode;
  }

  getHelmReleaseChartNode(name: string, namespace: string): ChartDataSeries {
    const releaseObject = new Renderer.K8sApi.KubeObject({
      apiVersion: "v1",
      kind: "HelmRelease",
      metadata: {
        uid: "",
        namespace: namespace,
        name: name,
        resourceVersion: "1",
        selfLink: `api/v1/helmreleases/${name}`
      }
    })
    const releaseData = this.generateNode(releaseObject);
    return releaseData;
  }

  // renderTooltip(obj: Renderer.K8sApi.KubeObject) {
  //   if (!obj) return;

  //   const tooltipElement = document.getElementById("KubeForceChart-tooltip");

  //   if (tooltipElement) {
  //     if (obj instanceof Renderer.K8sApi.Pod) {
  //       ReactDOM.render(<PodTooltip obj={obj} />, tooltipElement)
  //     }
  //     else if (obj instanceof Renderer.K8sApi.Service) {
  //       ReactDOM.render(<ServiceTooltip obj={obj} />, tooltipElement)
  //     }
  //     else if (obj instanceof Renderer.K8sApi.Deployment) {
  //       ReactDOM.render(<DeploymentTooltip obj={obj} />, tooltipElement)
  //     }
  //     else if (obj instanceof Renderer.K8sApi.StatefulSet) {
  //       ReactDOM.render(<StatefulsetTooltip obj={obj} />, tooltipElement)
  //     }
  //     else {
  //       ReactDOM.render(<DefaultTooltip obj={obj}/>, tooltipElement)
  //     }
  //     return tooltipElement.innerHTML;
  //   }
  // }

  render() {
    if (!KubeForceChart.isReady) {
      return (
        <div className="KubeForceChart flex center">
          <Renderer.Component.Spinner />
        </div>
      )
    }
    const theme = Renderer.Theme.getActiveTheme();

    const { id, width, height } = this.props;
    const sidebarWidth = (document.querySelectorAll('[data-testid="cluster-sidebar"]')[0] as HTMLElement)?.offsetWidth || 200;
    return (
      <div id={id} className="KubeForceChart">
        <div id="KubeForceChart-tooltip"/>
        <ForceGraph2D
          dagMode={'td'}
          dagLevelDistance={300}
          linkDirectionalArrowRelPos={1}
          linkDirectionalArrowLength={3.5}
          graphData={this.state.data}
          ref={this.chartRef}
          width={width || window.innerWidth - 70 - sidebarWidth }
          height={height || window.innerHeight}
          autoPauseRedraw={false}
          linkWidth={link => this.state.highlightLinks.has(link) ? 2 : 1}
          maxZoom={2}
          cooldownTicks={200}
          onEngineStop={() => {
            if (!this.initZoomDone) {
              if (this.nodes.length > 10) {
                this.chartRef.current.zoomToFit(400);
              } else {
                this.chartRef.current.zoom(1.2);
              }
              this.initZoomDone = true;
            }
          }}
          onNodeHover={this.handleNodeHover.bind(this)}
          onNodeDrag={this.handleNodeHover.bind(this)}
          nodeVal="value"
          // nodeLabel={ (node: ChartDataSeries) => { return this.renderTooltip(node.object)} }
          nodeVisibility={"visible"}
          linkColor={(link) => { return (link.source as ChartDataSeries).color }}
          onNodeClick={(node: ChartDataSeries) => {
            if (node.object) {
              // if (node.object.kind == "HelmRelease") {
              //   const path = `/apps/releases/${node.object.getNs()}/${node.object.getName()}?`
              //   Renderer.Navigation.navigate(path);
              // } else {
                const detailsUrl = Renderer.Navigation.getDetailsUrl(node.object.selfLink);
                Renderer.Navigation.navigate(detailsUrl);
              // }
            }
          }}
          nodeCanvasObject={(node: ChartDataSeries, ctx, globalScale) => {
            const padAmount = 0;
            const label = node.name;
            const fontSize = 8;

            const r = Math.sqrt(Math.max(0, node.value || 10)) * 4 + padAmount;

            // draw outer circle
            if (["Deployment", "DaemonSet", "StatefulSet"].includes(node.kind)) {
              ctx.beginPath();
              ctx.lineWidth = 2;
              ctx.arc(node.x , node.y, r + 3, 0, 2 * Math.PI, false);
              ctx.strokeStyle = node.color;
              ctx.stroke();
              ctx.fillStyle = theme.colors["secondaryBackground"];
              ctx.fill();
              ctx.closePath();
            }

            // draw circle
            const size = this.state.hoverNode == node ? r + 1 : r

            ctx.beginPath();
            ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
            ctx.fillStyle = node.color || 'rgba(31, 120, 180, 0.92)';
            ctx.fill();

            // draw icon
            const image = node.image;
            if (image) {
              try {
                ctx.drawImage(image, node.x - 15, node.y - 15, 30, 30);
              } catch (e) {
                console.error(e);
              }

            }

            // draw label
            ctx.textAlign = 'center';
            ctx.font = `${fontSize}px Arial`;
            ctx.textBaseline = 'middle';
            ctx.fillStyle = theme.colors["textfPrimary"];
            ctx.fillText(label, node.x, node.y + r + (10 / globalScale));
          }}
        />
      </div>
    )
  }
}
