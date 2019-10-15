// @flow

import React, {Component} from "react";
import type {
  CVATaskSubmission,
  CVASelectedComponents
} from "../../types/ContolValidationAudit";
import {
  DEFAULT_NO_CONTROLS_MESSAGE,
  DEFAULT_CVA_UNFINISHED_TASKS_MESSAGE
} from '../../constants/values.js';

type Props = {
  selectedComponents: Array<CVASelectedComponents>,
  productAspects: Array<*>,

};

export default class CVATaskForJiraCloud extends Component<Props, State> {
  renderFormForJiraCloud() {
    const {
      selectedComponents,
      productAspects
    } = {...this.props};

    if (productAspects.length > 0) {
      return (
        this.renderComponentGroupByProductAspect(productAspects, selectedComponents)
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
                  <label className="ml-2" key={control.id}>
                    <strong>{control.name}</strong>
                    <strong> {control.selectedOption}</strong>
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
    return (
      <div>{this.renderFormForJiraCloud()}</div>
    );
  }
}
