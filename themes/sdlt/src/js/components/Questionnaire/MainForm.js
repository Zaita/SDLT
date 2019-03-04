// @flow
import React, {Component} from "react";
import {ErrorMessage, Field, Form, Formik, FormikBag} from "formik";
import type {FormAction} from "../../types/FormAction";
import type {FormPage} from "../../types/FormPage";

type Props = {
  currentFormPage: FormPage,
  handleFormSubmit: (formik: FormikBag, values) => void,
  handleActionGoto: (action: FormAction) => void,
  handleActionContinue: (action: FormAction) => void,
};

export default class MainForm extends Component<Props> {

  renderInputsForm(formPage: FormPage) {
    const inputs = formPage && formPage.inputs;
    if (!inputs) {
      return null;
    }

    let initialValues = {};
    inputs.forEach((input) => {
      initialValues[input.name] = "";
    });

    return <Formik
      initialValues={initialValues}
      validate={values => {
        let errors = {};
        inputs.forEach((input) => {
          const name = input.name;
          const type = input.type;

          // TODO: need put more validation logic in the json
          if (!(values[name])) {
            errors[name] = "Required";
            return;
          }

          if (type === "email" &&
            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values[name])) {
            errors[name] = "Invalid email address";
            return;
          }
        });

        return errors;
      }}
      onSubmit={(values, formik) => {
        this.props.handleFormSubmit(formik, values);
      }}
    >
      {({isSubmitting}) => (
        <Form>
          {inputs.map((input) => {
            if (["text", "email"].includes(input.type)) {
              return (
                <div className="form-group" key={input.name}>
                  <label>{input.name.toUpperCase()}
                    <br/>
                    <Field type={input.type} name={input.name}/>
                  </label>
                  <ErrorMessage className="text-danger" name={input.name} component="div"/>
                </div>
              );
            }

            if (input.type === "textarea") {
              return (
                <div className="form-group" key={input.name}>
                  <label>{input.name.toUpperCase()}
                    <br/>
                    <Field name={input.name}>
                      {({field}) => {
                        return <textarea {...field} />;
                      }}
                    </Field>
                  </label>
                  <ErrorMessage className="text-danger" name={input.name} component="div"/>
                </div>
              );
            }

            return null;
          })}
          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            Continue
          </button>
        </Form>
      )}
    </Formik>;
  }

  renderActions(formPage: FormPage) {
    const actions = formPage && formPage.actions;
    if (!actions) {
      return null;
    }

    const btnClassIndexes = (index) => {
      switch (index) {
        case 0:
          return "btn btn-primary";
        case 1:
          return "btn btn-secondary";
        default:
          return "btn btn-light";
      }
    };

    return (
      <div className="row">
        <div className="col d-flex justify-content-between">
          {actions.map((action, index) => {
            return (
              <button key={action.text} type="button" className={`col-2 ${btnClassIndexes(index)}`} onClick={() => {
                switch (action.action) {
                  case "continue":
                    this.props.handleActionContinue(action);
                    break;
                  case "create_task":
                    alert(`Create Task: ${action.target}`);
                    break;
                  case "goto":
                    this.props.handleActionGoto(action);
                    break;
                  case "message":
                    alert(action.message);
                    break;
                  case "finish":
                    alert(action.result);
                    break;
                  default:
                    break;
                }
              }}>
                {action.text}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  renderKeyInformation() {
    if (!this.props.currentFormPage.keyInformation) {
      return null;
    }

    return (
      <div className="row">
        <h2>Key Information</h2>
        <ul>
          {this.props.currentFormPage.keyInformation.map(info => {
            return (
              <li>{info}</li>
            );
          })}
        </ul>
      </div>
    );
  }

  render() {
    const currentFormPage = this.props.currentFormPage;

    return (
      <div className="MainContent container">
        {this.renderKeyInformation()}
        <div className="row mb-3">{currentFormPage.question}</div>
        <div className="row mb-3">{currentFormPage.description}</div>
        {this.renderInputsForm(currentFormPage)}
        {this.renderActions(currentFormPage)}
      </div>
    );
  }
}
