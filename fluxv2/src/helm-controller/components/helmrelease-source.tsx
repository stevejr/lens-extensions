import { Renderer } from "@k8slens/extensions";
import React from "react";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";
import type { HelmRelease } from "../helmrelease";
import { bucketStore } from "../../source-controller/bucket-store";
import { gitRepositoryStore } from "../../source-controller/gitrepository-store";
import { helmRepositoryStore } from "../../source-controller/helmrepository-store";

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
  helmRelease: HelmRelease;
}

@observer
export class HelmReleaseSource extends React.Component<Props> {
  sortingCallbacks = {
    [sortBy.kind]: (helmRelease: HelmRelease) => helmRelease.spec?.chart?.spec?.sourceRef.kind,
    [sortBy.name]: (helmRelease: HelmRelease) => helmRelease.spec?.chart?.spec?.sourceRef.name,
  };
  
  async componentDidMount() {
    await bucketStore.loadAll();
    await gitRepositoryStore.loadAll();
    await helmRepositoryStore.loadAll();
  }

  getSourceRef(kind: string, name: string) {
    switch (kind) {
      case "Bucket":
        return bucketStore.getByName(name);
      case "GitRepository":
        return gitRepositoryStore.getByName(name);
      case "HelmRepository":
        return helmRepositoryStore.getByName(name);
    } 
  }

  render() {
    const { helmRelease } = this.props;

    if (!helmRelease) return null;

    const sourceRef = this.getSourceRef(helmRelease.spec?.chart?.spec?.sourceRef.kind, helmRelease.spec?.chart?.spec?.sourceRef.name);

    if (!sourceRef) return null;

    const sourceRefReady = sourceRef.spec?.suspend ? "Suspended" : sourceRef.status.conditions[0].status;

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
          tableId="helmChartSourceRefTable"
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
              sortItem={helmRelease}
              nowrap
            >
              <TableCell className="name"><Link to={getDetailsUrl(sourceRef.selfLink)}>{sourceRef.metadata.name}</Link></TableCell>
              <TableCell className="kind">{sourceRef.kind}</TableCell>
              <TableCell className="chart">{helmRelease.spec?.chart?.spec?.chart ?? "."}</TableCell>
              <TableCell className="revision">{sourceRef.status?.artifact?.revision}</TableCell>
              <TableCell className="ready">{sourceRefReady}</TableCell>
              <TableCell className="lastUpdated">{sourceRef.status?.artifact?.lastUpdateTime}</TableCell>
            </TableRow>
          }
        </Table>
      </div>
    );
  }
}
