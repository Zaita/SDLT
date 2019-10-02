// @flow

import React from "react";
import type {JiraTicket, SecurityComponent} from "../../types/SecurityComponent";
import ComponentSelectionUtil from "../../utils/ComponentSelectionUtil";

type Props = {
  selectedComponents: Array<SecurityComponent>,
  jiraTickets: Array<JiraTicket>,
  buttons?: *,
  componentTarget: string,
  productAspects: Array<*>
};

export default class ComponentSelectionReview extends React.Component<Props> {

  render() {
    const {selectedComponents, jiraTickets, buttons, componentTarget, productAspects} = {...this.props};
    const isGroupbyProductAspect = productAspects && productAspects.length > 0 && selectedComponents.length > 0;

    return (
      <div className="ComponentSelectionReview">
        <div className="section">
          <h4>Selected Components</h4>
          {isGroupbyProductAspect > 0 && productAspects.map ((productAspect, index) => {
            return (
              <ul key={index}>
                {ComponentSelectionUtil.doescomponentExistForProductAspect(productAspect, selectedComponents) &&
                  <h5 key={index}>{productAspect}</h5>
                }
                {selectedComponents.map((component, index) => {
                  if (component.productAspect === productAspect) {
                    return (
                      <li key={component.id + (productAspect ? `_${productAspect}`: "")}>
                        {component.name + (productAspect ? ` - ${productAspect}`: "")}
                      </li>
                    );
                  }
                })}
              </ul>
            );
          })}
          <ul>
            {(productAspects === undefined || productAspects === '') && selectedComponents.map((component: SecurityComponent) => {
              const productAspect = component.productAspect ? `${component.productAspect}`: "";

              return (
                <li key={component.id + (productAspect ? `_${productAspect}`: "")}>
                  {component.name + (productAspect ? ` - ${productAspect}`: "")}
                </li>
              );
            })}
          </ul>
        </div>

        {componentTarget === "JIRA Cloud" && (
          <div className="section">
            <h4>Created Jira Tickets</h4>
            <ul>
              {jiraTickets.map((ticket: JiraTicket) => {
                return (
                  <li key={ticket.id}><a href={ticket.link} target="_blank">{ticket.link}</a></li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="buttons">
          {buttons}
        </div>
      </div>
    );
  }
}
