// @flow

import React from "react";

type Props = {
  id: string,
  name: string,
  description: string,
  removeComponent: () => void
};

export default class ComponentInfo extends React.Component<Props> {

  render() {
    const {id, name, description, removeComponent} = {...this.props};

    return (
      <div className="ComponentInfo" key={id}>
        <h3>
          <button onClick={(event) => {
            event.preventDefault();
            removeComponent();
          }}>
            <i className="fas fa-minus-circle text-danger"/>
          </button>
          <span>{name}</span>
        </h3>
        <p>{description}</p>
      </div>
    );
  }
}