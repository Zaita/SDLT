// @flow

import React, {Component} from "react";
import {connect} from "react-redux";
import type {RootState} from "../../store/RootState";
import {Dispatch} from "redux";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import {loadCurrentUser} from "../../actions/user";
import LikelihoodLegendContainer from "./LikelihoodLegendContainer";
import RiskAssessmentMatrixTableContainer from "./RiskAssessmentMatrixTableContainer";
import type {User} from "../../types/User";
import {
  loadSecurityRiskAssessment
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
import SecurityRiskAssessmentUtil from "../../utils/SecurityRiskAssessmentUtil";

const mapStateToProps = (state: RootState) => {
  return {
    siteConfig: state.siteConfigState.siteConfig,
    currentUser: state.currentUserState.user,
    securityRiskAssessmentData: state.securityRiskAssessmentState.securityRiskAssessmentData,
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: *) => {
  return {
    dispatchLoadDataAction(uuid: string, secureToken: string) {
      dispatch(loadCurrentUser());
      dispatch(loadSiteConfig());
      dispatch(loadSecurityRiskAssessment({uuid, secureToken}));
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
      secureToken
    } = {...this.props};

    if (!currentUser || !siteConfig || !securityRiskAssessmentData) {
      return null;
    }

    const isSRATaskFinalised = SecurityRiskAssessmentUtil.isSRATaskFinalised(securityRiskAssessmentData.taskSubmissions);
    const backButton = (
      <LightButton
        title={"BACK TO QUESTIONNAIRE SUMMARY"}
        onClick={() => {
          URLUtil.redirectToQuestionnaireSummary(securityRiskAssessmentData.questionnaireSubmissionUUID, secureToken);
        }}
      />
    );

    const isSiblingTaskPending = SecurityRiskAssessmentUtil.isSiblingTaskPending(securityRiskAssessmentData.taskSubmissions);
    const finaliseButton = !isSRATaskFinalised && !isSiblingTaskPending
      ? (
        <DarkButton title="FINALISE"
          classes={["button ml-2"]}

          onClick={() => {
            this.props.dispatchFinaliseAction(securityRiskAssessmentData.uuid, secureToken, securityRiskAssessmentData.questionnaireSubmissionUUID);
          }}
        />
      )
      : null;

    return (
      <div className="SecurityRiskAssessmentContainer">
        <Header title={securityRiskAssessmentData.taskName} subtitle={siteConfig.siteTitle} username={currentUser.name} logopath={siteConfig.logoPath} />

        <div className="SecurityRiskAssessmentResult">
          {isSRATaskFinalised ? SecurityRiskAssessmentUtil.getSraIsFinalisedAlert() : false}
          <RiskAssessmentMatrixTableContainer
            tableData={securityRiskAssessmentData.securityRiskAssessmentTableData}
          />

          <LikelihoodLegendContainer
            likelihoodThresholds={securityRiskAssessmentData.securityRiskAssessmentTableData.LikelihoodThresholds}
          />
          <div className="buttons">
            {backButton}
            {finaliseButton}
          </div>

        </div>
        <Footer footerCopyrightText={siteConfig.footerCopyrightText}/>
      </div>
    )
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SecurityRiskAssessmentContainer);
