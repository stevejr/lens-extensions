import "./kustomization-dependson-list.scss";

import { Renderer } from "@k8slens/extensions";
import React from "react";
import { observer } from "mobx-react";
import { ConfigMap, Secret } from "@k8slens/extensions/dist/src/renderer/api/endpoints";
import { Link } from "react-router-dom";
import type { Kustomization, SubstituteReference } from "../kustomization";

const {
  Component: {
    DrawerTitle,
    Table,
    TableCell,
    TableHead,
    TableRow
  },
  Navigation: {
    getDetailsUrl,
  }
} = Renderer;

interface Props {
  kustomization: Kustomization;
}

enum sortBy {
  name = "name",
  kind = "kind",
}

const cmStore: Renderer.K8sApi.KubeObjectStore<ConfigMap> =
  Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.configMapApi);

const secretStore: Renderer.K8sApi.KubeObjectStore<Secret> =
  Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.secretsApi);


@observer
export class PostBuildFrom extends React.Component<Props> {
  sortingCallbacks = {
    [sortBy.name]: (sub: SubstituteReference) => sub.name,
    [sortBy.kind]: (sub: SubstituteReference) => sub.kind,
  };

  getSubstituteFrom(kind: string, name: string) {
    switch (kind) {
      case "ConfigMap":
        return cmStore.getByName(name);
      case "Secret":
        return secretStore.getByName(name);
    } 
  }

  render() {
    const { kustomization } = this.props;

    if (!kustomization) return null;

    const { postBuild } = kustomization.spec;

    if (!postBuild?.substituteFrom) return null;

    return (
      <div className="PostBuildFrom flex column">
        <DrawerTitle title="Post Build - Substitutes from CMs and Secrets"/>
        <Table
          selectable
          scrollable={false}
          sortable={this.sortingCallbacks}
          sortByDefault={{ sortBy: sortBy.name, orderBy: "asc" }}
          sortSyncWithUrl={false}
          className="box grow"
          tableId="kustomizationSubstituteFromTable"
        >
          <TableHead>
            <TableCell className="name" sortBy={sortBy.name}>Name</TableCell>
            <TableCell className="kind" sortBy={sortBy.kind}>Kind</TableCell>
          </TableHead>
          {
            postBuild.substituteFrom.map(sub => {
              const subSelfLink = this.getSubstituteFrom(sub.kind, sub.name).selfLink;

              return (
                <TableRow
                  key={sub.name}
                  sortItem={sub}
                  nowrap
                >
                  <TableCell className="name"><Link to={getDetailsUrl(subSelfLink)}>{sub.name}</Link></TableCell>
                  <TableCell className="kind">{sub.kind}</TableCell>
                </TableRow>
              );
            })
          }
        </Table>
      </div>
    );
  }
}
