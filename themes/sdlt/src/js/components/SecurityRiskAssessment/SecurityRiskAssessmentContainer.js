// @flow

import React, {Component} from "react";
import {connect} from "react-redux";
import type {RootState} from "../../store/RootState";
import {Dispatch} from "redux";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import {loadCurrentUser} from "../../actions/user";
import LikelihoodLegendContainer from "./LikelihoodLegendContainer";
import ImpactThresholdContainer from "./ImpactThresholdContainer";
import RiskAssessmentMatrixTableContainer from "./RiskAssessmentMatrixTableContainer";
import RiskRatingThresholdContainer from "./RiskRatingThresholdContainer";
import type {User} from "../../types/User";
import {
  loadSecurityRiskAssessment,
  loadImpactThreshold
} from "../../actions/securityRiskAssessment";
import {
  completeTaskSubmission
} from "../../actions/task";
import type {SecurityRiskAssessment} from "../../types/Task";
import URLUtil from "../../utils/URLUtil";
import LightButton from "../Button/LightButton";
import DarkButton from "../Button/DarkButton";
import {loadSiteConfig} from "../../actions/siteConfig";
import type {SiteConfig} from "../../types/SiteConfig";
import type {ImpactThreshold} from "../../types/ImpactThreshold";
import SecurityRiskAssessmentUtil from "../../utils/SecurityRiskAssessmentUtil";
import {SubmissionExpired} from "../Common/SubmissionExpired";

const mapStateToProps = (state: RootState) => {
  return {
    siteConfig: state.siteConfigState.siteConfig,
    currentUser: state.currentUserState.user,
    securityRiskAssessmentData: state.securityRiskAssessmentState.securityRiskAssessmentData,
    impactThresholdData: state.securityRiskAssessmentState.impactThresholdData
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: *) => {
  return {
    dispatchLoadDataAction(uuid: string, secureToken: string) {
      dispatch(loadCurrentUser());
      dispatch(loadSiteConfig());
      dispatch(loadSecurityRiskAssessment({uuid, secureToken}));
      dispatch(loadImpactThreshold());
    },
    dispatchFinaliseAction(uuid: string, secureToken?: string | null, questionnaireUUID) {
      dispatch(completeTaskSubmission({'taskSubmissionUUID': uuid, 'secureToken': secureToken, 'questionnaireUUID': questionnaireUUID}));
    }
  };
};

type Props = {
  uuid: string,
  secureToken: string,
  siteConfig?: SiteConfig | null,
  currentUser?: User | null,
  impactThresholdData?: Array<ImpactThreshold> | null,
  securityRiskAssessmentData?: SecurityRiskAssessment | null,
  dispatchLoadDataAction?: (uuid: string, secureToken: string) => void,
  dispatchFinaliseAction?: (uuid: string, secureToken: string) => void,
};

class SecurityRiskAssessmentContainer extends Component<Props> {
  componentDidMount() {
    const {uuid, dispatchLoadDataAction, secureToken} = {...this.props};
    dispatchLoadDataAction(uuid, secureToken);
  }


  render() {
    const {
      siteConfig,
      currentUser,
      securityRiskAssessmentData,
      secureToken,
      impactThresholdData
    } = {...this.props};

    if (!currentUser || !siteConfig || !securityRiskAssessmentData) {
      return null;
    }

    const {
      uuid,
      taskName,
      questionnaireSubmissionUUID,
      submitterID,
      taskSubmissions,
      sraData,
      status
    } = {...securityRiskAssessmentData};

    const isSRATaskFinalised = SecurityRiskAssessmentUtil.isSRATaskFinalised(taskSubmissions);

    const backButton = (
      <LightButton
        title={"BACK TO QUESTIONNAIRE SUMMARY"}
        classes={["button ml-3"]}
        onClick={() => {
          URLUtil.redirectToQuestionnaireSummary(questionnaireSubmissionUUID, secureToken);
        }}
      />
    );

    const isSiblingTaskPending = SecurityRiskAssessmentUtil.isSiblingTaskPending(taskSubmissions);

    const isSubmitter = securityRiskAssessmentData.submitterID === currentUser.id;

    const finaliseButton = !isSRATaskFinalised && !isSiblingTaskPending && isSubmitter
      ? (
        <DarkButton title="FINALISE"
          classes={["button ml-3"]}
          onClick={() => {
            this.props.dispatchFinaliseAction(uuid, secureToken, questionnaireSubmissionUUID);
          }}
        />
      )
      : null;

    return (
      <div className="SecurityRiskAssessmentContainer">

        <Header title={securityRiskAssessmentData.taskName} subtitle={siteConfig.siteTitle} username={currentUser.name} logopath={siteConfig.logoPath} />

        {securityRiskAssessmentData.status === 'expired' && <SubmissionExpired/>}
        {
          securityRiskAssessmentData.status !== 'expired' && (
            <div className="SecurityRiskAssessmentResult">
              {isSRATaskFinalised ? SecurityRiskAssessmentUtil.getSraIsFinalisedAlert() : false}

              <RiskAssessmentMatrixTableContainer
                calculatedSRAData={sraData.calculatedSRAData}
                hasProductAspects={sraData.hasProductAspects}
              />

              <LikelihoodLegendContainer
                likelihoodThresholds={sraData.likelihoodThresholds}
              />

              <ImpactThresholdContainer impactThresholds={impactThresholdData} />

              <RiskRatingThresholdContainer
                riskRatingThresholds={sraData.riskRatingThresholds}
              />

              <div className="buttons">
                {backButton}
                {finaliseButton}
              </div>
            </div>
          )
        }
        <Footer footerCopyrightText={siteConfig.footerCopyrightText}/>
      </div>
    )
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SecurityRiskAssessmentContainer);
