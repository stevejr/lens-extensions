import { Renderer } from "@k8slens/extensions";

export class ImagePolicy extends Renderer.K8sApi.KubeObject {
  static kind = "ImagePolicy";
  static namespaced = true;
  static apiBase = "/apis/image.toolkit.fluxcd.io/v1beta1/imagepolicies";

  kind!: string;
  apiVersion!: string;
  metadata!: ImagePolicyMetadata; 
  spec!: ImagePolicySpec;
  status?: ImagePolicyStatus;
}

export type ImagePolicyMetadata = {
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

export type ImagePolicySpec = {
  imageRepositoryRef: NamespacedObjectReference;
  policy: ImagePolicyChoice;
  filterTags?: TagFilter;
};

export type ImagePolicyChoice = {
  semver?: SemVerPolicy;
  alphabetical?: AlphabeticalPolicy
  numerical?: NumericalPolicy;
};

export type SemVerPolicy = {
  range: string;
};

export type AlphabeticalPolicy = {
  order: string;
};

export type NumericalPolicy = {
  order: string;
};

export type TagFilter = {
  pattern?: string;
  extract?: string;
};

export type NamespacedObjectReference = {
  name: string;
  namespace?: string;
}; 


export type ImagePolicyStatus = {
  latestImage: string;
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
