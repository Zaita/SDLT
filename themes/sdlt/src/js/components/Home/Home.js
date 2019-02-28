// @flow

import React, {Component} from "react";
import BackgroundImage from "../../../img/Home/background.jpg";
import PocIcon from "../../../img/Home/poc-icon.svg";
import SaasIcon from "../../../img/Home/saas-icon.svg";
import ProdIcon from "../../../img/Home/prod-icon.svg";
import BugIcon from "../../../img/Home/bug-icon.svg";
import LogoImage from "../../../img/Logo.svg";
import Pillar from "./Pillar";
import TaskButton from "./TaskButton";

class Home extends Component {

  render() {
    return (
      <div className="Home">
        <div className="background-image" style={{
          backgroundImage: `url("${BackgroundImage}")`,
        }}/>
        <div className="layout">
          <img src={LogoImage} className="logo"/>
          <h1>
            Security Development Lifecycle TOOL (SDLT)
          </h1>
          <h2>
            What are you delivering?
          </h2>
          <div className="pillars">
            <Pillar icon={PocIcon} link="/questionnaire/proof-of-concept-questions" classes="col mr-1" title="Proof of Concept or Software Trial"/>
            <Pillar icon={SaasIcon} link="/questionnaire/proof-of-concept-questions" classes="col mx-1" title="Software as-a Service (SaaS)"/>
            <Pillar icon={ProdIcon} link="/questionnaire/proof-of-concept-questions" classes="col mx-1" title="Product, Project or Solution"/>
            <Pillar icon={BugIcon} link="/questionnaire/proof-of-concept-questions" classes="col ml-1" title="Feature or Bug Fix"/>
          </div>
          <div className="tasks">
            <TaskButton link="/tasks/blah" classes="mr-1" title="Information Classification"/>
            <TaskButton link="/tasks/blah" classes="mx-1" title="Information Classification"/>
            <TaskButton link="/tasks/blah" classes="mx-1" title="Information Classification"/>
            <TaskButton link="/tasks/blah" classes="mx-1" title="Information Classification"/>
            <TaskButton link="/tasks/blah" classes="ml-1" title="Information Classification"/>
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
