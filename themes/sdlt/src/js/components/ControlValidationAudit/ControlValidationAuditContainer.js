// @flow

import React, {Component} from "react";
import {connect} from "react-redux";
import type {RootState} from "../../store/RootState";
import {Dispatch} from "redux";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import {loadCurrentUser} from "../../actions/user";
import {loadSiteTitle} from "../../actions/siteConfig";
import {
  updateControlValidationAuditData,
  loadControlValidationAudit,
  saveControlValidationAuditData,
  reSyncWithJira
} from "../../actions/controlValidationAudit";
import type {User} from "../../types/User";
import type {
  CVATaskSubmission,
  CVASelectedComponents
} from "../../types/ContolValidationAudit";
import URLUtil from "../../utils/URLUtil";
import LightButton from "../Button/LightButton";
import DarkButton from "../Button/DarkButton";
import {
  DEFAULT_CVA_CONTROLS_ANSWER_YES,
  DEFAULT_CVA_CONTROLS_ANSWER_NO,
  DEFAULT_CVA_CONTROLS_ANSWER_NOT_APPLICABLE,
  DEFAULT_NO_CONTROLS_MESSAGE,
  DEFAULT_CVA_UNFINISHED_TASKS_MESSAGE,
  CTL_STATUS_1,
  CTL_STATUS_2,
  CTL_STATUS_3
} from '../../constants/values.js';
import CVATaskForJiraCloud from "./CVATaskForJiraCloud";

const mapStateToProps = (state: RootState) => {
  return {
    siteTitle: state.siteConfigState.siteTitle,
    currentUser: state.currentUserState.user,
    contolValidationAuditData: state.controlValidationAuditState.contolValidationAuditData,
    cvaSelectedComponents: state.controlValidationAuditState.cvaSelectedComponents
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: *) => {
  return {
    dispatchLoadDataAction: async (uuid: string, secureToken: string) => {
      await Promise.all([
        dispatch(loadControlValidationAudit({uuid, secureToken})),
        dispatch(loadCurrentUser()),
        dispatch(loadSiteTitle())
      ]);
    },
    dispatchSaveControlValidationAuditDataAction(uuid: string, controlData: object, questionnaireSubmissionUUID: string, secureToken: string) {
      dispatch(saveControlValidationAuditData(uuid, controlData, questionnaireSubmissionUUID, secureToken));
    },
    dispatchUpdateControlValidationQuestionDataAction (selectedOptionDetail: object){
      dispatch(updateControlValidationAuditData(selectedOptionDetail));
    },
    dispatchReSyncWithJira(uuid: string) {
      dispatch(reSyncWithJira(uuid));
    }
  };
};

type Props = {
  uuid: string,
  secureToken: string,
  siteTitle?: string,
  currentUser?: User | null,
  contolValidationAuditData?: CVATaskSubmission | null,
  dispatchLoadDataAction?: (uuid: string, secureToken: string) => void,
  dispatchSaveControlValidationAuditDataAction?: () => void,
  dispatchUpdateControlValidationQuestionDataAction?: (selectedOptionDetail: object) => void,
  cvaSelectedComponents: CVASelectedComponents,
  dispatchReSyncWithJira?: (uuid: string) => void,
};

class ControlValidationAuditContainer extends Component<Props, State> {
  async componentDidMount() {
    const {uuid, dispatchLoadDataAction, secureToken} = {...this.props};
    await dispatchLoadDataAction(uuid, secureToken);
  }

  /**
   * Display a list of security component headlines with radio inputs for controls
   */
  renderCVAQuestionsForm() {
    const productAspects = this.props.contolValidationAuditData.productAspects;
    const selectedComponents = this.props.cvaSelectedComponents;
    if (productAspects.length > 0 && selectedComponents.length > 0) {
      return (
        this.renderComponentGroupByProductAspect(productAspects, selectedComponents)
      );
    } else if (selectedComponents.length > 0) {
      return(
        <div>
          {
            selectedComponents.map((component) => {
              return (
                this.renderComponent(component)
              );
            })
          }
        </div>
      );
    }
    else {
      return(
        <div className="alert alert-warning" key="unfinished_cs_task_message">
          {DEFAULT_CVA_UNFINISHED_TASKS_MESSAGE}
        </div>
      );
    }
  }

  renderComponentGroupByProductAspect(productAspects, components) {
    return (
      <div>
      {
        productAspects.map((productAspect, productAspectIndex) => {
          return (
            <div className="mt-2" key={productAspectIndex} >
              <h4>{productAspect}</h4>
              {
                components.map((component) => {
                  return (
                    //Default components have no user-defined product aspects,
                    //so we need to check for empty string too ''
                    (component.productAspect === productAspect || component.productAspect === '') &&
                    this.renderComponent(component)
                  );
                })
              }
            </div>
          )
        })
      }
      </div>
    );
  }

  renderComponent(component) {
    const componentKey = component.productAspect ? `${component.productAspect}_${component.id}`: component.id;
    const controls = component.controls;
    const link = component.jiraTicketLink ? (<a href={component.jiraTicketLink}>{component.jiraTicketLink}</a>) : null;
    const componetTitle = link !== null ? (component.name + '-' + link) : component.name;
    return (
      <div key={componentKey}>
        <h5>
          {component.name}
          {link && this.props.contolValidationAuditData.componentTarget == "JIRA Cloud" && (<span> - {link}</span>)}
        </h5>
        {
          controls && controls.map((control) => {
            return (this.renderControl(control, component));
          })
        }
      </div>
    );
  }

  renderControl(control, component) {
    const controlKey = component.productAspect ? `${component.productAspect}_${component.id}_${control.id}`: `${component.id}_${control.id}`;
    const componentTarget = this.props.contolValidationAuditData.componentTarget;

    if (componentTarget === "JIRA Cloud") {
      return this.renderRemoteControls(control, controlKey);
    } else {
      return this.renderLocalControl(control, controlKey, component);
    }
  }

  renderLocalControl(control, controlKey, component) {
    const options = [
      {'value': CTL_STATUS_1, 'label': DEFAULT_CVA_CONTROLS_ANSWER_YES},
      {'value':CTL_STATUS_2, 'label': DEFAULT_CVA_CONTROLS_ANSWER_NO},
      {'value':CTL_STATUS_3, 'label': DEFAULT_CVA_CONTROLS_ANSWER_NOT_APPLICABLE}
    ];

    return(
      <div className="my-0" key={controlKey}>
        {
          options.map((option, optionIndex) => {
            return (
              <label key={`optionlabel_${controlKey}_${optionIndex}`}>
                <input
                  type="radio"
                  key={`radiobutton_${controlKey}_${optionIndex}`}
                  name={controlKey}
                  value={option.value}
                  defaultChecked={control.selectedOption === option.value}
                  onClick={() => this.props.dispatchUpdateControlValidationQuestionDataAction({
                    "selectedOption": option.value,
                    "controlID":control.id,
                    "componentID":component.id,
                    "productAspect":component.productAspect
                })}
                />
                {option.label}
              </label>
            );
          })
        }
        <label className="ml-2" key={control.id}>
          <strong>{control.name}</strong>
        </label>
      </div>
    );
  }

  renderRemoteControls(control, controlKey) {
    const className = (control.selectedOption).toLowerCase().replace(" ", "-");
    return(
      <div className="my-0" key={controlKey}>
        <label className="ml-2" key={control.id}>
          <span><strong>{control.name}</strong> - </span>
          <span className={className}>({control.selectedOption})</span>
        </label>
      </div>
    );
  }

  render() {
    const {
      siteTitle,
      currentUser,
      contolValidationAuditData,
      secureToken,
      dispatchSaveControlValidationAuditDataAction,
      cvaSelectedComponents,
      dispatchReSyncWithJira
    } = {...this.props};

    if (!currentUser || !siteTitle || !contolValidationAuditData) {
      return null;
    }
    const isSubmitter = contolValidationAuditData.submitterID === currentUser.id;
    const submitButton = isSubmitter && cvaSelectedComponents.length > 0 ? (
      <LightButton
      title="SUBMIT"
      classes={["mr-3"]}
      onClick={() => dispatchSaveControlValidationAuditDataAction(
        contolValidationAuditData.uuid,
        cvaSelectedComponents,
        contolValidationAuditData.questionnaireSubmissionUUID,
        secureToken
      )}/>
    ): null;

    const backButton =  (
      <DarkButton
        title={"BACK TO QUESTIONNAIRE SUMMARY"}
        onClick={() => {
          URLUtil.redirectToQuestionnaireSummary(contolValidationAuditData.questionnaireSubmissionUUID, secureToken);
        }}
      />
    );

    const reSync = isSubmitter && contolValidationAuditData.componentTarget == "JIRA Cloud" && cvaSelectedComponents.length > 0 ? (
      <DarkButton
        title={"RE SYNC WITH JIRA"}
        classes={["mr-3"]}
        onClick={() => dispatchReSyncWithJira(contolValidationAuditData.uuid)}
      />
    ) : null;


    return (
      <div className="ControlValidationAuditContainer">
        <Header title={contolValidationAuditData.taskName} subtitle={siteTitle} username={currentUser.name}/>

        <div className="ControlValidationAuditResult" key="0">
          <div className=""  key="component_validation_questions">
            <h3>Have These Controls Been Implemented?</h3>
            {this.renderCVAQuestionsForm()}
          </div>

          <div className="buttons" key="component_validation_buttons">
            {submitButton}
            {reSync}
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
)(ControlValidationAuditContainer);
