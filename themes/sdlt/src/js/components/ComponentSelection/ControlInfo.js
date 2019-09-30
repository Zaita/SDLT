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
        <h5>{name}</h5>
        <p>{description}</p>
      </div>
    );
  }
}
