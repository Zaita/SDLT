// @flow

export default class URLUtil {

  static redirectToQuestionnaireEditing(uuid: string) {
    window.location.href = `/#/questionnaire/submission/${uuid}`;
  }

  static redirectToQuestionnaireReview(uuid: string, token: string = "") {
    if (token) {
      window.location.href = `/#/questionnaire/review/${uuid}?token=${token}`;
      return;
    }
    window.location.href = `/#/questionnaire/review/${uuid}`;
  }

  static redirectToQuestionnaireSummary(uuid: string, token: string = "") {
    if (token) {
      window.location.href = `/#/questionnaire/summary/${uuid}?token=${token}`;
      return;
    }

    window.location.href = `/#/questionnaire/summary/${uuid}`;
  }

  static redirectToTaskSubmission(uuid: string, token: string = "") {
    if (token) {
      window.location.href = `/#/task/submission/${uuid}?token=${token}`;
      return;
    }

    window.location.href = `/#/task/submission/${uuid}`;
  }

  static redirectToComponentSelectionSubmission(uuid: string, token: string = "") {
    if (token) {
      window.location.href = `/#/component-selection/submission/${uuid}?token=${token}`;
      return;
    }

    window.location.href = `/#/component-selection/submission/${uuid}`;
  }

  static redirectToSecurityRiskAssessment(uuid: string, token: string = "") {
    if (token) {
      window.location.href = `/#/security-risk-assessment/submission/${uuid}?token=${token}`;
      return;
    }

    window.location.href = `/#/security-risk-assessment/submission/${uuid}`;
  }

  static redirectToControlValidationAudit(uuid: string, token: string = "") {
    if (token) {
      window.location.href = `/#/control-validation-audit/submission/${uuid}?token=${token}`;
      return;
    }

    window.location.href = `/#/control-validation-audit/submission/${uuid}`;
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
