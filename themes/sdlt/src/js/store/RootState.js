// @flow

import type {HomeState} from "./HomeState";
import type {QuestionnaireState} from "./QuestionnaireState";
import type {TaskSubmissionState} from "./TaskSubmissionState";
import type {SiteConfigState} from "./SiteConfigState";
import type {CurrentUserState} from "./CurrentUserState";
import type {ComponentSelectionState} from "./ComponentSelectionState";
import type {MySubmissionListState} from "./MySubmissionListState";

export type RootState = {
  homeState: HomeState,
  questionnaireState: QuestionnaireState,
  taskSubmissionState: TaskSubmissionState,
  siteConfigState: SiteConfigState,
  currentUserState: CurrentUserState,
  componentSelectionState: ComponentSelectionState,
  mySubmissionListState: MySubmissionListState
}
