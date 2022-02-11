import { Common, Renderer } from "@k8slens/extensions";
import React from "react";
import { Link } from "react-router-dom";
import { Kustomization } from "../kustomize-controller/kustomization";
import { kustomizationStore } from "../kustomize-controller/kustomization-store";
import { bucketStore } from "../source-controller/bucket-store";
import { gitRepositoryStore } from "../source-controller/gitrepository-store";


const enum sortBy {
  name = "name",
  namespace = "namespace",
  ownerName = "ownername",
  ownerKind = "ownerkind",
  age = "age",

}

const {
  Component: {
    Badge,
  },
  Navigation: {
    getDetailsUrl
  }
} = Renderer;

const { stopPropagation } = Common.Util;

export class KustomizationsPage extends React.Component<{ extension: Renderer.LensExtension }> {
  getKustomizationSource(kustomization: Kustomization) {
    return <>Kind: {kustomization.spec.sourceRef.kind}<br />Name: {kustomization.spec.sourceRef.name}</>;
  }

  async componentDidMount() {
    await bucketStore.loadAll();
    await gitRepositoryStore.loadAll();
  }

  getSource(kustomization: Kustomization) {
    const selfLink = kustomization.getSourceRef(kustomization.spec.sourceRef.name, kustomization.spec.sourceRef.kind).selfLink;

    return <><Badge flat key={kustomization.spec.sourceRef.kind} className="sourceRef" tooltip={kustomization.spec.sourceRef.name} expandable={false} onClick={stopPropagation}>
      <Link to={getDetailsUrl(selfLink)}>
        {kustomization.spec.sourceRef.kind}
      </Link>
    </Badge></>;
  }

  checkSuspended(kustomization: Kustomization) {
    const ready = kustomization.spec?.suspend ? "Suspended" : kustomization.status.conditions[0].status;

    return ready;
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
          {title: "Last Applied Revision", className: "revision"},
        ]}
        renderTableContents={(kustomization: Kustomization) => [
          kustomization.getName(),
          kustomization.metadata.namespace,
          this.getSource(kustomization),
          kustomization.spec?.path ?? "",
          this.checkSuspended(kustomization),
          kustomization.status.lastAppliedRevision
        ]}
      />
    );
  }
}
