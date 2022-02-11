import { Renderer } from "@k8slens/extensions";
import React from "react";
import { Link } from "react-router-dom";
import { observer } from "mobx-react";
import type { HelmRelease } from "../helmrelease";
import { kustomizationStore } from "../../kustomize-controller/kustomization-store";

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
  name = "name"
}

interface Props {
  helmRelease: HelmRelease;
}

@observer
export class HelmReleaseKustomization extends React.Component<Props> {
  sortingCallbacks = {
    [sortBy.name]: (helmRelease: HelmRelease) => helmRelease.spec?.chart?.spec?.sourceRef.name,
  };
  
  async componentDidMount() {
    await kustomizationStore.loadAll();
  }

  render() {
    const { helmRelease } = this.props;

    if (!helmRelease) return null;

    const kustomizationRef = kustomizationStore.getByName(helmRelease.metadata?.labels["kustomize.toolkit.fluxcd.io/name"], helmRelease.metadata?.labels["kustomize.toolkit.fluxcd.io/namepace"]);

    if (!kustomizationRef) return null;

    const kustomizationRefReady = kustomizationRef.spec?.suspend ? "Suspended" : kustomizationRef.status.conditions[0].status;

    return (
      <div className="KustomizationRef flex column">
        <DrawerTitle title="Kustomization Ref"/>
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
            <TableCell className="kind">Kind</TableCell>
            <TableCell className="path">Path</TableCell>
            <TableCell className="revision">Revision</TableCell>
            <TableCell className="ready">Ready</TableCell>
            <TableCell className="lastReconciled">Last Reconciled At</TableCell>
          </TableHead>
          {
            <TableRow
              key={kustomizationRef.getName()}
              sortItem={helmRelease}
              nowrap
            >
              <TableCell className="name"><Link to={getDetailsUrl(kustomizationRef.selfLink)}>{kustomizationRef.metadata.name}</Link></TableCell>
              <TableCell className="kind">{kustomizationRef.kind}</TableCell>
              <TableCell className="path">{kustomizationRef.spec.path}</TableCell>
              <TableCell className="revision">{kustomizationRef.status.lastAppliedRevision}</TableCell>
              <TableCell className="ready">{kustomizationRefReady}</TableCell>
              <TableCell className="lastReconciled">{kustomizationRef.metadata.annotations["reconcile.fluxcd.io/requestedAt"]}</TableCell>
            </TableRow>
          }
        </Table>
      </div>
    );
  }
}
