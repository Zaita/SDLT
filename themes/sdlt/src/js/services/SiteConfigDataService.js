// @flow

import GraphQLRequestHelper from "../utils/GraphQLRequestHelper";
import _ from "lodash";
import SiteConfigParser from "../utils/SiteConfigParser";

type SiteConfig = {
  siteTitle: string
};

export default class SiteConfigDataService {

  static async fetchSiteConfig(): Promise<SiteConfig> {
    const query = `
query {
  readSiteConfig {
    Title
    FooterCopyrightText
    LogoPath
    HomePageBackgroundImagePath
    PdfHeaderImageLink
    PdfFooterImageLink
  }
}`;
    const responseJSONObject = await GraphQLRequestHelper.request({query});
    const siteData = _.get(responseJSONObject, "data.readSiteConfig.0", null);
    const siteConfig = SiteConfigParser.parseSiteConfigFromJSON(siteData);
    return siteConfig;
  }
}
