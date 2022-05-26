import { Renderer } from "@k8slens/extensions";
import React from "react";
import { observer } from "mobx-react";
import yaml from "js-yaml";
import type { HelmRelease } from "../helmrelease";

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
export class HelmReleaseValues extends React.Component<Props> {
  render() {
    const { helmRelease } = this.props;

    if (!helmRelease) return null;

    if (!helmRelease.spec?.values) return null;

    return (
      <div className="Values flex column">
        <DrawerTitle>Values</DrawerTitle>
        <div className="valueData">
          <Input
            multiLine
            theme="round-black"
            className="box grow"
            value={yaml.dump(helmRelease.spec?.values) ?? ""}
          />
        </div>
      </div>
    );
  }
}
