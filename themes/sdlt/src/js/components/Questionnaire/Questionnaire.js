import React, {Component} from "react";
import DataProvider from "../../services/DataProvider";
import LeftBarItem from "./LeftBarItem";
import MainForm from "./MainForm";
import {FormikBag} from "formik";
import {Link} from "react-router-dom";
import type {FormAction} from "../../types/FormAction";
import type {FormPage} from "../../types/FormPage";
import type {FormSchema} from "../../types/FormSchema";

export type FormState = {
  currentStep: number,
  maxStep: number,
  schema: FormSchema,
  data: Array
};

type Props = {
  questionnaire: string
};

class Questionnaire extends Component<Props, FormState> {

  constructor(props) {
    super(props);

    this.state = {
      currentStep: 0,
      maxStep: 0,
      schema: [],
      data: [],
    };
  }

  async componentDidMount() {
    await this.loadData();
  }

  async loadData() {
    const schema = await DataProvider.provideData(this.props.questionnaire);
    this.setState({
      schema: schema,
      maxStep: schema.length - 1,
      data: Array(schema.length).fill(null),
    });
  }

  handleFormSubmit(formik: FormikBag, values) {
    formik.setValues({});

    this.setState(prevState => {
      const data = prevState.data.map((item, i) => {
        if (i === prevState.currentStep) {
          return values;
        }
        return item;
      });
      const currentStep = prevState.currentStep + 1;
      return {
        currentStep,
        data,
      };
    }, () => {
      formik.setSubmitting(false);

      if (this.state.currentStep === this.state.maxStep) {
        alert(
          JSON.stringify(this.state.data, null, 2),
        );
      }
    });
  }

  handleActionContinue(action: FormAction) {
    this.setState(prevState => {
      const data = prevState.data.map((item, i) => {
        if (i === prevState.currentStep) {
          return action.text;
        }
        return item;
      });
      const currentStep = prevState.currentStep + 1;
      return {
        currentStep,
        data,
      };
    }, () => {
      if (this.state.currentStep === this.state.maxStep) {
        alert(
          JSON.stringify(this.state.data, null, 2),
        );
      }
    });
  }

  handleActionGoto(action: FormAction) {
    const nextStep = this.state.schema.map((page) => {
      return page.id;
    }).indexOf(action.target);

    this.setState(prevState => {
      const data = prevState.data.map((item, i) => {
        if (i === prevState.currentStep) {
          return action.text;
        }
        return item;
      });
      return {
        currentStep: nextStep,
        data,
      };
    }, () => {
      if (this.state.currentStep === this.state.maxStep) {
        alert(
          JSON.stringify(this.state.data, null, 2),
        );
      }
    });
  }

  handleClickLeftBarItem(page: FormPage) {
    // TODO: add limitation - only filled steps could be edited
    const nextStep = this.state.schema.map((page) => {
      return page.id;
    }).indexOf(page.id);

    this.setState(prevState => {
      return {
        currentStep: nextStep,
      };
    });
  }

  render() {
    if (this.state.schema.length === 0) {
      return (
        <div className="container">
          <h1>
            The questionnaire is not available...
          </h1>
          <Link to="/">
            <button className="btn btn-primary">
              Back
            </button>
          </Link>
        </div>
      );
    }

    return (
      <div className="Questionnaire container">
        <div className="row">
          <div className="col-4">
            <div className="LeftBar">
              {this.state.schema.map((page) => {
                const pageIndex = this.state.schema.findIndex((item) => {
                  return item.id === page.id;
                });
                const isCurrent = this.state.currentStep === pageIndex;
                const touched = (this.state.data[pageIndex] !== null);

                return (
                  <LeftBarItem key={page.id}
                               page={page}
                               isCurrentStep={isCurrent}
                               touched={touched}
                               onClick={() => {
                                 this.handleClickLeftBarItem(page);
                               }}/>
                );
              })}
            </div>
          </div>
          <div className="col-8">
            <MainForm currentFormPage={this.state.schema[this.state.currentStep]}
                      handleFormSubmit={this.handleFormSubmit.bind(this)}
                      handleActionGoto={this.handleActionGoto.bind(this)}
                      handleActionContinue={this.handleActionContinue.bind(this)}/>
          </div>
        </div>
      </div>
    );
  }
}

export default Questionnaire;
