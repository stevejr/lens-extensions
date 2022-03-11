import { Renderer } from "@k8slens/extensions";

export class BaseFluxController extends Renderer.K8sApi.KubeObject {

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


