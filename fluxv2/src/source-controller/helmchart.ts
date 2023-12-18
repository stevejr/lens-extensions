import { BaseFluxController } from "../base-controller/base";

export class HelmChart extends BaseFluxController {
  static kind = "HelmChart";
  static namespaced = true;
  static apiBase = "/apis/source.toolkit.fluxcd.io/v1beta1/helmcharts";

  kind!: string;
  apiVersion!: string;
  metadata!: HelmChartMetadata; 
  spec!: HelmChartSpec;
  status?: HelmChartStatus;
}

export type HelmChartMetadata = {
  name: string;
  namespace: string;
  selfLink: string;
  uid: string;
  resourceVersion: string;
  creationTimestamp: string;
  labels?: {
      [key: string]: string;
  };
  annotations?: {
      [key: string]: string;
  };
};

export type HelmChartSpec = {
  chart: string;
  version?: string;
  sourceRef: LocalHelmChartSourceReference;
  interval: string;
  valuesFiles?: string[];
  valuesFile?: string;
  suspend?: boolean;
};

export type LocalHelmChartSourceReference = {
  apiVersion?: string;
  kind: string;
  name: string;
};

export type HelmChartStatus = {
  observedGeneration?: BigInt;
  conditions?: Condition[];
  url?: string;
  artifact?: Artifact;
  includedArtifacts?: Artifact[];
  ReconcileRequestStatus?: ReconcileRequestStatus;
};

export type Condition = {
  type: string;
  status: "True|False|Unknown";
  observedGeneration?: BigInt;
  lastTransitionTime: string;
  reason: string;
  message: string
};

export type ConditionStatus = {
  ConditionTrue?: "True";
  ConditionFalse?: "False";
  ConditionUnknown?: "Unknown";
};

export type Artifact = {
  path: string;
  url: string;
  revision: string;
  checksum: string;
  lastUpdateTime: string;
};

export type ReconcileRequestStatus = {
  lastHandledReconcileAt: string;
};
