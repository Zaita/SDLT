// @flow

import React from "react";
import type {SecurityControl} from "../../types/SecurityControl";
import ControlInfo from "./ControlInfo";

type Props = {
  id: string,
  name: string,
  description: string,
  removeComponent: () => void,
  childControls: Array<SecurityControl>,
  showControls: boolean,
  isDisable: boolean,
};

export default class ComponentInfo extends React.Component<Props> {

  render() {
    const {id, name, description, removeComponent, childControls, isDisable} = {...this.props};

    return (
      <div className="ComponentInfo" key={id+name}>
        <h3>
          {!isDisable && (
            <button onClick={(event) => {
              event.preventDefault();
              removeComponent();
            }
          }>
          <i className="fas fa-minus-circle text-danger"/>
          <span> {name}</span>
          </button>)}
        </h3>
        <p>{description}</p>

        {childControls && childControls.length > 0 && (<div className="control-heading">Controls</div>)}

        {childControls && childControls.length > 0 && (
          childControls.map((control, index) => {
              return (
                <ControlInfo
                  key={index}
                  id={control.id}
                  name={control.name}
                  description={control.description}
                  implementationGuidance={control.implementationGuidance}
                  className= "control-cs"
                />
              );
            })
        )}
      </div>
    );
  }
}
