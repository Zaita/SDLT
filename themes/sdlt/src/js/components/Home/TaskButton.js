// @flow

import React, {Component} from "react";
import {Link} from "react-router-dom";

type Props = {
  link: string,
  title: string,
  classes: Array<string>,
};

class TaskButton extends Component<Props> {

  render() {
    const classes = ["TaskButton", ...this.props.classes];

    return (
      <Link className={classes.join(" ")} to={this.props.link}>
        {this.props.title}
      </Link>
    );
  }
}

export default TaskButton;
