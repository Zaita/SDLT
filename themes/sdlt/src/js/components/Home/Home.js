// @flow

import React, {Component} from "react";
import LogoImage from "../../../img/Logo.svg";
import Pillar from "./Pillar";
import TaskButton from "./TaskButton";
import type {HomeState} from "../../store/HomeState";
import LogoutButton from "../Button/LogoutButton";
import MySubmissionButton from "../Button/MySubmissionButton";
import AwaitingApprovalsButton from "../Button/AwaitingApprovalsButton";
import MyProductButton from "../Button/MyProductButton";
import type {Task} from "../../types/Task";

type Props = {
  homeState: HomeState
};

class Home extends Component<Props> {

  render() {
    const {title, subtitle, pillars, tasks} = {...this.props.homeState};

    return (
      <div className="Home">
        <LogoutButton classes={["clearfix","float-right", "mt-5", "mr-4"]}/>

        <MySubmissionButton classes={["clearfix","float-right", "mt-5", "mr-1"]}/>

        <AwaitingApprovalsButton classes={["clearfix","float-right", "mt-5", "mr-1"]}/>
        <MyProductButton classes={["clearfix","float-right", "mt-5", "mr-1"]}/>
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
              let link = `/tasks/standalone/${task.id}`;
              if (task.type === "selection") {
                link = "/component-selection/standalone";
              }
              return (
                <TaskButton link={link} classes={["mx-1"]} title={task.name}/>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
