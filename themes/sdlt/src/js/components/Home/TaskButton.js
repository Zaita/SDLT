// @flow

import React, {Component} from "react";
import {Link} from "react-router-dom";

type Props = {
  link: string,
  title: string,
  classes: Array<string>,
  disabled: boolean
};

class TaskButton extends Component<Props> {

  render() {
    return (
      <Link className={`TaskButton ${this.props.classes.join(" ")}`}
            to={this.props.link}
            onClick={(event) => {
              if(this.props.disabled) {
                event.preventDefault();
                alert("Coming soon...");
              }
            }}
      >
        <div className="title">{this.props.title}</div>
      </Link>
    );
  }
}

export default TaskButton;
