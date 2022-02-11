import { Renderer, Common } from "@k8slens/extensions";
import { computed, makeObservable, observable } from "mobx";
import React from "react";
import { observer } from "mobx-react";
import yaml from "js-yaml";

const {
  K8sApi: {
    forCluster, StatefulSet, DaemonSet, Deployment,
  },
  Component: {
    SubTitle, FormSwitch, Switcher, Button,
  },
} = Renderer;

interface Props {
  cluster: Common.Catalog.KubernetesCluster;
}

@observer
export class FluxSetting extends React.Component<Props> {

  constructor(props: Props) {
    super(props);
    makeObservable(this);
  }

  async componentDidMount() {}

  render() {
    return (
      <>
          <section>
            <p>
              Flux settings requires Flux to be installed in the cluster.
            </p>
          </section>
      </>
    );
  }
}
