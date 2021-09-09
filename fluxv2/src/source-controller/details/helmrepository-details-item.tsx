import { Renderer } from "@k8slens/extensions";
import React from "react";
import { observer } from "mobx-react";
import { Secret } from "@k8slens/extensions/dist/src/renderer/api/endpoints";
import { Link } from "react-router-dom";
import { HelmRepository } from "../helmrepository";

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
  helmRepository: HelmRepository;
}

@observer
export class HelmRepositoryDetailsItem extends React.Component<Renderer.Component.KubeObjectDetailsProps<HelmRepository>> {

  async componentDidMount() {
    await secretStore.loadAll();
  }

  getSecretRef(repo: HelmRepository) {
    const secretRef = secretStore.getByName(repo.spec?.secretRef?.name);

    if (secretRef) {
      return <Link to={getDetailsUrl(secretRef.metadata.selfLink)}>{repo.spec?.secretRef?.name}</Link>;
    }

    return "";
  }

  render() {
    const { object: helmRepository } = this.props;

    if (!helmRepository) {
      return null;
    }

    const ready = helmRepository.spec?.suspend ? "Suspended" : helmRepository.status.conditions[0].status;

    return (
      <div className="HelmRepositoryDetailsItem">
        <KubeObjectMeta object={helmRepository} />
        <Renderer.Component.DrawerItem name="Ready">
          {ready}
        </Renderer.Component.DrawerItem>
        <Renderer.Component.DrawerItem name="Last Applied Revision">
          {helmRepository.status.conditions[0].message}
        </Renderer.Component.DrawerItem>
        <Renderer.Component.DrawerItem name="URL">
          {helmRepository.spec?.url ?? ""}
        </Renderer.Component.DrawerItem>
        <Renderer.Component.DrawerItem name="Interval">
          {helmRepository.spec?.interval}
        </Renderer.Component.DrawerItem>
      </div>
    );
  }
}
