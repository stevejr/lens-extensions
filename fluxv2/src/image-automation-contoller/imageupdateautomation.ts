import { Renderer } from "@k8slens/extensions";
import { SpawnSyncOptionsWithBufferEncoding } from "child_process";

export class ImageUpdateAutomation extends Renderer.K8sApi.KubeObject {
  static kind = "ImageUpdateAutomation";
  static namespaced = true;
  static apiBase = "/apis/image.toolkit.fluxcd.io/v1beta1/imageupdateautomations";

  kind!: string;
  apiVersion!: string;
  metadata!: ImageUpdateAutomationMetadata; 
  spec!: ImageUpdateAutomationSpec;
  status?: ImageUpdateAutomationStatus;
}

export type ImageUpdateAutomationMetadata = {
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

export type ImageUpdateAutomationSpec = {
  sourceRef: CrossNamespaceSourceReference;
  git?: GitSpec;
  interval: string;
  update: UpdateStrategy;
  suspend?: boolean;
};

export type CrossNamespaceSourceReference = {
  apiVersion?: string;
  kind: string;
  name: string;
  namespace?: string;
};

export type GitSpec = {
  checkout?: GitCheckoutSpec;
  commit: CommitSpec;
  push?: PushSpec; 
};

export type GitCheckoutSpec = {
  ref: GitRepositoryRef;
};

export type GitRepositoryRef = {
  branch?: string;
  tag?: string;
  semver?: string;
  commit?: string;
};

export type CommitSpec = {
  author: CommitUser;
  signingKey?: SigningKey;
  messageTemplate?: string;
};

export type CommitUser = {
  name?: string;
  email: string;
};

export type SigningKey = {
  secretRef: LocalObjectReference;
};

export type LocalObjectReference = {
  name: string;
  namespace?: string;
};

export type PushSpec = {
  branch: string;
};

export type UpdateStrategy = {
  strategy: string;
  path?: string;
};

export type ImageUpdateAutomationStatus = {
  lastAutomationRunTime?: Date;
  lastPushCommit?: string;
  lastPushTime?: Date;
  observedGeneration?: BigInt;
  conditions?: Condition[];
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
