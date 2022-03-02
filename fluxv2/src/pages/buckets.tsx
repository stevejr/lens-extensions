import { Renderer } from "@k8slens/extensions";
import React from "react";
import { Bucket } from "../source-controller/bucket";
import { bucketStore } from "../source-controller/bucket-store";

const enum sortBy {
  name = "name",
  namespace = "namespace",
  ownerName = "ownername",
  ownerKind = "ownerkind",
  age = "age",

}

export class BucketsPage extends React.Component<{ extension: Renderer.LensExtension }> {
  checkSuspended(bucket: Bucket) {
    const ready = bucket.spec?.suspend ? "Suspended" : bucket.status.conditions[0].status;

    return ready;
  }

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
          {title: "Ready", className: "ready"},
          {title: "Message", className: "message"},
          {title: "Revision", className: "revision"},
          {title: "Suspended", className: "suspended"}
        ]}
        renderTableContents={(bucket: Bucket) => [
          bucket.getName(),
          bucket.metadata.namespace,
          bucket.spec.bucketName,
          bucket.spec.endpoint,
          bucket.spec?.region ?? "",
          bucket.status?.conditions[0].status ?? "",
          bucket.getShortenCommitSha(bucket.status?.conditions[0].message),
          bucket.status?.artifact?.revision ?? "",
          bucket.isSuspended(),
        ]}
      />
    );
  }
}
