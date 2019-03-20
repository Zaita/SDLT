import type {QuestionnaireSubmissionState} from "../src/js/store/QuestionnaireState";
import original from "./QuestionnaireSubmissionState";

const fixture = Object.assign({}, original);

fixture.submission.questions[0].inputs[0].data = "product";
fixture.submission.questions[0].inputs[1].data = "thor.chen@catalyst.net.nz";
fixture.submission.questions[0].inputs[2].data = "a long text in this area";
fixture.submission.questions[0].inputs[3].data = "07/03/2019";
fixture.submission.questions[0].isCurrent = false;
fixture.submission.questions[0].hasAnswer = true;

fixture.submission.questions[1].isCurrent = true;
fixture.submission.questions[1].actions[1].isChose = true;

fixture.submission.questions[2].isApplicable = false;

export default fixture;
