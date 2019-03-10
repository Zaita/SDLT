// @flow

import React, {Component} from "react";
import {connect} from "react-redux";
import type {RootState} from "../../store/RootState";
import {Dispatch} from "redux";
import Start from "./Start";
import {createInProgressSubmission, loadQuestionnaireStartState} from "../../actions/questionnarie";
import type {QuestionnaireStartState} from "../../store/QuestionnaireState";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

const mapStateToProps = (state: RootState) => {
  return {
    startState: state.questionnaireState.startState,
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: *) => {
  return {
    dispatchLoadQuestionnaireAction(questionnaireID: string) {
      dispatch(loadQuestionnaireStartState(questionnaireID));
    },
    dispatchCreateInProgressSubmissionAction(questionnaireID: string) {
      dispatch(createInProgressSubmission(questionnaireID));
    }
  };
};

type ownProps = {
  questionnaireID: string
};

type reduxProps = {
  startState: QuestionnaireStartState,
  dispatchLoadQuestionnaireAction: (id: string) => void,
  dispatchCreateInProgressSubmissionAction: (questionnaireID: string) => void
};

type Props = ownProps & reduxProps;

class StartContainer extends Component<Props> {

  componentDidMount() {
    const {questionnaireID, dispatchLoadQuestionnaireAction} = {...this.props};
    dispatchLoadQuestionnaireAction(questionnaireID);
  }

  render() {
    const {title, subtitle, keyInformation, user} = {...this.props.startState};
    const {questionnaireID, dispatchCreateInProgressSubmissionAction} = {...this.props};

    if(!user) {
      return null;
    }

    return (
      <div className="StartContainer">
        <Header title={title} subtitle={subtitle} />

        <Start keyInformation={keyInformation}
               user={user}
               onStartButtonClick={() => {
                 dispatchCreateInProgressSubmissionAction(questionnaireID);
               }}/>

        <Footer/>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(StartContainer);
