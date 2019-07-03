// @flow

import GraphQLRequestHelper from "../utils/GraphQLRequestHelper";
import _ from "lodash";

type SiteConfig = {
  siteTitle: string
};

export default class SiteConfigDataService {

  static async fetchSiteConfig(): Promise<SiteConfig> {
    const query = `
query {
  readSiteConfig {
    Title
  }
}`;
    const responseJSONObject = await GraphQLRequestHelper.request({query});

    const siteTitle = _.toString(_.get(responseJSONObject, "data.readSiteConfig.0.Title", ""));
    return {siteTitle};
  }
}
