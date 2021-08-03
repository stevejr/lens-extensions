import { Renderer } from "@k8slens/extensions";
import React from "react";
import { GitRepository } from "../source-controller/gitrepository";
import { gitRepositoryStore } from "../source-controller/gitrepository-store";

const enum sortBy {
  name = "name",
  namespace = "namespace",
  url = "url"

}

export class GitRepositoriesPage extends React.Component<{ extension: Renderer.LensExtension }> {
  getGitRef(gitRepository: GitRepository) {
    if (gitRepository.spec.ref?.semver) {
      return gitRepository.spec.ref.semver;
    }

    if (gitRepository.spec.ref?.tag) {
      return gitRepository.spec.ref.tag;
    }

    if (gitRepository.spec.ref?.branch) {
      return gitRepository.spec.ref.branch;
    }

    if (gitRepository.spec.ref?.commit) {
      return gitRepository.spec.ref.commit;
    }
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
          gitRepository.status.conditions[0].status,
          gitRepository.status.conditions[0].message
        ]}
      />
    );
  }
}
