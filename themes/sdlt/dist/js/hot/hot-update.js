webpackHotUpdate("main",{

/***/ "./src/js/services/QuestionnaireDataService.js":
/*!*****************************************************!*\
  !*** ./src/js/services/QuestionnaireDataService.js ***!
  \*****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return QuestionnaireDataService; });
/* harmony import */ var _utils_GraphQLRequestHelper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/GraphQLRequestHelper */ "./src/js/utils/GraphQLRequestHelper.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _constants_errors__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../constants/errors */ "./src/js/constants/errors.js");
/* harmony import */ var _fixtures_QuestionnaireSubmissionState__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../__fixtures__/QuestionnaireSubmissionState */ "./__fixtures__/QuestionnaireSubmissionState.js");
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }






var QuestionnaireDataService =
/*#__PURE__*/
function () {
  function QuestionnaireDataService() {
    _classCallCheck(this, QuestionnaireDataService);
  }

  _createClass(QuestionnaireDataService, null, [{
    key: "createInProgressSubmission",
    value: function () {
      var _createInProgressSubmission = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(questionnaireID, csrfToken) {
        var query, json, submissionHash;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                query = "\nmutation {\n createQuestionnaireSubmission(QuestionnaireID: ".concat(questionnaireID, "){\n   UUID\n }\n}");
                _context.next = 3;
                return _utils_GraphQLRequestHelper__WEBPACK_IMPORTED_MODULE_0__["default"].request({
                  query: query,
                  csrfToken: csrfToken
                });

              case 3:
                json = _context.sent;
                submissionHash = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(json, "data.createQuestionnaireSubmission.UUID", null);

                if (submissionHash) {
                  _context.next = 7;
                  break;
                }

                throw _constants_errors__WEBPACK_IMPORTED_MODULE_2__["DEFAULT_NETWORK_ERROR"];

              case 7:
                return _context.abrupt("return", submissionHash);

              case 8:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function createInProgressSubmission(_x, _x2) {
        return _createInProgressSubmission.apply(this, arguments);
      }

      return createInProgressSubmission;
    }()
  }, {
    key: "fetchStartData",
    value: function () {
      var _fetchStartData = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(questionnaireID) {
        var query, json, memberData, questionnaireData, siteData;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                query = "\nquery {\n  readCurrentMember {\n    Email\n    FirstName\n    Surname\n    UserRole\n  }\n  readQuestionnaire(ID: ".concat(questionnaireID, ") {\n    ID\n    Name\n    KeyInformation\n  }\n  readSiteConfig {\n    Title\n  }\n}\n");
                _context2.next = 3;
                return _utils_GraphQLRequestHelper__WEBPACK_IMPORTED_MODULE_0__["default"].request({
                  query: query
                });

              case 3:
                json = _context2.sent;
                memberData = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(json, "data.readCurrentMember.0", null);
                questionnaireData = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(json, "data.readQuestionnaire", null);
                siteData = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(json, "data.readSiteConfig.0", null);

                if (!(!memberData || !questionnaireData || !siteData)) {
                  _context2.next = 9;
                  break;
                }

                throw _constants_errors__WEBPACK_IMPORTED_MODULE_2__["DEFAULT_NETWORK_ERROR"];

              case 9:
                return _context2.abrupt("return", {
                  title: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(questionnaireData, "Name", ""),
                  subtitle: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(siteData, "Title", ""),
                  questionnaireID: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(questionnaireData, "ID", ""),
                  keyInformation: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(questionnaireData, "KeyInformation", ""),
                  user: {
                    name: "".concat(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(memberData, "FirstName"), " ").concat(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(memberData, "Surname")),
                    role: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(memberData, "UserRole"),
                    email: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(memberData, "Email")
                  }
                });

              case 10:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function fetchStartData(_x3) {
        return _fetchStartData.apply(this, arguments);
      }

      return fetchStartData;
    }()
  }, {
    key: "fetchSubmissionData",
    value: function () {
      var _fetchSubmissionData = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(submissionHash) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                return _context3.abrupt("return", _fixtures_QuestionnaireSubmissionState__WEBPACK_IMPORTED_MODULE_3__["default"]);

              case 1:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function fetchSubmissionData(_x4) {
        return _fetchSubmissionData.apply(this, arguments);
      }

      return fetchSubmissionData;
    }()
  }]);

  return QuestionnaireDataService;
}();



/***/ })

})
//# sourceMappingURL=hot-update.js.map