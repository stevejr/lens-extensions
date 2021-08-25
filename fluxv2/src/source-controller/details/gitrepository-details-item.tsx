import { Renderer } from "@k8slens/extensions";
import React from "react";
import { observer } from "mobx-react";
import { Secret } from "@k8slens/extensions/dist/src/renderer/api/endpoints";
import { Link } from "react-router-dom";
import { Kustomization } from "../../kustomize-controller/kustomization";
import { GitRepository } from "../gitrepository";
// import { DependsOnList } from "../components/kustomization-dependson-list";
// import { KustomizationSource } from "../components/kustomization-source";
// import { PostBuild } from "../components/kustomization-postbuild";
// import { PostBuildFrom } from "../components/kustomization-postbuild-from";

const {
  Component: {
    KubeObjectMeta
  },
  Navigation: {
    getDetailsUrl
  }
} = Renderer;

const secretStore: Renderer.K8sApi.KubeObjectStore<Secret> =
  Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.secretsApi);

interface Props {
  gitrepository: GitRepository;
}
@observer
export class GitRepositoryDetailsItem extends React.Component<Renderer.Component.KubeObjectDetailsProps<GitRepository>> {

  async componentDidMount() {
    await secretStore.loadAll();
  }

  getSecretRef(repo: GitRepository) {
    const secretRef = secretStore.getByName(repo.spec?.secretRef?.name);
    if (secretRef) {
      return <Link to={getDetailsUrl(secretRef.metadata.selfLink)}>{repo.spec?.secretRef?.name}</Link>
    }
    return ""
  }

  render() {
    const { object: gitrepository } = this.props;

    if (!gitrepository) {
      return null;
    }

    return (
      <div className="GitRepositoryDetailsItem">
        <KubeObjectMeta object={gitrepository} />
        <Renderer.Component.DrawerItem name="Ready">
          {gitrepository.status.conditions[0].status}
        </Renderer.Component.DrawerItem>
        <Renderer.Component.DrawerItem name="Last Applied Revision">
          {gitrepository.status.conditions[0].message}
        </Renderer.Component.DrawerItem>
        <Renderer.Component.DrawerItem name="URL">
          {gitrepository.spec?.url ?? ""}
        </Renderer.Component.DrawerItem>
        <Renderer.Component.DrawerItem name="Interval">
          {gitrepository.spec?.interval}
        </Renderer.Component.DrawerItem>
        <Renderer.Component.DrawerItem name="Secret Ref">
          {this.getSecretRef(gitrepository)}
        </Renderer.Component.DrawerItem>
        {/* <DependsOnList kustomization={kustomization}/>
        <PostBuild kustomization={kustomization}/>
        <PostBuildFrom kustomization={kustomization}/> */}
      </div>
    );
  }
}
