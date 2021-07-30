import "./kustomization-dependson-list.scss";

import { Renderer } from "@k8slens/extensions";
import React from "react";
import { observer } from "mobx-react";
import type { CrossNamespaceDependencyReference, Kustomization } from "../kustomization";
import { kustomizationStore } from "../kustomization-store";

const {
  Component: {
    KubeObjectMenu,
    DrawerTitle,
    Table,
    TableCell,
    TableHead,
    TableRow
  },
  Navigation: {
    getDetailsUrl,
    showDetails
  }
} = Renderer;

enum sortBy {
  name = "name",
  namespace = "namespace",
}

interface Props {
  kustomization: Kustomization;
}

@observer
export class DependsOnList extends React.Component<Props> {
  private sortingCallbacks = {
    [sortBy.name]: (dependsOn: CrossNamespaceDependencyReference) => dependsOn.name,
    [sortBy.namespace]: (dependsOn: CrossNamespaceDependencyReference) => dependsOn?.namespace,
  };

  private getDependantSelfLink(name: string) {
    return kustomizationStore.getByName(name).selfLink;
  }

  render() {
    const { kustomization } = this.props;

    if (!kustomization) return null;

    const { dependsOn } = kustomization.spec;

    if (!dependsOn) return null;

    return (
      <div className="DependsOn flex column">
        <DrawerTitle title="DependsOn"/>
        <Table
          selectable
          scrollable={false}
          sortable={this.sortingCallbacks}
          sortByDefault={{ sortBy: sortBy.name, orderBy: "asc" }}
          sortSyncWithUrl={false}
          className="box grow"
          tableId="kustomizationDetailsTable"
        >
          <TableHead>
            <TableCell className="name" sortBy={sortBy.name}>Name</TableCell>
            <TableCell className="namespace" sortBy={sortBy.namespace}>Namespace</TableCell>
          </TableHead>
          {
            dependsOn.map(dependent => {
              return (
                <TableRow
                  key={dependent.name}
                  sortItem={dependent}
                  nowrap
                  onClick={ (event) => { event.preventDefault(); showDetails(this.getDependantSelfLink(dependent.name), false)}}
                >
                  <TableCell className="name">{dependent.name}</TableCell>
                  <TableCell className="namespace">{dependent?.namespace ?? ""}</TableCell>
                </TableRow>
              );
            })
          }
        </Table>
      </div>
    );
  }
}

// {pods.map(pod => (
//   <Link key={pod.getId()} to={getDetailsUrl(pod.selfLink)}>
//     {pod.getName()}
//   </Link>
// ))}
