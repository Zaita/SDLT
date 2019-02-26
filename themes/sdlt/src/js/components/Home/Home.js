// @flow

import React, {Component} from "react";
import {Link} from "react-router-dom";
import BannerImage from "../../../img/Home-HeroImage.jpg";

class Home extends Component {

  render() {
    return (
        <div className="Home">
          <div className="banner">
            <img src={BannerImage}/>
            <h1 className="site-title">Security Development Lifecycle TOOL (SDLT)</h1>
          </div>
          <div className="entries container py-3">
            <div className="row">
              <Link className="entry col" to="/questionnaire/proof-of-concept-questions">
                <div className="icon rounded-circle btn-primary mb-2 d-flex justify-content-center align-items-center">
                  <i className="fas fa-play" style={{fontSize: 44}}/>
                </div>
                <div className="text-primary">
                  Proof of Concept or Software Trial
                </div>
              </Link>

              <Link className="entry col" to="/questionnaire/software-as-a-service-questions">
                <div className="icon rounded-circle btn-primary mb-2 d-flex justify-content-center align-items-center">
                  <i className="fas fa-cloud" style={{fontSize: 44}}/>
                </div>
                <div className="text-primary">
                  Software as-a Service (SaaS)
                </div>
              </Link>

              <Link className="entry col" to="/questionnaire/solution-questions">
                <div className="icon rounded-circle btn-primary mb-2 d-flex justify-content-center align-items-center">
                  <i className="fas fa-tasks" style={{fontSize: 44}}/>
                </div>
                <div className="text-primary">
                  Product, Project or Solution
                </div>
              </Link>

              <Link className="entry col" to="/questionnaire/feature-questions">
                <div className="icon rounded-circle btn-primary mb-2 d-flex justify-content-center align-items-center">
                  <i className="fas fa-tools" style={{fontSize: 44}}/>
                </div>
                <div className="text-primary">
                  Feature or Bug Fix
                </div>
              </Link>

              <Link className="entry col" to="/questionnaire/feature-questions">
                <div className="icon rounded-circle btn-primary mb-2 d-flex justify-content-center align-items-center">
                  <i className="fas fa-tools" style={{fontSize: 44}}/>
                </div>
                <div className="text-primary">
                  Tasks
                </div>
              </Link>
            </div>

            {/*all the questionnaires*/}
            <ul className="d-none">
              <li>
                <Link to="/questionnaire/feature-questions">feature-questions</Link>
              </li>
              <li>
                <Link to="/questionnaire/information-classification-questions">information-classification-questions</Link>
              </li>
              <li>
                <Link to="/questionnaire/proof-of-concept-questions">proof-of-concept-questions</Link>
              </li>
              <li>
                <Link to="/questionnaire/software-as-a-service-questions">software-as-a-service-questions</Link>
              </li>
              <li>
                <Link to="/questionnaire/solution-initial-risk-assessment-questions">solution-initial-risk-assessment-questions</Link>
              </li>
              <li>
                <Link to="/questionnaire/solution-questions">solution-questions</Link>
              </li>
            </ul>
          </div>
        </div>
    );
  }
}

export default Home;
