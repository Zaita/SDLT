// @flow

import React, {Component} from "react";
import LogoImage from "../../../img/Logo.svg";
import LogoutButton from "../Button/LogoutButton";

type Props = {
  title: string,
  subtitle: string,
  username: string,
  showLogoutButton?: boolean;
};

class Header extends Component<Props> {

  static defaultProps = {
    title: "",
    subtitle: "",
    username: "",
    showLogoutButton: true
  };

  render() {
    const {title, subtitle, showLogoutButton, username} = {...this.props};

    return (
      <header className="Header">
        <div className="top-banner">
          <a href="/"><img src={LogoImage} className="logo"/></a>
        </div>
        <div className="logout-layout">
          {showLogoutButton && (
            <div className="logout-block">
              <span className="username">{username}</span>
              <LogoutButton/>
            </div>
          )}
        </div>
        <h1>{title}</h1>
        <h2>{subtitle}</h2>
      </header>
    );
  }
}

export default Header;
