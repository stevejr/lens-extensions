import { BaseFluxController } from "../base-controller/base";

export class HelmRepository extends BaseFluxController {
  static kind = "HelmRepository";
  static namespaced = true;
  static apiBase = "/apis/source.toolkit.fluxcd.io/v1beta1/helmrepositories";

  kind!: string;
  apiVersion!: string;
  metadata!: HelmRepositoryMetadata; 
  spec!: HelmRepositorySpec;
  status?: HelmRepositoryStatus;
}

export type HelmRepositoryMetadata = {
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

export type HelmRepositorySpec = {
  url: string;
  secretRef?: {
    name: string;
  }
  passCredentials?: boolean;
  interval: string;
  timeout?: string;
  suspend?: boolean;
};

export type HelmRepositoryStatus = {
  observedGeneration?: BigInt;
  conditions?: Condition[];
  url?: string;
  artifact?: Artifact;
  includedArtifacts?: Artifact[];
  ReconcileRequestStatus?: ReconcileRequestStatus;
};

export type Condition = {
  type: string;
  status: ConditionStatus;
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
