// @flow

export default class URLUtil {

  static redirectToQuestionnaireEditing(uuid: string) {
    window.location.href = `/#/questionnaire/submission/${uuid}`;
  }

  static redirectToQuestionnaireReview(uuid: string) {
    window.location.href = `/#/questionnaire/review/${uuid}`;
  }

  static redirectToQuestionnaireSummary(uuid: string) {
    window.location.href = `/#/questionnaire/summary/${uuid}`;
  }

  static redirectToLogout() {
    window.location.href = "/Security/Logout";
  }

  static redirectToLogin() {
    window.location.href = "/Security/login?BackURL=%2F";
  }
}
