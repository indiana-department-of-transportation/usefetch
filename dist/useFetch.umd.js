"use strict";

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "react"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("react"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.react);
    global.undefined = mod.exports;
  }
})(void 0, function (exports, _react) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = useFetch;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }

    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }

  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
          args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);

        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }

        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }

        _next(undefined);
      });
    };
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

  function _iterableToArrayLimit(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  var REQUEST_CACHE = {};
  /**
   * @description Custom hook for AJAX data. Takes either a Request object or a url and returns
   * a state from a call to useState that gets updated REQUEST_CACHE a result comes back.
   *
   * @param {Request|string} request The string url or URL object or Request object to fetch.
   *  **NOTE:** if using a Request object it *must* be wrapped in a call to useState to prevent
   *  an infinite render loop.
   * @param {number} timeout The timeout, defaults to none.
   * @param {Any} initialData The initial data to pass to useState. Defaults to null.
   * @param {boolean} cache Whether or not to cache the request to prevent unnecessary fetches.
   * @returns {Object} The current status of the fetch.
   */

  function useFetch(_ref) {
    var request = _ref.request,
        _ref$timeout = _ref.timeout,
        timeout = _ref$timeout === void 0 ? 0 : _ref$timeout,
        _ref$initialData = _ref.initialData,
        initialData = _ref$initialData === void 0 ? {} : _ref$initialData,
        _ref$cache = _ref.cache,
        cache = _ref$cache === void 0 ? false : _ref$cache;

    var _useState = (0, _react.useState)(false),
        _useState2 = _slicedToArray(_useState, 2),
        isCancelled = _useState2[0],
        setCancelled = _useState2[1];

    var _useState3 = (0, _react.useState)(initialData),
        _useState4 = _slicedToArray(_useState3, 2),
        data = _useState4[0],
        updateData = _useState4[1];

    var _useState5 = (0, _react.useState)(false),
        _useState6 = _slicedToArray(_useState5, 2),
        isLoading = _useState6[0],
        setLoading = _useState6[1];

    var _useState7 = (0, _react.useState)(),
        _useState8 = _slicedToArray(_useState7, 2),
        error = _useState8[0],
        setError = _useState8[1];

    var cancel = function cancel() {
      return setCancelled(true);
    };

    (0, _react.useEffect)(function () {
      var fetchData = function () {
        var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(url) {
          var tout, req, resp, json;
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  if (isLoading) {
                    _context.next = 25;
                    break;
                  }

                  _context.prev = 1;
                  setLoading(true);
                  tout = timeout && timeout > 0 ? new Promise(function (_, rej) {
                    return setTimeout(rej, timeout, new Error('Request timed out.'));
                  }) : null;
                  req = tout ? Promise.race([tout, fetch(request)]) : fetch(request);
                  _context.next = 7;
                  return req;

                case 7:
                  resp = _context.sent;

                  if (!(resp.status < 200 || resp.status >= 400)) {
                    _context.next = 10;
                    break;
                  }

                  throw new Error("HTTP error ".concat(resp.status));

                case 10:
                  _context.next = 12;
                  return resp.json();

                case 12:
                  json = _context.sent;

                  if (json) {
                    _context.next = 15;
                    break;
                  }

                  throw new Error('Empty response');

                case 15:
                  if (!isCancelled) {
                    if (cache) {
                      REQUEST_CACHE[url] = json;
                    }

                    setError(undefined);
                    updateData(json);
                  }

                  _context.next = 22;
                  break;

                case 18:
                  _context.prev = 18;
                  _context.t0 = _context["catch"](1);
                  if (cache) REQUEST_CACHE[url] = _context.t0;
                  setError(_context.t0);

                case 22:
                  _context.prev = 22;
                  setLoading(false);
                  return _context.finish(22);

                case 25:
                  if (!request && data !== initialData) {
                    updateData(initialData);
                  }

                case 26:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, null, [[1, 18, 22, 25]]);
        }));

        return function fetchData(_x) {
          return _ref2.apply(this, arguments);
        };
      }();

      if (request && !isCancelled && !isLoading) {
        var url = function () {
          switch (true) {
            case request instanceof Request:
              return request.url;

            case typeof request === 'string':
              return request;

            default:
              setError(new Error("Unknown request type for '".concat(request, "'.")));
              return '';
          }
        }();

        if (url) {
          if (!REQUEST_CACHE.hasOwnProperty(url)) {
            fetchData(url);
          } else {
            var cached = REQUEST_CACHE[url];

            if (cached instanceof Error) {
              setError(cached);
            } else {
              updateData(cached);
            }
          }
        }
      }
    }, [request]);
    return {
      data: data,
      isLoading: isLoading,
      isCancelled: isCancelled,
      cancel: cancel,
      error: error
    };
  }
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy91c2VGZXRjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztvQkE2Q3dCLFE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFkeEIsTUFBTSxhQUFhLEdBQVUsRUFBN0I7QUFFQTs7Ozs7Ozs7Ozs7OztBQVljLFdBQVUsUUFBVixPQUtFO0FBQUEsUUFKZCxPQUljLFFBSmQsT0FJYztBQUFBLDRCQUhkLE9BR2M7QUFBQSxRQUhkLE9BR2MsNkJBSEosQ0FHSTtBQUFBLGdDQUZkLFdBRWM7QUFBQSxRQUZkLFdBRWMsaUNBRkEsRUFFQTtBQUFBLDBCQURkLEtBQ2M7QUFBQSxRQURkLEtBQ2MsMkJBRE4sS0FDTTs7QUFBQSxvQkFDc0IscUJBQVMsS0FBVCxDQUR0QjtBQUFBO0FBQUEsUUFDUCxXQURPO0FBQUEsUUFDTSxZQUROOztBQUFBLHFCQUVhLHFCQUFTLFdBQVQsQ0FGYjtBQUFBO0FBQUEsUUFFUCxJQUZPO0FBQUEsUUFFRCxVQUZDOztBQUFBLHFCQUdrQixxQkFBUyxLQUFULENBSGxCO0FBQUE7QUFBQSxRQUdQLFNBSE87QUFBQSxRQUdJLFVBSEo7O0FBQUEscUJBSVksc0JBSlo7QUFBQTtBQUFBLFFBSVAsS0FKTztBQUFBLFFBSUEsUUFKQTs7QUFLZCxRQUFNLE1BQU0sR0FBRyxTQUFULE1BQVM7QUFBQSxhQUFNLFlBQVksQ0FBQyxJQUFELENBQWxCO0FBQUEsS0FBZjs7QUFFQSwwQkFBVSxZQUFLO0FBQ2IsVUFBTSxTQUFTO0FBQUEsOERBQUcsaUJBQU8sR0FBUDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxzQkFDWCxTQURXO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBR1osa0JBQUEsVUFBVSxDQUFDLElBQUQsQ0FBVjtBQUNNLGtCQUFBLElBSk0sR0FJQyxPQUFPLElBQUksT0FBTyxHQUFHLENBQXJC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