// @flow

import React, {Component} from "react";
import {connect} from "react-redux";
import type {RootState} from "../../store/RootState";
import {Dispatch} from "redux";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import {loadSiteTitle} from "../../actions/siteConfig";
import URLUtil from "../../utils/URLUtil";
import ComponentSelectionReview from "./ComponentSelectionReview";
import DarkButton from "../Button/DarkButton";
import type {TaskSubmission} from "../../types/Task";
import {loadTaskSubmission} from "../../actions/task";

const mapStateToProps = (state: RootState) => {
  return {
    siteTitle: state.siteConfigState.siteTitle,
    taskSubmission: state.taskSubmissionState.taskSubmission,
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: OwnProps) => {
  return {
    dispatchLoadDataAction() {
      const {uuid, token} = {...props};
      dispatch(loadSiteTitle());
      dispatch(loadTaskSubmission({uuid, secureToken: token}));
    }
  };
};

type OwnProps = {
  uuid: string,
  token: string,
};

type Props = OwnProps & {
  siteTitle?: string,
  taskSubmission?: TaskSubmission | null,
  dispatchLoadDataAction?: () => void,
}

class ComponentSelectionForBusinessOwnerContainer extends Component<Props> {

  componentDidMount() {
    const {dispatchLoadDataAction} = {...this.props};
    dispatchLoadDataAction();
  }

  render() {
    const {
      siteTitle,
      taskSubmission,
      token
    } = {...this.props};

    if (!taskSubmission) {
      return null;
    }

    return (
      <div className="ComponentSelectionContainer">
        <Header title="Component Selection" subtitle={siteTitle}/>
        <ComponentSelectionReview
          selectedComponents={taskSubmission.selectedComponents}
          jiraTickets={taskSubmission.jiraTickets}
        >
          <div className="buttons">
            <DarkButton
              title={"BACK TO QUESTIONNAIRE SUMMARY"}
              onClick={() => {
                URLUtil.redirectToQuestionnaireSummary(taskSubmission.questionnaireSubmissionUUID, token);
              }}
            />
          </div>
        </ComponentSelectionReview>
        <Footer/>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ComponentSelectionForBusinessOwnerContainer);