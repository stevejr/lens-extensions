import { Renderer } from "@k8slens/extensions";

export default class FluxV2ExtensionMain extends Renderer.LensExtension {
  onActivate() {
    console.log("FluxV2 extension activated");
  }

  onDeactivate() {
    console.log("FluxV2 extension de-activated");
  }
}
