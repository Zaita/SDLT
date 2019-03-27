// @flow

import type {HomeState} from "./HomeState";
import type {QuestionnaireState} from "./QuestionnaireState";
import type {TaskSubmissionState} from "./TaskSubmissionState";

export type RootState = {
  homeState: HomeState,
  questionnaireState: QuestionnaireState,
  taskSubmissionState: TaskSubmissionState
}
