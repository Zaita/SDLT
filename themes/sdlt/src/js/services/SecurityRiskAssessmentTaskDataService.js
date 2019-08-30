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
    ID
    UUID
    TaskName
    QuestionnaireSubmission {
      UUID
    }
    LikelihoodRatings
  }
}`;

    const responseJSONObject = await GraphQLRequestHelper.request({query});
    const submissionJSONObject = get(responseJSONObject, "data.readTaskSubmission.0", null);
    if (!submissionJSONObject) {
      throw DEFAULT_NETWORK_ERROR;
    }

    const data: TaskSubmission = {
      id: toString(get(submissionJSONObject, "ID", "")),
      uuid: toString(get(submissionJSONObject, "UUID", "")),
      taskName: toString(get(submissionJSONObject, "TaskName", "")),
      taskType: toString(get(submissionJSONObject, "TaskType", "")),
      status: toString(get(submissionJSONObject, "Status", "")),
      submitter: UserParser.parseUserFromJSON(get(submissionJSONObject, "Submitter")),
      questionnaireSubmissionUUID: toString(get(submissionJSONObject, "QuestionnaireSubmission.UUID", "")),
      questionnaireSubmissionID: toString(get(submissionJSONObject, "QuestionnaireSubmission.ID", "")),
      questionnaireSubmissionStatus: toString(get(submissionJSONObject, "QuestionnaireSubmission.QuestionnaireStatus", "")),
      likelihoodRatings: TaskParser.parseLikelihoodJSONObject(get(submissionJSONObject, "LikelihoodRatings"))
    };

    return data;
  }
}
