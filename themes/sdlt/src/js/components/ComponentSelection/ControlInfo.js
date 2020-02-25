// @flow
import React, {Component} from "react";
import { Icon } from 'react-fa'

type Props = {
  id: string,
  name: string,
  description: string,
  implementationGuidance: string,
  className: string
};

type State = {
  isExpaned: boolean
};


export default class ControlInfo extends React.Component<Props> {
  constructor(props: *) {
    super(props);
    this.state = {
      isExpanded: false
    };
  }
  render() {
    const {id, name, description, implementationGuidance, className} = {...this.props};
    const {isExpanded} = {...this.state};
    return (
      <div className={"ControlInfo " + className}>
        {name && (<h5>{name}</h5>)}
        {
          description && (
            <div className="control-description">
              <span><b>Description: </b></span>
              <span
                className="control-description-cs"
                dangerouslySetInnerHTML={{
                  __html: description
                }}
              >
              </span>
            </div>
          )
        }
        {
          implementationGuidance && (
            <div className="implementation-Guidance">
              <div
                className="implementation-Guidance-title"
                onClick={() => this.setState({ isExpanded: !isExpanded })}
              >
                <span>
                  <b>Implementation Guidance </b>
                  <Icon name={`${isExpanded ? "caret-up" : "caret-down"}`} />
                </span>
              </div>

              {isExpanded && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: implementationGuidance
                  }}
                >
                </div>
              )}
            </div>
          )
        }
      </div>
    );
  }
}
