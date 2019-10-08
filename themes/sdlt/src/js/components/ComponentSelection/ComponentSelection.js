// @flow

import React, {Component} from "react";
import type {SecurityComponent} from "../../types/SecurityComponent";
import LeftBar from "../LeftBar/LeftBar";
import LeftBarItem from "../LeftBar/LeftBarItem";
import toString from "lodash/toString";
import DarkButton from "../Button/DarkButton";
import LightButton from "../Button/LightButton";
import ComponentInfo from "./ComponentInfo";
import ComponentSelectionUtil from "../../utils/ComponentSelectionUtil";

type Props = {
  availableComponents: Array<SecurityComponent>,
  selectedComponents: Array<SecurityComponent>,
  componentTarget: taskSubmission.ComponentTarget,
  createJIRATickets: (jiraKey: string) => void,
  removeComponent: (id: string) => void,
  addComponent: (id: string) => void,
  finishWithSelection: () => void,
  saveControls: () => void,
  extraButtons?: *,
  isStandaloneTask: boolean,
  productAspects: Array<*>
};

type State = {
  jiraKey: string
};

export default class ComponentSelection extends Component<Props, State> {

  constructor(props: *) {
    super(props);
    this.state = {
      jiraKey: ""
    };
  }

  render() {
    const {
      availableComponents,
      selectedComponents,
      createJIRATickets,
      removeComponent,
      addComponent,
      finishWithSelection,
      saveControls,
      extraButtons,
      componentTarget,
      productAspects,
      isStandaloneTask
    } = {...this.props};
    const {jiraKey} = {...this.state};
    const isGroupbyProductAspect = productAspects && productAspects.length > 0 && selectedComponents.length > 0;

    return (
      <div className="ComponentSelection">
        <div className="main-wrapper">
          <LeftBar
            selectedComponents={selectedComponents}
            availableComponents={availableComponents}
            title={"Available Components"}
            removeComponent={removeComponent}
            addComponent={addComponent}
            productAspects={productAspects}
            componentTarget={componentTarget}
          >
          </LeftBar>

          <div className="main-content">
            <div className="heading">
              Selected Components
            </div>
            <div className="selected-components">
              {isGroupbyProductAspect > 0 && productAspects.map ((productAspect, index) => {
                return (
                  <div key={index}>
                    {ComponentSelectionUtil.doescomponentExistForProductAspect(productAspect, selectedComponents) &&
                      <h4 key={index}>{productAspect}</h4>
                    }
                    {selectedComponents.map((component, index) => {
                      const isDisable = component.hasOwnProperty('isSaved') && component.isSaved && componentTarget == "JIRA Cloud";
                      if (component.productAspect === productAspect) {
                        return (
                          <ComponentInfo
                            key={component.id + (component.productAspect ? `_${component.productAspect}`: "")}
                            id={component.id}
                            name={component.name}
                            description={component.description}
                            removeComponent={() => {
                              removeComponent(component.id, component.productAspect);
                            }}
                            childControls={component.controls}
                            isDisable={isDisable}
                          />
                        );
                      }
                    })}
                  </div>
                );
              })}

              {(productAspects === undefined || productAspects === ''|| productAspects.length === 0 ) && selectedComponents.map((component, index) => {
                const isDisable = component.hasOwnProperty('isSaved') && component.isSaved && componentTarget == "JIRA Cloud";
                return (
                  <ComponentInfo
                    key={component.id}
                    id={component.id}
                    name={component.name }
                    description={component.description}
                    removeComponent={() => {
                      removeComponent(component.id, component.productAspect);
                    }}
                    childControls={component.controls}
                    isDisable={isDisable}
                  />
                );
              })}
            </div>

            <div className="buttons">
              {selectedComponents.length > 0 && componentTarget === "JIRA Cloud" && (
                <React.Fragment>
                  <input type="text" placeholder="JIRA Project Key" onChange={(event) => {
                    const value = toString(event.target.value).trim();
                    this.setState({jiraKey: value});
                  }}/>
                  <DarkButton title="CREATE JIRA TICKETS" classes={["mr-3"]} onClick={() => {
                    createJIRATickets(jiraKey);
                  }}/>
                </React.Fragment>
              )}
              {componentTarget === "Local" && !isStandaloneTask && (
                <LightButton title="SAVE CONTROLS" classes={["mr-3"]} onClick={() => {
                  saveControls();
                }}/>
              )}
              <LightButton title="COMPLETE WITHOUT SELECTION" classes={["mr-3"]} onClick={() => {
                finishWithSelection();
              }}/>

            </div>
          </div>
        </div>

        <div className="extra-wrapper">
          {extraButtons}
        </div>

      </div>
    );
  }
}
