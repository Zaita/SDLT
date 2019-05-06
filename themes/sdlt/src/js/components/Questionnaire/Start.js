// @flow

import React, {Component} from "react";
import type {User} from "../../types/User";
import LightButton from "../Button/LightButton";

type Props = {
  keyInformation: string,
  user: User,
  onStartButtonClick:() => void
};

class Start extends Component<Props> {

  render() {
    const {keyInformation, user, onStartButtonClick} = this.props;

    return (
      <div className="Start">
        <div className="start-form">
          <div className="info-box">
            <div className="key-info-title">Key Information:</div>
            <div className="key-info"
                 dangerouslySetInnerHTML={{
                   __html: keyInformation
                 }}
            />
            <div className='user-info'>
              <div className="info-line">
                <b>Your Name: </b>
                <span>{user.name}</span>
              </div>
              <div className="info-line">
                <b>Email Address: </b>
                <span>{user.email}</span>
              </div>
            </div>
            <div className="actions">
              <LightButton title="START" onClick={onStartButtonClick} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Start;
