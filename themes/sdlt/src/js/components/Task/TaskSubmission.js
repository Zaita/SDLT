// @flow

import React, {Component} from "react";
import Questionnaire from "../Questionnaire/Questionnaire";
import AnswersPreview from "../Questionnaire/AnswersPreview";
import type {TaskSubmission as TaskSubmissionType} from "../../types/Task"
import type {Question} from "../../types/Questionnaire";
import {Link} from "react-router-dom";
import LightButton from "../Button/LightButton";
import URLUtil from "../../utils/URLUtil";

type Props = {
  taskSubmission: TaskSubmissionType,
  saveAnsweredQuestion: (answeredQuestion: Question) => void,
  moveToPreviousQuestion: (targetQuestion: Question) => void
};

class TaskSubmission extends Component<Props> {

  render() {
    const {taskSubmission, saveAnsweredQuestion, moveToPreviousQuestion} = {...this.props};

    let body = null;

    // Display questionnaire form for in-progress task submission
    if (taskSubmission.status === "in_progress") {
      body = (
        <Questionnaire
          questions={taskSubmission.questions}
          saveAnsweredQuestion={saveAnsweredQuestion}
          onLeftBarItemClick={moveToPreviousQuestion}
        />
      );
    }

    // Display answers preview for completed task submission
    if (taskSubmission.status === "complete") {
      body = (
        <AnswersPreview questions={taskSubmission.questions}/>
      );
    }

    const backButton = taskSubmission.questionnaireSubmissionUUID ? (
      <LightButton
        title={"BACK TO QUESTIONNAIRE SUMMARY"}
        onClick={() => {
          URLUtil.redirectToQuestionnaireSummary(taskSubmission.questionnaireSubmissionUUID)
        }}
      />
    ) : null;

    return (
      <div className="TaskSubmission">
        {body}

        <div className="buttons">
          {backButton}
        </div>
      </div>
    );
  }
}

export default TaskSubmission;
