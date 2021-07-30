import { Renderer } from '@k8slens/extensions';
import { Namespace } from '@k8slens/extensions/dist/src/renderer/api/endpoints';
import React from 'react';
import { HelmChart } from '../source-controller/helmchart';
import { helmChartStore } from '../source-controller/helmchart-store';

import "./helmcharts.scss";

const nsStore: Renderer.K8sApi.KubeObjectStore<Namespace> =
Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.namespacesApi);

const enum sortBy {
  name = 'name',
  namespace = "namespace",
  ownerName = 'ownername',
  ownerKind = 'ownerkind',
  age = 'age',
}

const renderLabels = (labels?: Record<string, string>) =>
  labels && Object.entries(labels || {})
    .map(([key, value]) => `${key}=${value}`)
    .map(label => <Renderer.Component.Badge key={label} label={label}/>);

export class HelmChartsPage extends React.Component<{ extension: Renderer.LensExtension }> {
  getHelmChartSource(helmChart: HelmChart) {
    return <>Kind: {helmChart.spec.sourceRef.kind}<br />Name: {helmChart.spec.sourceRef.name}</>
  }

  render() {
    return (
      <Renderer.Component.KubeObjectListLayout 
        tableId="helmChartTable"
        className="HelmChart" store={helmChartStore}
        sortingCallbacks={{
            [sortBy.name]: (helmChart: HelmChart) => helmChart.getName(),
            [sortBy.namespace]: (helmChart: HelmChart) => helmChart.metadata.namespace,
        }}
        searchFilters={[
            (helmChart: HelmChart) => helmChart.getSearchFields()
        ]}
        renderHeaderTitle="HelmChart"
        renderTableHeader={[
            {title: "Name", className: "name", sortBy: sortBy.name},
            {title: "Namespace", className: "namespace", sortBy: sortBy.namespace},
            {title: "Source", className: "source"},
            {title: "Version", className: "version"},
        ]}
        renderTableContents={(helmChart: HelmChart) => [
          helmChart.getName(),
          helmChart.metadata.namespace,
          this.getHelmChartSource(helmChart),
          helmChart.spec?.version ?? ""
        ]}
        tableProps={{
          customRowHeights: (item: HelmChart, lineHeight, paddings) => {
            return 2 * lineHeight + paddings;
          }
        }}
    />
    )
  }
}
