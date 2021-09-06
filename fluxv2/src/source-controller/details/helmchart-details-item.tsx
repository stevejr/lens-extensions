import { Renderer } from "@k8slens/extensions";
import React from "react";
import { observer } from "mobx-react";
import { HelmChart } from "../helmchart";
import { HelmChartSource } from "../components/helmchart-source";

const {
  Component: {
    KubeObjectMeta
  },
} = Renderer;


@observer
export class HelmChartDetailsItem extends React.Component<Renderer.Component.KubeObjectDetailsProps<HelmChart>> {

  render() {
    const { object: helmChart } = this.props;

    if (!helmChart) {
      return null;
    }

    return (
      <div className="HelmChartDetailsItem">
        <KubeObjectMeta object={helmChart} />
        <Renderer.Component.DrawerItem name="Ready">
          {helmChart.status.conditions[0].status}
        </Renderer.Component.DrawerItem>
        <Renderer.Component.DrawerItem name="Last Applied Revision">
          {helmChart.status.artifact.revision}
        </Renderer.Component.DrawerItem>
        <Renderer.Component.DrawerItem name="Interval">
          {helmChart.spec?.interval}
        </Renderer.Component.DrawerItem>
        <HelmChartSource helmChart={helmChart}/>
      </div>
    );
  }
}
