import { Renderer } from "@k8slens/extensions";
import { ImageRepository } from "./imagerepository";

export class ImageRepositoryApi extends Renderer.K8sApi.KubeApi<ImageRepository> {
}

export const imageRepositoryApi = new ImageRepositoryApi({
  objectConstructor: ImageRepository
});

export class ImageRepositoryStore extends Renderer.K8sApi.KubeObjectStore<ImageRepository> {
  api = imageRepositoryApi;
}

export const imageRepositoryStore = new ImageRepositoryStore();

Renderer.K8sApi.apiManager.registerStore(imageRepositoryStore);

