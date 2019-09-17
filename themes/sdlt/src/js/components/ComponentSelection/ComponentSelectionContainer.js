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
  removeSelectedComponent,
  loadSelectedComponents,
} from "../../actions/componentSelection";
import URLUtil from "../../utils/URLUtil";
import ComponentSelectionReview from "./ComponentSelectionReview";
import DarkButton from "../Button/DarkButton";
import type {TaskSubmission} from "../../types/Task";
import {
  completeTaskSubmission,
  loadTaskSubmission,
  saveSelectedComponents,
  editCompletedTaskSubmission
} from "../../actions/task";
import editIcon from "../../../img/icons/edit.svg";
import LightButton from "../Button/LightButton";

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
  dispatchSaveLocalControlsAction?: () => void,
  dispatchAddComponentAction?: (id: string) => void,
  dispatchRemoveComponentAction?: (id: string) => void,
  dispatchFinishAction?: () => void,
  dispatchEditAnswersAction?: () => void,
  dispatchLoadSelectedComponents?: (selectedComponents: Array<SecurityComponent>) => void
}

const mapStateToProps = (state: RootState) => {
  return {
    siteTitle: state.siteConfigState.siteTitle,
    currentUser: state.currentUserState.user,
    taskSubmission: state.taskSubmissionState.taskSubmission,
    availableComponents: state.componentSelectionState.availableComponents,
    selectedComponents: state.componentSelectionState.selectedComponents
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: OwnProps) => {
  return {
    dispatchLoadDataAction() {
      const {uuid, secureToken} = {...props};
      dispatch(loadCurrentUser());
      dispatch(loadSiteTitle());
      dispatch(loadAvailableComponents());
      dispatch(loadTaskSubmission({uuid, secureToken, type: "componentSelection"}));
    },
    dispatchAddComponentAction(id: string) {
      dispatch(addSelectedComponent(id));
    },
    dispatchRemoveComponentAction(id: string) {
      dispatch(removeSelectedComponent(id));
    },
    dispatchCreateJIRATicketsAction(jiraKey: string) {
      dispatch(saveSelectedComponents(jiraKey));
    },
    dispatchSaveLocalControlsAction() {
      dispatch(saveSelectedComponents(""));
    },
    dispatchFinishAction() {
      dispatch(completeTaskSubmission());
    },
    dispatchEditAnswersAction() {
      dispatch(editCompletedTaskSubmission({type: "componentSelection"}));
    }
  };
};

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
      dispatchSaveLocalControlsAction,
      dispatchFinishAction,
      dispatchEditAnswersAction
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
            componentTarget={taskSubmission.componentTarget}
            productAspects={taskSubmission.productAspects}
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
            saveControls={() => {
              dispatchSaveLocalControlsAction();
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
            componentTarget={taskSubmission.componentTarget}
            buttons={[(
              <div key="component-selection-review-button-container">
                <LightButton
                  title={"EDIT CONTROLS"}
                  onClick={dispatchEditAnswersAction}
                  classes={["button"]}
                  iconImage={editIcon}
                />
                <DarkButton
                  title={"BACK TO QUESTIONNAIRE SUMMARY"}
                  onClick={() => {
                    URLUtil.redirectToQuestionnaireSummary(taskSubmission.questionnaireSubmissionUUID, secureToken);
                  }}
                  classes={["button"]}
                />
              </div>
            )]}
          />
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
