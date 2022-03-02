import { Common, Renderer } from "@k8slens/extensions";
import React from "react";
import { Link } from "react-router-dom";
import { HelmChart } from "../source-controller/helmchart";
import { helmChartStore } from "../source-controller/helmchart-store";
import { bucketStore } from "../source-controller/bucket-store";
import { gitRepositoryStore } from "../source-controller/gitrepository-store";
import { helmRepositoryStore } from "../source-controller/helmrepository-store";

import "./helmcharts.scss";

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

export class HelmChartsPage extends React.Component<{ extension: Renderer.LensExtension }> {
  getHelmChartSource(helmChart: HelmChart) {
    return <>Kind: {helmChart.spec.sourceRef.kind}<br />Name: {helmChart.spec.sourceRef.name}</>;
  }

  async componentDidMount() {
    await bucketStore.loadAll();
    await gitRepositoryStore.loadAll();
    await helmRepositoryStore.loadAll();
  }

  getSourceRefLink(helmChart: HelmChart) {
    const { kind, name } = helmChart.spec.sourceRef;

    switch (kind) {
      case "Bucket":
        const bucket = bucketStore.getByName(name);

        return bucket.selfLink;
      case "GitRepository":
        const gitRepo = gitRepositoryStore.getByName(name);

        return gitRepo.selfLink;

      case "HelmRepository":
        const helmRepo = helmRepositoryStore.getByName(name);

        return helmRepo.selfLink;
    } 
  }

  getSource(helmChart: HelmChart) {
    const selfLink = this.getSourceRefLink(helmChart);

    return <><Badge flat key={helmChart.spec.sourceRef.kind} className="sourceRef" tooltip={helmChart.spec.sourceRef.name} expandable={false} onClick={stopPropagation}>
      <Link to={getDetailsUrl(selfLink)}>
        {helmChart.spec.sourceRef.kind}
      </Link>
    </Badge></>;
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
          {title: "Ready", className: "ready"},
          {title: "Message", className: "message"},
          {title: "Revision", className: "revision"},
          {title: "Suspended", className: "suspended"}
        ]}
        renderTableContents={(helmChart: HelmChart) => [
          helmChart.getName(),
          helmChart.metadata.namespace,
          this.getSource(helmChart),
          helmChart.spec?.version ?? "",
          helmChart.status?.conditions[0].status ?? "",
          helmChart.getShortenCommitSha(helmChart.status?.conditions[0].message),
          helmChart.status?.artifact?.revision ?? "",
          helmChart.isSuspended(),
        ]}
      />
    );
  }
}
