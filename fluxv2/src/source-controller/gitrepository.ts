import { Renderer } from "@k8slens/extensions";

export class GitRepository extends Renderer.K8sApi.KubeObject {
  static kind = "GitRepository";
  static namespaced = true;
  static apiBase = "/apis/source.toolkit.fluxcd.io/v1beta1/gitrepositories";

  kind!: string;
  apiVersion!: string;
  metadata!: GitRepositoryMetadata; 
  spec!: GitRepositorySpec;
  status?: GitRepositoryStatus;
}

export type GitRepositoryMetadata = {
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

export type GitRepositorySpec = {
  url: string;
  secretRef?: {
    name: string;
  };
  interval: string;
  timeout?: string;
  ref?: GitRepositoryRef;
  verify?: GitRepositoryVerification;
  ignore?: string;
  suspend?: boolean;
  gitImplementation?: string;
  recurseSubmodules?: boolean;
  include?: GitRepositoryInclude[];
};

export type GitRepositoryRef = {
  branch?: string;
  tag?: string;
  semver?: string;
  commit?: string;
};

export type GitRepositoryVerification = {
  mode: string;
  secretRef: {
    name: string;
  };
};

export type GitRepositoryInclude = {
  repository: {
    name: string;
  };
  fromPath: string;
  toPath: string;
};

export type GitRepositoryStatus = {
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
