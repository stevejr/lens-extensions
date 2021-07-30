import { Renderer } from '@k8slens/extensions';
import { Namespace } from '@k8slens/extensions/dist/src/renderer/api/endpoints';
import React from 'react';
import { HelmRepository } from '../source-controller/helmrepository';
import { helmRepositoryStore } from '../source-controller/helmrepository-store';

const nsStore: Renderer.K8sApi.KubeObjectStore<Namespace> =
Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.namespacesApi);

const enum sortBy {
  name = 'name',
  namespace = "namespace",
  url = 'url'
}

const renderLabels = (labels?: Record<string, string>) =>
  labels && Object.entries(labels || {})
    .map(([key, value]) => `${key}=${value}`)
    .map(label => <Renderer.Component.Badge key={label} label={label}/>);

export class HelmRepositoriesPage extends React.Component<{ extension: Renderer.LensExtension }> {
  render() {
    return (
      <Renderer.Component.KubeObjectListLayout 
        tableId="helmRepositoryTable"
        className="HelmRepository" store={helmRepositoryStore}
        sortingCallbacks={{
            [sortBy.name]: (helmRepository: HelmRepository) => helmRepository.getName(),
            [sortBy.namespace]: (helmRepository: HelmRepository) => helmRepository.metadata.namespace,
            [sortBy.url]: (helmRepository: HelmRepository) => helmRepository.spec.url,
        }}
        searchFilters={[
            (helmRepository: HelmRepository) => helmRepository.getSearchFields()
        ]}
        renderHeaderTitle="HelmRepository"
        renderTableHeader={[
            {title: "Name", className: "name", sortBy: sortBy.name},
            {title: "Namespace", className: "namespace", sortBy: sortBy.namespace},
            {title: "URL", className: "url", sortBy: sortBy.url},
            {title: "Ready", className: "ready"},
            {title: "Revision", className: "revision"},
        ]}
        renderTableContents={(helmRepository: HelmRepository) => [
            helmRepository.getName(),
            helmRepository.metadata.namespace,
            helmRepository.spec.url,
            helmRepository.status.conditions[0].status,
            helmRepository.status.conditions[0].message
        ]}
    />
    )
  }
}
