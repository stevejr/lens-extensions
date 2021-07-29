import { Renderer } from '@k8slens/extensions';
import { Namespace } from '@k8slens/extensions/dist/src/renderer/api/endpoints';
import React from 'react';
import { GitRepository } from '../source-controller/gitrepository';
import { gitRepositoryStore } from '../source-controller/gitrepository-store';

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

export class GitRepositoriesPage extends React.Component<{ extension: Renderer.LensExtension }> {
  getGitRef(gitRepository: GitRepository) {
    if (gitRepository.spec.ref?.semver) {
      return gitRepository.spec.ref.semver
    };
    if (gitRepository.spec.ref?.tag) {
      return gitRepository.spec.ref.tag
    };
    if (gitRepository.spec.ref?.branch) {
      return gitRepository.spec.ref.branch
    };
    if (gitRepository.spec.ref?.commit) {
      return gitRepository.spec.ref.commit
    };
  }
  
  render() {
    return (
      <Renderer.Component.KubeObjectListLayout 
        tableId="gitRepositoryTable"
        className="GitRepository" store={gitRepositoryStore}
        sortingCallbacks={{
            [sortBy.name]: (gitRepository: GitRepository) => gitRepository.getName(),
            [sortBy.namespace]: (gitRepository: GitRepository) => gitRepository.metadata.namespace,
            [sortBy.url]: (gitRepository: GitRepository) => gitRepository.spec.url,
        }}
        searchFilters={[
            (gitRepository: GitRepository) => gitRepository.getSearchFields()
        ]}
        renderHeaderTitle="GitRepository"
        renderTableHeader={[
            {title: "Name", className: "name", sortBy: sortBy.name},
            {title: "Namespace", className: "namespace", sortBy: sortBy.namespace},
            {title: "URL", className: "url", sortBy: sortBy.url},
            {title: "Git Reference", className: "gitRef"},
            {title: "Ready", className: "ready"},
            {title: "Revision", className: "revision"},
        ]}
        renderTableContents={(gitRepository: GitRepository) => [
            gitRepository.getName(),
            gitRepository.metadata.namespace,
            gitRepository.spec.url,
            this.getGitRef(gitRepository),
            gitRepository.status.conditions[0].type,
            gitRepository.status.conditions[0].message
        ]}
    />
    )
  }
}

// import { Renderer } from "@k8slens/extensions";
// import React from "react"

// export class FluxSourcesPage extends React.Component<{ extension: Renderer.LensExtension }> {
//   render() {
//     return (
//       <div>
//         <p>Hello world!</p>
//       </div>
//     )
//   }
// }
