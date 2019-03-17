// @flow

import React, {Component} from "react";
import type {Question} from "../../types/Questionnaire";
import LeftBarItem from "./LeftBarItem";

type Props = {
  questions: Array<Question>,
  onItemClick: (question: Question) => void
};

class LeftBar extends Component<Props> {

  render() {
    const {questions, onItemClick} = {...this.props};

    return (
      <div className="LeftBar">
        <div className="title">QUESTIONS:</div>
        <div>
          {questions.map((question) => {
            return <LeftBarItem question={question} onItemClick={onItemClick} key={question.id}/>;
          })}
        </div>
      </div>
    );
  }
}

export default LeftBar;
