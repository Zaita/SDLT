// @flow

import React, {Component} from "react";
import {connect} from "react-redux";
import type {RootState} from "../../store/RootState";
import {Dispatch} from "redux";
import {
  loadQuestionnaireSubmissionState,
  moveAfterQuestionAnswered, moveToPreviousQuestion,
  putDataInQuestionnaireAnswer,
} from "../../actions/questionnarie";
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
      // Put data into state
      dispatch(putDataInQuestionnaireAnswer(answeredQuestion));
      // Move cursor to target question
      dispatch(moveAfterQuestionAnswered(answeredQuestion))
      // TODO: Send network request to save state in database
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
    const {title, subtitle, user, submission} = {...this.props.submissionState};

    if (!user) {
      return null;
    }

    return (
      <div className="QuestionnaireContainer">
        <Header title={title} subtitle={subtitle} />

        <Questionnaire
          user={user}
          submission={submission}
          saveAnsweredQuestion={(answeredQuestion) => {
            dispatchSaveAnsweredQuestionAction(answeredQuestion);
          }}
          onLeftBarItemClick={(targetQuestion) => {
            dispatchMoveToPreviousQuestionAction(targetQuestion);
          }}
        />

        <Footer/>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(QuestionnaireContainer);
