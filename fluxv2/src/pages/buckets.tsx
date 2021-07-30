import { Renderer } from '@k8slens/extensions';
import { Namespace } from '@k8slens/extensions/dist/src/renderer/api/endpoints';
import React from 'react';
import { Bucket } from '../source-controller/bucket';
import { bucketStore } from '../source-controller/bucket-store';

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

export class BucketsPage extends React.Component<{ extension: Renderer.LensExtension }> {
  render() {
    return (
      <Renderer.Component.KubeObjectListLayout 
        tableId="bucketTable"
        className="Bucket" store={bucketStore}
        sortingCallbacks={{
            [sortBy.name]: (bucket: Bucket) => bucket.getName(),
            [sortBy.namespace]: (bucket: Bucket) => bucket.metadata.namespace,
        }}
        searchFilters={[
          (bucket: Bucket) => bucket.getSearchFields()
        ]}
        renderHeaderTitle="Bucket"
        renderTableHeader={[
            {title: "Name", className: "name", sortBy: sortBy.name},
            {title: "Namespace", className: "namespace", sortBy: sortBy.namespace},
            {title: "Bucket Name", className: "bucketName"},
            {title: "Bucket Endpoint", className: "bucketEndpoint"},
            {title: "Bucket Region", className: "bucketRegion"},

        ]}
        renderTableContents={(bucket: Bucket) => [
          bucket.getName(),
          bucket.metadata.namespace,
          bucket.spec.bucketName,
          bucket.spec.endpoint,
          bucket.spec?.region ?? ""
        ]}
    />
    )
  }
}

