import { Renderer } from "@k8slens/extensions";
import React from "react";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { GitRepository } from "../gitrepository";

const {
  Component: {
    KubeObjectMeta
  },
  Navigation: {
    getDetailsUrl
  }
} = Renderer;

const secretStore: Renderer.K8sApi.KubeObjectStore<Renderer.K8sApi.Secret> =
  Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.secretsApi);

@observer
export class GitRepositoryDetailsItem extends React.Component<Renderer.Component.KubeObjectDetailsProps<GitRepository>> {

  async componentDidMount() {
    await secretStore.loadAll();
  }

  getSecretRef(repo: GitRepository) {
    const secretRef = secretStore.getByName(repo.spec?.secretRef?.name);

    if (secretRef) {
      return <Link to={getDetailsUrl(secretRef.metadata.selfLink)}>{repo.spec?.secretRef?.name}</Link>;
    }

    return "";
  }

  render() {
    const { object: gitRepository } = this.props;

    if (!gitRepository) {
      return null;
    }

    const ready = gitRepository.spec?.suspend ? "Suspended" : gitRepository.status.conditions[0].status;

    return (
      <div className="GitRepositoryDetailsItem">
        <KubeObjectMeta object={gitRepository} />
        <Renderer.Component.DrawerItem name="Ready">
          {ready}
        </Renderer.Component.DrawerItem>
        <Renderer.Component.DrawerItem name="Latest Condition Message">
          {gitRepository.status?.conditions[0]?.message ?? ""}
        </Renderer.Component.DrawerItem>
        <Renderer.Component.DrawerItem name="Last Applied Revision">
          {gitRepository.status.conditions[0].message}
        </Renderer.Component.DrawerItem>
        <Renderer.Component.DrawerItem name="URL">
          {gitRepository.spec?.url ?? ""}
        </Renderer.Component.DrawerItem>
        <Renderer.Component.DrawerItem name="Interval">
          {gitRepository.spec?.interval}
        </Renderer.Component.DrawerItem>
        <Renderer.Component.DrawerItem name="Secret Ref">
          {this.getSecretRef(gitRepository)}
        </Renderer.Component.DrawerItem>
        {/* <DependsOnList kustomization={kustomization}/>
        <PostBuild kustomization={kustomization}/>
        <PostBuildFrom kustomization={kustomization}/> */}
      </div>
    );
  }
}
