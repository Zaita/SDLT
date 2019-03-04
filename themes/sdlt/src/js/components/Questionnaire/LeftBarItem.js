// @flow

import React, {Component} from "react";
import type {FormPage} from "../../types/FormPage";

type Props = {
  page: FormPage,
  isCurrentStep: boolean,
  touched: boolean,
  onClick: (page: FormPage) => void
};

export default class LeftBarItem extends Component<Props> {
  render() {
    let text = "";
    text += this.props.page.title;

    if (this.props.isCurrentStep) {
      text += "[current]";
    }

    if (this.props.touched) {
      text += "[touched]";
    }

    return (
      <div className="LeftBarItem">
        <button className="btn" onClick={this.props.onClick}>{text}</button>
      </div>
    );
  }
}
