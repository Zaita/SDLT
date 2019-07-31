import type {QuestionnaireSubmissionListItem} from "../types/Questionnaire";

export type QuestionnaireSubmissionListState = {
  awaitingApprovalList: Array<QuestionnaireSubmissionListItem>,
  mySubmissionList: Array<QuestionnaireSubmissionListItem>,
  myProductList: Array<QuestionnaireSubmissionListItem>
}
