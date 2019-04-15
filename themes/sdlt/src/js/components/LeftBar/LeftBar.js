// @flow

import React, {Component} from "react";

type Props = {
  title: string,
  children?: *
};

export default class LeftBar extends Component<Props> {

  render() {
    const {title, children} = {...this.props};

    return (
      <div className="LeftBar">
        <div className="title">{title}</div>
        {children && (
          <div className="children">
            {children}
          </div>
        )}
      </div>
    );
  }
}
