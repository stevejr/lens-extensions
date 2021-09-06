import { Renderer } from "@k8slens/extensions";
import React from "react";
import { observer } from "mobx-react";
import { HelmRelease } from "../helmrelease";
import { HelmReleaseSource } from "../components/helmrelease-source";
import { HelmReleaseValues } from "../components/helmrelease-values";
import { HelmReleasePostRenderer } from "../components/helmrelease-postrenderer";

const {
  Component: {
    KubeObjectMeta
  },
} = Renderer;


@observer
export class HelmReleaseDetailsItem extends React.Component<Renderer.Component.KubeObjectDetailsProps<HelmRelease>> {

  render() {
    const { object: helmRelease } = this.props;

    if (!helmRelease) {
      return null;
    }

    return (
      <div className="HelmReleaseDetailsItem">
        <KubeObjectMeta object={helmRelease} />
        <Renderer.Component.DrawerItem name="Ready">
          {helmRelease.status.conditions[0].status}
        </Renderer.Component.DrawerItem>
        <Renderer.Component.DrawerItem name="Release Name">
          {helmRelease.spec?.releaseName ?? ""}
        </Renderer.Component.DrawerItem>
        <Renderer.Component.DrawerItem name="Storage Namespace">
          {helmRelease.spec?.storageNamespace ?? ""}
        </Renderer.Component.DrawerItem>
        <Renderer.Component.DrawerItem name="Target Namespace">
          {helmRelease.spec?.targetNamespace ?? ""}
        </Renderer.Component.DrawerItem>
        <Renderer.Component.DrawerItem name="Last Applied Revision">
          {helmRelease.status.lastAppliedRevision}
        </Renderer.Component.DrawerItem>
        <Renderer.Component.DrawerItem name="Interval">
          {helmRelease.spec?.interval}
        </Renderer.Component.DrawerItem>
        <HelmReleaseSource helmRelease={helmRelease}/>
        <HelmReleaseValues helmRelease={helmRelease}/>
        <HelmReleasePostRenderer helmRelease={helmRelease}/>
      </div>
    );
  }
}
