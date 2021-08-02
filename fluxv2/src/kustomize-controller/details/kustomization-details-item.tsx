import { Renderer } from "@k8slens/extensions";
import React from "react";
import { observer } from "mobx-react";
import { Kustomization } from "../kustomization"
import { DependsOnList } from "../components/kustomization-dependson-list"

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
        <DependsOnList kustomization={kustomization}/>
      </div>
    )
  }
}