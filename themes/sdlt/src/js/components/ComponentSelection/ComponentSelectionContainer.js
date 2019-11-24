// @flow

import React, {Component} from "react";
import {connect} from "react-redux";
import type {RootState} from "../../store/RootState";
import {Dispatch} from "redux";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import type {User} from "../../types/User";
import type {SiteConfig} from "../../types/SiteConfig";
import {loadCurrentUser} from "../../actions/user";
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
import SecurityRiskAssessmentUtil from "../../utils/SecurityRiskAssessmentUtil";
import {loadSiteConfig} from "../../actions/siteConfig";
import {SubmissionExpired} from "../Common/SubmissionExpired";

type OwnProps = {
  uuid: string,
  secureToken:string
};

type Props = OwnProps & {
  siteConfig?: SiteConfig | null,
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
    siteConfig: state.siteConfigState.siteConfig,
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
      dispatch(loadSiteConfig());
      dispatch(loadCurrentUser());
      dispatch(loadAvailableComponents());
      dispatch(loadTaskSubmission({uuid, secureToken, type: "componentSelection"}));
    },
    dispatchAddComponentAction(id: string, productAspect: string) {
      dispatch(addSelectedComponent(id, productAspect));
    },
    dispatchRemoveComponentAction(id: string, productAspect: string) {
      dispatch(removeSelectedComponent(id, productAspect));
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
      siteConfig,
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

    if (!currentUser || !taskSubmission || !siteConfig) {
      return null;
    }
    const isSRATaskFinalised = SecurityRiskAssessmentUtil.isSRATaskFinalised(taskSubmission.siblingSubmissions);

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
            removeComponent={(id, productAspect) => {
              dispatchRemoveComponentAction(id, productAspect);
            }}
            addComponent={(id, productAspect) => {
              dispatchAddComponentAction(id, productAspect);
            }}
            finishWithSelection={() => {
              dispatchFinishAction();
            }}
          />
        );
        break;
      case "complete":
        body = (
          <div>
            <div className="ComponentSelectionReview">
                {isSRATaskFinalised ? SecurityRiskAssessmentUtil.getSraIsFinalisedAlert() : false}
            </div>

          <ComponentSelectionReview
            selectedComponents={taskSubmission.selectedComponents}
            jiraTickets={taskSubmission.jiraTickets}
            componentTarget={taskSubmission.componentTarget}
            productAspects={taskSubmission.productAspects}
            buttons={[(
              <div key="component-selection-review-button-container">
                {!isSRATaskFinalised && (<LightButton
                  title="EDIT CONTROLS"
                  onClick={ dispatchEditAnswersAction}
                  classes={["button"]}
                  iconImage={editIcon}
                />)}
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
          </div>
        );
        break;
        case "expired":
          body = (<SubmissionExpired/>);
        break;
    }

    return (
      <div className="ComponentSelectionContainer">
        <Header title="Component Selection" subtitle={siteConfig.siteTitle} logopath={siteConfig.logoPath} username={currentUser.name} />
        {body}
        <Footer footerCopyrightText={siteConfig.footerCopyrightText}/>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ComponentSelectionContainer);
