// @flow

import React, {Component} from "react";
import {FormikBag} from "formik";
import type {AnswerAction, Question, Submission} from "../../types/Questionnaire";
import LeftBar from "./LeftBar";
import QuestionForm from "./QuestionForm";
import _ from "lodash";

type Props = {
  questions: Array<Question>,
  saveAnsweredQuestion: (question: Question) => void,
  onLeftBarItemClick: (question: Question) => void
};

class Questionnaire extends Component<Props> {

  handleFormSubmit(formik: FormikBag, values: Object) {
    const {questions, saveAnsweredQuestion} = {...this.props};

    // Generate new question with data
    const currentQuestion = questions.find((question) => {
      return question.isCurrent === true;
    });
    if (!currentQuestion) {
      return;
    }

    const answeredQuestion = {...currentQuestion};
    _.forIn(values, (value, key) => {
      const index = answeredQuestion.inputs.findIndex((item) => item.id === key);
      if(index >= 0) {
        _.set(answeredQuestion, `inputs.${index}.data`, value)
      }
    });
    answeredQuestion.hasAnswer = true;
    answeredQuestion.isApplicable = true;

    saveAnsweredQuestion(answeredQuestion)
  }

  handleActionClick(action: AnswerAction) {
    const {questions, saveAnsweredQuestion} = {...this.props};

    // Generate new question with data
    const currentQuestion = questions.find((question) => {
      return question.isCurrent === true;
    });
    if (!currentQuestion) {
      return;
    }

    const answeredQuestion = {...currentQuestion};
    answeredQuestion.actions = answeredQuestion.actions.map((item) => {
      item.isChose = (item.id === action.id);
      return item;
    });
    answeredQuestion.hasAnswer = true;
    answeredQuestion.isApplicable = true;

    saveAnsweredQuestion(answeredQuestion);
  }

  render() {
    const {questions, onLeftBarItemClick} = {...this.props};

    const currentQuestion = questions.find((question) => {
      return question.isCurrent === true;
    });

    return (
      <div className="Questionnaire mx-1">
        <div className="major">
          <LeftBar questions={questions} onItemClick={onLeftBarItemClick}/>
          {currentQuestion && <QuestionForm
            key={currentQuestion.id}
            question={currentQuestion}
            handleFormSubmit={this.handleFormSubmit.bind(this)}
            handleActionClick={this.handleActionClick.bind(this)}/>}
        </div>
      </div>
    );
  }
}

export default Questionnaire;
