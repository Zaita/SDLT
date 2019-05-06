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

const mapStateToProps = (state: RootState) => {
  return {
    homeState: state.homeState,
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: *) => {
  return {
    dispatchLoadHomeDataAction: () => {
      dispatch(loadHomeState());
    },
  };
};

type Props = {
  homeState?: HomeState,
  dispatchLoadHomeDataAction?: () => void
};

class HomeContainer extends Component<Props> {

  componentDidMount() {
    if (this.props.dispatchLoadHomeDataAction) {
      this.props.dispatchLoadHomeDataAction();
    }
  }

  render() {
    if (!this.props.homeState) {
      return null;
    }

    return (
      <div className="HomeContainer" style={{
        backgroundImage: `url("${BackgroundImage}")`,
        backgroundSize: "cover"
      }}>
        <Home homeState={this.props.homeState}/>
        <Footer/>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(HomeContainer);
