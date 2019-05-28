// @flow
// This is used for component selection

import React, {Component} from "react";
import EditingIcon from "../../../img/icons/question-editing.svg";

type Props = {
  title: string,
  iconType: "editing" | "success" | "pending" | "not-applicable",
  disabled: boolean,
  onItemClick: () => void
};

export default class LeftBarItem extends Component<Props> {

  render() {
    const {title, disabled, onItemClick} = {...this.props};

    return (
      <div className="LeftBarItem">
        {this.renderIcon()}
        <button className="btn"
                disabled={disabled}
                onClick={(event) => {
                  event.preventDefault();
                  onItemClick();
                }}>
                {title}
        </button>
      </div>
    );
  }

  renderIcon() {
    const {iconType} = {...this.props};

    switch (iconType) {
      case "editing":
        return <img src={EditingIcon} alt=""/>;
      case "success":
        return <i className="fas fa-check-circle success"/>;
      case "pending":
        return <i className="fas fa-check-circle pending"/>;
      case "not-applicable":
        return <i className="fas fa-question-circle not-applicable"/>;
      default:
        return null;
    }
  }
}
