// @flow

import React, {Component} from "react";
import {connect} from "react-redux";
import type {RootState} from "../../store/RootState";
import {Dispatch} from "redux";
import {
  loadQuestionnaireSubmissionState,
  moveAfterQuestionAnswered, moveToPreviousQuestion,
  putDataInQuestionnaireAnswer,
} from "../../actions/questionnaire";
import type {QuestionnaireSubmissionState} from "../../store/QuestionnaireState";
import Questionnaire from "./Questionnaire";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import type {Question} from "../../types/Questionnaire";

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
    dispatchSaveAnsweredQuestionAction(answeredQuestion: Question) {
      dispatch(putDataInQuestionnaireAnswer(answeredQuestion));
    },
    dispatchMoveToPreviousQuestionAction(targetQuestion: Question) {
      dispatch(moveToPreviousQuestion(targetQuestion));
    }
  };
};

type ownProps = {
  submissionHash: string
};

type reduxProps = {
  submissionState: QuestionnaireSubmissionState,
  dispatchLoadSubmissionAction: (submissionHash: string) => void,
  dispatchSaveAnsweredQuestionAction: (answeredQuestion: Question) => void,
  dispatchMoveToPreviousQuestionAction: (targetQuestion: Question) => void,
};

type Props = ownProps & reduxProps;

class QuestionnaireContainer extends Component<Props> {

  componentDidMount() {
    const {submissionHash, dispatchLoadSubmissionAction} = {...this.props};
    dispatchLoadSubmissionAction(submissionHash);
  }

  render() {
    const {dispatchSaveAnsweredQuestionAction, dispatchMoveToPreviousQuestionAction} = {...this.props};
    const {title, siteConfig, user, submission} = {...this.props.submissionState};

    if (!user || !submission || !siteConfig) {
      return null;
    }

    if (submission.status !== "in_progress") {
      return (
        <div className="QuestionnaireContainer">
          <Header title={title} subtitle={siteConfig.siteTitle} username={user.name} logopath={siteConfig.logoPath}/>
          <div className="Questionnaire">
            <h1>
              The questionnaire is not in progress...
            </h1>
          </div>
          <Footer footerCopyrightText={siteConfig.footerCopyrightText}/>
        </div>
      );
    }


    return (
      <div className="QuestionnaireContainer">
        <Header title={title} subtitle={siteConfig.siteTitle} logopath={siteConfig.logoPath} username={user.name} />
        <Questionnaire
          questions={submission.questions}
          saveAnsweredQuestion={(answeredQuestion) => {
            dispatchSaveAnsweredQuestionAction(answeredQuestion);
          }}
          onLeftBarItemClick={(targetQuestion) => {
            dispatchMoveToPreviousQuestionAction(targetQuestion);
          }}
        />
        <Footer footerCopyrightText={siteConfig.footerCopyrightText}/>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(QuestionnaireContainer);
