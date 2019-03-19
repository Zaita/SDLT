// @flow

import React, {Component} from "react";
import type {AnswerAction, Question, Submission} from "../../types/Questionnaire";
import _ from "lodash";
import moment from "moment";

type Props = {
  submission: Submission | null,
};

class AnswersPreview extends Component<Props> {

  render() {
    const {submission} = {...this.props};

    if (!submission) {
      return null;
    }

    return (
      <div className="AnswersPreview">
        <div className="questions">
          {submission.questions.map((question, index, all) => {
            const renderedData = this.renderData(question);
            return (
              <div className="row" key={question.id}>
                <div className="col">
                  <b>{index + 1}. {question.heading}</b>
                </div>
                <div className="vertical-divider"/>
                <div className="col">
                  {renderedData}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  renderData(question: Question): * {
    // Render data for non-applicable question
    if (!question.isApplicable) {
      const msg = "(Not applicable)";
      return (
        <div>{msg}</div>
      );
    }

    // Render data for non-answered question
    if (!question.hasAnswer) {
      const msg = "(Has no answer)";
      return (
        <div>{msg}</div>
      );
    }

    // Render data for input
    if (question.type === "input" && question.inputs && Array.isArray(question.inputs)) {
      return (
        <div>
          {question.inputs.map((input => {
            let data: string = input.data || "";
            // Format data
            if (input.type === "date") {
              data = moment(data).format("DD-MM-YYYY");
            }
            // Format textarea
            if (input.type === "textarea") {
              data = "\n" + data;
            }
            return (
              <div key={input.id}>
                <b>{input.label}</b>&nbsp;
                <span>-</span>&nbsp;
                <span>{data}</span>
              </div>
            );
          }))}
        </div>
      );
    }

    // Render data for action
    if (question.type === "action" && question.actions && Array.isArray(question.actions)) {
      let action: AnswerAction = _.head(question.actions.filter((action) => action.isChose));

      return (
        <div>
          {action && <div>{action.label}</div>}
        </div>
      );
    }
  }
}

export default AnswersPreview;
