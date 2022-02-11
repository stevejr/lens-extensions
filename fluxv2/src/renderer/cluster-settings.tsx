import React from "react";
import { Common } from "@k8slens/extensions";
import { FluxSetting } from "./components/FluxSetting";

export const clusterSettings = [
  {
    apiVersions: ["entity.k8slens.dev/v1alpha1"],
    kind: "KubernetesCluster",
    group: "GitOps",
    title: "Flux",
    priority: 5,
    components: {
      View: ({ entity = null }: { entity: Common.Catalog.KubernetesCluster }) => {
        return (
          <FluxSetting cluster={entity} />
        );
      },
    },
  }
];
