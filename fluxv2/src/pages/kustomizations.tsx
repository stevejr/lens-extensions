import { Renderer } from '@k8slens/extensions';
import { Namespace } from '@k8slens/extensions/dist/src/renderer/api/endpoints';
import React from 'react';
import { Kustomization } from '../kustomize-controller/kustomization';
import { kustomizationStore } from '../kustomize-controller/kustomization-store';

const nsStore: Renderer.K8sApi.KubeObjectStore<Namespace> =
Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.namespacesApi);

const enum sortBy {
  name = 'name',
  namespace = "namespace",
  ownerName = 'ownername',
  ownerKind = 'ownerkind',
  age = 'age',
}

const renderLabels = (labels?: Record<string, string>) =>
  labels && Object.entries(labels || {})
    .map(([key, value]) => `${key}=${value}`)
    .map(label => <Renderer.Component.Badge key={label} label={label}/>);

export class KustomizationPage extends React.Component<{ extension: Renderer.LensExtension }> {
  getKustomizationSource(kustomization: Kustomization) {
    return <>Kind: {kustomization.spec.sourceRef.kind}<br />Name: {kustomization.spec.sourceRef.name}</>
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
        ]}
        renderTableContents={(kustomization: Kustomization) => [
          kustomization.getName(),
          kustomization.metadata.namespace,
          this.getKustomizationSource(kustomization),
          kustomization.spec?.path ?? ""
        ]}
        tableProps={{
          customRowHeights: (item: Kustomization, lineHeight, paddings) => {
            return 2 * lineHeight + paddings;
          }
        }}
    />
    )
  }
}

