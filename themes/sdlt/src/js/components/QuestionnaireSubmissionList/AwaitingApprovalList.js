import React, {Component} from "react";
import {connect} from "react-redux";
import type {RootState} from "../../store/RootState";
import {Dispatch} from "redux";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import type {User} from "../../types/User";
import type {QuestionnaireSubmissionListItem} from "../../types/Questionnaire";
import PrettifyStatusUtil from "../../utils/PrettifyStatusUtil";
import type {TaskSubmissionListItem} from "../../types/Task";
import {loadCurrentUser} from "../../actions/user";
import {loadAwaitingApprovalList} from "../../actions/questionnaire";
import {loadAwaitingApprovalTaskList} from "../../actions/task";
import moment from "moment";
import {loadSiteConfig} from "../../actions/siteConfig";
import type {SiteConfig} from "../../types/SiteConfig";

const mapStateToProps = (state: RootState) => {
  return {
    currentUser: state.currentUserState.user,
    siteConfig: state.siteConfigState.siteConfig,
    awaitingApprovalList: state.questionnaireSubmissionListState.awaitingApprovalList,
    awaitingApprovalTaskList: state.questionnaireSubmissionListState.awaitingApprovalTaskList,
    loadingState: state.loadingState
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: *) => {
  return {
    async dispatchLoadDataAction() {
      await dispatch(loadCurrentUser());
      await dispatch(loadAwaitingApprovalList());
      await dispatch(loadAwaitingApprovalTaskList());
      await dispatch(loadSiteConfig());
    }
  };
};

type Props = {
  currentUser?: User | null,
  siteConfig?: SiteConfig | null,
  dispatchLoadDataAction?: () => void,
  awaitingApprovalList?: Array<QuestionnaireSubmissionListItem>,
  awaitingApprovalTaskList?: Array<TaskSubmissionListItem>,
  loadingState: object<*>
};

type State = {
  currentApprovalList: string
};

class AwaitingApprovalList extends Component<Props> {
  constructor(props: *) {
    super(props);
    this.state = {
      currentApprovalList: "QuestionnaireApproval"
    };
  }
  componentDidMount() {
    const {dispatchLoadDataAction} = {...this.props};
    dispatchLoadDataAction();
  }

  render() {
    const {
      currentUser,
      siteConfig,
      awaitingApprovalList,
      awaitingApprovalTaskList,
      loadingState
    } = {...this.props};

    if (!currentUser || !awaitingApprovalList || !siteConfig || !awaitingApprovalTaskList) {
      return null;
    }

    if (loadingState['QUESTIONNAIRE/FETCH_AWAITING_APPROVAL_LIST']) {
      return null;
    }

    return (
      <div className="AnswersPreview">
        <Header title="Awaiting Approvals" username={currentUser.name} subtitle={siteConfig.siteTitle} logopath={siteConfig.logoPath}/>
        <div className="container text-center tab-container">
          <button
            className={this.state.currentApprovalList=="QuestionnaireApproval" ? "tab-button mr-3 active" : "tab-button mr-3"}
            onClick={() => this.setState({currentApprovalList: "QuestionnaireApproval"})}
          >
            Questionnaire Approvals
          </button>
          <button
            className={this.state.currentApprovalList=="TaskApproval" ? "tab-button active" : "tab-button"}
            onClick={()=> this.setState({currentApprovalList: "TaskApproval"})}
          >
            Task Approvals
          </button>
        </div>
        {this.state.currentApprovalList=="QuestionnaireApproval" && questionnaireList(awaitingApprovalList, currentUser)}
        {this.state.currentApprovalList=="TaskApproval" && taskList(awaitingApprovalTaskList, currentUser)}
        <Footer footerCopyrightText={siteConfig.footerCopyrightText}/>
      </div>
    );
  }
}

const questionnaireList = (awaitingApprovalList: Array<QuestionnaireSubmissionListItem>, currentUser: User) => {
  if(!awaitingApprovalList.length)
  {
    return (
      <div className="container">
        <div className="alert alert-danger">
          Sorry, No data to display for Questionnaire.
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
              <th className="text-center">Product Name</th>
              <th className="text-center">Business Owner</th>
              <th className="text-center">Submitter</th>
              <th className="text-center">Status</th>
              <th className="text-center">Deliverable Release Date</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {awaitingApprovalList.map((awaitingApproval) => {
              const url =  "#/questionnaire/summary/" + awaitingApproval.uuid;
              return (
                <tr key={awaitingApproval.id}>
                  <td>
                    {moment(awaitingApproval.created).format("DD MMM YYYY")}
                  </td>
                  <td>
                    {awaitingApproval.productName}
                  </td>
                  <td>
                    {awaitingApproval.businessOwner}
                  </td>
                  <td>
                    {awaitingApproval.submitterName}
                  </td>
                  <td>
                    {PrettifyStatusUtil.prettifyStatus(
                      awaitingApproval.status,
                      awaitingApproval.SecurityArchitectApproverID,
                      currentUser,
                      awaitingApproval.SecurityArchitectApprover,
                      awaitingApproval.CisoApprovalStatus,
                      awaitingApproval.BusinessOwnerApprovalStatus,
                    )
                    }
                  </td>
                  <td>
                    {awaitingApproval.releaseDate ? moment(awaitingApproval.releaseDate).format("DD MMM YYYY") : ''}
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

const taskList = (awaitingApprovalTaskList:Array<TaskSubmissionListItem>, currentUser: User) => {
  if(!awaitingApprovalTaskList.length)
  {
    return (
      <div className="container">
        <div className="alert alert-danger">
          Sorry, No data to display for Task.
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
              <th className="text-center">Task Name</th>
              <th className="text-center">Product Name</th>
              <th className="text-center">Submitter</th>
              <th className="text-center">Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {awaitingApprovalTaskList.map((awaitingTaskApproval) => {
              const url =  "#/task/submission/" + awaitingTaskApproval.uuid;
              return (
                <tr key={awaitingTaskApproval.id}>
                  <td>
                    {moment(awaitingTaskApproval.created).format("DD MMM YYYY")}
                  </td>
                  <td>
                    {awaitingTaskApproval.taskName}
                  </td>
                  <td>
                    {awaitingTaskApproval.productName}
                  </td>
                  <td>
                    {awaitingTaskApproval.submitterName}
                  </td>
                  <td>
                    {PrettifyStatusUtil.prettifyStatus(
                      awaitingTaskApproval.status,
                      '',
                      currentUser,
                      '',
                      '',
                      ''
                    )}
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

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AwaitingApprovalList);
