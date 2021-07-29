import { Renderer } from '@k8slens/extensions';
import { Namespace } from '@k8slens/extensions/dist/src/renderer/api/endpoints';
import React from 'react';
import { HelmChart } from '../source-controller/helmchart';
import { helmChartStore } from '../source-controller/helmchart-store';

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
        ]}
        renderTableContents={(helmChart: HelmChart) => [
          helmChart.getName(),
          helmChart.metadata.namespace
        ]}
    />
    )
  }
}

// import { Renderer } from "@k8slens/extensions";
// import React from "react"

// export class FluxSourcesPage extends React.Component<{ extension: Renderer.LensExtension }> {
//   render() {
//     return (
//       <div>
//         <p>Hello world!</p>
//       </div>
//     )
//   }
// }
