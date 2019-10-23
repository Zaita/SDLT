// @flow

import GraphQLRequestHelper from "../utils/GraphQLRequestHelper";
import get from "lodash/get";
import toString from "lodash/toString";
import {DEFAULT_NETWORK_ERROR} from "../constants/errors";
import type {Task, TaskSubmission} from "../types/Task";
import UserParser from "../utils/UserParser";
import TaskParser from "../utils/TaskParser";

export default class SecurityRiskAssessmentTaskDataService {

  static async fetchSecurityRiskAssessmentTasK(args: { uuid: string, secureToken?: string }): Promise<TaskSubmission> {
    const {uuid, secureToken} = {...args};
    const query = `
query {
  readTaskSubmission(UUID: "${uuid}", SecureToken: "${secureToken || ""}") {
    UUID
    TaskName
    Status
    QuestionnaireSubmission {
      UUID
      TaskSubmissions {
        UUID
        Status
        TaskType
      }
    }
    SecurityRiskAssessmentTableData
  }
}`;

    const responseJSONObject = await GraphQLRequestHelper.request({query});
    const submissionJSONObject = get(responseJSONObject, "data.readTaskSubmission.0", null);
    if (!submissionJSONObject) {
      throw DEFAULT_NETWORK_ERROR;
    }

    const data: TaskSubmission = {
      uuid: submissionJSONObject && submissionJSONObject.UUID ? submissionJSONObject.UUID : '',
      taskName: toString(get(submissionJSONObject, "TaskName", "")),
      questionnaireSubmissionUUID: toString(get(submissionJSONObject, "QuestionnaireSubmission.UUID", "")),
      taskSubmissions: TaskParser.parseAlltaskSubmissionforQuestionnaire(submissionJSONObject),
      securityRiskAssessmentTableData: JSON.parse(get(submissionJSONObject, 'SecurityRiskAssessmentTableData', ''))
    };

    return data;
  }
}
