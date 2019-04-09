// @flow

import React, {Component} from "react";
import LogoImage from "../../../img/Logo.svg";
import Pillar from "./Pillar";
import TaskButton from "./TaskButton";
import type {HomeState} from "../../store/HomeState";
import LogoutButton from "../Button/LogoutButton";
import type {Task} from "../../types/Task";

type Props = {
  homeState: HomeState
};

class Home extends Component<Props> {

  render() {
    const {title, subtitle, pillars, tasks} = {...this.props.homeState};

    return (
      <div className="Home">
        <LogoutButton classes={["clearfix","float-right", "mt-5", "mr-5"]}/>
        <div className="layout">
          <a href="/"><img src={LogoImage} className="logo"/></a>
          <h1>
            {title}
          </h1>
          <h2>
            {subtitle}
          </h2>
          <div className="pillars">
            <div className="row">
              {pillars.map((pillar, index) => {
                return (
                  <Pillar link={`/questionnaire/start/${pillar.questionnaireID}`}
                          classes={["col", "mx-1"]}
                          pillar={pillar}
                          key={index}
                  />
                );
              })}
            </div>
          </div>
          <div className="tasks">
            {tasks.map((task: Task) => {
              return (
                <TaskButton link={`/tasks/standalone/${task.id}`} classes={["mx-1"]} title={task.name}/>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
