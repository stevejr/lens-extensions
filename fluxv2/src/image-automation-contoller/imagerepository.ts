import { Renderer } from "@k8slens/extensions";

export class ImageRepository extends Renderer.K8sApi.KubeObject {
  static kind = "ImageRepository";
  static namespaced = true;
  static apiBase = "/apis/image.toolkit.fluxcd.io/v1beta1/imagerepositories";

  kind!: string;
  apiVersion!: string;
  metadata!: ImageRepositoryMetadata; 
  spec!: ImageRepositorySpec;
  status?: ImageRepositoryStatus;
}

export type ImageRepositoryMetadata = {
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

export type ImageRepositorySpec = {
  image: string;
  interval: string;
  timeout?: string;
  secretRef?: {
    name: string;
  };
  certSecretRef?: {
    name: string;
  };
  suspend?: boolean;
  accessFrom?: AccessFrom;
};

export type ImageRepositoryStatus = {
  observedGeneration?: BigInt;
  conditions?: Condition[];
  canonicalImageName?: string;
  lastScanResult?: ScanResult;
  ReconcileRequestStatus?: ReconcileRequestStatus;
};

export type AccessFrom = {
  namespaceSelectors: NamespaceSelectors[];
};

export type NamespaceSelectors = {
  matchLabels: Map<String, String>;
};

export type ScanResult = {
  tagCount: number;
  scanTime: Date;
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

export type ReconcileRequestStatus = {
  lastHandledReconcileAt: string;
};
