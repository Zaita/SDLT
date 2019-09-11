// @flow

import React, {Component} from "react";
import type {AnswerAction, AnswerInput, Question, Submission} from "../../types/Questionnaire";
import _ from "lodash";
import moment from "moment";

type Props = {
  questions: Array<Question>
};

class AnswersPreview extends Component<Props> {

  render() {
    const {questions} = {...this.props};

    return (
      <div className="AnswersPreview">
        <div className="questions">
          {questions.map((question, index, all) => {
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
    if (question.type === "input" && question.inputs && Array.isArray(question.inputs) && question.inputs.length > 0) {
      const renderInputData = (input: AnswerInput) => {
        let data: string = input.data || "";

        // Format date
        if (input.type === "date") {
          data = moment(data).format("DD-MM-YYYY");
        }

        // Format textarea and "product aspects"
        if (input.type === "textarea" || input.type === "product aspects") {
          data = "\n" + data;
        }

        // Format radio button data: replace value with label
        if (input.type === "radio" && data) {
          const option = input.options.find((option => {
            return option.value === data
          }));
          if (option) {
            data = option.label;
          }
        }

        // Format checkbox data: replace value with label
        if (input.type === "checkbox" && data && data !== "[]") {
          const selectedOptions = JSON.parse(data);

          const dataArr = input.options.filter((option) => {
            return selectedOptions.includes(option.value);
          }).map((option) => {
            return option.label;
          })

          data = dataArr.join(', ');
        }

        return data;
      };

      // For multiple-inputs question, display their labels
      if (question.inputs.length > 1) {
        return (
          <div>
            {question.inputs.map((input => {
              const data = renderInputData(input);
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

      // For single-input question, display its answer directly
      return (
        <div>
          {renderInputData(question.inputs[0]).trim()}
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
