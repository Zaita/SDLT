webpackHotUpdate("main",{

/***/ "./src/js/utils/GraphQLRequestHelper.js":
/*!**********************************************!*\
  !*** ./src/js/utils/GraphQLRequestHelper.js ***!
  \**********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return GraphQLRequestHelper; });
/* harmony import */ var graphql_query_compress__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! graphql-query-compress */ "./node_modules/graphql-query-compress/lib/graphql-query-compress.browser.js");
/* harmony import */ var graphql_query_compress__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(graphql_query_compress__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! axios */ "./node_modules/axios/index.js");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_2__);
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }





var GraphQLRequestHelper =
/*#__PURE__*/
function () {
  function GraphQLRequestHelper() {
    _classCallCheck(this, GraphQLRequestHelper);
  }

  _createClass(GraphQLRequestHelper, null, [{
    key: "request",
    value: function () {
      var _request = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(query, variables) {
        var headers, data, inst, response, json, errorMessage;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                headers = {};
                /* Uncomment following lines to add custom headers for auth and/or statics
                const user = StorageService.readUser();
                if (user && user.Token) {
                  headers["Authorization"] = "Bearer " + user.Token;
                }
                */

                data = {
                  query: graphql_query_compress__WEBPACK_IMPORTED_MODULE_0___default()(query),
                  variables: variables
                };
                inst = axios__WEBPACK_IMPORTED_MODULE_1___default.a.create({
                  url: "/graphql",
                  method: "post",
                  data: data,
                  headers: headers
                });
                _context.next = 5;
                return inst.request();

              case 5:
                response = _context.sent;
                json = response.data; // Deal with common error

                errorMessage = lodash__WEBPACK_IMPORTED_MODULE_2___default.a.get(json, "errors.0.message", null);

                if (!errorMessage) {
                  _context.next = 11;
                  break;
                }

                // Check auth error
                if (errorMessage === "Please log in first...") {
                  window.location.href = "/Security/login?BackURL=%2F";
                }

                throw new Error(errorMessage);

              case 11:
                return _context.abrupt("return", json);

              case 12:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function request(_x, _x2) {
        return _request.apply(this, arguments);
      }

      return request;
    }()
  }]);

  return GraphQLRequestHelper;
}();



/***/ })

})
//# sourceMappingURL=hot-update.js.map