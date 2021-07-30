import { Renderer } from "@k8slens/extensions";

export class Kustomization extends Renderer.K8sApi.KubeObject {
  static kind = "Kustomization"
  static namespaced = true
  static apiBase = "/apis/kustomize.toolkit.fluxcd.io/v1beta1/kustomizations"

  kind!: string
  apiVersion!: string
  metadata!: KustomizationMetadata; 
  spec!: KustomizationSpec
  status?: KustomizationStatus

  getDependsOn() {
    return this.spec?.dependsOn ?? []
  }
}

export type KustomizationMetadata = {
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
}

export type KustomizationSpec = {
  dependsOn?: CrossNamespaceDependencyReference[];
  decryption?: Decryption;
  interval: string;
  retryInterval?: string;
  kubeConfig?: KubeConfig;
  path?: string;
  postBuild?: PostBuild;
  prune: boolean;
  healthChecks?: NamespacedObjectKindReference[];
  patches?: Patch[];
  patchesStrategicMerge?: {}[];
  patchesJson6902?: JSON6902Patch[]
  images?: Image[];
  serviceAccountName?: string;
  sourceRef?: CrossNamespaceSourceReference;
  suspend?: boolean;
  targetNamespace?: string;
  timeout?: string;
  validation?: string;
  force?: boolean;
};

export type CrossNamespaceDependencyReference = {
  namespace?: string;
  name: string;
};

export type Decryption = {
  provider: string;
  secretRef?: {
    name: string;
  }
};

export type KubeConfig = {
  secretRef?: {
    name: string;
  }
};

export type PostBuild = {
  substitute?: Map<string, string>;
  substituteFrom?: SubstituteReference[];
};

export type SubstituteReference = {
  kind: string;
  name: string;
};

export type NamespacedObjectKindReference = {
  apiVersion?: string;
  kind: string;
  name: string;
  namespace: string;
}; 

export type Patch = {
  patch?: string;
  target: Selector;
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
}

export type Image = {
  name: string;
  newName?: string;
  newTag?: string;
  digest?: string;
}

export type CrossNamespaceSourceReference = {
  apiVersion?: string;
  kind: string;
  name: string;
  namespace?: string;
}

export type KustomizationStatus = {
  observedGeneration?: BigInt;
  conditions?: Condition[];
  lastAppliedRevision?: string;
  lastAttemptedRevision?: string;
  ReconcileRequestStatus?: ReconcileRequestStatus;
  snapshot?: Snapshot;
}

export type Condition = {
  type: string;
  status: ConditionStatus;
  observedGeneration?: BigInt;
  lastTransitionTime: string;
  reason: string;
  message: string

}

export type ConditionStatus = {
  ConditionTrue?: 'True';
  ConditionFalse?: 'False';
  ConditionUnknown?: 'Unknown';
}

export type Artifact = {
  path: string;
  url: string;
  revision: string;
  checksum: string;
  lastUpdateTime: string;
}

export type ReconcileRequestStatus = {
  lastHandledReconcileAt: string;
}

export type Snapshot = {
  checksum: string;
  entries: SnapshotEntry[];
}

export type SnapshotEntry = {
  namespace?: string;
  kinds: Map<string, string>;
}
