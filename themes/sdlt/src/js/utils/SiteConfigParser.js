// @flow

import type {Siteconfig} from "../types/SiteConfig";
import get from "lodash/get";
import toString from "lodash/toString";
import DefaultLogoImage from "../../img/Logo.svg";
import DefaultBackgroundImage from "../../img/Home/background.jpg";
import DefaultPDFHeaderImage from "../../img/PDF/heading.jpg";
import DefaultPDFFooterImage from "../../img/PDF/footer.jpg";

export default class SiteConfigParser {
  static parseSiteConfigFromJSON(siteConfigJSON: string | Object): Siteconfig {
    const jsonObject = (typeof siteConfigJSON === "string" ? JSON.parse(siteConfigJSON) : siteConfigJSON);
    const defaultFooterText = String.fromCharCode(169) + ' NZTA ' + (new Date()).getFullYear();

    // Ensure defaults are configured for when user-contributed config doesn't yet exist
    return {
      siteTitle: toString(get(jsonObject, "Title") || 'NZTA SDLT'),
      footerCopyrightText: toString(get(jsonObject, "FooterCopyrightText", '') || defaultFooterText),
      logoPath: toString(get(jsonObject, "LogoPath", '') || DefaultLogoImage),
      homePageBackgroundImagePath: toString(get(jsonObject, "HomePageBackgroundImagePath", '') || DefaultBackgroundImage),
      pdfHeaderImageLink: toString(get(jsonObject, "PdfHeaderImageLink", '') || DefaultPDFHeaderImage),
      pdfFooterImageLink: toString(get(jsonObject, "PdfFooterImageLink", '') || DefaultPDFFooterImage)
    }
  }
}
