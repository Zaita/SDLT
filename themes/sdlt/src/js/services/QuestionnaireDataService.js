// @flow

import type {QuestionnaireStartState, QuestionnaireSubmissionState} from "../store/QuestionnaireState";
import GraphQLRequestHelper from "../utils/GraphQLRequestHelper";
import _ from "lodash";
import {DEFAULT_NETWORK_ERROR} from "../constants/errors";
import submissionFixture from "../../../__fixtures__/QuestionnaireSubmissionState";

export default class QuestionnaireDataService {

  static async createInProgressSubmission(argument: {questionnaireID: string, csrfToken: string}): Promise<string> {
    const {questionnaireID, csrfToken} = {...argument};
    const query = `
mutation {
 createQuestionnaireSubmission(QuestionnaireID: ${questionnaireID}){
   UUID
 }
}`;

    const json = await GraphQLRequestHelper.request({query, csrfToken});
    const submissionHash = _.get(json, "data.createQuestionnaireSubmission.UUID", null);
    if (!submissionHash) {
      throw DEFAULT_NETWORK_ERROR;
    }

    return submissionHash;
  }

  static async fetchStartData(questionnaireID: string): Promise<QuestionnaireStartState> {
    const query = `
query {
  readCurrentMember {
    Email
    FirstName
    Surname
    UserRole
  }
  readQuestionnaire(ID: ${questionnaireID}) {
    ID
    Name
    KeyInformation
  }
  readSiteConfig {
    Title
  }
}
`;

    const json = await GraphQLRequestHelper.request({query});
    const memberData = _.get(json, "data.readCurrentMember.0", null);
    const questionnaireData = _.get(json, "data.readQuestionnaire", null);
    const siteData = _.get(json, "data.readSiteConfig.0", null);

    if(!memberData || !questionnaireData || !siteData) {
      throw DEFAULT_NETWORK_ERROR;
    }

    return {
      title: _.get(questionnaireData, "Name", ""),
      subtitle: _.get(siteData, "Title", ""),
      questionnaireID: _.get(questionnaireData, "ID", ""),
      keyInformation: _.get(questionnaireData, "KeyInformation", ""),
      user: {
        name: `${_.get(memberData, "FirstName")} ${_.get(memberData, "Surname")}`,
        role: _.get(memberData, "UserRole"),
        email: _.get(memberData, "Email"),
      },
    };
  }

  static async fetchSubmissionData(submissionHash: string): Promise<QuestionnaireSubmissionState> {
    // TODO: fetch real data
    return submissionFixture;
  }
}
