// @flow

import React, {Component} from "react";
import Questionnaire from "../Questionnaire/Questionnaire";
import AnswersPreview from "../Questionnaire/AnswersPreview";
import type {TaskSubmission as TaskSubmissionType} from "../../types/Task";
import type {Question} from "../../types/Questionnaire";
import editIcon from "../../../img/icons/edit.svg";
import LightButton from "../Button/LightButton";
import URLUtil from "../../utils/URLUtil";
import DarkButton from "../Button/DarkButton";

type Props = {
  taskSubmission: TaskSubmissionType,
  saveAnsweredQuestion: (answeredQuestion: Question) => void,
  moveToPreviousQuestion: (targetQuestion: Question) => void,
  editAnswers: () => void,
  showBackButton: boolean,
  showEditButton: boolean,
  canUpdateAnswers: boolean
};

class TaskSubmission extends Component<Props> {

  static defaultProps = {
    saveAnsweredQuestion: () => {},
    moveToPreviousQuestion: () => {},
    editAnswers: () => {},
    showBackButton: true,
    showEditButton: true,
    canUpdateAnswers: true
  };

  render() {
    const {
      taskSubmission,
      saveAnsweredQuestion,
      moveToPreviousQuestion,
      editAnswers,
      showBackButton,
      showEditButton,
      canUpdateAnswers
    } = {...this.props};

    let body = null;

    if (canUpdateAnswers && taskSubmission.status === "in_progress") {
      body = (
        <Questionnaire
          questions={taskSubmission.questions}
          saveAnsweredQuestion={saveAnsweredQuestion}
          onLeftBarItemClick={moveToPreviousQuestion}
        />
      );
    }

    if (!canUpdateAnswers || taskSubmission.status === "complete") {
      body = (
        <AnswersPreview questions={taskSubmission.questions}/>
      );
    }

    const backButton = showBackButton && taskSubmission.questionnaireSubmissionUUID ? (
      <DarkButton
        title={"BACK TO QUESTIONNAIRE SUMMARY"}
        onClick={() => {
          URLUtil.redirectToQuestionnaireSummary(taskSubmission.questionnaireSubmissionUUID);
        }}
      />
    ) : null;

    const editButton = showEditButton && taskSubmission.status === "complete" ? (
      <LightButton title={"EDIT ANSWERS"} onClick={editAnswers} iconImage={editIcon}/>
    ) : null;

    const result = taskSubmission.result && taskSubmission.status === "complete" ? (
      <div className="result">
        <h3>Result:</h3>
        <div>{taskSubmission.result}</div>
      </div>
    ) : null;

    return (
      <div className="TaskSubmission">
        {result}
        {body}

        <div className="buttons">
          {editButton}
          {backButton}
        </div>
      </div>
    );
  }
}

export default TaskSubmission;
