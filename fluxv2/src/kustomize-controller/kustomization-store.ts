import { Renderer } from "@k8slens/extensions";
import { Kustomization } from "./kustomization";

export class KustomizationApi extends Renderer.K8sApi.KubeApi<Kustomization> {
}

export const kustomizationApi = new KustomizationApi({
  objectConstructor: Kustomization
});

export class KustomizationStore extends Renderer.K8sApi.KubeObjectStore<Kustomization> {
  api = kustomizationApi;
}

export const kustomizationStore = new KustomizationStore();

Renderer.K8sApi.apiManager.registerStore(kustomizationStore);

