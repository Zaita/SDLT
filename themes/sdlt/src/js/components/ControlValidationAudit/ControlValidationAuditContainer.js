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
  saveControlValidationAuditData
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
  DEFAULT_CVA_UNFINISHED_TASKS_MESSAGE
} from '../../constants/values.js';

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
                this.renderComponentControls(component)
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
                    (component.productAspect === productAspect || component.productAspect === '')
                    &&
                    this.renderComponentControls(component)
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

  renderComponentControls(component) {
    const controls = component.controls;
    const componentKey = component.productAspect ? `${component.productAspect}_${component.id}`: component.id;
    const options = [
      DEFAULT_CVA_CONTROLS_ANSWER_YES,
      DEFAULT_CVA_CONTROLS_ANSWER_NO,
      DEFAULT_CVA_CONTROLS_ANSWER_NOT_APPLICABLE
    ];

    if (controls === undefined || controls.length === 0) {
      return (
        <div key={componentKey}>
          <h5>{component.name}</h5>
          <div className="alert alert-info" key={componentKey}>
            {DEFAULT_NO_CONTROLS_MESSAGE}
          </div>
        </div>
      );
    } else {
      return (
        <div key={componentKey}>
          <h5>{component.name}</h5>
          {
            controls.map((control) => {
              const controlKey = component.productAspect ? `${component.productAspect}_${component.id}_${control.id}`: `${component.id}_${control.id}`;
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
                            value={option}
                            defaultChecked={control.selectedOption === option}
                            onClick={() => this.props.dispatchUpdateControlValidationQuestionDataAction({
                              "selectedOption": option,
                              "controlID":control.id,
                              "componentID":component.id,
                              "productAspect":component.productAspect
                          })}
                          />
                          {option}
                        </label>
                      );
                    })
                  }
                  <label className="ml-2" key={control.id}>
                    <strong>{control.name}</strong>
                  </label>
                </div>
              );
            })
          }
        </div>
      );
    }
  }

  render() {
    const {
      siteTitle,
      currentUser,
      contolValidationAuditData,
      secureToken,
      dispatchSaveControlValidationAuditDataAction,
      cvaSelectedComponents
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

    const backButton = (
      <DarkButton
        title={"BACK TO QUESTIONNAIRE SUMMARY"}
        onClick={() => {
          URLUtil.redirectToQuestionnaireSummary(contolValidationAuditData.questionnaireSubmissionUUID, secureToken);
        }}
      />
    );

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
