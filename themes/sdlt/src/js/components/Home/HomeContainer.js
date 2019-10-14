// @flow

import React, {Component} from "react";
import {connect} from "react-redux";
import type {RootState} from "../../store/RootState";
import {loadHomeState} from "../../actions/home";
import {Dispatch} from "redux";
import Home from "./Home";
import type {HomeState} from "../../store/HomeState";
import Footer from "../Footer/Footer";
import BackgroundImage from "../../../img/Home/background.jpg";
import {loadSiteConfig} from "../../actions/siteConfig";
import type {SiteConfig} from "../../types/SiteConfig";

const mapStateToProps = (state: RootState) => {
  return {
    homeState: state.homeState,
    siteConfig: state.siteConfigState.siteConfig,
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: *) => {
  return {
    dispatchLoadHomeDataAction: () => {
      dispatch(loadHomeState());
      dispatch(loadSiteConfig());
    },
  };
};

type Props = {
  siteConfig?: SiteConfig | null,
  homeState?: HomeState,
  dispatchLoadHomeDataAction?: () => void,
};

class HomeContainer extends Component<Props> {

  componentDidMount() {
    if (this.props.dispatchLoadHomeDataAction) {
      this.props.dispatchLoadHomeDataAction();
    }
  }

  render() {
    const {
      siteConfig,
      homeState,
    } = {...this.props};

    if (!homeState || !siteConfig) {
      return null;
    }

    return (
      <div className="HomeContainer" style={{
        backgroundImage: `url("${siteConfig.homePageBackgroundImagePath}")`,
        backgroundSize: "cover"
      }}>
        <Home homeState={homeState} siteConfig={siteConfig}/>
        <Footer footerCopyrightText={siteConfig.footerCopyrightText}/>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(HomeContainer);
