// @flow

import type {HomeState} from "./HomeState";
import type {QuestionnaireState} from "./QuestionnaireState";

export type RootState = {
  homeState: HomeState,
  questionnaireState: QuestionnaireState
}
