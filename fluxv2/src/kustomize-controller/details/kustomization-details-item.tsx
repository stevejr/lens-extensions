import { Renderer } from "@k8slens/extensions";
import React from "react";
import { observer } from "mobx-react";
import { Kustomization } from "../kustomization"
import { DependsOnList } from "../components/kustomization-dependson-list"
import { KustomizationSource } from "../components/kustomization-source"
import { PostBuild } from "../components/kustomization-postbuild"

const {
  Component: {
    DrawerItem,
    DrawerTitle,
    KubeObjectMeta
  },
} = Renderer;

type Namespace = Renderer.K8sApi.Namespace;
type Pod = Renderer.K8sApi.Pod;

@observer
export class KustomizationDetailsItem extends React.Component<Renderer.Component.KubeObjectDetailsProps<Kustomization>> {

  render() {
    const { object: kustomization } = this.props;
    if (!kustomization) {
      return null;
    }

    return (
      <div className='KustomizationDetailsItem'>
        <KubeObjectMeta object={kustomization} />
        <Renderer.Component.DrawerItem name="Ready">
            {kustomization.status.conditions[0].status}
        </Renderer.Component.DrawerItem>
        <Renderer.Component.DrawerItem name="Last Applied Revision">
            {kustomization.status.lastAppliedRevision}
        </Renderer.Component.DrawerItem>
        <Renderer.Component.DrawerItem name="Path">
            {kustomization.spec?.path ?? ""}
        </Renderer.Component.DrawerItem>
        <Renderer.Component.DrawerItem name="Prune">
            {kustomization.spec?.prune ? "true" : "false"}
        </Renderer.Component.DrawerItem>
        <Renderer.Component.DrawerItem name="Interval">
            {kustomization.spec?.interval}
        </Renderer.Component.DrawerItem>
        <Renderer.Component.DrawerItem name="Force">
            {kustomization.spec?.force ? "true" : "false"}
        </Renderer.Component.DrawerItem>
        <KustomizationSource kustomization={kustomization}/>
        <DependsOnList kustomization={kustomization}/>
        <PostBuild kustomization={kustomization}/>
      </div>
    )
  }
}
