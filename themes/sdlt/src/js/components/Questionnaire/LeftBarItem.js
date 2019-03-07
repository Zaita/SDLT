// @flow

import React, {Component} from "react";
import type {Question} from "../../types/Questionnaire";

type Props = {
  question: Question,
  onItemClick: (question: Question) => void
};

export default class LeftBarItem extends Component<Props> {

  render() {
    const {question, onItemClick} = {...this.props};

    return (
      <div className="LeftBarItem">
        {this.renderIcon(question)}
        <button className="btn"
                disabled={!question.isApplicable}
                onClick={(event) => {
                  onItemClick(question);
                }}>
          {question.title}
        </button>
      </div>
    );
  }

  renderIcon(question: Question) {
    const {isCurrent, hasAnswer, isApplicable} = {...question};

    if (isCurrent) {
      return (
        <i className="fas fa-edit current"/>
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
