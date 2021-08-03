import { Renderer } from "@k8slens/extensions";
import { HelmChart } from "./helmchart";

export class HelmChartApi extends Renderer.K8sApi.KubeApi<HelmChart> {
}

export const helmChartApi = new HelmChartApi({
  objectConstructor: HelmChart
});

export class HelmChartStore extends Renderer.K8sApi.KubeObjectStore<HelmChart> {
  api = helmChartApi;
}

export const helmChartStore = new HelmChartStore();

Renderer.K8sApi.apiManager.registerStore(helmChartStore);

