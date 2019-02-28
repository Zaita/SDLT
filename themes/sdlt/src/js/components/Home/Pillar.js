// @flow

import React, {Component} from "react";
import {Link} from "react-router-dom";

type Props = {
  link: string, ///questionnaire/proof-of-concept-questions
  classes: string,
  title: string,
  icon: string,
};

class Pillar extends Component<Props> {

  render() {
    return (
      <Link className={`Pillar ${this.props.classes}`} to={this.props.link}>
        <div className="icon">
          <img src={this.props.icon} alt={this.props.title} />
        </div>
        <div className="title">
          {this.props.title}
        </div>
      </Link>
    );
  }
}

export default Pillar;
