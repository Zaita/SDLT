// @flow

import React, {Component} from "react";
import {connect} from "react-redux";
import type {RootState} from "../../store/RootState";
import {Dispatch} from "redux";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import {loadCurrentUser} from "../../actions/user";
import {loadSiteTitle} from "../../actions/siteConfig";
import LikelihoodLegendContainer from "../Common/LikelihoodLegendContainer";
import RiskAssessmentMatrixTableContainer from "../Common/RiskAssessmentMatrixTableContainer";
import type {User} from "../../types/User";
import {
  loadSecurityRiskAssessment
} from "../../actions/securityRiskAssessment";
import type {SecurityRiskAssessment} from "../../types/Task";
import URLUtil from "../../utils/URLUtil";
import DarkButton from "../Button/DarkButton";

const mapStateToProps = (state: RootState) => {
  return {
    siteTitle: state.siteConfigState.siteTitle,
    currentUser: state.currentUserState.user,
    securityRiskAssessmentData: state.securityRiskAssessmentState.securityRiskAssessmentData,
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: *) => {
  return {
    dispatchLoadDataAction(uuid: string, secureToken: string) {
      dispatch(loadCurrentUser());
      dispatch(loadSiteTitle());
      dispatch(loadSecurityRiskAssessment({uuid, secureToken}));
    }
  };
};

type Props = {
  uuid: string,
  secureToken: string,
  siteTitle?: string,
  currentUser?: User | null,
  securityRiskAssessmentData?: SecurityRiskAssessment | null,
  dispatchLoadDataAction?: (uuid: string, secureToken: string) => void,
};

class SecurityRiskAssessmentContainer extends Component<Props> {
  componentDidMount() {
    const {uuid, dispatchLoadDataAction, secureToken} = {...this.props};
    dispatchLoadDataAction(uuid, secureToken);
  }

  render() {
    const {
      siteTitle,
      currentUser,
      securityRiskAssessmentData,
      secureToken
    } = {...this.props};

    if (!currentUser || !siteTitle || !securityRiskAssessmentData) {
      return null;
    }

    const backButton = (
      <DarkButton
        title={"BACK TO QUESTIONNAIRE SUMMARY"}
        onClick={() => {
          URLUtil.redirectToQuestionnaireSummary(securityRiskAssessmentData.questionnaireSubmissionUUID, secureToken);
        }}
      />
    );

    return (
      <div className="SecurityRiskAssessmentContainer">
        <Header title={securityRiskAssessmentData.taskName} subtitle={siteTitle} username={currentUser.name}/>

        <div className="SecurityRiskAssessmentResult">
          <RiskAssessmentMatrixTableContainer
            riskResults={securityRiskAssessmentData.riskResults}
            likelihoodThresholds={securityRiskAssessmentData.likelihoodRatings} />

          <LikelihoodLegendContainer
            likelihoodThresholds={securityRiskAssessmentData.likelihoodRatings} />
          <div className="buttons">
            {backButton}
          </div>
        </div>
        <Footer/>
      </div>
    )
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SecurityRiskAssessmentContainer);
