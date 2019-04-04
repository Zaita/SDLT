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
};

class TaskSubmission extends Component<Props> {

  static defaultProps = {
    saveAnsweredQuestion: () => {},
    moveToPreviousQuestion: () => {},
    editAnswers: () => {},
    showBackButton: true,
    showEditButton: true,
  };

  render() {
    const {
      taskSubmission,
      saveAnsweredQuestion,
      moveToPreviousQuestion,
      editAnswers,
      showBackButton,
      showEditButton
    } = {...this.props};

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
      <DarkButton
        title={"BACK TO QUESTIONNAIRE SUMMARY"}
        onClick={() => {
          URLUtil.redirectToQuestionnaireSummary(taskSubmission.questionnaireSubmissionUUID);
        }}
      />
    ) : null;

    const editButton = taskSubmission.status === "complete" ? (
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
          {showEditButton && editButton}
          {showBackButton && backButton}
        </div>
      </div>
    );
  }
}

export default TaskSubmission;
