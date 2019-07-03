// @flow

import GraphQLRequestHelper from "../utils/GraphQLRequestHelper";
import _ from "lodash";
import {DEFAULT_NETWORK_ERROR} from "../constants/errors";
import type {Submission} from "../types/Questionnaire";
import type {TaskSubmissionDisplay} from "../types/Task";
import QuestionParser from "../utils/QuestionParser";
import type {User} from "../types/User";

type QuestionnaireSubmissionState = {
  siteTitle: string,
  submission: Submission | null,
};

export default class QuestionnaireForBusinessOwnerDataService {

  static async fetchSubmissionData(argument: { uuid: string, secureToken: string }): Promise<QuestionnaireSubmissionState> {
    const {uuid, secureToken} = {...argument};
    const query = `
query {
  readQuestionnaireSubmission(UUID: "${uuid}", SecureToken: "${secureToken}") {
    ID
    UUID
    User {
      ID
    }
    SubmitterName,
    SubmitterEmail,
    QuestionnaireStatus
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
    TaskSubmissions {
      UUID
      TaskName
      TaskType
      Status
    }
  }
  readSiteConfig {
    Title
  }
}`;
    const json = await GraphQLRequestHelper.request({query});

    const memberData = _.get(json, "data.readCurrentMember.0", {});
    const submissionJSON = _.get(json, "data.readQuestionnaireSubmission.0", {});
    if (!memberData || !submissionJSON) {
      throw DEFAULT_NETWORK_ERROR;
    }

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
        approvalStatus: {
          chiefInformationSecurityOfficer: _.toString(_.get(submissionJSON, "CisoApprovalStatus", "")),
          businessOwner: _.toString(_.get(submissionJSON, "BusinessOwnerApprovalStatus", "")),
          securityArchitect: _.toString(_.get(submissionJSON, "SecurityArchitectApprovalStatus", "")),
        },
        questions: QuestionParser.parseQuestionsFromJSON({
          schemaJSON: _.toString(_.get(submissionJSON, "QuestionnaireData", "")),
          answersJSON: _.toString(_.get(submissionJSON, "AnswerData", "")),
        }),
        taskSubmissions: _
          .toArray(_.get(submissionJSON, "TaskSubmissions", []))
          .map((item) => {
            const taskSubmission: TaskSubmissionDisplay = {
              uuid: _.toString(_.get(item, "UUID", "")),
              taskName: _.toString(_.get(item, "TaskName", "")),
              taskType: _.toString(_.get(item, "TaskType", "")),
              status: _.toString(_.get(item, "Status", "")),
            };
            return taskSubmission;
          }),
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
