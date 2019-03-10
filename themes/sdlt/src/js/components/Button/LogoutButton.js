// @flow

import React, {Component} from "react";
import Icon from "../../../img/icons/user.svg";

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
              onClick={this.onButtonClick.bind(this)}
      >
        <div>
          <img src={Icon} />
          Log Out
        </div>
      </button>
    );
  }

  onButtonClick() {
    window.location.href = "/Security/Logout";
  }
}

export default LogoutButton;
