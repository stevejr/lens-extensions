import { Renderer } from "@k8slens/extensions";
import React from "react";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import type { HelmRelease, ValuesReference } from "../helmrelease";

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
  kind = "kind",
  valuesKey = "valuesKey"
}

interface Props {
  helmRelease: HelmRelease;
}

const cmStore: Renderer.K8sApi.KubeObjectStore<Renderer.K8sApi.ConfigMap> =
  Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.configMapApi);

const secretStore: Renderer.K8sApi.KubeObjectStore<Renderer.K8sApi.Secret> =
  Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.secretsApi);

@observer
export class HelmReleaseValuesFrom extends React.Component<Props> {
  sortingCallbacks = {
    [sortBy.name]: (valuesFrom: ValuesReference) => valuesFrom.name,
    [sortBy.kind]: (valuesFrom: ValuesReference) => valuesFrom.kind,
    [sortBy.valuesKey]: (valuesFrom: ValuesReference) => valuesFrom.valuesKey,
  };

  async componentDidMount() {
    await cmStore.loadAll();
    await secretStore.loadAll();
  }

  getValuesFrom(kind: string, name: string) {
    switch (kind) {
      case "ConfigMap":
        return cmStore.getByName(name);
      case "Secret":
        return secretStore.getByName(name);
    } 
  }

  render() {
    const { helmRelease } = this.props;

    if (!helmRelease) return null;

    if (!helmRelease.spec?.valuesFrom) return null;

    const valuesFrom = helmRelease.spec?.valuesFrom;

    return (
      <div className="ValuesFrom flex column">
        <DrawerTitle>ValuesFrom</DrawerTitle>
        <Table
          selectable
          scrollable={false}
          sortable={this.sortingCallbacks}
          sortByDefault={{ sortBy: sortBy.name, orderBy: "asc" }}
          sortSyncWithUrl={false}
          className="box grow"
          tableId="valuesFromDetailsTable"
        >
          <TableHead>
            <TableCell className="name" sortBy={sortBy.name}>Name</TableCell>
            <TableCell className="kind" sortBy={sortBy.kind}>Kind</TableCell>
            <TableCell className="valuesKey" sortBy={sortBy.valuesKey}>Values Key</TableCell>
          </TableHead>
          {
            valuesFrom.map(value => {

              const valuesFromSelfLink = this.getValuesFrom(value.kind, value.name).selfLink;
              // const depObject = this.getDependant(value.name);
              // const dependsOnReady = depObject.spec?.suspend ? "Suspended" : depObject.status.conditions[0].status;

              return (
                <TableRow
                  key={value.name}
                  sortItem={value}
                  nowrap
                  // onClick={ prevDefault(() => showDetails(this.getDependantSelfLink(dependent.name), false))}
                >
                  <TableCell className="name"><Link to={getDetailsUrl(valuesFromSelfLink)}>{value.name}</Link></TableCell>
                  <TableCell className="kind">{value.kind}</TableCell>
                  <TableCell className="valuesKey">{value.valuesKey}</TableCell>
                </TableRow>
              );
            })
          }
        </Table>
      </div>    
    );
  }
}
