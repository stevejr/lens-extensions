import { Renderer } from "@k8slens/extensions";
import { ImageUpdateAutomation } from "./imageupdateautomation";

export class ImageUpdateAutomationApi extends Renderer.K8sApi.KubeApi<ImageUpdateAutomation> {
}

export const imageUpdateAutomationApi = new ImageUpdateAutomationApi({
  objectConstructor: ImageUpdateAutomation
});

export class ImageUpdateAutomationStore extends Renderer.K8sApi.KubeObjectStore<ImageUpdateAutomation> {
  api = imageUpdateAutomationApi;
}

export const imageUpdateAutomationStore = new ImageUpdateAutomationStore();

Renderer.K8sApi.apiManager.registerStore(imageUpdateAutomationStore);

