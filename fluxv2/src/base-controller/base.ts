import { Renderer } from "@k8slens/extensions";

export interface Condition {
  type: string;
  status: "True|False|Unknown";
  observedGeneration?: BigInt;
  lastTransitionTime: string;
  reason: string;
  message: string
}

export interface BaseControllerMetadata
  extends Renderer.K8sApi.NamespaceScopedMetadata {
  instance?: string;
  managedBy?: string;
  version?: string;
  partOf?: string;
}

export interface BaseControllerStatus {
  conditions?: Condition[];
  lastAppliedRevision?: string;
}

export interface BaseControllerSpec {
  interval?: string;
  timeout?: string;
  suspend?: boolean;
}

export type BaseControllerConstructorData = Renderer.K8sApi.KubeJsonApiData<
BaseControllerMetadata,
BaseControllerStatus,
BaseControllerSpec
>;

export class BaseFluxController extends Renderer.K8sApi.KubeObject<BaseControllerMetadata, BaseControllerStatus, BaseControllerSpec> {

  isSuspended() {
    return this.spec?.suspend ? "True" : "False";
  }

  getShortCommit() {
    return this.status?.lastAppliedRevision.slice(0, 7);
  }

  getShortenCommitSha(msg: string, shaLength = 40) {
    if (typeof msg !== undefined && msg) {

      const shaRegex = `([a-f0-9]{${shaLength}})$`;
      const sha = msg.match(shaRegex);

      if (sha?.[0]) {
        msg = msg.replace(sha[0], sha[0].slice(0, 7));
      }
    }

    return msg;
  }
}


