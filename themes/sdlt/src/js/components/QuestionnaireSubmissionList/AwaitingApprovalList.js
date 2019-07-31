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
import {loadAwaitingApprovalList} from "../../actions/questionnaire";
import moment from "moment";

const mapStateToProps = (state: RootState) => {
  return {
    currentUser: state.currentUserState.user,
    siteTitle: state.siteConfigState.siteTitle,
    awaitingApprovalList: state.questionnaireSubmissionListState.awaitingApprovalList
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: *) => {
  return {
    async dispatchLoadDataAction() {
      await dispatch(loadCurrentUser());
      await dispatch(loadAwaitingApprovalList());
      await dispatch(loadSiteTitle());
    }
  };
};

type Props = {
  currentUser?: User | null,
  siteTitle?: string,
  dispatchLoadDataAction?: () => void,
  awaitingApprovalList?: Array<QuestionnaireSubmissionListItem>
};

const prettifyStatus = (status: string,  securityArchitectID: string, currentUser: User) => {
  if (status === "waiting_for_security_architect_approval" &&
    currentUser.id == securityArchitectID
  ) {
    return "Assigned to me";
  }
  return status
    .split("_")
    .map((str) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    })
    .join(" ");
};

class AwaitingApprovalList extends Component<Props> {
  componentDidMount() {
    const {dispatchLoadDataAction} = {...this.props};
    dispatchLoadDataAction();
  }

  render() {
    const {
      currentUser,
      siteTitle,
      awaitingApprovalList
    } = {...this.props};

    if (!currentUser || !awaitingApprovalList || !siteTitle) {
      return null;
    }

    return (
      <div className="AnswersPreview">
        <Header title="Awaiting Approvals" subtitle={siteTitle} username={currentUser.name} />
        {list(awaitingApprovalList, currentUser)}
        <Footer/>
      </div>
    );
  }
}

const list = (awaitingApprovalList: QuestionnaireSubmissionListItem, currentUser: User) => {
  if(!awaitingApprovalList.length)
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
              <th className="text-center">Product Name</th>
              <th className="text-center">Business Owner</th>
              <th className="text-center">Submitter</th>
              <th className="text-center">Status</th>
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
                    {prettifyStatus(
                      awaitingApproval.status,
                      awaitingApproval.SecurityArchitectApproverID,
                      currentUser)
                    }
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
