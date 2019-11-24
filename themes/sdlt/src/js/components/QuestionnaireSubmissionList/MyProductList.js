import React, {Component} from "react";
import {connect} from "react-redux";
import type {RootState} from "../../store/RootState";
import {Dispatch} from "redux";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import type {User} from "../../types/User";
import type {QuestionnaireSubmissionListItem} from "../../types/Questionnaire";
import {loadCurrentUser} from "../../actions/user";
import {loadMyProductList} from "../../actions/questionnaire";
import moment from "moment";
import {loadSiteConfig} from "../../actions/siteConfig";
import type {SiteConfig} from "../../types/SiteConfig";

const mapStateToProps = (state: RootState) => {
  return {
    currentUser: state.currentUserState.user,
    siteConfig: state.siteConfigState.siteConfig,
    myProductList: state.questionnaireSubmissionListState.myProductList,
    loadingState: state.loadingState
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: *) => {
  return {
    async dispatchLoadDataAction() {
      await dispatch(loadCurrentUser());
      await dispatch(loadMyProductList());
      await dispatch(loadSiteConfig());
    }
  };
};

type Props = {
  currentUser?: User | null,
  siteConfig?: SiteConfig | null,
  dispatchLoadDataAction?: () => void,
  myProductList?: Array<QuestionnaireSubmissionListItem>,
  loadingState: object<*>
};

const prettifyStatus = (status: string) => {
  return status
    .split("_")
    .map((str) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    })
    .join(" ");
};

const list = (myProductList: QuestionnaireSubmissionListItem) => {
  if(!myProductList.length)
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
              <th className="text-center">Submitter</th>
              <th className="text-center">Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {myProductList.map((myProduct) => {
              let url = "#/questionnaire/summary/" + myProduct.uuid;
              return (
                <tr key={myProduct.id}>
                  <td>
                    {moment(myProduct.created).format("DD MMM YYYY")}
                  </td>
                  <td>
                    {myProduct.productName}
                  </td>
                  <td>
                    {myProduct.submitterName}
                  </td>
                  <td>
                    {prettifyStatus(myProduct.status)}
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

class MyProductList extends Component<Props> {
  componentDidMount() {
    const {dispatchLoadDataAction} = {...this.props};
    dispatchLoadDataAction();
  }

  render() {
    const {
      currentUser,
      myProductList,
      siteConfig,
      loadingState
    } = {...this.props};

    if (!currentUser || !myProductList || !siteConfig) {
      return null;
    }

    if (loadingState['QUESTIONNAIRE/FETCH_MY_PRODUCT_LIST']) {
      return null;
    }

    return (
      <div className="AnswersPreview">
        <Header title="My Products" subtitle={siteConfig.siteTitle} username={currentUser.name} logopath={siteConfig.logoPath} />
        {list(myProductList)}
        <Footer footerCopyrightText={siteConfig.footerCopyrightText}/>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MyProductList);
