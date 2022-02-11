import "./KubeResourcePage.scss"
import React from "react";
import { Common, Renderer } from "@k8slens/extensions";
import { KubeForceChart } from "../resourcemap/kubeforcechart";
import { KubeResourceChartLegend } from "../resourcemap/kuberesourcechartlegend";

export class KubeResourcePage extends React.Component<{ extension: Renderer.LensExtension }> {
  render() {
    return (
      <Renderer.Component.TabLayout className="KubeResourcePage">
        <header className="flex gaps align-center">
          <h2 className="flex gaps align-center">
            <span>Resource Map</span>
            <Renderer.Component.Icon material="info" tooltip={<KubeResourceChartLegend/>}/>
          </h2>
          <div className="box right">
          <Renderer.Component.NamespaceSelectFilter />
          </div>
        </header>
        <KubeForceChart />
      </Renderer.Component.TabLayout>
    );
  }
}
