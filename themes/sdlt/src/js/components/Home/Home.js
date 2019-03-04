// @flow

import React, {Component} from "react";
import BackgroundImage from "../../../img/Home/background.jpg";
import LogoImage from "../../../img/Logo.svg";
import Pillar from "./Pillar";
import TaskButton from "./TaskButton";
import type {HomeState} from "../../store/HomeState";

type Props = {
  homeState: HomeState
};

class Home extends Component<Props> {

  render() {
    return (
      <div className="Home">
        <div className="background-image" style={{
          backgroundImage: `url("${BackgroundImage}")`,
        }}/>
        <div className="layout">
          <img src={LogoImage} className="logo"/>
          <h1>
            {this.props.homeState.title}
          </h1>
          <h2>
            {this.props.homeState.subtitle}
          </h2>
          <div className="pillars">
            {this.props.homeState.pillars.map((pillar, index) => {
              return (
                <Pillar link={`/questionnaire/start/${pillar.questionnaireID}`}
                        classes={["col", "mx-1"]}
                        pillar={pillar}
                        key={index}
                />
              );
            })}
          </div>
          <div className="tasks">
            <TaskButton link="/tasks/blah" classes={["mx-1"]} disabled={true} title="Information Classification"/>
            <TaskButton link="/tasks/blah" classes={["mx-1"]} disabled={true} title="Information Classification"/>
            <TaskButton link="/tasks/blah" classes={["mx-1"]} disabled={true} title="Information Classification"/>
            <TaskButton link="/tasks/blah" classes={["mx-1"]} disabled={true} title="Information Classification"/>
            <TaskButton link="/tasks/blah" classes={["mx-1"]} disabled={true} title="Information Classification"/>
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
