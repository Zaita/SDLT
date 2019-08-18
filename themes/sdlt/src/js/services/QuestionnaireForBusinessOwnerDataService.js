// @flow

import GraphQLRequestHelper from "../utils/GraphQLRequestHelper";
import _ from "lodash";
import {DEFAULT_NETWORK_ERROR} from "../constants/errors";
import type {Submission} from "../types/Questionnaire";
import type {TaskSubmissionDisplay} from "../types/Task";
import QuestionParser from "../utils/QuestionParser";
import type {User} from "../types/User";
import UserParser from "../utils/UserParser";

type QuestionnaireSubmissionState = {
  siteTitle: string,
  submission: Submission | null,
};

export default class QuestionnaireForBusinessOwnerDataService {

  static async fetchSubmissionData(argument: { uuid: string, secureToken: string, isBusinessOwnerSummaryPage: string }): Promise<QuestionnaireSubmissionState> {
    const {uuid, secureToken, isBusinessOwnerSummaryPage} = {...argument};
    const query = `
query {
  readQuestionnaireSubmission(UUID: "${uuid}", SecureToken: "${secureToken}", IsBusinessOwnerSummaryPage: "${isBusinessOwnerSummaryPage}") {
    ID
    UUID
    User {
      ID
    }
    SubmitterName,
    SubmitterEmail,
    QuestionnaireStatus,
    BusinessOwnerApproverName,
    GQRiskResult,
    Questionnaire {
      ID
      Name
    }
    QuestionnaireData
    AnswerData
    CisoApprovalStatus
    BusinessOwnerApprovalStatus
    SecurityArchitectApprovalStatus
    IsCurrentUserAnApprover
    CisoApprover {
      FirstName
      Surname
    }
    SecurityArchitectApprover {
      FirstName
      Surname
    }

    TaskSubmissions {
      UUID
      TaskName
      TaskType
      Status
      TaskApprover {
        ID
        FirstName
        Surname
      }
    }
  }
  readSiteConfig {
    Title
  }
}`;
    const json = await GraphQLRequestHelper.request({query});

    const submissionJSON = _.get(json, "data.readQuestionnaireSubmission.0", {});
    if (!submissionJSON) {
      throw DEFAULT_NETWORK_ERROR;
    }

    // @todo : change with real value

    const data: QuestionnaireSubmissionState = {
      siteTitle: _.toString(_.get(json, "data.readSiteConfig.0.Title", "")),
      submission: {
        questionnaireID: _.toString(_.get(submissionJSON, "Questionnaire.ID", "")),
        questionnaireTitle: _.toString(_.get(submissionJSON, "Questionnaire.Name", "")),
        submissionID: _.toString(_.get(submissionJSON, "ID", "")),
        submissionUUID: _.toString(_.get(submissionJSON, "UUID", "")),
        submitter: {
          id: _.toString(_.get(submissionJSON, "User.ID")),
          name: _.toString(_.get(submissionJSON, "SubmitterName", "")),
          email: _.toString(_.get(submissionJSON, "SubmitterEmail", "")),
          isSA: false,
          isCISO: false
        },
        status: _.toString(_.get(submissionJSON, "QuestionnaireStatus", "")).toLowerCase().replace("-", "_"),
        businessOwnerApproverName: _.toString(_.get(submissionJSON, "BusinessOwnerApproverName", "")),
        approvalStatus: {
          chiefInformationSecurityOfficer: _.toString(_.get(submissionJSON, "CisoApprovalStatus", "")),
          businessOwner: _.toString(_.get(submissionJSON, "BusinessOwnerApprovalStatus", "")),
          securityArchitect: _.toString(_.get(submissionJSON, "SecurityArchitectApprovalStatus", "")),
        },
        questions: QuestionParser.parseQuestionsFromJSON({
          schemaJSON: _.toString(_.get(submissionJSON, "QuestionnaireData", "")),
          answersJSON: _.toString(_.get(submissionJSON, "AnswerData", "")),
        }),
        securityArchitectApprover: {
          FirstName: _.toString(_.get(submissionJSON, "SecurityArchitectApprover.FirstName", "")),
          Surname: _.toString(_.get(submissionJSON, "SecurityArchitectApprover.Surname", "")),
        },
        cisoApprover: {
          FirstName: _.toString(_.get(submissionJSON, "CisoApprover.FirstName", "")),
          Surname: _.toString(_.get(submissionJSON, "CisoApprover.Surname", "")),
        },
        taskSubmissions: _.toArray(_.get(submissionJSON, "TaskSubmissions", []))
          .map((item) => {
            const taskSubmission: TaskSubmissionDisplay = {
              uuid: _.toString(_.get(item, "UUID", "")),
              taskName: _.toString(_.get(item, "TaskName", "")),
              taskType: _.toString(_.get(item, "TaskType", "")),
              status: _.toString(_.get(item, "Status", "")),
              approver: UserParser.parseUserFromJSON(_.get(item, "TaskApprover")),
            };
            return taskSubmission;
          }),
        riskResults: _.has(submissionJSON, 'GQRiskResult') ? JSON.parse(_.get(submissionJSON, "GQRiskResult", "")) : ""
      },
    };

    return data;
  }

  static async approveQuestionnaireSubmission(
    argument: { submissionID: string, csrfToken: string, secureToken: string },
  ): Promise<{ uuid: string }> {
    const {submissionID, csrfToken, secureToken} = {...argument};
    const query = `
mutation {
 updateQuestionnaireStatusToApproved(ID: "${submissionID}", SecureToken: "${secureToken}") {
   QuestionnaireStatus
   UUID
 }
}`;
    const json = await GraphQLRequestHelper.request({query, csrfToken});
    const status = _.toString(
      _.get(json, "data.updateQuestionnaireStatusToApproved.QuestionnaireStatus", null));
    const uuid = _.toString(_.get(json, "data.updateQuestionnaireStatusToApproved.UUID", null));
    if (!status || !uuid) {
      throw DEFAULT_NETWORK_ERROR;
    }
    return {uuid};
  }

  static async denyQuestionnaireSubmission(
    argument: { submissionID: string, csrfToken: string, secureToken: string },
  ): Promise<{ uuid: string }> {
    const {submissionID, csrfToken, secureToken} = {...argument};
    const query = `
mutation {
 updateQuestionnaireStatusToDenied(ID: "${submissionID}", SecureToken: "${secureToken}") {
   QuestionnaireStatus
   UUID
 }
}`;
    const json = await GraphQLRequestHelper.request({query, csrfToken});
    const status = _.toString(_.get(json, "data.updateQuestionnaireStatusToDenied.QuestionnaireStatus", null));
    const uuid = _.toString(_.get(json, "data.updateQuestionnaireStatusToDenied.UUID", null));
    if (!status || !uuid) {
      throw DEFAULT_NETWORK_ERROR;
    }
    return {uuid};
  }
}
