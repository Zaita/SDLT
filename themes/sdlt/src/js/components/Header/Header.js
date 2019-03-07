// @flow

import React, {Component} from "react";
import LogoImage from "../../../img/Logo.svg";

type Props = {
  title: string,
  subtitle: string
};

class Header extends Component<Props> {

  render() {
    const {title, subtitle} = {...this.props};

    return (
      <header className="Header">
        <div className="top-banner">
          <img src={LogoImage} className="logo"/>
        </div>
        <h1>{title}</h1>
        <h2>{subtitle}</h2>
      </header>
    );
  }
}

export default Header;
