import React, {Component} from "react";
import {connect} from "react-redux";
import type {RootState} from "../../store/RootState";
import {Dispatch} from "redux";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import type {User} from "../../types/User";
import type {QuestionnaireSubmissionListItem} from "../../types/Questionnaire";
import {loadCurrentUser} from "../../actions/user";
import {loadSiteTitle} from "../../actions/siteConfig";
import {loadMySubmissionList} from "../../actions/questionnaire";
import moment from "moment";

const mapStateToProps = (state: RootState) => {
  return {
    currentUser: state.currentUserState.user,
    siteTitle: state.siteConfigState.siteTitle,
    mySubmissionList: state.questionnaireSubmissionListState.mySubmissionList
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: *) => {
  return {
    async dispatchLoadDataAction() {
      await dispatch(loadCurrentUser());
      await dispatch(loadMySubmissionList());
      await dispatch(loadSiteTitle());
    }
  };
};

type Props = {
  currentUser?: User | null,
  siteTitle?: string,
  dispatchLoadDataAction?: () => void,
  mySubmissionList?: Array<QuestionnaireSubmissionListItem>
};

const prettifyStatus = (status: string) => {
  return status
    .split("_")
    .map((str) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    })
    .join(" ");
};

const list = (mySubmissionList: QuestionnaireSubmissionListItem) => {
  if(!mySubmissionList.length)
  {
    return (
      <div className="container">
        <div className="alert alert-danger">
          Sorry, No data to display.
        </div>
      </div>
    );
  }
  return (
    <div className="container">
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead>
            <tr key="submission_table_header">
              <th className="text-center">Date Created</th>
              <th className="text-center">Pillar</th>
              <th className="text-center">Product Name</th>
              <th className="text-center">Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mySubmissionList.map((mySubmission) => {
              let url = "";
              if (mySubmission.status === "in_progress") {
                url = "#/questionnaire/submission/" + mySubmission.uuid;
              } else {
                url = "#/questionnaire/summary/" + mySubmission.uuid;
              }
              return (
                <tr key={mySubmission.id}>
                  <td>
                    {moment(mySubmission.created).format("DD MMM YYYY")}
                  </td>
                  <td>
                    {mySubmission.questionnaireName}
                  </td>
                  <td>
                    {mySubmission.productName}
                  </td>
                  <td>
                    {prettifyStatus(mySubmission.status)}
                  </td>
                  <td>
                      <a href={url}>View</a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

class MySubmissionList extends Component<Props> {
  componentDidMount() {
    const {dispatchLoadDataAction} = {...this.props};
    dispatchLoadDataAction();
  }

  render() {
    const {
      currentUser,
      mySubmissionList,
      siteTitle,
    } = {...this.props};

    if (!currentUser || !mySubmissionList || !siteTitle) {
      return null;
    }

    return (
      <div className="AnswersPreview">
        <Header title="My Submission" subtitle={siteTitle} username={currentUser.name} />
        {list(mySubmissionList)}
        <Footer/>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MySubmissionList);
