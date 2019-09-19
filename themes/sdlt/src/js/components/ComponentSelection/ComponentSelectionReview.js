// @flow

import React from "react";
import type {JiraTicket, SecurityComponent} from "../../types/SecurityComponent";

type Props = {
  selectedComponents: Array<SecurityComponent>,
  jiraTickets: Array<JiraTicket>,
  buttons?: *,
  componentTarget: string
};

export default class ComponentSelectionReview extends React.Component<Props> {

  render() {
    const {selectedComponents, jiraTickets, buttons, componentTarget} = {...this.props};

    return (
      <div className="ComponentSelectionReview">
        <div className="section">
          <h4>Selected Components</h4>
          <ul>
            {selectedComponents.map((component: SecurityComponent) => {
              return (
                <li key={component.id}>{component.name}</li>
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
