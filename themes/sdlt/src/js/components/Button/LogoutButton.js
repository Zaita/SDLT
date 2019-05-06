// @flow

import React, {Component} from "react";
import Icon from "../../../img/icons/user.svg";
import CSRFTokenService from '../../services/CSRFTokenService';

type Props = {
  classes: Array<string>
};

class LogoutButton extends Component<Props> {

  static defaultProps = {
    classes: []
  };

  render() {
    const {classes} = {...this.props};

    return (
      <button className={`LogoutButton ${classes.join(" ")}`}
        onClick={() => {
          this.logout();
        }}
      >
        <div>
          <img src={Icon} />
          Log Out
        </div>
      </button>
    );
  }


  async logout() {
    const csrfToken = await CSRFTokenService.getCSRFToken();
    window.location.href = `/Security/Logout?SecurityID=${csrfToken}`;
  }
}

export default LogoutButton;
