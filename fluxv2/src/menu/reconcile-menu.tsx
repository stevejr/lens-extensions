import React, { useEffect, useState }  from "react";
import { Renderer, Common } from "@k8slens/extensions";

type FluxController = Renderer.K8sApi.KubeObject

const {
  Component: {
    MenuItem,
    Icon,
  }
} = Renderer;
const {
  Util,
} = Common;

export interface FluxReconcileMenuProps extends Renderer.Component.KubeObjectMenuProps<FluxController> {
}

export function FluxReconcileMenu({ object: controller, toolbar }: FluxReconcileMenuProps) {
  
  const toggle = async () => {
    const controllerApi = Renderer.K8sApi.apiManager.getApi(api => api.kind === controller.kind && api.apiVersionWithGroup == controller.apiVersion);
    controllerApi.patch({
      name: controller.getName(),
      namespace: controller.getNs(),
    }, 
    {
      metadata: {
        annotations: {
          "reconcile.fluxcd.io/requestedAt": new Date().toISOString()
        },
      },
    },
    "merge");
  };
    
  return (
    <MenuItem onClick={Util.prevDefault(toggle)}>
      <Icon material="restart_alt" interactive={toolbar} tooltip={toolbar && "Reconcile"}/>
      <span className="title">Reconcile</span>
    </MenuItem>
  );
}
