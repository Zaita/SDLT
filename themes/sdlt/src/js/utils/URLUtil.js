// @flow

export default class URLUtil {

  static redirectToQuestionnaireEditing(uuid: string) {
    window.location.href = `/#/questionnaire/submission/${uuid}`;
  }

  static redirectToQuestionnaireReview(uuid: string) {
    window.location.href = `/#/questionnaire/review/${uuid}`;
  }

  static redirectToQuestionnaireSummary(uuid: string, token: string = "") {
    if (token) {
      window.location.href = `/businessOwnerApproval/#/questionnaire/summary/${uuid}?token=${token}`;
      return;
    }

    window.location.href = `/#/questionnaire/summary/${uuid}`;
  }

  static redirectToTaskSubmission(uuid: string, token: string = "") {
    if (token) {
      window.location.href = `/businessOwnerApproval/#/task/submission/${uuid}?token=${token}`;
      return;
    }

    window.location.href = `/#/task/submission/${uuid}`;
  }

  static redirectToComponentSelectionSubmission(uuid: string, token: string = "") {
    if (token) {
      window.location.href = `/businessOwnerApproval/#/component-selection/submission/${uuid}?token=${token}`;
      return;
    }

    window.location.href = `/#/component-selection/submission/${uuid}`;
  }

  static redirectToLogout() {
    window.location.href = "/Security/Logout";
  }

  static redirectToLogin() {
    window.location.href = "/Security/login?BackURL=%2F";
  }

  static redirectToHome() {
    window.location.href = "/";
  }
}
