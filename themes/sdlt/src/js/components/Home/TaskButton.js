// @flow

import React, {Component} from "react";
import {Link} from "react-router-dom";

type Props = {
  link: string,
  classes?: string,
  title: string,
};

class TaskButton extends Component<Props> {

  render() {
    return (
      <Link className={`TaskButton ${this.props.classes}`} to={this.props.link}>
        <div className="title">{this.props.title}</div>
      </Link>
    );
  }
}

export default TaskButton;
