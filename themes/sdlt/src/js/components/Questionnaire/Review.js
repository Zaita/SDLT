// @flow

import React, {Component} from "react";
import {Redirect} from "react-router-dom";
import type {AnswerAction, Question, Submission} from "../../types/Questionnaire";
import _ from "lodash";
import LightButton from "../Button/LightButton";
import DarkButton from "../Button/DarkButton";
import editIcon from "../../../img/icons/edit.svg";
import pdfIcon from "../../../img/icons/pdf.svg";
import URLUtil from "../../utils/URLUtil";
import PDFUtil from "../../utils/PDFUtil";

type Props = {
  siteTitle: string,
  submission: Submission | null,
};

class Review extends Component<Props> {

  render() {
    const {submission} = {...this.props};

    if (!submission) {
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

    return (
      <div className="Review">
        <div className="questions">
          {submission.questions.map((question, index, all) => {
            const renderedData = this.renderData(question);
            return (
              <div className="row" key={question.id}>
                <div className="col">
                  <b>{index + 1}. {question.heading}</b>
                </div>
                <div className="vertical-divider"/>
                <div className="col">
                  {renderedData}
                </div>
              </div>
            );
          })}
        </div>
        <div className="buttons">
          <LightButton title="EDIT ANSWERS" iconImage={editIcon} classes={["button"]} onClick={this.handleEditAnswerButtonClick.bind(this)}/>
          <LightButton title="DOWNLOAD PDF" iconImage={pdfIcon} classes={["button"]} onClick={this.handlePDFDownloadButtonClick.bind(this)}/>
          <DarkButton title="SUBMIT FOR APPROVAL" classes={["button"]} onClick={this.handleSubmitButtonClick.bind(this)}/>
        </div>
      </div>
    );
  }

  renderData(question: Question): * {
    // Render data for non-applicable question
    if (!question.isApplicable) {
      const msg = "(Not applicable)";
      return (
        <div>{msg}</div>
      );
    }

    // Render data for non-answered question
    if (!question.hasAnswer) {
      const msg = "(Has no answer)";
      return (
        <div>{msg}</div>
      );
    }

    // Render data for input
    if (question.type === "input" && question.inputs && Array.isArray(question.inputs)) {
      return (
        <div>
          {question.inputs.map((input => {
            return (
              <div key={input.id}>
                <b>{input.label}</b>&nbsp;
                <span>-</span>&nbsp;
                <span>{input.data}</span>
              </div>
            );
          }))}
        </div>
      );
    }

    // Render data for action
    if (question.type === "action" && question.actions && Array.isArray(question.actions)) {
      let action: AnswerAction = _.head(question.actions.filter((action) => action.isChose));

      return (
        <div>
          {action && <div>{action.label}</div>}
        </div>
      );
    }
  }

  handleEditAnswerButtonClick() {
    const uuid = _.get(this.props, "submission.submissionUUID", "");
    if (!uuid) {
      return;
    }
    URLUtil.redirectToQuestionnaireEditing(uuid);
  }

  handlePDFDownloadButtonClick() {
    const {submission, siteTitle} = {...this.props};
    if (!submission) {
      return;
    }

    PDFUtil.generatePDF({
      questions: submission.questions,
      submitter: submission.submitter,
      questionnaireTitle: submission.questionnaireTitle,
      siteTitle
    });
  }

  handleSubmitButtonClick() {
    alert("Coming soon...");
  }
}

export default Review;
