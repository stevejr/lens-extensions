import {Renderer} from "@k8slens/extensions";
import React from "react"
import {GitRepository} from "./src/source-controller/gitrepository"
import {GitRepositoriesPage} from "./src/pages/gitrepositories"
import {HelmChartsPage} from "./src/pages/helmcharts"

const enum id {
  bucket = 'bucket',
  gitRepository = 'gitrepository',
  helmChart = 'helmchart',
  helmRepository = 'helmrepository',
  sources = 'sources'
}

export function DashboardIcon(props: Renderer.Component.IconProps) {
    return <Renderer.Component.Icon {...props} material="dashboard"/>
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
    ];

    // kubeObjectDetailItems = [
    //   {
    //     kind: GitRepository.kind,
    //     apiVersions: ["source.toolkit.fluxcd.io/v1beta1"],
    //     components: {
    //         Details: (props: VulnerabilityReportDetailsProps) => <VulnerabilityReportDetails
    //             showObjectMeta={true} {...props} />
    //     }
    //   }
    // ];
}
