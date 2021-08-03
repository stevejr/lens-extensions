import { Renderer } from "@k8slens/extensions";
import React from "react";
import { Kustomization } from "../kustomize-controller/kustomization";
import { kustomizationStore } from "../kustomize-controller/kustomization-store";

const enum sortBy {
  name = "name",
  namespace = "namespace",
  ownerName = "ownername",
  ownerKind = "ownerkind",
  age = "age",

}

export class KustomizationPage extends React.Component<{ extension: Renderer.LensExtension }> {
  getKustomizationSource(kustomization: Kustomization) {
    return <>Kind: {kustomization.spec.sourceRef.kind}<br />Name: {kustomization.spec.sourceRef.name}</>;
  }

  render() {
    return (
      <Renderer.Component.KubeObjectListLayout 
        tableId="kustomizationTable"
        className="Kustomization" store={kustomizationStore}
        sortingCallbacks={{
          [sortBy.name]: (kustomization: Kustomization) => kustomization.getName(),
          [sortBy.namespace]: (kustomization: Kustomization) => kustomization.metadata.namespace,
        }}
        searchFilters={[
          (kustomization: Kustomization) => kustomization.getSearchFields()
        ]}
        renderHeaderTitle="Kustomization"
        renderTableHeader={[
          {title: "Name", className: "name", sortBy: sortBy.name},
          {title: "Namespace", className: "namespace", sortBy: sortBy.namespace},
          {title: "Source", className: "Source"},
          {title: "Path", className: "path"},
          {title: "Ready", className: "ready"},
          {title: "Revision", className: "revision"},
        ]}
        renderTableContents={(kustomization: Kustomization) => [
          kustomization.getName(),
          kustomization.metadata.namespace,
          this.getKustomizationSource(kustomization),
          kustomization.spec?.path ?? "",
          kustomization.status.conditions[0].status,
          kustomization.status.conditions[0].message
        ]}
        tableProps={{
          customRowHeights: (item: Kustomization, lineHeight, paddings) => {
            return 2 * lineHeight + paddings;
          }
        }}
      />
    );
  }
}
