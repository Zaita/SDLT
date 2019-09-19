// @flow

import React from "react";

type Props = {
  id: string,
  name: string,
  description: string
};

export default class ControlInfo extends React.Component<Props> {

  render() {
    const {id, name, description} = {...this.props};

    return (
      <div className="ControlInfo">
        <h4>
          <span>{name}</span>
        </h4>
        <p>{description}</p>
      </div>
    );
  }
}
