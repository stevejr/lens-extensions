import { Renderer } from "@k8slens/extensions";
import React from "react";
import { observer } from "mobx-react";
import yaml from "js-yaml";
import type { HelmRelease, PostRenderer } from "../helmrelease";

const {
  Component: {
    DrawerTitle,
    Input
  },
} = Renderer;

interface Props {
  helmRelease: HelmRelease;
}

@observer
export class HelmReleasePostRenderer extends React.Component<Props> {
  
  processKustomizeData(postRenderers: PostRenderer[]) {

    const renderers: Object[] = [];

    const filtered = [...postRenderers.values()].filter((item: PostRenderer) => item.kustomize);

    if (filtered.length === 0) return [];

    filtered.forEach((postRenderer) => {
      postRenderer?.kustomize?.patchesStrategicMerge?.forEach((renderer) => {
        renderers.push(renderer);
      });

      postRenderer?.kustomize?.patchesJson6902?.forEach((renderer) => {
        renderers.push(renderer);
      });

      postRenderer?.kustomize?.images?.forEach((renderer) => {
        renderers.push(renderer);
      });
    });
    
    return renderers;
  }

  render() {
    const { helmRelease } = this.props;

    if (!helmRelease.spec.postRenderers) return null;

    const postRenderers = this.processKustomizeData(helmRelease.spec.postRenderers);

    if (postRenderers.length === 0) return null;

    return (
      <div className="PostRenderers flex column">
        <DrawerTitle>Post Renderers</DrawerTitle>
        <div className="postRenderersData">
          <Input
            multiLine
            theme="round-black"
            className="box grow"
            value={yaml.dump(postRenderers) ?? ""}
          />
        </div>
      </div>
    );
  }
}
