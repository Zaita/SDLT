// @flow

import React, {Component} from "react";
import LogoImage from "../../../img/Logo.svg";
import LogoutButton from "../Button/LogoutButton";

type Props = {
  title: string,
  subtitle: string,
  showLogoutButton?: boolean;
};

class Header extends Component<Props> {

  static defaultProps = {
    title: "",
    subtitle: "",
    showLogoutButton: true
  };

  render() {
    const {title, subtitle} = {...this.props};

    return (
      <header className="Header">
        <div className="top-banner">
          <a href="/"><img src={LogoImage} className="logo"/></a>
        </div>
        <div className="logout-wrapper">
        {this.props.showLogoutButton && <LogoutButton/>}
        </div>
        <h1>{title}</h1>
        <h2>{subtitle}</h2>
      </header>
    );
  }
}

export default Header;
