import { Renderer } from "@k8slens/extensions";
import React from "react";
import { GitRepositoriesPage } from "./src/pages/gitrepositories";
import { HelmChartsPage } from "./src/pages/helmcharts";
import { BucketsPage } from "./src/pages/buckets";
import { HelmRepositoriesPage } from "./src/pages/helmrepositories";
import { KustomizationsPage } from "./src/pages/kustomizations";
import { Kustomization } from "./src/kustomize-controller/kustomization";
import { KustomizationDetailsItem } from "./src/kustomize-controller/details/kustomization-details-item";
import { GitRepositoryDetailsItem } from "./src/source-controller/details/gitrepository-details-item";
import { GitRepository } from "./src/source-controller/gitrepository";
import { HelmChart } from "./src/source-controller/helmchart";
import { HelmChartDetailsItem } from "./src/source-controller/details/helmchart-details-item";
import { HelmReleasesPage } from "./src/pages/helmreleases";
import { HelmRelease } from "./src/helm-controller/helmrelease";
import { HelmReleaseDetailsItem } from "./src/helm-controller/details/helmrelease-details-item";
import { HelmRepository } from "./src/source-controller/helmrepository";
import { HelmRepositoryDetailsItem } from "./src/source-controller/details/helmrepository-details-item";
import { clusterSettings } from "./src/renderer/cluster-settings";
import { KubeResourcePage } from "./src/pages/kuberesourcepage";
import { KubeForceChart } from "./src/resourcemap/kubeforcechart";

const enum id {
  bucket = "bucket",
  gitRepository = "gitrepository",
  helmChart = "helmchart",
  helmRepository = "helmrepository",
  sources = "sources",
  kustomize = "kustomize",
  helmRelease = "helmrelease",
  resourceMap = "resourcemap"
}

export function DashboardIcon(props: Renderer.Component.IconProps) {
  return <Renderer.Component.Icon {...props} material="dashboard"/>;
}

export default class FluxV2Extension extends Renderer.LensExtension {

    clusterPages = [
      {
        id: id.sources,
        components: {
          Page: () => <GitRepositoriesPage extension={this}/>,
        }
      },
      {
        id: id.helmChart,
        components: {
          Page: () => <HelmChartsPage extension={this}/>,
        }
      },
      {
        id: id.bucket,
        components: {
          Page: () => <BucketsPage extension={this}/>,
        }
      },
      {
        id: id.helmRelease,
        components: {
          Page: () => <HelmReleasesPage extension={this}/>,
        }
      },
      {
        id: id.helmRepository,
        components: {
          Page: () => <HelmRepositoriesPage extension={this}/>,
        }
      },
      {
        id: id.kustomize,
        components: {
          Page: () => <KustomizationsPage extension={this}/>,
        }
      },
      {
        id: id.resourceMap,
        components: {
          Page: () => <KubeResourcePage extension={this}/>,
        }
      }
    ];

    clusterPageMenus = [
      {
        id: "flux",
        title: "FluxV2",
        components: {
          Icon: DashboardIcon
        }
      },
      {
        id: id.bucket,
        parentId: "flux",
        target: {pageId: id.bucket},
        title: "Bucket Sources",
        components: {
          Icon: DashboardIcon
        }
      },
      {
        id: id.sources,
        parentId: "flux",
        target: {pageId: id.sources},
        title: "GitRepository Sources",
        components: {
          Icon: DashboardIcon
        }
      },
      {
        id: id.helmChart,
        parentId: "flux",
        target: {pageId: id.helmChart},
        title: "HelmChart Sources",
        components: {
          Icon: DashboardIcon
        }
      },
      {
        id: id.helmRelease,
        parentId: "flux",
        target: {pageId: id.helmRelease},
        title: "HelmReleases",
        components: {
          Icon: DashboardIcon
        }
      },
      {
        id: id.helmRepository,
        parentId: "flux",
        target: {pageId: id.helmRepository},
        title: "HelmRepository Sources",
        components: {
          Icon: DashboardIcon
        }
      },
      {
        id: id.kustomize,
        parentId: "flux",
        target: {pageId: id.kustomize},
        title: "Kustomizations",
        components: {
          Icon: DashboardIcon
        }
      },
      {
        id: id.resourceMap,
        parentId: "flux",
        target: {pageId: id.resourceMap},
        title: "Resource Map",
        components: {
          Icon: MenuIcon
        }
      },
    ];

    kubeObjectDetailItems = [
      {
        kind: "GitRepository",
        apiVersions: ["source.toolkit.fluxcd.io/v1beta1"],
        priority: 10,
        components: {
          Details: (props: Renderer.Component.KubeObjectDetailsProps<GitRepository>) => <GitRepositoryDetailsItem {...props} />
        }
      },
      {
        kind: "HelmChart",
        apiVersions: ["source.toolkit.fluxcd.io/v1beta1"],
        priority: 10,
        components: {
          Details: (props: Renderer.Component.KubeObjectDetailsProps<HelmChart>) => <HelmChartDetailsItem {...props} />
        }
      },
      {
        kind: "HelmRelease",
        apiVersions: ["helm.toolkit.fluxcd.io/v2beta1"],
        priority: 10,
        components: {
          Details: (props: Renderer.Component.KubeObjectDetailsProps<HelmRelease>) => <HelmReleaseDetailsItem {...props} />
        }
      },
      {
        kind: "HelmRepository",
        apiVersions: ["source.toolkit.fluxcd.io/v1beta1"],
        priority: 10,
        components: {
          Details: (props: Renderer.Component.KubeObjectDetailsProps<HelmRepository>) => <HelmRepositoryDetailsItem {...props} />
        }
      },
      {
        kind: "Kustomization",
        apiVersions: ["kustomize.toolkit.fluxcd.io/v1beta1"],
        priority: 10,
        components: {
          Details: (props: Renderer.Component.KubeObjectDetailsProps<Kustomization>) => <KustomizationDetailsItem {...props} />
        }
      }
    ];

    kubeWorkloadsOverviewItems = [
      {
        priority: 25,
        components : {
          Details: () => { return (
            <div className="ResourceMapOverviewDetail">
              <div className="header flex gaps align-center">
                <h5 className="box grow">Resources</h5>
              </div>
              <div className="content">
                <KubeForceChart height={480} />
              </div>
            </div>
          )}
        }
      }
    ]

    entitySettings = [...clusterSettings]
}

export function MenuIcon(props: Renderer.Component.IconProps): React.ReactElement {
  return (
    <Renderer.Component.Icon
      material="bubble_chart"
      onClick={() => this.navigate()}
    />
  )
}
