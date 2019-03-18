// @flow

import React, {Component} from "react";
import {connect} from "react-redux";
import type {RootState} from "../../store/RootState";
import {Dispatch} from "redux";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import type {QuestionnaireSubmissionState} from "../../store/QuestionnaireState";
import {loadQuestionnaireSubmissionState} from "../../actions/questionnarie";
import Summary from "./Summary";

const mapStateToProps = (state: RootState) => {
  return {
    submissionState: state.questionnaireState.submissionState,
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: *) => {
  return {
    dispatchLoadSubmissionAction(submissionHash: string) {
      dispatch(loadQuestionnaireSubmissionState(submissionHash));
    },
  };
};

type ownProps = {
  submissionHash: string
};

type reduxProps = {
  submissionState: QuestionnaireSubmissionState,
  dispatchLoadSubmissionAction: (submissionHash: string) => void,
};

type Props = ownProps & reduxProps;

class SummaryContainer extends Component<Props> {

  componentDidMount() {
    const {submissionHash, dispatchLoadSubmissionAction} = {...this.props};
    dispatchLoadSubmissionAction(submissionHash);
  }

  render() {
    const {title, siteTitle, user, submission} = {...this.props.submissionState};

    if (!user) {
      return null;
    }

    return (
      <div className="SummaryContainer">
        <Header title={title} subtitle="Summary" />
        <Summary siteTitle={siteTitle} submission={submission}/>
        <Footer/>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SummaryContainer);
