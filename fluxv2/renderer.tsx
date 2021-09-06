import { Renderer } from "@k8slens/extensions";
import React from "react";
import { GitRepositoriesPage } from "./src/pages/gitrepositories";
import { HelmChartsPage } from "./src/pages/helmcharts";
import { BucketsPage } from "./src/pages/buckets";
import { HelmRepositoriesPage } from "./src/pages/helmrepositories";
import { KustomizationPage } from "./src/pages/kustomizations";
import { Kustomization } from "./src/kustomize-controller/kustomization";
import { KustomizationDetailsItem } from "./src/kustomize-controller/details/kustomization-details-item";
import { GitRepositoryDetailsItem } from "./src/source-controller/details/gitrepository-details-item";
import { GitRepository } from "./src/source-controller/gitrepository";
import { HelmChart } from "./src/source-controller/helmchart";
import { HelmChartDetailsItem } from "./src/source-controller/details/helmchart-details-item";

const enum id {
  bucket = "bucket",
  gitRepository = "gitrepository",
  helmChart = "helmchart",
  helmRepository = "helmrepository",
  sources = "sources",
  kustomize = "kustomize"
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
        id: id.helmRepository,
        components: {
          Page: () => <HelmRepositoriesPage extension={this}/>,
        }
      },
      {
        id: id.kustomize,
        components: {
          Page: () => <KustomizationPage extension={this}/>,
        }
      },
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
        parentId: "flux",
        target: {pageId: id.bucket},
        title: "Bucket Sources",
        components: {
          Icon: DashboardIcon
        }
      },
      {
        parentId: "flux",
        target: {pageId: id.sources},
        title: "GitRepository Sources",
        components: {
          Icon: DashboardIcon
        }
      },
      {
        parentId: "flux",
        target: {pageId: id.helmChart},
        title: "HelmChart Sources",
        components: {
          Icon: DashboardIcon
        }
      },
      {
        parentId: "flux",
        target: {pageId: id.helmRepository},
        title: "HelmRepository Sources",
        components: {
          Icon: DashboardIcon
        }
      },
      {
        parentId: "flux",
        target: {pageId: id.kustomize},
        title: "Kustomizations",
        components: {
          Icon: DashboardIcon
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
        kind: "Kustomization",
        apiVersions: ["kustomize.toolkit.fluxcd.io/v1beta1"],
        priority: 10,
        components: {
          Details: (props: Renderer.Component.KubeObjectDetailsProps<Kustomization>) => <KustomizationDetailsItem {...props} />
        }
      }
    ];
}
