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

export interface FluxSuspendMenuProps extends Renderer.Component.KubeObjectMenuProps<FluxController> {
}

export function FluxSuspendMenu({ object: controller, toolbar }: FluxSuspendMenuProps) {
  const getIcon = () => (
    controller.spec?.suspend
      ? "play_arrow"
      : "pause"
  );

  const getTitle = () => (
    controller.spec?.suspend
      ? "Resume"
      : "Suspend"
  );
  
  const toggle = async () => {
    const controllerApi = Renderer.K8sApi.apiManager.getApi(api => api.kind === controller.kind && api.apiVersionWithGroup == controller.apiVersion);
    controllerApi.patch({
      name: controller.getName(),
      namespace: controller.getNs(),
    }, 
    {
      spec: {
        suspend: !controller.spec?.suspend,
      },
    },
    "merge");
  };
  
  const [icon, setIcon] = useState(getIcon);
  
  const [title, setTitle] = useState(getTitle);
  
  useEffect(() => {
    setIcon(getIcon());
    setTitle(getTitle());
  }, [controller.spec?.suspend]);
  
  return (
    <MenuItem onClick={Util.prevDefault(toggle)}>
      <Icon material={getIcon()} interactive={toolbar} tooltip={toolbar && title}/>
      <span className="title">ResumeSuspend</span>
    </MenuItem>
  );
}
