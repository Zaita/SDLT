// @flow

import React, {Component} from "react";
import type {Question} from "../../types/Questionnaire";
import QuesiontEditingIcon from "../../../img/icons/question-editing.svg";

type Props = {
  question: Question,
  onItemClick: (question: Question) => void,
  index: number
};

export default class LeftBarItem extends Component<Props> {

  render() {
    const {question, onItemClick, index} = {...this.props};

    return (
      <div className="LeftBarItem">
        {this.renderIcon(question)}
        <button className="btn"
                disabled={!question.isApplicable}
                onClick={(event) => {
                  onItemClick(question);
                }}>
          {index+1}. {question.title}
        </button>
      </div>
    );
  }

  renderIcon(question: Question) {
    const {isCurrent, hasAnswer, isApplicable} = {...question};

    if (isCurrent) {
      return (
        <img src={QuesiontEditingIcon} />
      );
    }

    if (!isApplicable) {
      return (
        <i className="fas fa-question-circle not-applicable"/>
      );
    }

    if (hasAnswer && isApplicable) {
      return (
        <i className="fas fa-check-circle success"/>
      );
    }

    return (
      <i className="fas fa-check-circle pending"/>
    );
  }
}
