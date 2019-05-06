// @flow

import GraphQLRequestHelper from "../utils/GraphQLRequestHelper";
import _ from "lodash";
import {DEFAULT_NETWORK_ERROR} from "../constants/errors";
import QuestionParser from "../utils/QuestionParser";
import type {TaskSubmission} from "../types/Task";
import UserParser from "../utils/UserParser";
import get from "lodash/get";
import toString from "lodash/toString";
import toArray from "lodash/toArray";
import SecurityComponentParser from "../utils/SecurityComponentParser";
import JiraTicketParser from "../utils/JiraTicketParser";

type FetchTaskSubmissionDataArgument = { uuid: string, token: string };
type FetchTaskSubmissionDataReturn = { siteTitle: string, taskSubmission: TaskSubmission };

// TODO: Refactor - Should use TaskDataService instead as TaskDataService now accepts `token` argument
export default class TaskForBusinessOwnerDataService {

  static async fetchTaskSubmissionData(argument: FetchTaskSubmissionDataArgument): Promise<FetchTaskSubmissionDataReturn> {

    const {uuid, token} = {...argument};

    const query = `
query {
  readSiteConfig {
    Title
  }
  readTaskSubmission(UUID: "${uuid}", SecureToken: "${token}") {
    ID
    UUID
    TaskName
    TaskType
    Status
    Result
    LockAnswersWhenComplete
    Submitter {
      ID
      Email
      FirstName
      Surname
      IsSA
      IsCISO
    }
    QuestionnaireSubmission {
      UUID
      ID
    }
    QuestionnaireData
    AnswerData
    SelectedComponents {
      ID
      Name
      Description
    }
    JiraTickets {
      ID
      JiraKey
      TicketLink
    }
  }
}`;
    const responseJSONObject = await GraphQLRequestHelper.request({query});
    const submissionJSONObject = _.get(responseJSONObject, "data.readTaskSubmission.0", {});
    if (!submissionJSONObject) {
      throw DEFAULT_NETWORK_ERROR;
    }

    const data: FetchTaskSubmissionDataReturn = {
      siteTitle: _.toString(_.get(responseJSONObject, "data.readSiteConfig.0.Title", "")),
      taskSubmission: {
        id: _.toString(_.get(submissionJSONObject, "ID", "")),
        uuid: _.toString(_.get(submissionJSONObject, "UUID", "")),
        taskName: _.toString(_.get(submissionJSONObject, "TaskName", "")),
        taskType: toString(get(submissionJSONObject, "TaskType", "")),
        status: _.toString(_.get(submissionJSONObject, "Status", "")),
        result: _.toString(_.get(submissionJSONObject, "Result", "")),
        submitter: UserParser.parseUserFromJSON(get(submissionJSONObject, "Submitter")),
        questionnaireSubmissionUUID: _.toString(_.get(submissionJSONObject, "QuestionnaireSubmission.UUID", "")),
        questionnaireSubmissionID: _.toString(_.get(submissionJSONObject, "QuestionnaireSubmission.ID", "")),
        lockWhenComplete: Boolean(get(submissionJSONObject, "LockAnswersWhenComplete", false)),
        questions: QuestionParser.parseQuestionsFromJSON({
          schemaJSON: _.toString(_.get(submissionJSONObject, "QuestionnaireData", "")),
          answersJSON: _.toString(_.get(submissionJSONObject, "AnswerData", "")),
        }),
        selectedComponents: SecurityComponentParser.parseFromJSONOArray(get(submissionJSONObject, "SelectedComponents", [])),
        jiraTickets: JiraTicketParser.parseFromJSONArray(get(submissionJSONObject, "JiraTickets", []))
      },
    };

    return data;
  }
}
