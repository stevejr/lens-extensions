import "./kustomization-dependson-list.scss";

import { Renderer } from "@k8slens/extensions";
import React from "react";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";
import type { Kustomization } from "../kustomization";
import { bucketStore } from "../../source-controller/bucket-store";
import { gitRepositoryStore } from "../../source-controller/gitrepository-store";

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
  kind = "kind",
  name = "name"
}

interface Props {
  kustomization: Kustomization;
}

@observer
export class KustomizationSource extends React.Component<Props> {
  sortingCallbacks = {
    [sortBy.kind]: (kustomization: Kustomization) => kustomization.spec?.sourceRef.kind,
    [sortBy.name]: (kustomization: Kustomization) => kustomization.spec?.sourceRef.name,
  };

  getSourceRef(kind: string, name: string) {
    switch (kind) {
      case "Bucket":
        return bucketStore.getByName(name);
      case "GitRepository":
        return gitRepositoryStore.getByName(name);
    } 
  }

  render() {
    const { kustomization } = this.props;

    if (!kustomization) return null;

    const sourceRef = this.getSourceRef(kustomization.spec?.sourceRef.kind, kustomization.spec?.sourceRef.name);

    if (!sourceRef) return null;

    return (
      <div className="SourceRef flex column">
        <DrawerTitle title="Source Ref"/>
        <Table
          selectable
          scrollable={false}
          sortable={this.sortingCallbacks}
          sortByDefault={{ sortBy: sortBy.name, orderBy: "asc" }}
          sortSyncWithUrl={false}
          className="box grow"
          tableId="kustomizationSourceRefTable"
        >
          <TableHead>
            <TableCell className="name" sortBy={sortBy.name}>Name</TableCell>
            <TableCell className="kind" sortBy={sortBy.kind}>Kind</TableCell>
            <TableCell className="path">Path</TableCell>
            <TableCell className="revision">Revision</TableCell>
            <TableCell className="ready">Ready</TableCell>
            <TableCell className="lastUpdated">Last Updated</TableCell>
          </TableHead>
          {
            <TableRow
              key={sourceRef.getName()}
              sortItem={kustomization}
              nowrap
            >
              <TableCell className="name"><Link to={getDetailsUrl(sourceRef.selfLink)}>{sourceRef.metadata.name}</Link></TableCell>
              <TableCell className="kind">{sourceRef.kind}</TableCell>
              <TableCell className="path">{kustomization.spec?.path ?? "."}</TableCell>
              <TableCell className="revision">{sourceRef.status?.artifact?.revision}</TableCell>
              <TableCell className="revision">{sourceRef.status.conditions[0].status}</TableCell>
              <TableCell className="lastUpdated">{sourceRef.status?.artifact?.lastUpdateTime}</TableCell>
            </TableRow>
          }
        </Table>
      </div>
    );
  }
}
