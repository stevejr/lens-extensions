import { Common, Renderer } from "@k8slens/extensions";
import React from "react";
import { Link } from "react-router-dom";
import { HelmRelease } from "../helm-controller/helmrelease";
import { helmReleaseStore } from "../helm-controller/helmrelease-store";
import { bucketStore } from "../source-controller/bucket-store";
import { gitRepositoryStore } from "../source-controller/gitrepository-store";
import { helmRepositoryStore } from "../source-controller/helmrepository-store";

const enum sortBy {
  name = "name",
  namespace = "namespace",
  ownerName = "ownername",
  ownerKind = "ownerkind",
  age = "age",

}

const {
  Component: {
    Badge,
  },
  Navigation: {
    getDetailsUrl
  }
} = Renderer;

const { stopPropagation } = Common.Util;

export class HelmReleasesPage extends React.Component<{ extension: Renderer.LensExtension }> {
  getHelmChartSource(helmRelease: HelmRelease) {
    return <>Kind: {helmRelease.spec.chart.spec.sourceRef.kind}<br />Name: {helmRelease.spec.chart.spec.sourceRef.name}</>;
  }

  getSourceRefLink(helmRelease: HelmRelease) {
    const { kind, name } = helmRelease.spec.chart.spec.sourceRef;

    switch (kind) {
      case "Bucket":
        const bucket = bucketStore.getByName(name);

        return bucket?.selfLink;
      case "GitRepository":
        const gitRepo = gitRepositoryStore.getByName(name);

        return gitRepo?.selfLink;
      case "HelmRepository":
        const helmRepo = helmRepositoryStore.getByName(name);

        return helmRepo?.selfLink;
    } 
  }

  getSource(helmRelease: HelmRelease) {
    const selfLink = this.getSourceRefLink(helmRelease);

    if (!selfLink) {
      return null;
    }

    return <><Badge flat key={helmRelease.spec.chart.spec.sourceRef.kind} className="sourceRef" tooltip={helmRelease.spec.chart.spec.sourceRef.name} expandable={false} onClick={stopPropagation}>
      <Link to={getDetailsUrl(selfLink)}>
        {helmRelease.spec.chart.spec.sourceRef.kind}
      </Link>
    </Badge></>;
  }

  checkSuspended(helmRelease: HelmRelease) {
    const ready = helmRelease.spec?.suspend ? "Suspended" : helmRelease.status.conditions[0].status;

    return ready;
  }

  render() {
    return (
      <Renderer.Component.KubeObjectListLayout 
        tableId="helmReleaseTable"
        className="HelmRelease" store={helmReleaseStore}
        dependentStores={[bucketStore, gitRepositoryStore, helmRepositoryStore]}
        sortingCallbacks={{
          [sortBy.name]: (helmRelease: HelmRelease) => helmRelease.getName(),
          [sortBy.namespace]: (helmRelease: HelmRelease) => helmRelease.metadata.namespace,
        }}
        searchFilters={[
          (helmRelease: HelmRelease) => helmRelease.getSearchFields()
        ]}
        renderHeaderTitle="HelmRelease"
        renderTableHeader={[
          {title: "Name", className: "name", sortBy: sortBy.name},
          {title: "Namespace", className: "namespace", sortBy: sortBy.namespace},
          {title: "Source", className: "source"},
          {title: "Version", className: "version"},
          {title: "Ready", className: "ready"},
          {title: "Message", className: "message"},
          {title: "Revision", className: "lastAppliedRevision"},
          {title: "Suspended", className: "suspended"}
        ]}
        renderTableContents={(helmRelease: HelmRelease) => [
          helmRelease.getName(),
          helmRelease.metadata.namespace,
          this.getSource(helmRelease),
          helmRelease.spec?.chart?.spec?.version ?? "",
          helmRelease.status?.conditions[0].status ?? "",
          helmRelease.getShortenCommitSha(helmRelease.status?.conditions[0].message) ?? "",
          helmRelease.getShortenCommitSha(helmRelease.status?.lastAppliedRevision) ?? "",
          helmRelease.isSuspended(),
        ]}
      />
    );
  }
}
