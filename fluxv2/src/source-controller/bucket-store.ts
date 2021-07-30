import { Renderer } from "@k8slens/extensions";
import { Bucket } from "./bucket";

export class BucketApi extends Renderer.K8sApi.KubeApi<Bucket> {
}

export const bucketApi = new BucketApi({
    objectConstructor: Bucket
});

export class BucketStore extends Renderer.K8sApi.KubeObjectStore<Bucket> {
    api = bucketApi
}

export const bucketStore = new BucketStore();

Renderer.K8sApi.apiManager.registerStore(bucketStore);

