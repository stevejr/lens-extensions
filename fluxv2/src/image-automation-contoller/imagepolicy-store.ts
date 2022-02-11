import { Renderer } from "@k8slens/extensions";
import { ImagePolicy } from "./imagepolicy";

export class ImagePolicyApi extends Renderer.K8sApi.KubeApi<ImagePolicy> {
}

export const imagepolicyApi = new ImagePolicyApi({
  objectConstructor: ImagePolicy
});

export class ImagePolicyStore extends Renderer.K8sApi.KubeObjectStore<ImagePolicy> {
  api = imagepolicyApi;
}

export const imagepolicyStore = new ImagePolicyStore();

Renderer.K8sApi.apiManager.registerStore(imagepolicyStore);

