import { Renderer } from "@k8slens/extensions";
import { HelmRepository } from "./helmrepository";

export class HelmRepositoryApi extends Renderer.K8sApi.KubeApi<HelmRepository> {
}

export const helmRepositoryApi = new HelmRepositoryApi({
    objectConstructor: HelmRepository
});

export class HelmRepositoryStore extends Renderer.K8sApi.KubeObjectStore<HelmRepository> {
    api = helmRepositoryApi
}

export const helmRepositoryStore = new HelmRepositoryStore();

Renderer.K8sApi.apiManager.registerStore(helmRepositoryStore);

