import { BaseFluxController } from "../base-controller/base";


export class HelmRelease extends BaseFluxController {
  static kind = "HelmRelease";
  static namespaced = true;
  static apiBase = "/apis/helm.toolkit.fluxcd.io/v2beta1/helmreleases";

  kind!: string;
  apiVersion!: string;
  metadata!: HelmReleaseMetadata; 
  spec!: HelmReleaseSpec;
  status?: HelmReleaseStatus;
}

export type HelmReleaseMetadata = {
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

export type HelmReleaseSpec = {
  chart: HelmChartTemplate;
  interval: string;
  suspend?: boolean;
  releaseName?: string;
  targetNamespace?: string;
  storageNamespace?: string;
  dependsOn?: CrossNamespaceDependencyReference[];
  timeout?: string;
  maxHistory?: number;
  install?: Install;
  upgrade?: Upgrade;
  test?: Test;
  rollback?: Rollback;
  uninstall?: Uninstall;
  valuesFrom?: ValuesReference[];
  values?: JSON;
  kubeConfig?: KubeConfig;
  serviceAccountName?: string;
  postRenderers?: PostRenderer[]; 
};

export type HelmReleaseStatus = {
  observedGeneration?: BigInt;
  ReconcileRequestStatus?: ReconcileRequestStatus;
  lastHandledReconcileAt?: string;
  conditions?: Condition[];
  lastAppliedRevision?: string;
  lastAttemptedRevision?: string;
  lastAttemptedValuesChecksum?: string;
  lastReleaseRevision?: number;
  helmChart?: string;
  installFailures?: BigInt;
  upgradeFailures?: BigInt;
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

export type HelmChartTemplate = {
  spec: HelmChartTemplateSpec;
};

export type HelmChartTemplateSpec = {
  chart: string;
  version?: string;
  sourceRef: CrossNamespaceDependencyReference;
  interval?: string;
  valuesFiles?: string[];
  valuesFile?: string;
};

export type CrossNamespaceDependencyReference = {
  apiVersion?: string;
  kind?: string;
  namespace?: string;
  name: string;
};

export type Install = {
  timeout?: string;
  remediation?: InstallRemediation;
  disableWait?: boolean;
  disableWaitForJobs?: boolean;
  disableOpenAPIValidation?: boolean;
  replace?: boolean;
  skipCRDs?: boolean;
  crds?: string; // CRDsPolicy
  createNamespace?: boolean;
};

export type InstallRemediation = {
  retries?: number;
  ignoreTestFailures?: boolean;
  remediateLastFailure?: boolean;
};

export type Upgrade = {
  timeout?: string;
  remediation?: UpgradeRemediation;
  disableWait?: boolean;
  disableWaitForJobs?: boolean;
  disableHooks?: boolean;
  disableOpenAPIValidation?: boolean;
  force?: boolean;
  preserveValues?: boolean;
  cleanupOnFail?: boolean;
  crds?: string; // CRDsPolicy
};

export type UpgradeRemediation = {
  retries?: number;
  ignoreTestFailures?: boolean;
  remediateLastFailure?: boolean;
  strategy?: string; // RemediationStrategy
};

export type Test = {
  enable?: boolean;
  timeout?: string;
  ignoreFailures?: boolean;
};

export type Rollback = {
  timeout?: string;
  disableWait?: boolean;
  disableWaitForJobs?: boolean;
  disableHooks?: boolean;
  recreate?: boolean;
  force?: boolean;
  cleanupOnFail?: boolean;
};

export type Uninstall = {
  timeout?: string;
  disableHooks?: boolean;
  keepHistory?: boolean;
};

export type PostRenderer = {
  kustomize?: Kustomize;
};

export type Kustomize = {
  patchesStrategicMerge?: {}[];
  patchesJson6902?: JSON6902Patch[]
  images?: Image[];
};

export type JSON6902Patch = {
  patch: JSON6902[];
  target: Selector;
};

export type JSON6902 = {
  op: string;
  path: string;
  from?: string;
  value?: {};
};

export type Selector = {
  group?: string;
  version?: string;
  kind?: string;
  name?: string;
  namespace?: string;
  annotationSelector?: string;
  labelSelector?: string;
};

export type Image = {
  name: string;
  newName?: string;
  newTag?: string;
  digest?: string;
};

export type ValuesReference = {
  kind: string;
  name: string;
  valuesKey?: string;
  targetPath?: string;
  optional?: boolean;
};

export type KubeConfig = {
  secretRef: string;
};
