import "./kustomization-dependson-list.scss";

import { Renderer } from "@k8slens/extensions";
import React from "react";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";
import type { CrossNamespaceDependencyReference, Kustomization } from "../kustomization";
import { kustomizationStore } from "../kustomization-store";

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

enum sortBy {
  name = "name",
  namespace = "namespace",
}

interface Props {
  kustomization: Kustomization;
}

@observer
export class DependsOnList extends React.Component<Props> {
  sortingCallbacks = {
    [sortBy.name]: (dependsOn: CrossNamespaceDependencyReference) => dependsOn.name,
    [sortBy.namespace]: (dependsOn: CrossNamespaceDependencyReference) => dependsOn?.namespace,
  };

  async componentDidMount() {
    await kustomizationStore.loadAll();
  }

  getDependant(name: string) {
    return kustomizationStore.getByName(name);
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

              const depSelfLink = this.getDependant(dependent.name).selfLink;
              
              return (
                <TableRow
                  key={dependent.name}
                  sortItem={dependent}
                  nowrap
                  // onClick={ prevDefault(() => showDetails(this.getDependantSelfLink(dependent.name), false))}
                >
                  <TableCell className="name"><Link to={getDetailsUrl(depSelfLink)}>{dependent.name}</Link></TableCell>
                  <TableCell className="namespace">{dependent?.namespace ?? kustomization.metadata.namespace}</TableCell>
                </TableRow>
              );
            })
          }
        </Table>
      </div>
    );
  }
}
