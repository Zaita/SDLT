// @flow

import React, {Component} from "react";
import {connect} from "react-redux";
import type {RootState} from "../../store/RootState";
import {Dispatch} from "redux";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import type {User} from "../../types/User";
import {loadCurrentUser} from "../../actions/user";
import {loadSiteTitle} from "../../actions/siteConfig";
import type {JiraTicket, SecurityComponent} from "../../types/SecurityComponent";
import ComponentSelection from "./ComponentSelection";
import {
  addSelectedComponent,
  createJIRATickets,
  loadAvailableComponents,
  removeSelectedComponent
} from "../../actions/componentSelection";
import URLUtil from "../../utils/URLUtil";
import ComponentSelectionReview from "./ComponentSelectionReview";
import DarkButton from "../Button/DarkButton";
import type {TaskSubmission} from "../../types/Task";
import {completeTaskSubmission, loadTaskSubmission, saveSelectedComponents} from "../../actions/task";

const mapStateToProps = (state: RootState) => {
  return {
    siteTitle: state.siteConfigState.siteTitle,
    currentUser: state.currentUserState.user,
    taskSubmission: state.taskSubmissionState.taskSubmission,
    availableComponents: state.componentSelectionState.availableComponents,
    selectedComponents: state.componentSelectionState.selectedComponents,
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: OwnProps) => {
  return {
    dispatchLoadDataAction() {
      const {uuid, secureToken} = {...props};
      dispatch(loadCurrentUser());
      dispatch(loadSiteTitle());
      dispatch(loadAvailableComponents());
      dispatch(loadTaskSubmission({uuid, secureToken}));
    },
    dispatchAddComponentAction(id: string) {
      dispatch(addSelectedComponent(id));
    },
    dispatchRemoveComponentAction(id: string) {
      dispatch(removeSelectedComponent(id))
    },
    dispatchCreateJIRATicketsAction(jiraKey: string) {
      dispatch(saveSelectedComponents(jiraKey));
    },
    dispatchFinishAction() {
      dispatch(completeTaskSubmission());
    }
  };
};

type OwnProps = {
  uuid: string,
  secureToken:string
};

type Props = OwnProps & {
  siteTitle?: string,
  currentUser?: User | null,
  taskSubmission?: TaskSubmission | null,
  availableComponents?: Array<SecurityComponent>,
  selectedComponents?: Array<SecurityComponent>,
  dispatchLoadDataAction?: () => void,
  dispatchCreateJIRATicketsAction?: (jiraKey: string) => void,
  dispatchAddComponentAction?: (id: string) => void,
  dispatchRemoveComponentAction?: (id: string) => void,
  dispatchFinishAction?: () => void,
}

class ComponentSelectionContainer extends Component<Props> {

  componentDidMount() {
    const {dispatchLoadDataAction} = {...this.props};
    dispatchLoadDataAction();
  }

  render() {
    const {
      siteTitle,
      secureToken,
      currentUser,
      taskSubmission,
      availableComponents,
      selectedComponents,
      dispatchAddComponentAction,
      dispatchRemoveComponentAction,
      dispatchCreateJIRATicketsAction,
      dispatchFinishAction
    } = {...this.props};

    if (!currentUser || !taskSubmission) {
      return null;
    }

    let body = null;
    switch (taskSubmission.status) {
      case "start":
      case "in_progress":
        body = (
          <ComponentSelection
            availableComponents={availableComponents}
            selectedComponents={selectedComponents}
            extraButtons={[(
              <DarkButton
                key="back"
                title={"BACK TO QUESTIONNAIRE SUMMARY"}
                onClick={() => {
                  URLUtil.redirectToQuestionnaireSummary(taskSubmission.questionnaireSubmissionUUID, secureToken);
                }}
              />
            )]}
            createJIRATickets={(jiraKey) => {
              dispatchCreateJIRATicketsAction(jiraKey);
            }}
            removeComponent={(id) => {
              dispatchRemoveComponentAction(id);
            }}
            addComponent={(id) => {
              dispatchAddComponentAction(id);
            }}
            finishWithSelection={() => {
              dispatchFinishAction();
            }}
          />
        );
        break;
      case "complete":
        body = (
          <ComponentSelectionReview
            selectedComponents={taskSubmission.selectedComponents}
            jiraTickets={taskSubmission.jiraTickets}
          >
            <div className="buttons">
              <DarkButton
                title={"BACK TO QUESTIONNAIRE SUMMARY"}
                onClick={() => {
                  URLUtil.redirectToQuestionnaireSummary(taskSubmission.questionnaireSubmissionUUID, secureToken);
                }}
              />
            </div>
          </ComponentSelectionReview>
        );
    }

    return (
      <div className="ComponentSelectionContainer">
        <Header title="Component Selection" subtitle={siteTitle} username={currentUser.name}/>
        {body}
        <Footer/>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ComponentSelectionContainer);
