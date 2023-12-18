import { BaseFluxController } from "../base-controller/base";
export class Bucket extends BaseFluxController {
  static kind = "Bucket";
  static namespaced = true;
  static apiBase = "/apis/source.toolkit.fluxcd.io/v1beta1/buckets";

  kind!: string;
  apiVersion!: string;
  metadata!: BucketMetadata; 
  spec!: BucketSpec;
  status?: BucketStatus;
}

export type BucketMetadata = {
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

export type BucketSpec = {
  provider?: string;
  bucketName: string;
  endpoint: string;
  insecure?: boolean;
  region?: string;  
  secretRef?: {
    name: string;
  };
  interval: string;
  timeout?: string;
  ignore?: string;
  suspend?: boolean;
};

export type BucketStatus = {
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
