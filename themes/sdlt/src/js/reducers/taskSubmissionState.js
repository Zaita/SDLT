// @flow

import type {TaskSubmissionState} from "../store/TaskSubmissionState";
import ActionType from "../actions/ActionType";
import type {Question} from "../types/Questionnaire";
import _ from "lodash";
import type {TaskSubmission} from "../types/Task";

const defaultStartState: TaskSubmissionState = {
  siteTitle: "",
  currentUser: null,
  taskSubmission: null,
};

export function taskSubmissionState(state: TaskSubmissionState = defaultStartState, action: *): TaskSubmissionState {
  const taskSubmission: TaskSubmission | null = state.taskSubmission;

  if (action.type === ActionType.TASK.LOAD_TASK_SUBMISSION_STATE) {
    return action.payload;
  }

  if (action.type === ActionType.TASK.PUT_DATA_IN_TASK_SUBMISSION) {
    if (!taskSubmission) {
      return state;
    }
    // Find the matched question
    const answeredQuestion: Question = action.payload;
    const index = taskSubmission.questions.findIndex((question) => {
      return question.id === answeredQuestion.id;
    });
    if (index < 0) {
      return state;
    }

    const newState = {...state};
    _.set(newState, `taskSubmission.questions.${index}`, answeredQuestion);
    return newState;
  }

  if (action.type === ActionType.TASK.MARK_TASK_QUESTION_NOT_APPLICABLE) {
    if (!taskSubmission) {
      return state;
    }
    const newState = {...state};

    // Mark questions between target and current to be "not applicable"
    const nonApplicableIndexes = action.payload;
    if (nonApplicableIndexes && nonApplicableIndexes.length > 0) {
      nonApplicableIndexes.forEach(index => {
        const nonApplicableQuestion = taskSubmission.questions[index];
        nonApplicableQuestion.isApplicable = false;
        _.set(newState, `taskSubmission.questions.${index}`, nonApplicableQuestion);
      });
    }

    return newState;
  }

  if (action.type === ActionType.TASK.MOVE_TO_ANOTHER_TASK_QUESTION) {
    if (!taskSubmission) {
      return state;
    }

    const {currentIndex, targetIndex} = {...action.payload};

    // Don't move when target is wrong
    if (targetIndex < 0 || targetIndex >= taskSubmission.questions.length) {
      return state;
    }

    const newState = {...state};

    // Mark current question is not current anymore
    _.set(newState, `taskSubmission.questions.${currentIndex}.isCurrent`, false);
    // Mark target question to be current
    _.set(newState, `taskSubmission.questions.${targetIndex}.isCurrent`, true);

    return newState;
  }

  return state;
}

