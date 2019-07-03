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
  createJIRATickets: (jiraKey: string) => void,
  removeComponent: (id: string) => void,
  addComponent: (id: string) => void,
  finishWithSelection: () => void,
  extraButtons?: *,
};

type State = {
  filter: string,
  jiraKey: string,
};

export default class ComponentSelection extends Component<Props, State> {

  constructor(props: *) {
    super(props);
    this.state = {
      filter: "",
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
      extraButtons
    } = {...this.props};

    const {filter, jiraKey} = {...this.state};

    return (
      <div className="ComponentSelection">

        <div className="main-wrapper">
          <LeftBar title={"Available Components".toUpperCase()}>
            <div className="search">
              <i className="fas fa-search"/>
              <input type="text" placeholder="Filter component..." onChange={(event) => {
                const value = toString(event.target.value).trim();
                this.setState({filter: value});
              }}/>
            </div>

            <div className="items">
              {availableComponents
                .filter((component) => {
                  if (!filter) {
                    return true;
                  }
                  return component.name.includes(filter);
                })
                .map((component) => {
                  const isSelected = ComponentSelectionUtil.isComponentExists(component.id, selectedComponents);

                  return (
                    <LeftBarItem
                      title={component.name}
                      iconType={isSelected ? "success" : "pending"}
                      disabled={false}
                      key={component.id}
                      onItemClick={() => {
                        // Toggle selection
                        if (isSelected) {
                          removeComponent(component.id);
                        } else {
                          addComponent(component.id);
                        }
                      }}/>
                  );
                })}
            </div>
          </LeftBar>

          <div className="main-content">
            <div className="heading">
              Selected Components
            </div>

            <div className="selected-components">
              {selectedComponents.map((component) => {
                return (
                  <ComponentInfo
                    key={component.id}
                    id={component.id}
                    name={component.name}
                    description={component.description}
                    removeComponent={() => {
                      removeComponent(component.id);
                    }}
                  />
                );
              })}
            </div>

            <div className="buttons">
              {selectedComponents.length > 0 && (
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
              <LightButton title="FINISH WITHOUT SELECTION" classes={["mr-3"]} onClick={() => {
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
