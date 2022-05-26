import "./kustomization-dependson-list.scss";

import { Renderer } from "@k8slens/extensions";
import React from "react";
import { observer } from "mobx-react";
import type { Kustomization } from "../kustomization";

const {
  Component: {
    DrawerTitle,
    Table,
    TableCell,
    TableHead,
    TableRow
  }
} = Renderer;

interface Props {
  kustomization: Kustomization;
}

@observer
export class PostBuild extends React.Component<Props> {
  render() {
    const { kustomization } = this.props;

    if (!kustomization) return null;

    const { postBuild } = kustomization.spec;

    if (!postBuild?.substitute) return null;

    return (
      <div className="PostBuild flex column">
        <DrawerTitle>Post Build - Substitutes</DrawerTitle>
        <Table
          selectable
          scrollable={false}
          sortSyncWithUrl={false}
          className="box grow"
          tableId="kustomizationSubstituteTable"
        >
          <TableHead>
            <TableCell className="subKey">Substitution Key</TableCell>
            <TableCell className="subValue">Substitution Value</TableCell>
          </TableHead>
          {
            Object.entries(postBuild.substitute).map(([subKey, subValue]) => {
              return (
                <TableRow
                  key={subKey}
                  nowrap
                >
                  <TableCell className="subKey">{subKey}</TableCell>
                  <TableCell className="subValue">{subValue}</TableCell>
                </TableRow>
              );
            })
          }
        </Table>
      </div>
    );
  }
}
