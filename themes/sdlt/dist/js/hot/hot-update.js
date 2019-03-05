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
    key: "fetchStartData",
    value: function () {
      var _fetchStartData = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(questionnaireID) {
        var query, response, json, memberData, questionnaireData, siteData;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                query = "\nquery {\n  readCurrentMember {\n    Email\n    FirstName\n    Surname\n    UserRole\n  }\n  readQuestionnaire(ID: ".concat(questionnaireID, ") {\n    ID\n    Name\n    KeyInformation\n  }\n  readSiteConfig {\n    Title\n  }\n}\n");
                _context.next = 3;
                return _utils_GraphQLRequestHelper__WEBPACK_IMPORTED_MODULE_0__["default"].prepareRequest(query).request();

              case 3:
                response = _context.sent;
                json = response.data;
                memberData = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(json, "data.readCurrentMember.0", null);
                questionnaireData = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(json, "data.readQuestionnaire", null);
                siteData = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(json, "data.readSiteConfig.0", null);

                if (!(!memberData || !questionnaireData || !siteData)) {
                  _context.next = 10;
                  break;
                }

                throw _constants_errors__WEBPACK_IMPORTED_MODULE_2__["DEFAULT_NETWORK_ERROR"];

              case 10:
                return _context.abrupt("return", {
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

              case 11:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function fetchStartData(_x) {
        return _fetchStartData.apply(this, arguments);
      }

      return fetchStartData;
    }()
  }]);

  return QuestionnaireDataService;
}();



/***/ })

})
//# sourceMappingURL=hot-update.js.map