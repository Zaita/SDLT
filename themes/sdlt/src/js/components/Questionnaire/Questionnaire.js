// @flow

import React, {Component} from "react";
import {FormikBag} from "formik";
import {Redirect} from "react-router-dom";
import type {FormAction} from "../../types/FormAction";
import type {FormPage} from "../../types/FormPage";
import type {User} from "../../types/User";
import type {AnswerAction, Question, Submission} from "../../types/Questionnaire";
import LeftBar from "./LeftBar";
import QuestionForm from "./QuestionForm";
import _ from "lodash";

type Props = {
  user: User | null,
  submission: Submission | null,
  saveAnsweredQuestion: (question: Question) => void
};

class Questionnaire extends Component<Props> {

  handleFormSubmit(formik: FormikBag, values: Object) {
    // Clear values
    formik.setValues({});
    // TODO: use global loading indicator
    formik.setSubmitting(false);

    const {submission, saveAnsweredQuestion} = {...this.props};
    if (!submission) {
      return;
    }

    // Generate new question with data
    const currentQuestion = submission.questions.find((question) => {
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

    saveAnsweredQuestion(answeredQuestion)
  }

  handleActionClick(action: AnswerAction) {
    const {submission, saveAnsweredQuestion} = {...this.props};
    if (!submission) {
      return;
    }

    // Generate new question with data
    const currentQuestion = submission.questions.find((question) => {
      return question.isCurrent === true;
    });
    if (!currentQuestion) {
      return;
    }

    const answeredQuestion = {...currentQuestion};
    answeredQuestion.actions = answeredQuestion.actions.map((item) => {
      if (item.id === action.id) {
        item.isChose = true;
      } else {
        item.isChose = false;
      }
      return item;
    });
    answeredQuestion.hasAnswer = true;

    saveAnsweredQuestion(answeredQuestion)
  }

  render() {
    const {user, submission} = {...this.props};

    if (!user || !submission) {
      return null;
    }

    if (submission.status !== "in_progress") {
      return (
        <div className="Questionnaire">
          <h1>
            The questionnaire is not in progress...
          </h1>
          <Redirect to="/"/>
        </div>
      );
    }

    const currentQuestion = submission.questions.find((question) => {
      return question.isCurrent === true;
    });

    return (
      <div className="Questionnaire">
        <div className="major">
          <LeftBar questions={submission.questions} onItemClick={(question) => {
            console.log(`LeftBar::onItemClickL: ${question.title}`);
          }}/>
          {currentQuestion && <QuestionForm
            question={currentQuestion}
            handleFormSubmit={this.handleFormSubmit.bind(this)}
            handleActionClick={this.handleActionClick.bind(this)}/>}
        </div>
      </div>
    );
  }
}

export default Questionnaire;
