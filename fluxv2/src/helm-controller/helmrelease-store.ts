import { Renderer } from "@k8slens/extensions";
import { HelmRelease } from "./helmrelease";

export class HelmReleaseApi extends Renderer.K8sApi.KubeApi<HelmRelease> {
}

export const helmReleaseApi = new HelmReleaseApi({
  objectConstructor: HelmRelease
});

export class HelmReleaseStore extends Renderer.K8sApi.KubeObjectStore<HelmRelease> {
  api = helmReleaseApi;
}

export const helmReleaseStore = new HelmReleaseStore();

Renderer.K8sApi.apiManager.registerStore(helmReleaseStore);

