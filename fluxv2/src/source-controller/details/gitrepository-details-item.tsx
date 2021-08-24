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

@observer
export class GitRepositoryDetailsItem extends React.Component<Renderer.Component.KubeObjectDetailsProps<GitRepository>> {

  async componentDidMount() {
    await secretStore.loadAll();
  }

  render() {
    const { object: gitrepository } = this.props;

    if (!gitrepository) {
      return null;
    }

    const secretRef = secretStore.getByName(gitrepository.spec?.secretRef?.name);
    if (secretRef) {
      console.log(`secretRef selfLink: ${secretRef?.metadata?.selfLink}`);
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
          <Link to={getDetailsUrl(secretRef.metadata.selfLink)}>{gitrepository.spec?.secretRef?.name}</Link>
        </Renderer.Component.DrawerItem>
        {/* <DependsOnList kustomization={kustomization}/>
        <PostBuild kustomization={kustomization}/>
        <PostBuildFrom kustomization={kustomization}/> */}
      </div>
    );
  }
}
