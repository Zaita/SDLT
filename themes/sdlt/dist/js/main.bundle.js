/******/ (function(modules) { // webpackBootstrap
/******/ 	// install a JSONP callback for chunk loading
/******/ 	function webpackJsonpCallback(data) {
/******/ 		var chunkIds = data[0];
/******/ 		var moreModules = data[1];
/******/ 		var executeModules = data[2];
/******/
/******/ 		// add "moreModules" to the modules object,
/******/ 		// then flag all "chunkIds" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0, resolves = [];
/******/ 		for(;i < chunkIds.length; i++) {
/******/ 			chunkId = chunkIds[i];
/******/ 			if(installedChunks[chunkId]) {
/******/ 				resolves.push(installedChunks[chunkId][0]);
/******/ 			}
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 		for(moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				modules[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(parentJsonpFunction) parentJsonpFunction(data);
/******/
/******/ 		while(resolves.length) {
/******/ 			resolves.shift()();
/******/ 		}
/******/
/******/ 		// add entry modules from loaded chunk to deferred list
/******/ 		deferredModules.push.apply(deferredModules, executeModules || []);
/******/
/******/ 		// run deferred modules when all chunks ready
/******/ 		return checkDeferredModules();
/******/ 	};
/******/ 	function checkDeferredModules() {
/******/ 		var result;
/******/ 		for(var i = 0; i < deferredModules.length; i++) {
/******/ 			var deferredModule = deferredModules[i];
/******/ 			var fulfilled = true;
/******/ 			for(var j = 1; j < deferredModule.length; j++) {
/******/ 				var depId = deferredModule[j];
/******/ 				if(installedChunks[depId] !== 0) fulfilled = false;
/******/ 			}
/******/ 			if(fulfilled) {
/******/ 				deferredModules.splice(i--, 1);
/******/ 				result = __webpack_require__(__webpack_require__.s = deferredModule[0]);
/******/ 			}
/******/ 		}
/******/ 		return result;
/******/ 	}
/******/ 	function hotDisposeChunk(chunkId) {
/******/ 		delete installedChunks[chunkId];
/******/ 	}
/******/ 	var parentHotUpdateCallback = window["webpackHotUpdate"];
/******/ 	window["webpackHotUpdate"] = // eslint-disable-next-line no-unused-vars
/******/ 	function webpackHotUpdateCallback(chunkId, moreModules) {
/******/ 		hotAddUpdateChunk(chunkId, moreModules);
/******/ 		if (parentHotUpdateCallback) parentHotUpdateCallback(chunkId, moreModules);
/******/ 	} ;
/******/
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotDownloadUpdateChunk(chunkId) {
/******/ 		var script = document.createElement("script");
/******/ 		script.charset = "utf-8";
/******/ 		script.src = __webpack_require__.p + "hot/hot-update.js";
/******/ 		if (null) script.crossOrigin = null;
/******/ 		document.head.appendChild(script);
/******/ 	}
/******/
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotDownloadManifest(requestTimeout) {
/******/ 		requestTimeout = requestTimeout || 10000;
/******/ 		return new Promise(function(resolve, reject) {
/******/ 			if (typeof XMLHttpRequest === "undefined") {
/******/ 				return reject(new Error("No browser support"));
/******/ 			}
/******/ 			try {
/******/ 				var request = new XMLHttpRequest();
/******/ 				var requestPath = __webpack_require__.p + "hot/hot-update.json";
/******/ 				request.open("GET", requestPath, true);
/******/ 				request.timeout = requestTimeout;
/******/ 				request.send(null);
/******/ 			} catch (err) {
/******/ 				return reject(err);
/******/ 			}
/******/ 			request.onreadystatechange = function() {
/******/ 				if (request.readyState !== 4) return;
/******/ 				if (request.status === 0) {
/******/ 					// timeout
/******/ 					reject(
/******/ 						new Error("Manifest request to " + requestPath + " timed out.")
/******/ 					);
/******/ 				} else if (request.status === 404) {
/******/ 					// no update available
/******/ 					resolve();
/******/ 				} else if (request.status !== 200 && request.status !== 304) {
/******/ 					// other failure
/******/ 					reject(new Error("Manifest request to " + requestPath + " failed."));
/******/ 				} else {
/******/ 					// success
/******/ 					try {
/******/ 						var update = JSON.parse(request.responseText);
/******/ 					} catch (e) {
/******/ 						reject(e);
/******/ 						return;
/******/ 					}
/******/ 					resolve(update);
/******/ 				}
/******/ 			};
/******/ 		});
/******/ 	}
/******/
/******/ 	var hotApplyOnUpdate = true;
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	var hotCurrentHash = "6c0ba268d03b458646c9";
/******/ 	var hotRequestTimeout = 10000;
/******/ 	var hotCurrentModuleData = {};
/******/ 	var hotCurrentChildModule;
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	var hotCurrentParents = [];
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	var hotCurrentParentsTemp = [];
/******/
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotCreateRequire(moduleId) {
/******/ 		var me = installedModules[moduleId];
/******/ 		if (!me) return __webpack_require__;
/******/ 		var fn = function(request) {
/******/ 			if (me.hot.active) {
/******/ 				if (installedModules[request]) {
/******/ 					if (installedModules[request].parents.indexOf(moduleId) === -1) {
/******/ 						installedModules[request].parents.push(moduleId);
/******/ 					}
/******/ 				} else {
/******/ 					hotCurrentParents = [moduleId];
/******/ 					hotCurrentChildModule = request;
/******/ 				}
/******/ 				if (me.children.indexOf(request) === -1) {
/******/ 					me.children.push(request);
/******/ 				}
/******/ 			} else {
/******/ 				console.warn(
/******/ 					"[HMR] unexpected require(" +
/******/ 						request +
/******/ 						") from disposed module " +
/******/ 						moduleId
/******/ 				);
/******/ 				hotCurrentParents = [];
/******/ 			}
/******/ 			return __webpack_require__(request);
/******/ 		};
/******/ 		var ObjectFactory = function ObjectFactory(name) {
/******/ 			return {
/******/ 				configurable: true,
/******/ 				enumerable: true,
/******/ 				get: function() {
/******/ 					return __webpack_require__[name];
/******/ 				},
/******/ 				set: function(value) {
/******/ 					__webpack_require__[name] = value;
/******/ 				}
/******/ 			};
/******/ 		};
/******/ 		for (var name in __webpack_require__) {
/******/ 			if (
/******/ 				Object.prototype.hasOwnProperty.call(__webpack_require__, name) &&
/******/ 				name !== "e" &&
/******/ 				name !== "t"
/******/ 			) {
/******/ 				Object.defineProperty(fn, name, ObjectFactory(name));
/******/ 			}
/******/ 		}
/******/ 		fn.e = function(chunkId) {
/******/ 			if (hotStatus === "ready") hotSetStatus("prepare");
/******/ 			hotChunksLoading++;
/******/ 			return __webpack_require__.e(chunkId).then(finishChunkLoading, function(err) {
/******/ 				finishChunkLoading();
/******/ 				throw err;
/******/ 			});
/******/
/******/ 			function finishChunkLoading() {
/******/ 				hotChunksLoading--;
/******/ 				if (hotStatus === "prepare") {
/******/ 					if (!hotWaitingFilesMap[chunkId]) {
/******/ 						hotEnsureUpdateChunk(chunkId);
/******/ 					}
/******/ 					if (hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/ 						hotUpdateDownloaded();
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 		fn.t = function(value, mode) {
/******/ 			if (mode & 1) value = fn(value);
/******/ 			return __webpack_require__.t(value, mode & ~1);
/******/ 		};
/******/ 		return fn;
/******/ 	}
/******/
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotCreateModule(moduleId) {
/******/ 		var hot = {
/******/ 			// private stuff
/******/ 			_acceptedDependencies: {},
/******/ 			_declinedDependencies: {},
/******/ 			_selfAccepted: false,
/******/ 			_selfDeclined: false,
/******/ 			_disposeHandlers: [],
/******/ 			_main: hotCurrentChildModule !== moduleId,
/******/
/******/ 			// Module API
/******/ 			active: true,
/******/ 			accept: function(dep, callback) {
/******/ 				if (dep === undefined) hot._selfAccepted = true;
/******/ 				else if (typeof dep === "function") hot._selfAccepted = dep;
/******/ 				else if (typeof dep === "object")
/******/ 					for (var i = 0; i < dep.length; i++)
/******/ 						hot._acceptedDependencies[dep[i]] = callback || function() {};
/******/ 				else hot._acceptedDependencies[dep] = callback || function() {};
/******/ 			},
/******/ 			decline: function(dep) {
/******/ 				if (dep === undefined) hot._selfDeclined = true;
/******/ 				else if (typeof dep === "object")
/******/ 					for (var i = 0; i < dep.length; i++)
/******/ 						hot._declinedDependencies[dep[i]] = true;
/******/ 				else hot._declinedDependencies[dep] = true;
/******/ 			},
/******/ 			dispose: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			addDisposeHandler: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			removeDisposeHandler: function(callback) {
/******/ 				var idx = hot._disposeHandlers.indexOf(callback);
/******/ 				if (idx >= 0) hot._disposeHandlers.splice(idx, 1);
/******/ 			},
/******/
/******/ 			// Management API
/******/ 			check: hotCheck,
/******/ 			apply: hotApply,
/******/ 			status: function(l) {
/******/ 				if (!l) return hotStatus;
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			addStatusHandler: function(l) {
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			removeStatusHandler: function(l) {
/******/ 				var idx = hotStatusHandlers.indexOf(l);
/******/ 				if (idx >= 0) hotStatusHandlers.splice(idx, 1);
/******/ 			},
/******/
/******/ 			//inherit from previous dispose call
/******/ 			data: hotCurrentModuleData[moduleId]
/******/ 		};
/******/ 		hotCurrentChildModule = undefined;
/******/ 		return hot;
/******/ 	}
/******/
/******/ 	var hotStatusHandlers = [];
/******/ 	var hotStatus = "idle";
/******/
/******/ 	function hotSetStatus(newStatus) {
/******/ 		hotStatus = newStatus;
/******/ 		for (var i = 0; i < hotStatusHandlers.length; i++)
/******/ 			hotStatusHandlers[i].call(null, newStatus);
/******/ 	}
/******/
/******/ 	// while downloading
/******/ 	var hotWaitingFiles = 0;
/******/ 	var hotChunksLoading = 0;
/******/ 	var hotWaitingFilesMap = {};
/******/ 	var hotRequestedFilesMap = {};
/******/ 	var hotAvailableFilesMap = {};
/******/ 	var hotDeferred;
/******/
/******/ 	// The update info
/******/ 	var hotUpdate, hotUpdateNewHash;
/******/
/******/ 	function toModuleId(id) {
/******/ 		var isNumber = +id + "" === id;
/******/ 		return isNumber ? +id : id;
/******/ 	}
/******/
/******/ 	function hotCheck(apply) {
/******/ 		if (hotStatus !== "idle") {
/******/ 			throw new Error("check() is only allowed in idle status");
/******/ 		}
/******/ 		hotApplyOnUpdate = apply;
/******/ 		hotSetStatus("check");
/******/ 		return hotDownloadManifest(hotRequestTimeout).then(function(update) {
/******/ 			if (!update) {
/******/ 				hotSetStatus("idle");
/******/ 				return null;
/******/ 			}
/******/ 			hotRequestedFilesMap = {};
/******/ 			hotWaitingFilesMap = {};
/******/ 			hotAvailableFilesMap = update.c;
/******/ 			hotUpdateNewHash = update.h;
/******/
/******/ 			hotSetStatus("prepare");
/******/ 			var promise = new Promise(function(resolve, reject) {
/******/ 				hotDeferred = {
/******/ 					resolve: resolve,
/******/ 					reject: reject
/******/ 				};
/******/ 			});
/******/ 			hotUpdate = {};
/******/ 			for(var chunkId in installedChunks)
/******/ 			// eslint-disable-next-line no-lone-blocks
/******/ 			{
/******/ 				/*globals chunkId */
/******/ 				hotEnsureUpdateChunk(chunkId);
/******/ 			}
/******/ 			if (
/******/ 				hotStatus === "prepare" &&
/******/ 				hotChunksLoading === 0 &&
/******/ 				hotWaitingFiles === 0
/******/ 			) {
/******/ 				hotUpdateDownloaded();
/******/ 			}
/******/ 			return promise;
/******/ 		});
/******/ 	}
/******/
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotAddUpdateChunk(chunkId, moreModules) {
/******/ 		if (!hotAvailableFilesMap[chunkId] || !hotRequestedFilesMap[chunkId])
/******/ 			return;
/******/ 		hotRequestedFilesMap[chunkId] = false;
/******/ 		for (var moduleId in moreModules) {
/******/ 			if (Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				hotUpdate[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if (--hotWaitingFiles === 0 && hotChunksLoading === 0) {
/******/ 			hotUpdateDownloaded();
/******/ 		}
/******/ 	}
/******/
/******/ 	function hotEnsureUpdateChunk(chunkId) {
/******/ 		if (!hotAvailableFilesMap[chunkId]) {
/******/ 			hotWaitingFilesMap[chunkId] = true;
/******/ 		} else {
/******/ 			hotRequestedFilesMap[chunkId] = true;
/******/ 			hotWaitingFiles++;
/******/ 			hotDownloadUpdateChunk(chunkId);
/******/ 		}
/******/ 	}
/******/
/******/ 	function hotUpdateDownloaded() {
/******/ 		hotSetStatus("ready");
/******/ 		var deferred = hotDeferred;
/******/ 		hotDeferred = null;
/******/ 		if (!deferred) return;
/******/ 		if (hotApplyOnUpdate) {
/******/ 			// Wrap deferred object in Promise to mark it as a well-handled Promise to
/******/ 			// avoid triggering uncaught exception warning in Chrome.
/******/ 			// See https://bugs.chromium.org/p/chromium/issues/detail?id=465666
/******/ 			Promise.resolve()
/******/ 				.then(function() {
/******/ 					return hotApply(hotApplyOnUpdate);
/******/ 				})
/******/ 				.then(
/******/ 					function(result) {
/******/ 						deferred.resolve(result);
/******/ 					},
/******/ 					function(err) {
/******/ 						deferred.reject(err);
/******/ 					}
/******/ 				);
/******/ 		} else {
/******/ 			var outdatedModules = [];
/******/ 			for (var id in hotUpdate) {
/******/ 				if (Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 					outdatedModules.push(toModuleId(id));
/******/ 				}
/******/ 			}
/******/ 			deferred.resolve(outdatedModules);
/******/ 		}
/******/ 	}
/******/
/******/ 	function hotApply(options) {
/******/ 		if (hotStatus !== "ready")
/******/ 			throw new Error("apply() is only allowed in ready status");
/******/ 		options = options || {};
/******/
/******/ 		var cb;
/******/ 		var i;
/******/ 		var j;
/******/ 		var module;
/******/ 		var moduleId;
/******/
/******/ 		function getAffectedStuff(updateModuleId) {
/******/ 			var outdatedModules = [updateModuleId];
/******/ 			var outdatedDependencies = {};
/******/
/******/ 			var queue = outdatedModules.slice().map(function(id) {
/******/ 				return {
/******/ 					chain: [id],
/******/ 					id: id
/******/ 				};
/******/ 			});
/******/ 			while (queue.length > 0) {
/******/ 				var queueItem = queue.pop();
/******/ 				var moduleId = queueItem.id;
/******/ 				var chain = queueItem.chain;
/******/ 				module = installedModules[moduleId];
/******/ 				if (!module || module.hot._selfAccepted) continue;
/******/ 				if (module.hot._selfDeclined) {
/******/ 					return {
/******/ 						type: "self-declined",
/******/ 						chain: chain,
/******/ 						moduleId: moduleId
/******/ 					};
/******/ 				}
/******/ 				if (module.hot._main) {
/******/ 					return {
/******/ 						type: "unaccepted",
/******/ 						chain: chain,
/******/ 						moduleId: moduleId
/******/ 					};
/******/ 				}
/******/ 				for (var i = 0; i < module.parents.length; i++) {
/******/ 					var parentId = module.parents[i];
/******/ 					var parent = installedModules[parentId];
/******/ 					if (!parent) continue;
/******/ 					if (parent.hot._declinedDependencies[moduleId]) {
/******/ 						return {
/******/ 							type: "declined",
/******/ 							chain: chain.concat([parentId]),
/******/ 							moduleId: moduleId,
/******/ 							parentId: parentId
/******/ 						};
/******/ 					}
/******/ 					if (outdatedModules.indexOf(parentId) !== -1) continue;
/******/ 					if (parent.hot._acceptedDependencies[moduleId]) {
/******/ 						if (!outdatedDependencies[parentId])
/******/ 							outdatedDependencies[parentId] = [];
/******/ 						addAllToSet(outdatedDependencies[parentId], [moduleId]);
/******/ 						continue;
/******/ 					}
/******/ 					delete outdatedDependencies[parentId];
/******/ 					outdatedModules.push(parentId);
/******/ 					queue.push({
/******/ 						chain: chain.concat([parentId]),
/******/ 						id: parentId
/******/ 					});
/******/ 				}
/******/ 			}
/******/
/******/ 			return {
/******/ 				type: "accepted",
/******/ 				moduleId: updateModuleId,
/******/ 				outdatedModules: outdatedModules,
/******/ 				outdatedDependencies: outdatedDependencies
/******/ 			};
/******/ 		}
/******/
/******/ 		function addAllToSet(a, b) {
/******/ 			for (var i = 0; i < b.length; i++) {
/******/ 				var item = b[i];
/******/ 				if (a.indexOf(item) === -1) a.push(item);
/******/ 			}
/******/ 		}
/******/
/******/ 		// at begin all updates modules are outdated
/******/ 		// the "outdated" status can propagate to parents if they don't accept the children
/******/ 		var outdatedDependencies = {};
/******/ 		var outdatedModules = [];
/******/ 		var appliedUpdate = {};
/******/
/******/ 		var warnUnexpectedRequire = function warnUnexpectedRequire() {
/******/ 			console.warn(
/******/ 				"[HMR] unexpected require(" + result.moduleId + ") to disposed module"
/******/ 			);
/******/ 		};
/******/
/******/ 		for (var id in hotUpdate) {
/******/ 			if (Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 				moduleId = toModuleId(id);
/******/ 				/** @type {TODO} */
/******/ 				var result;
/******/ 				if (hotUpdate[id]) {
/******/ 					result = getAffectedStuff(moduleId);
/******/ 				} else {
/******/ 					result = {
/******/ 						type: "disposed",
/******/ 						moduleId: id
/******/ 					};
/******/ 				}
/******/ 				/** @type {Error|false} */
/******/ 				var abortError = false;
/******/ 				var doApply = false;
/******/ 				var doDispose = false;
/******/ 				var chainInfo = "";
/******/ 				if (result.chain) {
/******/ 					chainInfo = "\nUpdate propagation: " + result.chain.join(" -> ");
/******/ 				}
/******/ 				switch (result.type) {
/******/ 					case "self-declined":
/******/ 						if (options.onDeclined) options.onDeclined(result);
/******/ 						if (!options.ignoreDeclined)
/******/ 							abortError = new Error(
/******/ 								"Aborted because of self decline: " +
/******/ 									result.moduleId +
/******/ 									chainInfo
/******/ 							);
/******/ 						break;
/******/ 					case "declined":
/******/ 						if (options.onDeclined) options.onDeclined(result);
/******/ 						if (!options.ignoreDeclined)
/******/ 							abortError = new Error(
/******/ 								"Aborted because of declined dependency: " +
/******/ 									result.moduleId +
/******/ 									" in " +
/******/ 									result.parentId +
/******/ 									chainInfo
/******/ 							);
/******/ 						break;
/******/ 					case "unaccepted":
/******/ 						if (options.onUnaccepted) options.onUnaccepted(result);
/******/ 						if (!options.ignoreUnaccepted)
/******/ 							abortError = new Error(
/******/ 								"Aborted because " + moduleId + " is not accepted" + chainInfo
/******/ 							);
/******/ 						break;
/******/ 					case "accepted":
/******/ 						if (options.onAccepted) options.onAccepted(result);
/******/ 						doApply = true;
/******/ 						break;
/******/ 					case "disposed":
/******/ 						if (options.onDisposed) options.onDisposed(result);
/******/ 						doDispose = true;
/******/ 						break;
/******/ 					default:
/******/ 						throw new Error("Unexception type " + result.type);
/******/ 				}
/******/ 				if (abortError) {
/******/ 					hotSetStatus("abort");
/******/ 					return Promise.reject(abortError);
/******/ 				}
/******/ 				if (doApply) {
/******/ 					appliedUpdate[moduleId] = hotUpdate[moduleId];
/******/ 					addAllToSet(outdatedModules, result.outdatedModules);
/******/ 					for (moduleId in result.outdatedDependencies) {
/******/ 						if (
/******/ 							Object.prototype.hasOwnProperty.call(
/******/ 								result.outdatedDependencies,
/******/ 								moduleId
/******/ 							)
/******/ 						) {
/******/ 							if (!outdatedDependencies[moduleId])
/******/ 								outdatedDependencies[moduleId] = [];
/******/ 							addAllToSet(
/******/ 								outdatedDependencies[moduleId],
/******/ 								result.outdatedDependencies[moduleId]
/******/ 							);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 				if (doDispose) {
/******/ 					addAllToSet(outdatedModules, [result.moduleId]);
/******/ 					appliedUpdate[moduleId] = warnUnexpectedRequire;
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// Store self accepted outdated modules to require them later by the module system
/******/ 		var outdatedSelfAcceptedModules = [];
/******/ 		for (i = 0; i < outdatedModules.length; i++) {
/******/ 			moduleId = outdatedModules[i];
/******/ 			if (
/******/ 				installedModules[moduleId] &&
/******/ 				installedModules[moduleId].hot._selfAccepted
/******/ 			)
/******/ 				outdatedSelfAcceptedModules.push({
/******/ 					module: moduleId,
/******/ 					errorHandler: installedModules[moduleId].hot._selfAccepted
/******/ 				});
/******/ 		}
/******/
/******/ 		// Now in "dispose" phase
/******/ 		hotSetStatus("dispose");
/******/ 		Object.keys(hotAvailableFilesMap).forEach(function(chunkId) {
/******/ 			if (hotAvailableFilesMap[chunkId] === false) {
/******/ 				hotDisposeChunk(chunkId);
/******/ 			}
/******/ 		});
/******/
/******/ 		var idx;
/******/ 		var queue = outdatedModules.slice();
/******/ 		while (queue.length > 0) {
/******/ 			moduleId = queue.pop();
/******/ 			module = installedModules[moduleId];
/******/ 			if (!module) continue;
/******/
/******/ 			var data = {};
/******/
/******/ 			// Call dispose handlers
/******/ 			var disposeHandlers = module.hot._disposeHandlers;
/******/ 			for (j = 0; j < disposeHandlers.length; j++) {
/******/ 				cb = disposeHandlers[j];
/******/ 				cb(data);
/******/ 			}
/******/ 			hotCurrentModuleData[moduleId] = data;
/******/
/******/ 			// disable module (this disables requires from this module)
/******/ 			module.hot.active = false;
/******/
/******/ 			// remove module from cache
/******/ 			delete installedModules[moduleId];
/******/
/******/ 			// when disposing there is no need to call dispose handler
/******/ 			delete outdatedDependencies[moduleId];
/******/
/******/ 			// remove "parents" references from all children
/******/ 			for (j = 0; j < module.children.length; j++) {
/******/ 				var child = installedModules[module.children[j]];
/******/ 				if (!child) continue;
/******/ 				idx = child.parents.indexOf(moduleId);
/******/ 				if (idx >= 0) {
/******/ 					child.parents.splice(idx, 1);
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// remove outdated dependency from module children
/******/ 		var dependency;
/******/ 		var moduleOutdatedDependencies;
/******/ 		for (moduleId in outdatedDependencies) {
/******/ 			if (
/******/ 				Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)
/******/ 			) {
/******/ 				module = installedModules[moduleId];
/******/ 				if (module) {
/******/ 					moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 					for (j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 						dependency = moduleOutdatedDependencies[j];
/******/ 						idx = module.children.indexOf(dependency);
/******/ 						if (idx >= 0) module.children.splice(idx, 1);
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// Not in "apply" phase
/******/ 		hotSetStatus("apply");
/******/
/******/ 		hotCurrentHash = hotUpdateNewHash;
/******/
/******/ 		// insert new code
/******/ 		for (moduleId in appliedUpdate) {
/******/ 			if (Object.prototype.hasOwnProperty.call(appliedUpdate, moduleId)) {
/******/ 				modules[moduleId] = appliedUpdate[moduleId];
/******/ 			}
/******/ 		}
/******/
/******/ 		// call accept handlers
/******/ 		var error = null;
/******/ 		for (moduleId in outdatedDependencies) {
/******/ 			if (
/******/ 				Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)
/******/ 			) {
/******/ 				module = installedModules[moduleId];
/******/ 				if (module) {
/******/ 					moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 					var callbacks = [];
/******/ 					for (i = 0; i < moduleOutdatedDependencies.length; i++) {
/******/ 						dependency = moduleOutdatedDependencies[i];
/******/ 						cb = module.hot._acceptedDependencies[dependency];
/******/ 						if (cb) {
/******/ 							if (callbacks.indexOf(cb) !== -1) continue;
/******/ 							callbacks.push(cb);
/******/ 						}
/******/ 					}
/******/ 					for (i = 0; i < callbacks.length; i++) {
/******/ 						cb = callbacks[i];
/******/ 						try {
/******/ 							cb(moduleOutdatedDependencies);
/******/ 						} catch (err) {
/******/ 							if (options.onErrored) {
/******/ 								options.onErrored({
/******/ 									type: "accept-errored",
/******/ 									moduleId: moduleId,
/******/ 									dependencyId: moduleOutdatedDependencies[i],
/******/ 									error: err
/******/ 								});
/******/ 							}
/******/ 							if (!options.ignoreErrored) {
/******/ 								if (!error) error = err;
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// Load self accepted modules
/******/ 		for (i = 0; i < outdatedSelfAcceptedModules.length; i++) {
/******/ 			var item = outdatedSelfAcceptedModules[i];
/******/ 			moduleId = item.module;
/******/ 			hotCurrentParents = [moduleId];
/******/ 			try {
/******/ 				__webpack_require__(moduleId);
/******/ 			} catch (err) {
/******/ 				if (typeof item.errorHandler === "function") {
/******/ 					try {
/******/ 						item.errorHandler(err);
/******/ 					} catch (err2) {
/******/ 						if (options.onErrored) {
/******/ 							options.onErrored({
/******/ 								type: "self-accept-error-handler-errored",
/******/ 								moduleId: moduleId,
/******/ 								error: err2,
/******/ 								originalError: err
/******/ 							});
/******/ 						}
/******/ 						if (!options.ignoreErrored) {
/******/ 							if (!error) error = err2;
/******/ 						}
/******/ 						if (!error) error = err;
/******/ 					}
/******/ 				} else {
/******/ 					if (options.onErrored) {
/******/ 						options.onErrored({
/******/ 							type: "self-accept-errored",
/******/ 							moduleId: moduleId,
/******/ 							error: err
/******/ 						});
/******/ 					}
/******/ 					if (!options.ignoreErrored) {
/******/ 						if (!error) error = err;
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// handle errors in accept handlers and self accepted module load
/******/ 		if (error) {
/******/ 			hotSetStatus("fail");
/******/ 			return Promise.reject(error);
/******/ 		}
/******/
/******/ 		hotSetStatus("idle");
/******/ 		return new Promise(function(resolve) {
/******/ 			resolve(outdatedModules);
/******/ 		});
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded and loading chunks
/******/ 	// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 	// Promise = chunk loading, 0 = chunk loaded
/******/ 	var installedChunks = {
/******/ 		"main": 0
/******/ 	};
/******/
/******/ 	var deferredModules = [];
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {},
/******/ 			hot: hotCreateModule(moduleId),
/******/ 			parents: (hotCurrentParentsTemp = hotCurrentParents, hotCurrentParents = [], hotCurrentParentsTemp),
/******/ 			children: []
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, hotCreateRequire(moduleId));
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/resources/themes/sdlt/dist/img/";
/******/
/******/ 	// __webpack_hash__
/******/ 	__webpack_require__.h = function() { return hotCurrentHash; };
/******/
/******/ 	var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
/******/ 	var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
/******/ 	jsonpArray.push = webpackJsonpCallback;
/******/ 	jsonpArray = jsonpArray.slice();
/******/ 	for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
/******/ 	var parentJsonpFunction = oldJsonpFunction;
/******/
/******/
/******/ 	// add entry module to deferred list
/******/ 	deferredModules.push(["./src/js/main.js","vendors"]);
/******/ 	// run deferred modules when ready
/******/ 	return checkDeferredModules();
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/moment/locale sync recursive ^\\.\\/.*$":
/*!**************************************************!*\
  !*** ./node_modules/moment/locale sync ^\.\/.*$ ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./af": "./node_modules/moment/locale/af.js",
	"./af.js": "./node_modules/moment/locale/af.js",
	"./ar": "./node_modules/moment/locale/ar.js",
	"./ar-dz": "./node_modules/moment/locale/ar-dz.js",
	"./ar-dz.js": "./node_modules/moment/locale/ar-dz.js",
	"./ar-kw": "./node_modules/moment/locale/ar-kw.js",
	"./ar-kw.js": "./node_modules/moment/locale/ar-kw.js",
	"./ar-ly": "./node_modules/moment/locale/ar-ly.js",
	"./ar-ly.js": "./node_modules/moment/locale/ar-ly.js",
	"./ar-ma": "./node_modules/moment/locale/ar-ma.js",
	"./ar-ma.js": "./node_modules/moment/locale/ar-ma.js",
	"./ar-sa": "./node_modules/moment/locale/ar-sa.js",
	"./ar-sa.js": "./node_modules/moment/locale/ar-sa.js",
	"./ar-tn": "./node_modules/moment/locale/ar-tn.js",
	"./ar-tn.js": "./node_modules/moment/locale/ar-tn.js",
	"./ar.js": "./node_modules/moment/locale/ar.js",
	"./az": "./node_modules/moment/locale/az.js",
	"./az.js": "./node_modules/moment/locale/az.js",
	"./be": "./node_modules/moment/locale/be.js",
	"./be.js": "./node_modules/moment/locale/be.js",
	"./bg": "./node_modules/moment/locale/bg.js",
	"./bg.js": "./node_modules/moment/locale/bg.js",
	"./bm": "./node_modules/moment/locale/bm.js",
	"./bm.js": "./node_modules/moment/locale/bm.js",
	"./bn": "./node_modules/moment/locale/bn.js",
	"./bn.js": "./node_modules/moment/locale/bn.js",
	"./bo": "./node_modules/moment/locale/bo.js",
	"./bo.js": "./node_modules/moment/locale/bo.js",
	"./br": "./node_modules/moment/locale/br.js",
	"./br.js": "./node_modules/moment/locale/br.js",
	"./bs": "./node_modules/moment/locale/bs.js",
	"./bs.js": "./node_modules/moment/locale/bs.js",
	"./ca": "./node_modules/moment/locale/ca.js",
	"./ca.js": "./node_modules/moment/locale/ca.js",
	"./cs": "./node_modules/moment/locale/cs.js",
	"./cs.js": "./node_modules/moment/locale/cs.js",
	"./cv": "./node_modules/moment/locale/cv.js",
	"./cv.js": "./node_modules/moment/locale/cv.js",
	"./cy": "./node_modules/moment/locale/cy.js",
	"./cy.js": "./node_modules/moment/locale/cy.js",
	"./da": "./node_modules/moment/locale/da.js",
	"./da.js": "./node_modules/moment/locale/da.js",
	"./de": "./node_modules/moment/locale/de.js",
	"./de-at": "./node_modules/moment/locale/de-at.js",
	"./de-at.js": "./node_modules/moment/locale/de-at.js",
	"./de-ch": "./node_modules/moment/locale/de-ch.js",
	"./de-ch.js": "./node_modules/moment/locale/de-ch.js",
	"./de.js": "./node_modules/moment/locale/de.js",
	"./dv": "./node_modules/moment/locale/dv.js",
	"./dv.js": "./node_modules/moment/locale/dv.js",
	"./el": "./node_modules/moment/locale/el.js",
	"./el.js": "./node_modules/moment/locale/el.js",
	"./en-SG": "./node_modules/moment/locale/en-SG.js",
	"./en-SG.js": "./node_modules/moment/locale/en-SG.js",
	"./en-au": "./node_modules/moment/locale/en-au.js",
	"./en-au.js": "./node_modules/moment/locale/en-au.js",
	"./en-ca": "./node_modules/moment/locale/en-ca.js",
	"./en-ca.js": "./node_modules/moment/locale/en-ca.js",
	"./en-gb": "./node_modules/moment/locale/en-gb.js",
	"./en-gb.js": "./node_modules/moment/locale/en-gb.js",
	"./en-ie": "./node_modules/moment/locale/en-ie.js",
	"./en-ie.js": "./node_modules/moment/locale/en-ie.js",
	"./en-il": "./node_modules/moment/locale/en-il.js",
	"./en-il.js": "./node_modules/moment/locale/en-il.js",
	"./en-nz": "./node_modules/moment/locale/en-nz.js",
	"./en-nz.js": "./node_modules/moment/locale/en-nz.js",
	"./eo": "./node_modules/moment/locale/eo.js",
	"./eo.js": "./node_modules/moment/locale/eo.js",
	"./es": "./node_modules/moment/locale/es.js",
	"./es-do": "./node_modules/moment/locale/es-do.js",
	"./es-do.js": "./node_modules/moment/locale/es-do.js",
	"./es-us": "./node_modules/moment/locale/es-us.js",
	"./es-us.js": "./node_modules/moment/locale/es-us.js",
	"./es.js": "./node_modules/moment/locale/es.js",
	"./et": "./node_modules/moment/locale/et.js",
	"./et.js": "./node_modules/moment/locale/et.js",
	"./eu": "./node_modules/moment/locale/eu.js",
	"./eu.js": "./node_modules/moment/locale/eu.js",
	"./fa": "./node_modules/moment/locale/fa.js",
	"./fa.js": "./node_modules/moment/locale/fa.js",
	"./fi": "./node_modules/moment/locale/fi.js",
	"./fi.js": "./node_modules/moment/locale/fi.js",
	"./fo": "./node_modules/moment/locale/fo.js",
	"./fo.js": "./node_modules/moment/locale/fo.js",
	"./fr": "./node_modules/moment/locale/fr.js",
	"./fr-ca": "./node_modules/moment/locale/fr-ca.js",
	"./fr-ca.js": "./node_modules/moment/locale/fr-ca.js",
	"./fr-ch": "./node_modules/moment/locale/fr-ch.js",
	"./fr-ch.js": "./node_modules/moment/locale/fr-ch.js",
	"./fr.js": "./node_modules/moment/locale/fr.js",
	"./fy": "./node_modules/moment/locale/fy.js",
	"./fy.js": "./node_modules/moment/locale/fy.js",
	"./ga": "./node_modules/moment/locale/ga.js",
	"./ga.js": "./node_modules/moment/locale/ga.js",
	"./gd": "./node_modules/moment/locale/gd.js",
	"./gd.js": "./node_modules/moment/locale/gd.js",
	"./gl": "./node_modules/moment/locale/gl.js",
	"./gl.js": "./node_modules/moment/locale/gl.js",
	"./gom-latn": "./node_modules/moment/locale/gom-latn.js",
	"./gom-latn.js": "./node_modules/moment/locale/gom-latn.js",
	"./gu": "./node_modules/moment/locale/gu.js",
	"./gu.js": "./node_modules/moment/locale/gu.js",
	"./he": "./node_modules/moment/locale/he.js",
	"./he.js": "./node_modules/moment/locale/he.js",
	"./hi": "./node_modules/moment/locale/hi.js",
	"./hi.js": "./node_modules/moment/locale/hi.js",
	"./hr": "./node_modules/moment/locale/hr.js",
	"./hr.js": "./node_modules/moment/locale/hr.js",
	"./hu": "./node_modules/moment/locale/hu.js",
	"./hu.js": "./node_modules/moment/locale/hu.js",
	"./hy-am": "./node_modules/moment/locale/hy-am.js",
	"./hy-am.js": "./node_modules/moment/locale/hy-am.js",
	"./id": "./node_modules/moment/locale/id.js",
	"./id.js": "./node_modules/moment/locale/id.js",
	"./is": "./node_modules/moment/locale/is.js",
	"./is.js": "./node_modules/moment/locale/is.js",
	"./it": "./node_modules/moment/locale/it.js",
	"./it-ch": "./node_modules/moment/locale/it-ch.js",
	"./it-ch.js": "./node_modules/moment/locale/it-ch.js",
	"./it.js": "./node_modules/moment/locale/it.js",
	"./ja": "./node_modules/moment/locale/ja.js",
	"./ja.js": "./node_modules/moment/locale/ja.js",
	"./jv": "./node_modules/moment/locale/jv.js",
	"./jv.js": "./node_modules/moment/locale/jv.js",
	"./ka": "./node_modules/moment/locale/ka.js",
	"./ka.js": "./node_modules/moment/locale/ka.js",
	"./kk": "./node_modules/moment/locale/kk.js",
	"./kk.js": "./node_modules/moment/locale/kk.js",
	"./km": "./node_modules/moment/locale/km.js",
	"./km.js": "./node_modules/moment/locale/km.js",
	"./kn": "./node_modules/moment/locale/kn.js",
	"./kn.js": "./node_modules/moment/locale/kn.js",
	"./ko": "./node_modules/moment/locale/ko.js",
	"./ko.js": "./node_modules/moment/locale/ko.js",
	"./ku": "./node_modules/moment/locale/ku.js",
	"./ku.js": "./node_modules/moment/locale/ku.js",
	"./ky": "./node_modules/moment/locale/ky.js",
	"./ky.js": "./node_modules/moment/locale/ky.js",
	"./lb": "./node_modules/moment/locale/lb.js",
	"./lb.js": "./node_modules/moment/locale/lb.js",
	"./lo": "./node_modules/moment/locale/lo.js",
	"./lo.js": "./node_modules/moment/locale/lo.js",
	"./lt": "./node_modules/moment/locale/lt.js",
	"./lt.js": "./node_modules/moment/locale/lt.js",
	"./lv": "./node_modules/moment/locale/lv.js",
	"./lv.js": "./node_modules/moment/locale/lv.js",
	"./me": "./node_modules/moment/locale/me.js",
	"./me.js": "./node_modules/moment/locale/me.js",
	"./mi": "./node_modules/moment/locale/mi.js",
	"./mi.js": "./node_modules/moment/locale/mi.js",
	"./mk": "./node_modules/moment/locale/mk.js",
	"./mk.js": "./node_modules/moment/locale/mk.js",
	"./ml": "./node_modules/moment/locale/ml.js",
	"./ml.js": "./node_modules/moment/locale/ml.js",
	"./mn": "./node_modules/moment/locale/mn.js",
	"./mn.js": "./node_modules/moment/locale/mn.js",
	"./mr": "./node_modules/moment/locale/mr.js",
	"./mr.js": "./node_modules/moment/locale/mr.js",
	"./ms": "./node_modules/moment/locale/ms.js",
	"./ms-my": "./node_modules/moment/locale/ms-my.js",
	"./ms-my.js": "./node_modules/moment/locale/ms-my.js",
	"./ms.js": "./node_modules/moment/locale/ms.js",
	"./mt": "./node_modules/moment/locale/mt.js",
	"./mt.js": "./node_modules/moment/locale/mt.js",
	"./my": "./node_modules/moment/locale/my.js",
	"./my.js": "./node_modules/moment/locale/my.js",
	"./nb": "./node_modules/moment/locale/nb.js",
	"./nb.js": "./node_modules/moment/locale/nb.js",
	"./ne": "./node_modules/moment/locale/ne.js",
	"./ne.js": "./node_modules/moment/locale/ne.js",
	"./nl": "./node_modules/moment/locale/nl.js",
	"./nl-be": "./node_modules/moment/locale/nl-be.js",
	"./nl-be.js": "./node_modules/moment/locale/nl-be.js",
	"./nl.js": "./node_modules/moment/locale/nl.js",
	"./nn": "./node_modules/moment/locale/nn.js",
	"./nn.js": "./node_modules/moment/locale/nn.js",
	"./pa-in": "./node_modules/moment/locale/pa-in.js",
	"./pa-in.js": "./node_modules/moment/locale/pa-in.js",
	"./pl": "./node_modules/moment/locale/pl.js",
	"./pl.js": "./node_modules/moment/locale/pl.js",
	"./pt": "./node_modules/moment/locale/pt.js",
	"./pt-br": "./node_modules/moment/locale/pt-br.js",
	"./pt-br.js": "./node_modules/moment/locale/pt-br.js",
	"./pt.js": "./node_modules/moment/locale/pt.js",
	"./ro": "./node_modules/moment/locale/ro.js",
	"./ro.js": "./node_modules/moment/locale/ro.js",
	"./ru": "./node_modules/moment/locale/ru.js",
	"./ru.js": "./node_modules/moment/locale/ru.js",
	"./sd": "./node_modules/moment/locale/sd.js",
	"./sd.js": "./node_modules/moment/locale/sd.js",
	"./se": "./node_modules/moment/locale/se.js",
	"./se.js": "./node_modules/moment/locale/se.js",
	"./si": "./node_modules/moment/locale/si.js",
	"./si.js": "./node_modules/moment/locale/si.js",
	"./sk": "./node_modules/moment/locale/sk.js",
	"./sk.js": "./node_modules/moment/locale/sk.js",
	"./sl": "./node_modules/moment/locale/sl.js",
	"./sl.js": "./node_modules/moment/locale/sl.js",
	"./sq": "./node_modules/moment/locale/sq.js",
	"./sq.js": "./node_modules/moment/locale/sq.js",
	"./sr": "./node_modules/moment/locale/sr.js",
	"./sr-cyrl": "./node_modules/moment/locale/sr-cyrl.js",
	"./sr-cyrl.js": "./node_modules/moment/locale/sr-cyrl.js",
	"./sr.js": "./node_modules/moment/locale/sr.js",
	"./ss": "./node_modules/moment/locale/ss.js",
	"./ss.js": "./node_modules/moment/locale/ss.js",
	"./sv": "./node_modules/moment/locale/sv.js",
	"./sv.js": "./node_modules/moment/locale/sv.js",
	"./sw": "./node_modules/moment/locale/sw.js",
	"./sw.js": "./node_modules/moment/locale/sw.js",
	"./ta": "./node_modules/moment/locale/ta.js",
	"./ta.js": "./node_modules/moment/locale/ta.js",
	"./te": "./node_modules/moment/locale/te.js",
	"./te.js": "./node_modules/moment/locale/te.js",
	"./tet": "./node_modules/moment/locale/tet.js",
	"./tet.js": "./node_modules/moment/locale/tet.js",
	"./tg": "./node_modules/moment/locale/tg.js",
	"./tg.js": "./node_modules/moment/locale/tg.js",
	"./th": "./node_modules/moment/locale/th.js",
	"./th.js": "./node_modules/moment/locale/th.js",
	"./tl-ph": "./node_modules/moment/locale/tl-ph.js",
	"./tl-ph.js": "./node_modules/moment/locale/tl-ph.js",
	"./tlh": "./node_modules/moment/locale/tlh.js",
	"./tlh.js": "./node_modules/moment/locale/tlh.js",
	"./tr": "./node_modules/moment/locale/tr.js",
	"./tr.js": "./node_modules/moment/locale/tr.js",
	"./tzl": "./node_modules/moment/locale/tzl.js",
	"./tzl.js": "./node_modules/moment/locale/tzl.js",
	"./tzm": "./node_modules/moment/locale/tzm.js",
	"./tzm-latn": "./node_modules/moment/locale/tzm-latn.js",
	"./tzm-latn.js": "./node_modules/moment/locale/tzm-latn.js",
	"./tzm.js": "./node_modules/moment/locale/tzm.js",
	"./ug-cn": "./node_modules/moment/locale/ug-cn.js",
	"./ug-cn.js": "./node_modules/moment/locale/ug-cn.js",
	"./uk": "./node_modules/moment/locale/uk.js",
	"./uk.js": "./node_modules/moment/locale/uk.js",
	"./ur": "./node_modules/moment/locale/ur.js",
	"./ur.js": "./node_modules/moment/locale/ur.js",
	"./uz": "./node_modules/moment/locale/uz.js",
	"./uz-latn": "./node_modules/moment/locale/uz-latn.js",
	"./uz-latn.js": "./node_modules/moment/locale/uz-latn.js",
	"./uz.js": "./node_modules/moment/locale/uz.js",
	"./vi": "./node_modules/moment/locale/vi.js",
	"./vi.js": "./node_modules/moment/locale/vi.js",
	"./x-pseudo": "./node_modules/moment/locale/x-pseudo.js",
	"./x-pseudo.js": "./node_modules/moment/locale/x-pseudo.js",
	"./yo": "./node_modules/moment/locale/yo.js",
	"./yo.js": "./node_modules/moment/locale/yo.js",
	"./zh-cn": "./node_modules/moment/locale/zh-cn.js",
	"./zh-cn.js": "./node_modules/moment/locale/zh-cn.js",
	"./zh-hk": "./node_modules/moment/locale/zh-hk.js",
	"./zh-hk.js": "./node_modules/moment/locale/zh-hk.js",
	"./zh-tw": "./node_modules/moment/locale/zh-tw.js",
	"./zh-tw.js": "./node_modules/moment/locale/zh-tw.js"
};


function webpackContext(req) {
	var id = webpackContextResolve(req);
	return __webpack_require__(id);
}
function webpackContextResolve(req) {
	if(!__webpack_require__.o(map, req)) {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	}
	return map[req];
}
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = "./node_modules/moment/locale sync recursive ^\\.\\/.*$";

/***/ }),

/***/ "./src/img/Home/background.jpg":
/*!*************************************!*\
  !*** ./src/img/Home/background.jpg ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "../img/f0545538d29150bca803dd2e1d422c11.jpg";

/***/ }),

/***/ "./src/img/Home/bug-icon.svg":
/*!***********************************!*\
  !*** ./src/img/Home/bug-icon.svg ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "../img/442b4a253c2be23661dc12e64f264053.svg";

/***/ }),

/***/ "./src/img/Home/poc-icon.svg":
/*!***********************************!*\
  !*** ./src/img/Home/poc-icon.svg ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "../img/b2ce59ecfcc515cb33d81013163089b9.svg";

/***/ }),

/***/ "./src/img/Home/prod-icon.svg":
/*!************************************!*\
  !*** ./src/img/Home/prod-icon.svg ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "../img/0e61629440d7a6d860ba88aad4af303a.svg";

/***/ }),

/***/ "./src/img/Home/saas-icon.svg":
/*!************************************!*\
  !*** ./src/img/Home/saas-icon.svg ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "../img/41e304962a77cf734f9bfe9772ab12b9.svg";

/***/ }),

/***/ "./src/img/Logo.svg":
/*!**************************!*\
  !*** ./src/img/Logo.svg ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "../img/b002cf666ac7512c21ad21462efdf4e8.svg";

/***/ }),

/***/ "./src/img/PDF/footer.jpg":
/*!********************************!*\
  !*** ./src/img/PDF/footer.jpg ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "../img/d1029db2ceff54ee06b8dafcf9f6a671.jpg";

/***/ }),

/***/ "./src/img/PDF/heading.jpg":
/*!*********************************!*\
  !*** ./src/img/PDF/heading.jpg ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "../img/4b4872cec3cb197b21f4d3ac1b8ee472.jpg";

/***/ }),

/***/ "./src/img/icons/edit.svg":
/*!********************************!*\
  !*** ./src/img/icons/edit.svg ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "../img/4aa06b86ab33745eda39a0996b2a31bd.svg";

/***/ }),

/***/ "./src/img/icons/pdf.svg":
/*!*******************************!*\
  !*** ./src/img/icons/pdf.svg ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "../img/64544011f835a0bcc13b668a98a70f78.svg";

/***/ }),

/***/ "./src/img/icons/question-editing.svg":
/*!********************************************!*\
  !*** ./src/img/icons/question-editing.svg ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "../img/b0b707ee0bdf8b4add381179f4a89bf9.svg";

/***/ }),

/***/ "./src/img/icons/user.svg":
/*!********************************!*\
  !*** ./src/img/icons/user.svg ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "../img/44cca0ef5b0830924492e8a8413b854e.svg";

/***/ }),

/***/ "./src/js/actions/ActionType.js":
/*!**************************************!*\
  !*** ./src/js/actions/ActionType.js ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var redux__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! redux */ "./node_modules/redux/es/redux.js");

var ActionType = {
  HOME: {
    LOAD_HOME_STATE_STARTED: "LOAD_HOME_STATE_STARTED",
    LOAD_HOME_STATE_FAILED: "LOAD_HOME_STATE_FAILED",
    LOAD_HOME_STATE_FINISHED: "LOAD_HOME_STATE_FINISHED"
  },
  QUESTIONNAIRE: {
    LOAD_QUESTIONNAIRE_START_STATE: "LOAD_QUESTIONNAIRE_START_STATE",
    LOAD_QUESTIONNAIRE_SUBMISSION_STATE: "LOAD_QUESTIONNAIRE_SUBMISSION_STATE",
    PUT_DATA_IN_QUESTIONNAIRE_ANSWER: "PUT_DATA_IN_QUESTIONNAIRE_ANSWER",
    MOVE_TO_ANOTHER_QUESTIONNAIRE_QUESTION: "MOVE_TO_ANOTHER_QUESTIONNAIRE_QUESTION",
    MARK_QUESTIONNAIRE_QUESTION_NOT_APPLICABLE: "MARK_QUESTIONNAIRE_QUESTION_NOT_APPLICABLE"
  },
  TASK: {
    LOAD_TASK_SUBMISSION_STATE: "LOAD_TASK_SUBMISSION_STATE",
    PUT_DATA_IN_TASK_SUBMISSION: "PUT_DATA_IN_TASK_SUBMISSION",
    MARK_TASK_QUESTION_NOT_APPLICABLE: "MARK_TASK_QUESTION_NOT_APPLICABLE",
    MOVE_TO_ANOTHER_TASK_QUESTION: "MOVE_TO_ANOTHER_TASK_QUESTION"
  },
  // TODO: add a global UI state to reflect loading and error
  UI: {
    LOAD_DATA_STARTED: "LOAD_DATA_STARTED",
    LOAD_DATA_FAILED: "LOAD_DATA_FAILED",
    LOAD_DATA_FINISHED: "LOAD_DATA_FINISHED"
  }
};
/* harmony default export */ __webpack_exports__["default"] = (ActionType);

/***/ }),

/***/ "./src/js/actions/home.js":
/*!********************************!*\
  !*** ./src/js/actions/home.js ***!
  \********************************/
/*! exports provided: loadHomeState, loadingHomeState, failedHomeState, loadedHomeState */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loadHomeState", function() { return loadHomeState; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loadingHomeState", function() { return loadingHomeState; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "failedHomeState", function() { return failedHomeState; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loadedHomeState", function() { return loadedHomeState; });
/* harmony import */ var _ActionType__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActionType */ "./src/js/actions/ActionType.js");
/* harmony import */ var redux_thunk__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! redux-thunk */ "./node_modules/redux-thunk/es/index.js");
/* harmony import */ var _services_HomeDataService__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../services/HomeDataService */ "./src/js/services/HomeDataService.js");
/* harmony import */ var redux__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! redux */ "./node_modules/redux/es/redux.js");
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }





function loadHomeState() {
  return (
    /*#__PURE__*/
    function () {
      var _ref = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(dispatch) {
        var homeState;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                // TODO: maybe dispatch a global loading action
                dispatch(loadingHomeState());
                _context.prev = 1;
                _context.next = 4;
                return _services_HomeDataService__WEBPACK_IMPORTED_MODULE_2__["default"].fetchHomeData();

              case 4:
                homeState = _context.sent;
                dispatch(loadedHomeState(homeState));
                _context.next = 13;
                break;

              case 8:
                _context.prev = 8;
                _context.t0 = _context["catch"](1);
                dispatch(failedHomeState(_context.t0)); // TODO: maybe dispatch a global error action
                // TODO: maybe better error alert

                console.error(_context.t0);
                alert(_context.t0.message);

              case 13:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[1, 8]]);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }()
  );
}
function loadingHomeState() {
  return {
    type: _ActionType__WEBPACK_IMPORTED_MODULE_0__["default"].HOME.LOAD_HOME_STATE_STARTED
  };
}
function failedHomeState(error) {
  return {
    type: _ActionType__WEBPACK_IMPORTED_MODULE_0__["default"].HOME.LOAD_HOME_STATE_FAILED,
    error: error
  };
}
function loadedHomeState(homeState) {
  return {
    type: _ActionType__WEBPACK_IMPORTED_MODULE_0__["default"].HOME.LOAD_HOME_STATE_FINISHED,
    payload: homeState
  };
}

/***/ }),

/***/ "./src/js/actions/questionnarie.js":
/*!*****************************************!*\
  !*** ./src/js/actions/questionnarie.js ***!
  \*****************************************/
/*! exports provided: loadQuestionnaireStartState, loadQuestionnaireStartStateFinished, createInProgressSubmission, loadQuestionnaireSubmissionState, loadQuestionnaireSubmissionStateFinished, putDataInQuestionnaireAnswer, moveAfterQuestionAnswered, moveToPreviousQuestion, submitQuestionnaire, submitQuestionnaireForApproval, approveQuestionnaireSubmission, denyQuestionnaireSubmission, editQuestionnaireSubmission */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loadQuestionnaireStartState", function() { return loadQuestionnaireStartState; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loadQuestionnaireStartStateFinished", function() { return loadQuestionnaireStartStateFinished; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createInProgressSubmission", function() { return createInProgressSubmission; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loadQuestionnaireSubmissionState", function() { return loadQuestionnaireSubmissionState; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loadQuestionnaireSubmissionStateFinished", function() { return loadQuestionnaireSubmissionStateFinished; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "putDataInQuestionnaireAnswer", function() { return putDataInQuestionnaireAnswer; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "moveAfterQuestionAnswered", function() { return moveAfterQuestionAnswered; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "moveToPreviousQuestion", function() { return moveToPreviousQuestion; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "submitQuestionnaire", function() { return submitQuestionnaire; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "submitQuestionnaireForApproval", function() { return submitQuestionnaireForApproval; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "approveQuestionnaireSubmission", function() { return approveQuestionnaireSubmission; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "denyQuestionnaireSubmission", function() { return denyQuestionnaireSubmission; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "editQuestionnaireSubmission", function() { return editQuestionnaireSubmission; });
/* harmony import */ var _ActionType__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ActionType */ "./src/js/actions/ActionType.js");
/* harmony import */ var redux_thunk__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! redux-thunk */ "./node_modules/redux-thunk/es/index.js");
/* harmony import */ var _services_QuestionnaireDataService__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../services/QuestionnaireDataService */ "./src/js/services/QuestionnaireDataService.js");
/* harmony import */ var _services_CSRFTokenService__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../services/CSRFTokenService */ "./src/js/services/CSRFTokenService.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _utils_SubmissionDataUtil__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/SubmissionDataUtil */ "./src/js/utils/SubmissionDataUtil.js");
/* harmony import */ var _utils_URLUtil__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../utils/URLUtil */ "./src/js/utils/URLUtil.js");
/* harmony import */ var _services_TaskDataService__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../services/TaskDataService */ "./src/js/services/TaskDataService.js");
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }








 // Start

function loadQuestionnaireStartState(questionnaireID) {
  return (
    /*#__PURE__*/
    function () {
      var _ref = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(dispatch) {
        var data;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _context.next = 3;
                return _services_QuestionnaireDataService__WEBPACK_IMPORTED_MODULE_2__["default"].fetchStartData(questionnaireID);

              case 3:
                data = _context.sent;
                dispatch(loadQuestionnaireStartStateFinished(data));
                _context.next = 10;
                break;

              case 7:
                _context.prev = 7;
                _context.t0 = _context["catch"](0);
                // TODO: maybe dispatch a global error action
                alert(_context.t0);

              case 10:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[0, 7]]);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }()
  );
}
function loadQuestionnaireStartStateFinished(payload) {
  return {
    type: _ActionType__WEBPACK_IMPORTED_MODULE_0__["default"].QUESTIONNAIRE.LOAD_QUESTIONNAIRE_START_STATE,
    payload: payload
  };
} // Submission

function createInProgressSubmission(questionnaireID) {
  return (
    /*#__PURE__*/
    function () {
      var _ref2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(dispatch) {
        var csrfToken, uuid;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.prev = 0;
                _context2.next = 3;
                return _services_CSRFTokenService__WEBPACK_IMPORTED_MODULE_3__["default"].getCSRFToken();

              case 3:
                csrfToken = _context2.sent;
                _context2.next = 6;
                return _services_QuestionnaireDataService__WEBPACK_IMPORTED_MODULE_2__["default"].createInProgressSubmission({
                  questionnaireID: questionnaireID,
                  csrfToken: csrfToken
                });

              case 6:
                uuid = _context2.sent;
                // Redirect to questionnaire page
                _utils_URLUtil__WEBPACK_IMPORTED_MODULE_6__["default"].redirectToQuestionnaireEditing(uuid);
                _context2.next = 13;
                break;

              case 10:
                _context2.prev = 10;
                _context2.t0 = _context2["catch"](0);
                // TODO: maybe dispatch a global error action
                alert(_context2.t0);

              case 13:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, null, [[0, 10]]);
      }));

      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    }()
  );
}
function loadQuestionnaireSubmissionState(submissionHash) {
  return (
    /*#__PURE__*/
    function () {
      var _ref3 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(dispatch) {
        var data;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.prev = 0;
                _context3.next = 3;
                return _services_QuestionnaireDataService__WEBPACK_IMPORTED_MODULE_2__["default"].fetchSubmissionData(submissionHash);

              case 3:
                data = _context3.sent;
                dispatch(loadQuestionnaireSubmissionStateFinished(data));
                _context3.next = 10;
                break;

              case 7:
                _context3.prev = 7;
                _context3.t0 = _context3["catch"](0);
                // TODO: maybe dispatch a global error action
                alert(_context3.t0);

              case 10:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, null, [[0, 7]]);
      }));

      return function (_x3) {
        return _ref3.apply(this, arguments);
      };
    }()
  );
}
function loadQuestionnaireSubmissionStateFinished(payload) {
  return {
    type: _ActionType__WEBPACK_IMPORTED_MODULE_0__["default"].QUESTIONNAIRE.LOAD_QUESTIONNAIRE_SUBMISSION_STATE,
    payload: payload
  };
} // TODO: split big functions

function putDataInQuestionnaireAnswer(payload) {
  return (
    /*#__PURE__*/
    function () {
      var _ref4 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(dispatch, getState) {
        var rootState, submissionID, csrfToken, questionID, answerData;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                // Save local state
                dispatch({
                  type: _ActionType__WEBPACK_IMPORTED_MODULE_0__["default"].QUESTIONNAIRE.PUT_DATA_IN_QUESTIONNAIRE_ANSWER,
                  payload: payload
                });
                rootState = getState();
                submissionID = lodash__WEBPACK_IMPORTED_MODULE_4___default.a.get(rootState, "questionnaireState.submissionState.submission.submissionID", null);

                if (submissionID) {
                  _context4.next = 5;
                  break;
                }

                throw new Error("Something is wrong, please reload the page");

              case 5:
                _context4.next = 7;
                return _services_CSRFTokenService__WEBPACK_IMPORTED_MODULE_3__["default"].getCSRFToken();

              case 7:
                csrfToken = _context4.sent;
                questionID = payload.id;
                answerData = _utils_SubmissionDataUtil__WEBPACK_IMPORTED_MODULE_5__["default"].transformFromFullQuestionToData(payload); // Update state of current answered question in cloud

                _context4.prev = 10;
                _context4.next = 13;
                return _services_QuestionnaireDataService__WEBPACK_IMPORTED_MODULE_2__["default"].updateSubmissionData({
                  submissionID: submissionID,
                  questionID: questionID,
                  csrfToken: csrfToken,
                  answerData: answerData
                });

              case 13:
                // Move cursor
                dispatch(moveAfterQuestionAnswered(payload));
                _context4.next = 19;
                break;

              case 16:
                _context4.prev = 16;
                _context4.t0 = _context4["catch"](10);
                // TODO: error handling
                alert(_context4.t0.message);

              case 19:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, null, [[10, 16]]);
      }));

      return function (_x4, _x5) {
        return _ref4.apply(this, arguments);
      };
    }()
  );
}
function moveAfterQuestionAnswered(answeredQuestion) {
  return (
    /*#__PURE__*/
    function () {
      var _ref5 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee5(dispatch, getState) {
        var rootState, submission, _SubmissionDataUtil$g, currentIndex, targetIndex, nonApplicableIndexes, complete;

        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                rootState = getState();
                submission = rootState.questionnaireState.submissionState.submission;

                if (submission) {
                  _context5.next = 4;
                  break;
                }

                return _context5.abrupt("return");

              case 4:
                _SubmissionDataUtil$g = _utils_SubmissionDataUtil__WEBPACK_IMPORTED_MODULE_5__["default"].getDataUpdateIntent({
                  answeredQuestion: answeredQuestion,
                  questions: submission.questions
                }), currentIndex = _SubmissionDataUtil$g.currentIndex, targetIndex = _SubmissionDataUtil$g.targetIndex, nonApplicableIndexes = _SubmissionDataUtil$g.nonApplicableIndexes, complete = _SubmissionDataUtil$g.complete; // Mark non applicable questions

                if (nonApplicableIndexes.length > 0) {
                  dispatch({
                    type: _ActionType__WEBPACK_IMPORTED_MODULE_0__["default"].QUESTIONNAIRE.MARK_QUESTIONNAIRE_QUESTION_NOT_APPLICABLE,
                    nonApplicableIndexes: nonApplicableIndexes
                  });
                } // Move cursor if target question is valid


                if (targetIndex > currentIndex) {
                  dispatch({
                    type: _ActionType__WEBPACK_IMPORTED_MODULE_0__["default"].QUESTIONNAIRE.MOVE_TO_ANOTHER_QUESTIONNAIRE_QUESTION,
                    targetIndex: targetIndex
                  });
                } // Batch update states for all related questions to cloud


                _context5.next = 9;
                return batchUpdateSubmissionData(getState(), lodash__WEBPACK_IMPORTED_MODULE_4___default.a.uniq([currentIndex].concat(_toConsumableArray(nonApplicableIndexes), [targetIndex])));

              case 9:
                if (complete) {
                  _utils_URLUtil__WEBPACK_IMPORTED_MODULE_6__["default"].redirectToQuestionnaireReview(submission.submissionUUID);
                }

              case 10:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5);
      }));

      return function (_x6, _x7) {
        return _ref5.apply(this, arguments);
      };
    }()
  );
}
function moveToPreviousQuestion(targetQuestion) {
  return (
    /*#__PURE__*/
    function () {
      var _ref6 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee6(dispatch, getState) {
        var rootState, submission, currentIndex, targetIndex;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                rootState = getState();
                submission = rootState.questionnaireState.submissionState.submission;

                if (submission) {
                  _context6.next = 4;
                  break;
                }

                return _context6.abrupt("return");

              case 4:
                currentIndex = submission.questions.findIndex(function (question) {
                  return question.isCurrent;
                });

                if (!(currentIndex < 0)) {
                  _context6.next = 7;
                  break;
                }

                throw new Error("Wrong state, please reload the questionnaire");

              case 7:
                if (!(!targetQuestion.isApplicable || !targetQuestion.hasAnswer)) {
                  _context6.next = 9;
                  break;
                }

                return _context6.abrupt("return");

              case 9:
                targetIndex = submission.questions.findIndex(function (question) {
                  return question.id === targetQuestion.id;
                });

                if (!(targetIndex < 0)) {
                  _context6.next = 12;
                  break;
                }

                return _context6.abrupt("return");

              case 12:
                dispatch({
                  type: _ActionType__WEBPACK_IMPORTED_MODULE_0__["default"].QUESTIONNAIRE.MOVE_TO_ANOTHER_QUESTIONNAIRE_QUESTION,
                  targetIndex: targetIndex
                }); // Batch update states for all related questions to cloud ("current" cursor changes)

                _context6.next = 15;
                return batchUpdateSubmissionData(getState(), [currentIndex, targetIndex]);

              case 15:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6);
      }));

      return function (_x8, _x9) {
        return _ref6.apply(this, arguments);
      };
    }()
  );
}
function submitQuestionnaire() {
  return (
    /*#__PURE__*/
    function () {
      var _ref7 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee7(dispatch, getState) {
        var rootState, submissionState, submission, csrfToken, _ref8, uuid;

        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.prev = 0;
                rootState = getState();
                submissionState = rootState.questionnaireState.submissionState;
                submission = submissionState.submission;

                if (submission) {
                  _context7.next = 6;
                  break;
                }

                return _context7.abrupt("return");

              case 6:
                if (!_utils_SubmissionDataUtil__WEBPACK_IMPORTED_MODULE_5__["default"].existsUnansweredQuestion(submission.questions)) {
                  _context7.next = 9;
                  break;
                }

                alert("There are questions not answered properly, please check your answers");
                return _context7.abrupt("return");

              case 9:
                _context7.next = 11;
                return _services_CSRFTokenService__WEBPACK_IMPORTED_MODULE_3__["default"].getCSRFToken();

              case 11:
                csrfToken = _context7.sent;
                _context7.next = 14;
                return _services_QuestionnaireDataService__WEBPACK_IMPORTED_MODULE_2__["default"].submitQuestionnaire({
                  submissionID: submission.submissionID,
                  csrfToken: csrfToken
                });

              case 14:
                _ref8 = _context7.sent;
                uuid = _ref8.uuid;
                _context7.next = 18;
                return _services_TaskDataService__WEBPACK_IMPORTED_MODULE_7__["default"].createTaskSubmissionsForQuestionnaireSubmission({
                  questionnaireSubmission: submission,
                  csrfToken: csrfToken
                });

              case 18:
                _utils_URLUtil__WEBPACK_IMPORTED_MODULE_6__["default"].redirectToQuestionnaireSummary(uuid);
                _context7.next = 24;
                break;

              case 21:
                _context7.prev = 21;
                _context7.t0 = _context7["catch"](0);
                // TODO: errors
                alert(_context7.t0);

              case 24:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, null, [[0, 21]]);
      }));

      return function (_x10, _x11) {
        return _ref7.apply(this, arguments);
      };
    }()
  );
}
function submitQuestionnaireForApproval(submissionID) {
  return (
    /*#__PURE__*/
    function () {
      var _ref9 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee8(dispatch, getState) {
        var csrfToken, _ref10, uuid;

        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.prev = 0;
                _context8.next = 3;
                return _services_CSRFTokenService__WEBPACK_IMPORTED_MODULE_3__["default"].getCSRFToken();

              case 3:
                csrfToken = _context8.sent;
                _context8.next = 6;
                return _services_QuestionnaireDataService__WEBPACK_IMPORTED_MODULE_2__["default"].submitQuestionnaireForApproval({
                  submissionID: submissionID,
                  csrfToken: csrfToken
                });

              case 6:
                _ref10 = _context8.sent;
                uuid = _ref10.uuid;
                dispatch(loadQuestionnaireSubmissionState(uuid));
                _context8.next = 14;
                break;

              case 11:
                _context8.prev = 11;
                _context8.t0 = _context8["catch"](0);
                // TODO: errors
                alert(_context8.t0);

              case 14:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, null, [[0, 11]]);
      }));

      return function (_x12, _x13) {
        return _ref9.apply(this, arguments);
      };
    }()
  );
}
function approveQuestionnaireSubmission(submissionID) {
  return (
    /*#__PURE__*/
    function () {
      var _ref11 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee9(dispatch, getState) {
        var csrfToken, _ref12, uuid;

        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                _context9.prev = 0;
                _context9.next = 3;
                return _services_CSRFTokenService__WEBPACK_IMPORTED_MODULE_3__["default"].getCSRFToken();

              case 3:
                csrfToken = _context9.sent;
                _context9.next = 6;
                return _services_QuestionnaireDataService__WEBPACK_IMPORTED_MODULE_2__["default"].approveQuestionnaireSubmission({
                  submissionID: submissionID,
                  csrfToken: csrfToken
                });

              case 6:
                _ref12 = _context9.sent;
                uuid = _ref12.uuid;
                dispatch(loadQuestionnaireSubmissionState(uuid));
                _context9.next = 14;
                break;

              case 11:
                _context9.prev = 11;
                _context9.t0 = _context9["catch"](0);
                // TODO: errors
                alert(_context9.t0);

              case 14:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, null, [[0, 11]]);
      }));

      return function (_x14, _x15) {
        return _ref11.apply(this, arguments);
      };
    }()
  );
}
function denyQuestionnaireSubmission(submissionID) {
  return (
    /*#__PURE__*/
    function () {
      var _ref13 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee10(dispatch, getState) {
        var csrfToken, _ref14, uuid;

        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                _context10.prev = 0;
                _context10.next = 3;
                return _services_CSRFTokenService__WEBPACK_IMPORTED_MODULE_3__["default"].getCSRFToken();

              case 3:
                csrfToken = _context10.sent;
                _context10.next = 6;
                return _services_QuestionnaireDataService__WEBPACK_IMPORTED_MODULE_2__["default"].denyQuestionnaireSubmission({
                  submissionID: submissionID,
                  csrfToken: csrfToken
                });

              case 6:
                _ref14 = _context10.sent;
                uuid = _ref14.uuid;
                dispatch(loadQuestionnaireSubmissionState(uuid));
                _context10.next = 14;
                break;

              case 11:
                _context10.prev = 11;
                _context10.t0 = _context10["catch"](0);
                // TODO: errors
                alert(_context10.t0);

              case 14:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, null, [[0, 11]]);
      }));

      return function (_x16, _x17) {
        return _ref13.apply(this, arguments);
      };
    }()
  );
}
function editQuestionnaireSubmission(submissionID) {
  return (
    /*#__PURE__*/
    function () {
      var _ref15 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee11(dispatch, getState) {
        var csrfToken, _ref16, uuid;

        return regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                _context11.prev = 0;
                _context11.next = 3;
                return _services_CSRFTokenService__WEBPACK_IMPORTED_MODULE_3__["default"].getCSRFToken();

              case 3:
                csrfToken = _context11.sent;
                _context11.next = 6;
                return _services_QuestionnaireDataService__WEBPACK_IMPORTED_MODULE_2__["default"].editQuestionnaireSubmission({
                  submissionID: submissionID,
                  csrfToken: csrfToken
                });

              case 6:
                _ref16 = _context11.sent;
                uuid = _ref16.uuid;
                _utils_URLUtil__WEBPACK_IMPORTED_MODULE_6__["default"].redirectToQuestionnaireEditing(uuid);
                _context11.next = 14;
                break;

              case 11:
                _context11.prev = 11;
                _context11.t0 = _context11["catch"](0);
                // TODO: errors
                alert(_context11.t0);

              case 14:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, null, [[0, 11]]);
      }));

      return function (_x18, _x19) {
        return _ref15.apply(this, arguments);
      };
    }()
  );
} // Commons

function batchUpdateSubmissionData(_x20, _x21) {
  return _batchUpdateSubmissionData.apply(this, arguments);
}

function _batchUpdateSubmissionData() {
  _batchUpdateSubmissionData = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee12(rootState, indexesToUpdate) {
    var submission, csrfToken;
    return regeneratorRuntime.wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            submission = rootState.questionnaireState.submissionState.submission;

            if (submission) {
              _context12.next = 3;
              break;
            }

            return _context12.abrupt("return");

          case 3:
            _context12.next = 5;
            return _services_CSRFTokenService__WEBPACK_IMPORTED_MODULE_3__["default"].getCSRFToken();

          case 5:
            csrfToken = _context12.sent;
            _context12.prev = 6;
            _context12.next = 9;
            return _services_QuestionnaireDataService__WEBPACK_IMPORTED_MODULE_2__["default"].batchUpdateSubmissionData({
              submissionID: submission.submissionID,
              questionIDList: indexesToUpdate.map(function (index) {
                return submission.questions[index].id;
              }),
              answerDataList: indexesToUpdate.map(function (index) {
                return _utils_SubmissionDataUtil__WEBPACK_IMPORTED_MODULE_5__["default"].transformFromFullQuestionToData(submission.questions[index]);
              }),
              csrfToken: csrfToken
            });

          case 9:
            _context12.next = 14;
            break;

          case 11:
            _context12.prev = 11;
            _context12.t0 = _context12["catch"](6);
            // TODO: error handling
            alert(_context12.t0.message);

          case 14:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee12, null, [[6, 11]]);
  }));
  return _batchUpdateSubmissionData.apply(this, arguments);
}

/***/ }),

/***/ "./src/js/actions/task.js":
/*!********************************!*\
  !*** ./src/js/actions/task.js ***!
  \********************************/
/*! exports provided: loadTaskSubmissionState, saveAnsweredQuestion, moveToPreviousQuestion, editCompletedTaskSubmission */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loadTaskSubmissionState", function() { return loadTaskSubmissionState; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "saveAnsweredQuestion", function() { return saveAnsweredQuestion; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "moveToPreviousQuestion", function() { return moveToPreviousQuestion; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "editCompletedTaskSubmission", function() { return editCompletedTaskSubmission; });
/* harmony import */ var redux_thunk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! redux-thunk */ "./node_modules/redux-thunk/es/index.js");
/* harmony import */ var _services_TaskDataService__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../services/TaskDataService */ "./src/js/services/TaskDataService.js");
/* harmony import */ var _ActionType__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ActionType */ "./src/js/actions/ActionType.js");
/* harmony import */ var _utils_SubmissionDataUtil__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/SubmissionDataUtil */ "./src/js/utils/SubmissionDataUtil.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _services_CSRFTokenService__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../services/CSRFTokenService */ "./src/js/services/CSRFTokenService.js");
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }







function loadTaskSubmissionState(uuid) {
  return (
    /*#__PURE__*/
    function () {
      var _ref = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(dispatch) {
        var payload;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _context.next = 3;
                return _services_TaskDataService__WEBPACK_IMPORTED_MODULE_1__["default"].fetchTaskSubmissionState(uuid);

              case 3:
                payload = _context.sent;
                dispatch({
                  type: _ActionType__WEBPACK_IMPORTED_MODULE_2__["default"].TASK.LOAD_TASK_SUBMISSION_STATE,
                  payload: payload
                });
                _context.next = 10;
                break;

              case 7:
                _context.prev = 7;
                _context.t0 = _context["catch"](0);
                // TODO: errors
                alert(_context.t0);

              case 10:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[0, 7]]);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }()
  );
}
function saveAnsweredQuestion(answeredQuestion) {
  return (
    /*#__PURE__*/
    function () {
      var _ref2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(dispatch, getState) {
        var taskSubmission, _SubmissionDataUtil$g, currentIndex, nonApplicableIndexes, targetIndex, complete, terminate, result, _ref3, uuid;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                taskSubmission = lodash__WEBPACK_IMPORTED_MODULE_4___default.a.get(getState(), "taskSubmissionState.taskSubmission");

                if (taskSubmission) {
                  _context2.next = 3;
                  break;
                }

                return _context2.abrupt("return");

              case 3:
                // Save local state
                dispatch({
                  type: _ActionType__WEBPACK_IMPORTED_MODULE_2__["default"].TASK.PUT_DATA_IN_TASK_SUBMISSION,
                  payload: answeredQuestion
                }); // Network request - save answer

                _context2.t0 = _services_TaskDataService__WEBPACK_IMPORTED_MODULE_1__["default"];
                _context2.t1 = taskSubmission.uuid;
                _context2.t2 = [answeredQuestion.id];
                _context2.t3 = [_utils_SubmissionDataUtil__WEBPACK_IMPORTED_MODULE_3__["default"].transformFromFullQuestionToData(answeredQuestion)];
                _context2.next = 10;
                return _services_CSRFTokenService__WEBPACK_IMPORTED_MODULE_5__["default"].getCSRFToken();

              case 10:
                _context2.t4 = _context2.sent;
                _context2.t5 = {
                  uuid: _context2.t1,
                  questionIDList: _context2.t2,
                  answerDataList: _context2.t3,
                  csrfToken: _context2.t4
                };
                _context2.next = 14;
                return _context2.t0.batchUpdateTaskSubmissionData.call(_context2.t0, _context2.t5);

              case 14:
                // Move cursor
                _SubmissionDataUtil$g = _utils_SubmissionDataUtil__WEBPACK_IMPORTED_MODULE_3__["default"].getDataUpdateIntent({
                  answeredQuestion: answeredQuestion,
                  questions: taskSubmission.questions
                }), currentIndex = _SubmissionDataUtil$g.currentIndex, nonApplicableIndexes = _SubmissionDataUtil$g.nonApplicableIndexes, targetIndex = _SubmissionDataUtil$g.targetIndex, complete = _SubmissionDataUtil$g.complete, terminate = _SubmissionDataUtil$g.terminate, result = _SubmissionDataUtil$g.result; // Mark non applicable questions

                if (nonApplicableIndexes.length > 0) {
                  dispatch({
                    type: _ActionType__WEBPACK_IMPORTED_MODULE_2__["default"].TASK.MARK_TASK_QUESTION_NOT_APPLICABLE,
                    payload: nonApplicableIndexes
                  });
                } // Move cursor


                if (targetIndex > currentIndex) {
                  dispatch({
                    type: _ActionType__WEBPACK_IMPORTED_MODULE_2__["default"].TASK.MOVE_TO_ANOTHER_TASK_QUESTION,
                    payload: {
                      currentIndex: currentIndex,
                      targetIndex: targetIndex
                    }
                  });
                } // Network request - batch update


                _context2.next = 19;
                return batchUpdateTaskSubmissionData(taskSubmission, lodash__WEBPACK_IMPORTED_MODULE_4___default.a.uniq([currentIndex].concat(_toConsumableArray(nonApplicableIndexes), [targetIndex])));

              case 19:
                if (!complete) {
                  _context2.next = 32;
                  break;
                }

                _context2.t6 = _services_TaskDataService__WEBPACK_IMPORTED_MODULE_1__["default"];
                _context2.t7 = taskSubmission.uuid;
                _context2.t8 = result;
                _context2.next = 25;
                return _services_CSRFTokenService__WEBPACK_IMPORTED_MODULE_5__["default"].getCSRFToken();

              case 25:
                _context2.t9 = _context2.sent;
                _context2.t10 = {
                  uuid: _context2.t7,
                  result: _context2.t8,
                  csrfToken: _context2.t9
                };
                _context2.next = 29;
                return _context2.t6.completeTaskSubmission.call(_context2.t6, _context2.t10);

              case 29:
                _ref3 = _context2.sent;
                uuid = _ref3.uuid;
                dispatch(loadTaskSubmissionState(uuid));

              case 32:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      return function (_x2, _x3) {
        return _ref2.apply(this, arguments);
      };
    }()
  );
}
function moveToPreviousQuestion(targetQuestion) {
  return (
    /*#__PURE__*/
    function () {
      var _ref4 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(dispatch, getState) {
        var taskSubmission, questions, currentIndex, targetIndex;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                taskSubmission = lodash__WEBPACK_IMPORTED_MODULE_4___default.a.get(getState(), "taskSubmissionState.taskSubmission", null);

                if (taskSubmission) {
                  _context3.next = 3;
                  break;
                }

                return _context3.abrupt("return");

              case 3:
                questions = taskSubmission.questions;
                currentIndex = questions.findIndex(function (question) {
                  return question.isCurrent;
                });

                if (!(currentIndex < 0)) {
                  _context3.next = 7;
                  break;
                }

                throw new Error("Wrong state, please reload the task");

              case 7:
                if (!(!targetQuestion.isApplicable || !targetQuestion.hasAnswer)) {
                  _context3.next = 9;
                  break;
                }

                return _context3.abrupt("return");

              case 9:
                targetIndex = questions.findIndex(function (question) {
                  return question.id === targetQuestion.id;
                });

                if (!(targetIndex < 0)) {
                  _context3.next = 12;
                  break;
                }

                return _context3.abrupt("return");

              case 12:
                // Move cursor
                dispatch({
                  type: _ActionType__WEBPACK_IMPORTED_MODULE_2__["default"].TASK.MOVE_TO_ANOTHER_TASK_QUESTION,
                  payload: {
                    currentIndex: currentIndex,
                    targetIndex: targetIndex
                  }
                }); // Network request - batch update

                _context3.next = 15;
                return batchUpdateTaskSubmissionData(taskSubmission, lodash__WEBPACK_IMPORTED_MODULE_4___default.a.uniq([currentIndex, targetIndex]));

              case 15:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      return function (_x4, _x5) {
        return _ref4.apply(this, arguments);
      };
    }()
  );
}
function editCompletedTaskSubmission() {
  return (
    /*#__PURE__*/
    function () {
      var _ref5 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(dispatch, getState) {
        var taskSubmission, _ref6, uuid;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                taskSubmission = lodash__WEBPACK_IMPORTED_MODULE_4___default.a.get(getState(), "taskSubmissionState.taskSubmission", null);

                if (taskSubmission) {
                  _context4.next = 3;
                  break;
                }

                return _context4.abrupt("return");

              case 3:
                _context4.t0 = _services_TaskDataService__WEBPACK_IMPORTED_MODULE_1__["default"];
                _context4.t1 = taskSubmission.uuid;
                _context4.next = 7;
                return _services_CSRFTokenService__WEBPACK_IMPORTED_MODULE_5__["default"].getCSRFToken();

              case 7:
                _context4.t2 = _context4.sent;
                _context4.t3 = {
                  uuid: _context4.t1,
                  csrfToken: _context4.t2
                };
                _context4.next = 11;
                return _context4.t0.editTaskSubmission.call(_context4.t0, _context4.t3);

              case 11:
                _ref6 = _context4.sent;
                uuid = _ref6.uuid;
                dispatch(loadTaskSubmissionState(uuid));

              case 14:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      }));

      return function (_x6, _x7) {
        return _ref5.apply(this, arguments);
      };
    }()
  );
}

function batchUpdateTaskSubmissionData(_x8, _x9) {
  return _batchUpdateTaskSubmissionData.apply(this, arguments);
}

function _batchUpdateTaskSubmissionData() {
  _batchUpdateTaskSubmissionData = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee5(taskSubmission, indexesToUpdate) {
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.prev = 0;
            _context5.t0 = _services_TaskDataService__WEBPACK_IMPORTED_MODULE_1__["default"];
            _context5.t1 = taskSubmission.uuid;
            _context5.t2 = indexesToUpdate.map(function (index) {
              return taskSubmission.questions[index].id;
            });
            _context5.t3 = indexesToUpdate.map(function (index) {
              return _utils_SubmissionDataUtil__WEBPACK_IMPORTED_MODULE_3__["default"].transformFromFullQuestionToData(taskSubmission.questions[index]);
            });
            _context5.next = 7;
            return _services_CSRFTokenService__WEBPACK_IMPORTED_MODULE_5__["default"].getCSRFToken();

          case 7:
            _context5.t4 = _context5.sent;
            _context5.t5 = {
              uuid: _context5.t1,
              questionIDList: _context5.t2,
              answerDataList: _context5.t3,
              csrfToken: _context5.t4
            };
            _context5.next = 11;
            return _context5.t0.batchUpdateTaskSubmissionData.call(_context5.t0, _context5.t5);

          case 11:
            _context5.next = 16;
            break;

          case 13:
            _context5.prev = 13;
            _context5.t6 = _context5["catch"](0);
            // TODO: error handling
            alert(_context5.t6.message);

          case 16:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[0, 13]]);
  }));
  return _batchUpdateTaskSubmissionData.apply(this, arguments);
}

/***/ }),

/***/ "./src/js/components/App/AnonymousApp.js":
/*!***********************************************!*\
  !*** ./src/js/components/App/AnonymousApp.js ***!
  \***********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-router-dom */ "./node_modules/react-router-dom/es/index.js");
/* harmony import */ var _Questionnaire_SummaryForBusinessOwner__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Questionnaire/SummaryForBusinessOwner */ "./src/js/components/Questionnaire/SummaryForBusinessOwner.js");
/* harmony import */ var query_string__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! query-string */ "./node_modules/query-string/index.js");
/* harmony import */ var query_string__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(query_string__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _Task_TaskSubmissionForBusinessOwner__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../Task/TaskSubmissionForBusinessOwner */ "./src/js/components/Task/TaskSubmissionForBusinessOwner.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }







var AnonymousApp =
/*#__PURE__*/
function (_Component) {
  _inherits(AnonymousApp, _Component);

  function AnonymousApp() {
    _classCallCheck(this, AnonymousApp);

    return _possibleConstructorReturn(this, _getPrototypeOf(AnonymousApp).apply(this, arguments));
  }

  _createClass(AnonymousApp, [{
    key: "render",
    value: function render() {
      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("main", null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_1__["HashRouter"], null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_1__["Switch"], null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_1__["Route"], {
        path: "/questionnaire/summary/:uuid"
      }, function (_ref) {
        var match = _ref.match,
            location = _ref.location;
        var query = Object(query_string__WEBPACK_IMPORTED_MODULE_3__["parse"])(location.search);
        return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
          className: "gray-bg"
        }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Questionnaire_SummaryForBusinessOwner__WEBPACK_IMPORTED_MODULE_2__["default"], {
          uuid: match.params.uuid,
          token: query.token || ""
        }));
      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_1__["Route"], {
        path: "/task/submission/:uuid"
      }, function (_ref2) {
        var match = _ref2.match,
            location = _ref2.location;
        var query = Object(query_string__WEBPACK_IMPORTED_MODULE_3__["parse"])(location.search);
        return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
          className: "gray-bg"
        }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Task_TaskSubmissionForBusinessOwner__WEBPACK_IMPORTED_MODULE_4__["default"], {
          uuid: match.params.uuid,
          token: query.token || ""
        }));
      })))));
    }
  }]);

  return AnonymousApp;
}(react__WEBPACK_IMPORTED_MODULE_0__["Component"]);

/* harmony default export */ __webpack_exports__["default"] = (AnonymousApp);

/***/ }),

/***/ "./src/js/components/App/MainApp.js":
/*!******************************************!*\
  !*** ./src/js/components/App/MainApp.js ***!
  \******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-router-dom */ "./node_modules/react-router-dom/es/index.js");
/* harmony import */ var _Home_HomeContainer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Home/HomeContainer */ "./src/js/components/Home/HomeContainer.js");
/* harmony import */ var _Questionnaire_StartContainer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Questionnaire/StartContainer */ "./src/js/components/Questionnaire/StartContainer.js");
/* harmony import */ var _Questionnaire_QuestionnaireContainer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../Questionnaire/QuestionnaireContainer */ "./src/js/components/Questionnaire/QuestionnaireContainer.js");
/* harmony import */ var _Questionnaire_ReviewContainer__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../Questionnaire/ReviewContainer */ "./src/js/components/Questionnaire/ReviewContainer.js");
/* harmony import */ var _Questionnaire_SummaryContainer__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../Questionnaire/SummaryContainer */ "./src/js/components/Questionnaire/SummaryContainer.js");
/* harmony import */ var _Task_TaskSubmissionContainer__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../Task/TaskSubmissionContainer */ "./src/js/components/Task/TaskSubmissionContainer.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }










var MainApp =
/*#__PURE__*/
function (_Component) {
  _inherits(MainApp, _Component);

  function MainApp() {
    _classCallCheck(this, MainApp);

    return _possibleConstructorReturn(this, _getPrototypeOf(MainApp).apply(this, arguments));
  }

  _createClass(MainApp, [{
    key: "render",
    value: function render() {
      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("main", null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_1__["Switch"], null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_1__["Route"], {
        exact: true,
        path: "/"
      }, function () {
        return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Home_HomeContainer__WEBPACK_IMPORTED_MODULE_2__["default"], null);
      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_1__["Route"], {
        path: "/questionnaire/start/:id"
      }, function (_ref) {
        var match = _ref.match;
        return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
          className: "gray-bg"
        }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Questionnaire_StartContainer__WEBPACK_IMPORTED_MODULE_3__["default"], {
          questionnaireID: match.params.id
        }));
      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_1__["Route"], {
        path: "/questionnaire/submission/:hash"
      }, function (_ref2) {
        var match = _ref2.match;
        return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
          className: "gray-bg"
        }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Questionnaire_QuestionnaireContainer__WEBPACK_IMPORTED_MODULE_4__["default"], {
          submissionHash: match.params.hash
        }));
      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_1__["Route"], {
        path: "/questionnaire/review/:hash"
      }, function (_ref3) {
        var match = _ref3.match;
        return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
          className: "gray-bg"
        }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Questionnaire_ReviewContainer__WEBPACK_IMPORTED_MODULE_5__["default"], {
          submissionHash: match.params.hash
        }));
      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_1__["Route"], {
        path: "/questionnaire/summary/:hash"
      }, function (_ref4) {
        var match = _ref4.match;
        return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
          className: "gray-bg"
        }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Questionnaire_SummaryContainer__WEBPACK_IMPORTED_MODULE_6__["default"], {
          submissionHash: match.params.hash
        }));
      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_1__["Route"], {
        path: "/task/submission/:uuid"
      }, function (_ref5) {
        var match = _ref5.match;
        return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
          className: "gray-bg"
        }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Task_TaskSubmissionContainer__WEBPACK_IMPORTED_MODULE_7__["default"], {
          uuid: match.params.uuid
        }));
      }))));
    }
  }]);

  return MainApp;
}(react__WEBPACK_IMPORTED_MODULE_0__["Component"]);

/* harmony default export */ __webpack_exports__["default"] = (MainApp);

/***/ }),

/***/ "./src/js/components/Button/BaseButton.js":
/*!************************************************!*\
  !*** ./src/js/components/Button/BaseButton.js ***!
  \************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! classnames */ "./node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_1__);
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }




var BaseButton =
/*#__PURE__*/
function (_Component) {
  _inherits(BaseButton, _Component);

  function BaseButton() {
    _classCallCheck(this, BaseButton);

    return _possibleConstructorReturn(this, _getPrototypeOf(BaseButton).apply(this, arguments));
  }

  _createClass(BaseButton, [{
    key: "render",
    value: function render() {
      var _this$props = _objectSpread({}, this.props),
          title = _this$props.title,
          classes = _this$props.classes,
          disabled = _this$props.disabled,
          _onClick = _this$props.onClick,
          iconImage = _this$props.iconImage;

      var icon = null;

      if (iconImage) {
        icon = react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("img", {
          src: iconImage
        });
      }

      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("button", {
        className: classnames__WEBPACK_IMPORTED_MODULE_1___default()("BaseButton", classes, {
          "disabled": disabled
        }),
        onClick: function onClick(event) {
          if (disabled) {
            event.preventDefault();
            return;
          }

          _onClick(event);
        }
      }, icon, title);
    }
  }]);

  return BaseButton;
}(react__WEBPACK_IMPORTED_MODULE_0__["Component"]);

BaseButton.defaultProps = {
  title: "",
  disabled: false,
  classes: [],
  onClick: function onClick() {}
};
/* harmony default export */ __webpack_exports__["default"] = (BaseButton);

/***/ }),

/***/ "./src/js/components/Button/DarkButton.js":
/*!************************************************!*\
  !*** ./src/js/components/Button/DarkButton.js ***!
  \************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _BaseButton__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./BaseButton */ "./src/js/components/Button/BaseButton.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }




var DarkButton =
/*#__PURE__*/
function (_Component) {
  _inherits(DarkButton, _Component);

  function DarkButton() {
    _classCallCheck(this, DarkButton);

    return _possibleConstructorReturn(this, _getPrototypeOf(DarkButton).apply(this, arguments));
  }

  _createClass(DarkButton, [{
    key: "render",
    value: function render() {
      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_BaseButton__WEBPACK_IMPORTED_MODULE_1__["default"], _extends({}, this.props, {
        classes: ["DarkButton"].concat(_toConsumableArray(this.props.classes))
      }));
    }
  }]);

  return DarkButton;
}(react__WEBPACK_IMPORTED_MODULE_0__["Component"]);

DarkButton.defaultProps = {
  title: "",
  disabled: false,
  classes: [],
  onClick: function onClick() {}
};
/* harmony default export */ __webpack_exports__["default"] = (DarkButton);

/***/ }),

/***/ "./src/js/components/Button/LightButton.js":
/*!*************************************************!*\
  !*** ./src/js/components/Button/LightButton.js ***!
  \*************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _BaseButton__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./BaseButton */ "./src/js/components/Button/BaseButton.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }




var LightButton =
/*#__PURE__*/
function (_Component) {
  _inherits(LightButton, _Component);

  function LightButton() {
    _classCallCheck(this, LightButton);

    return _possibleConstructorReturn(this, _getPrototypeOf(LightButton).apply(this, arguments));
  }

  _createClass(LightButton, [{
    key: "render",
    value: function render() {
      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_BaseButton__WEBPACK_IMPORTED_MODULE_1__["default"], _extends({}, this.props, {
        classes: ["LightButton"].concat(_toConsumableArray(this.props.classes))
      }));
    }
  }]);

  return LightButton;
}(react__WEBPACK_IMPORTED_MODULE_0__["Component"]);

LightButton.defaultProps = {
  title: "",
  disabled: false,
  classes: [],
  onClick: function onClick() {}
};
/* harmony default export */ __webpack_exports__["default"] = (LightButton);

/***/ }),

/***/ "./src/js/components/Button/LogoutButton.js":
/*!**************************************************!*\
  !*** ./src/js/components/Button/LogoutButton.js ***!
  \**************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _img_icons_user_svg__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../img/icons/user.svg */ "./src/img/icons/user.svg");
/* harmony import */ var _img_icons_user_svg__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_img_icons_user_svg__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _services_CSRFTokenService__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../services/CSRFTokenService */ "./src/js/services/CSRFTokenService.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }





var LogoutButton =
/*#__PURE__*/
function (_Component) {
  _inherits(LogoutButton, _Component);

  function LogoutButton() {
    _classCallCheck(this, LogoutButton);

    return _possibleConstructorReturn(this, _getPrototypeOf(LogoutButton).apply(this, arguments));
  }

  _createClass(LogoutButton, [{
    key: "render",
    value: function render() {
      var _this = this;

      var _this$props = _objectSpread({}, this.props),
          classes = _this$props.classes;

      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("button", {
        className: "LogoutButton ".concat(classes.join(" ")),
        onClick: function onClick() {
          _this.logout();
        }
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("img", {
        src: _img_icons_user_svg__WEBPACK_IMPORTED_MODULE_1___default.a
      }), "Log Out"));
    }
  }, {
    key: "logout",
    value: function () {
      var _logout = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee() {
        var csrfToken;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return _services_CSRFTokenService__WEBPACK_IMPORTED_MODULE_2__["default"].getCSRFToken();

              case 2:
                csrfToken = _context.sent;
                window.location.href = "/Security/Logout?SecurityID=".concat(csrfToken);

              case 4:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function logout() {
        return _logout.apply(this, arguments);
      }

      return logout;
    }()
  }]);

  return LogoutButton;
}(react__WEBPACK_IMPORTED_MODULE_0__["Component"]);

LogoutButton.defaultProps = {
  classes: []
};
/* harmony default export */ __webpack_exports__["default"] = (LogoutButton);

/***/ }),

/***/ "./src/js/components/Footer/Footer.js":
/*!********************************************!*\
  !*** ./src/js/components/Footer/Footer.js ***!
  \********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }



var Footer =
/*#__PURE__*/
function (_Component) {
  _inherits(Footer, _Component);

  function Footer() {
    _classCallCheck(this, Footer);

    return _possibleConstructorReturn(this, _getPrototypeOf(Footer).apply(this, arguments));
  }

  _createClass(Footer, [{
    key: "render",
    value: function render() {
      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("footer", {
        className: "Footer"
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, "\xA9 2019 | NZ Transport Agency"));
    }
  }]);

  return Footer;
}(react__WEBPACK_IMPORTED_MODULE_0__["Component"]);

/* harmony default export */ __webpack_exports__["default"] = (Footer);

/***/ }),

/***/ "./src/js/components/Header/Header.js":
/*!********************************************!*\
  !*** ./src/js/components/Header/Header.js ***!
  \********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _img_Logo_svg__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../img/Logo.svg */ "./src/img/Logo.svg");
/* harmony import */ var _img_Logo_svg__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_img_Logo_svg__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _Button_LogoutButton__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Button/LogoutButton */ "./src/js/components/Button/LogoutButton.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }





var Header =
/*#__PURE__*/
function (_Component) {
  _inherits(Header, _Component);

  function Header() {
    _classCallCheck(this, Header);

    return _possibleConstructorReturn(this, _getPrototypeOf(Header).apply(this, arguments));
  }

  _createClass(Header, [{
    key: "render",
    value: function render() {
      var _this$props = _objectSpread({}, this.props),
          title = _this$props.title,
          subtitle = _this$props.subtitle;

      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("header", {
        className: "Header"
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "top-banner"
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("img", {
        src: _img_Logo_svg__WEBPACK_IMPORTED_MODULE_1___default.a,
        className: "logo"
      })), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "logout-wrapper"
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Button_LogoutButton__WEBPACK_IMPORTED_MODULE_2__["default"], null)), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("h1", null, title), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("h2", null, subtitle));
    }
  }]);

  return Header;
}(react__WEBPACK_IMPORTED_MODULE_0__["Component"]);

/* harmony default export */ __webpack_exports__["default"] = (Header);

/***/ }),

/***/ "./src/js/components/Home/Home.js":
/*!****************************************!*\
  !*** ./src/js/components/Home/Home.js ***!
  \****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _img_Logo_svg__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../img/Logo.svg */ "./src/img/Logo.svg");
/* harmony import */ var _img_Logo_svg__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_img_Logo_svg__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _Pillar__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Pillar */ "./src/js/components/Home/Pillar.js");
/* harmony import */ var _TaskButton__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./TaskButton */ "./src/js/components/Home/TaskButton.js");
/* harmony import */ var _Button_LogoutButton__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../Button/LogoutButton */ "./src/js/components/Button/LogoutButton.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }







var Home =
/*#__PURE__*/
function (_Component) {
  _inherits(Home, _Component);

  function Home() {
    _classCallCheck(this, Home);

    return _possibleConstructorReturn(this, _getPrototypeOf(Home).apply(this, arguments));
  }

  _createClass(Home, [{
    key: "render",
    value: function render() {
      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "Home"
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Button_LogoutButton__WEBPACK_IMPORTED_MODULE_4__["default"], {
        classes: ["clearfix", "float-right", "mt-5", "mr-5"]
      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "layout"
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("img", {
        src: _img_Logo_svg__WEBPACK_IMPORTED_MODULE_1___default.a,
        className: "logo"
      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("h1", null, this.props.homeState.title), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("h2", null, this.props.homeState.subtitle), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "pillars"
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "row"
      }, this.props.homeState.pillars.map(function (pillar, index) {
        return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Pillar__WEBPACK_IMPORTED_MODULE_2__["default"], {
          link: "/questionnaire/start/".concat(pillar.questionnaireID),
          classes: ["col", "mx-1"],
          pillar: pillar,
          key: index
        });
      }))), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "tasks"
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_TaskButton__WEBPACK_IMPORTED_MODULE_3__["default"], {
        link: "/tasks/blah",
        classes: ["mx-1"],
        disabled: true,
        title: "Information Classification"
      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_TaskButton__WEBPACK_IMPORTED_MODULE_3__["default"], {
        link: "/tasks/blah",
        classes: ["mx-1"],
        disabled: true,
        title: "Information Classification"
      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_TaskButton__WEBPACK_IMPORTED_MODULE_3__["default"], {
        link: "/tasks/blah",
        classes: ["mx-1"],
        disabled: true,
        title: "Information Classification"
      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_TaskButton__WEBPACK_IMPORTED_MODULE_3__["default"], {
        link: "/tasks/blah",
        classes: ["mx-1"],
        disabled: true,
        title: "Information Classification"
      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_TaskButton__WEBPACK_IMPORTED_MODULE_3__["default"], {
        link: "/tasks/blah",
        classes: ["mx-1"],
        disabled: true,
        title: "Information Classification"
      }))));
    }
  }]);

  return Home;
}(react__WEBPACK_IMPORTED_MODULE_0__["Component"]);

/* harmony default export */ __webpack_exports__["default"] = (Home);

/***/ }),

/***/ "./src/js/components/Home/HomeContainer.js":
/*!*************************************************!*\
  !*** ./src/js/components/Home/HomeContainer.js ***!
  \*************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_redux__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-redux */ "./node_modules/react-redux/es/index.js");
/* harmony import */ var _actions_home__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../actions/home */ "./src/js/actions/home.js");
/* harmony import */ var redux__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! redux */ "./node_modules/redux/es/redux.js");
/* harmony import */ var _Home__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Home */ "./src/js/components/Home/Home.js");
/* harmony import */ var _Footer_Footer__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../Footer/Footer */ "./src/js/components/Footer/Footer.js");
/* harmony import */ var _img_Home_background_jpg__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../img/Home/background.jpg */ "./src/img/Home/background.jpg");
/* harmony import */ var _img_Home_background_jpg__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_img_Home_background_jpg__WEBPACK_IMPORTED_MODULE_6__);
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }









var mapStateToProps = function mapStateToProps(state) {
  return {
    homeState: state.homeState
  };
};

var mapDispatchToProps = function mapDispatchToProps(dispatch, props) {
  return {
    dispatchLoadHomeDataAction: function dispatchLoadHomeDataAction() {
      dispatch(Object(_actions_home__WEBPACK_IMPORTED_MODULE_2__["loadHomeState"])());
    }
  };
};

var HomeContainer =
/*#__PURE__*/
function (_Component) {
  _inherits(HomeContainer, _Component);

  function HomeContainer() {
    _classCallCheck(this, HomeContainer);

    return _possibleConstructorReturn(this, _getPrototypeOf(HomeContainer).apply(this, arguments));
  }

  _createClass(HomeContainer, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      if (this.props.dispatchLoadHomeDataAction) {
        this.props.dispatchLoadHomeDataAction();
      }
    }
  }, {
    key: "render",
    value: function render() {
      if (!this.props.homeState) {
        return null;
      }

      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "HomeContainer",
        style: {
          backgroundImage: "url(\"".concat(_img_Home_background_jpg__WEBPACK_IMPORTED_MODULE_6___default.a, "\")"),
          backgroundSize: "cover"
        }
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Home__WEBPACK_IMPORTED_MODULE_4__["default"], {
        homeState: this.props.homeState
      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Footer_Footer__WEBPACK_IMPORTED_MODULE_5__["default"], null));
    }
  }]);

  return HomeContainer;
}(react__WEBPACK_IMPORTED_MODULE_0__["Component"]);

/* harmony default export */ __webpack_exports__["default"] = (Object(react_redux__WEBPACK_IMPORTED_MODULE_1__["connect"])(mapStateToProps, mapDispatchToProps)(HomeContainer));

/***/ }),

/***/ "./src/js/components/Home/Pillar.js":
/*!******************************************!*\
  !*** ./src/js/components/Home/Pillar.js ***!
  \******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-router-dom */ "./node_modules/react-router-dom/es/index.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }




var Pillar =
/*#__PURE__*/
function (_Component) {
  _inherits(Pillar, _Component);

  function Pillar() {
    _classCallCheck(this, Pillar);

    return _possibleConstructorReturn(this, _getPrototypeOf(Pillar).apply(this, arguments));
  }

  _createClass(Pillar, [{
    key: "render",
    value: function render() {
      var _this = this;

      var classes = ["Pillar"].concat(_toConsumableArray(this.props.classes));

      if (this.props.pillar.disabled) {
        classes.push("disabled");
      }

      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_1__["Link"], {
        className: classes.join(" "),
        to: this.props.link,
        onClick: function onClick(event) {
          if (_this.props.pillar.disabled) {
            event.preventDefault();
            alert("Coming soon...");
          }
        }
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "icon"
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("img", {
        src: this.props.pillar.icon,
        alt: this.props.pillar.title
      })), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "title"
      }, this.props.pillar.title));
    }
  }]);

  return Pillar;
}(react__WEBPACK_IMPORTED_MODULE_0__["Component"]);

/* harmony default export */ __webpack_exports__["default"] = (Pillar);

/***/ }),

/***/ "./src/js/components/Home/TaskButton.js":
/*!**********************************************!*\
  !*** ./src/js/components/Home/TaskButton.js ***!
  \**********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-router-dom */ "./node_modules/react-router-dom/es/index.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }




var TaskButton =
/*#__PURE__*/
function (_Component) {
  _inherits(TaskButton, _Component);

  function TaskButton() {
    _classCallCheck(this, TaskButton);

    return _possibleConstructorReturn(this, _getPrototypeOf(TaskButton).apply(this, arguments));
  }

  _createClass(TaskButton, [{
    key: "render",
    value: function render() {
      var _this = this;

      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_1__["Link"], {
        className: "TaskButton ".concat(this.props.classes.join(" ")),
        to: this.props.link,
        onClick: function onClick(event) {
          if (_this.props.disabled) {
            event.preventDefault();
            alert("Coming soon...");
          }
        }
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "title"
      }, this.props.title));
    }
  }]);

  return TaskButton;
}(react__WEBPACK_IMPORTED_MODULE_0__["Component"]);

/* harmony default export */ __webpack_exports__["default"] = (TaskButton);

/***/ }),

/***/ "./src/js/components/Questionnaire/AnswersPreview.js":
/*!***********************************************************!*\
  !*** ./src/js/components/Questionnaire/AnswersPreview.js ***!
  \***********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! moment */ "./node_modules/moment/moment.js");
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_2__);
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }





var AnswersPreview =
/*#__PURE__*/
function (_Component) {
  _inherits(AnswersPreview, _Component);

  function AnswersPreview() {
    _classCallCheck(this, AnswersPreview);

    return _possibleConstructorReturn(this, _getPrototypeOf(AnswersPreview).apply(this, arguments));
  }

  _createClass(AnswersPreview, [{
    key: "render",
    value: function render() {
      var _this = this;

      var _this$props = _objectSpread({}, this.props),
          questions = _this$props.questions;

      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "AnswersPreview"
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "questions"
      }, questions.map(function (question, index, all) {
        var renderedData = _this.renderData(question);

        return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
          className: "row",
          key: question.id
        }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
          className: "col"
        }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("b", null, index + 1, ". ", question.heading)), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
          className: "vertical-divider"
        }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
          className: "col"
        }, renderedData));
      })));
    }
  }, {
    key: "renderData",
    value: function renderData(question) {
      // Render data for non-applicable question
      if (!question.isApplicable) {
        var msg = "(Not applicable)";
        return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, msg);
      } // Render data for non-answered question


      if (!question.hasAnswer) {
        var _msg = "(Has no answer)";
        return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, _msg);
      } // Render data for input


      if (question.type === "input" && question.inputs && Array.isArray(question.inputs) && question.inputs.length > 0) {
        var renderInputData = function renderInputData(input) {
          var data = input.data || ""; // Format data

          if (input.type === "date") {
            data = moment__WEBPACK_IMPORTED_MODULE_2___default()(data).format("DD-MM-YYYY");
          } // Format textarea


          if (input.type === "textarea") {
            data = "\n" + data;
          }

          return data;
        }; // For multiple-inputs question, display their labels


        if (question.inputs.length > 1) {
          return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, question.inputs.map(function (input) {
            var data = renderInputData(input);
            return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
              key: input.id
            }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("b", null, input.label), "\xA0", react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("span", null, "-"), "\xA0", react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("span", null, data));
          }));
        } // For single-input question, display its answer directly


        return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, renderInputData(question.inputs[0]).trim());
      } // Render data for action


      if (question.type === "action" && question.actions && Array.isArray(question.actions)) {
        var action = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.head(question.actions.filter(function (action) {
          return action.isChose;
        }));

        return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, action && react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, action.label));
      }
    }
  }]);

  return AnswersPreview;
}(react__WEBPACK_IMPORTED_MODULE_0__["Component"]);

/* harmony default export */ __webpack_exports__["default"] = (AnswersPreview);

/***/ }),

/***/ "./src/js/components/Questionnaire/LeftBar.js":
/*!****************************************************!*\
  !*** ./src/js/components/Questionnaire/LeftBar.js ***!
  \****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _LeftBarItem__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./LeftBarItem */ "./src/js/components/Questionnaire/LeftBarItem.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }




var LeftBar =
/*#__PURE__*/
function (_Component) {
  _inherits(LeftBar, _Component);

  function LeftBar() {
    _classCallCheck(this, LeftBar);

    return _possibleConstructorReturn(this, _getPrototypeOf(LeftBar).apply(this, arguments));
  }

  _createClass(LeftBar, [{
    key: "render",
    value: function render() {
      var _this$props = _objectSpread({}, this.props),
          questions = _this$props.questions,
          onItemClick = _this$props.onItemClick;

      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "LeftBar"
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "title"
      }, "QUESTIONS:"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "items"
      }, questions.map(function (question) {
        return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_LeftBarItem__WEBPACK_IMPORTED_MODULE_1__["default"], {
          question: question,
          onItemClick: onItemClick,
          key: question.id
        });
      })));
    }
  }]);

  return LeftBar;
}(react__WEBPACK_IMPORTED_MODULE_0__["Component"]);

/* harmony default export */ __webpack_exports__["default"] = (LeftBar);

/***/ }),

/***/ "./src/js/components/Questionnaire/LeftBarItem.js":
/*!********************************************************!*\
  !*** ./src/js/components/Questionnaire/LeftBarItem.js ***!
  \********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return LeftBarItem; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _img_icons_question_editing_svg__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../img/icons/question-editing.svg */ "./src/img/icons/question-editing.svg");
/* harmony import */ var _img_icons_question_editing_svg__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_img_icons_question_editing_svg__WEBPACK_IMPORTED_MODULE_1__);
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }




var LeftBarItem =
/*#__PURE__*/
function (_Component) {
  _inherits(LeftBarItem, _Component);

  function LeftBarItem() {
    _classCallCheck(this, LeftBarItem);

    return _possibleConstructorReturn(this, _getPrototypeOf(LeftBarItem).apply(this, arguments));
  }

  _createClass(LeftBarItem, [{
    key: "render",
    value: function render() {
      var _this$props = _objectSpread({}, this.props),
          question = _this$props.question,
          onItemClick = _this$props.onItemClick;

      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "LeftBarItem"
      }, this.renderIcon(question), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("button", {
        className: "btn",
        disabled: !question.isApplicable,
        onClick: function onClick(event) {
          onItemClick(question);
        }
      }, question.title));
    }
  }, {
    key: "renderIcon",
    value: function renderIcon(question) {
      var _question = _objectSpread({}, question),
          isCurrent = _question.isCurrent,
          hasAnswer = _question.hasAnswer,
          isApplicable = _question.isApplicable;

      if (isCurrent) {
        return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("img", {
          src: _img_icons_question_editing_svg__WEBPACK_IMPORTED_MODULE_1___default.a
        });
      }

      if (!isApplicable) {
        return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("i", {
          className: "fas fa-question-circle not-applicable"
        });
      }

      if (hasAnswer && isApplicable) {
        return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("i", {
          className: "fas fa-check-circle success"
        });
      }

      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("i", {
        className: "fas fa-check-circle pending"
      });
    }
  }]);

  return LeftBarItem;
}(react__WEBPACK_IMPORTED_MODULE_0__["Component"]);



/***/ }),

/***/ "./src/js/components/Questionnaire/QuestionForm.js":
/*!*********************************************************!*\
  !*** ./src/js/components/Questionnaire/QuestionForm.js ***!
  \*********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var formik__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! formik */ "./node_modules/formik/dist/formik.esm.js");
/* harmony import */ var _Button_LightButton__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Button/LightButton */ "./src/js/components/Button/LightButton.js");
/* harmony import */ var _Button_DarkButton__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../Button/DarkButton */ "./src/js/components/Button/DarkButton.js");
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! moment */ "./node_modules/moment/moment.js");
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var react_datepicker__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react-datepicker */ "./node_modules/react-datepicker/es/index.js");
/* harmony import */ var react_datepicker_dist_react_datepicker_css__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react-datepicker/dist/react-datepicker.css */ "./node_modules/react-datepicker/dist/react-datepicker.css");
/* harmony import */ var react_datepicker_dist_react_datepicker_css__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(react_datepicker_dist_react_datepicker_css__WEBPACK_IMPORTED_MODULE_7__);
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }










var QuestionForm =
/*#__PURE__*/
function (_Component) {
  _inherits(QuestionForm, _Component);

  function QuestionForm() {
    _classCallCheck(this, QuestionForm);

    return _possibleConstructorReturn(this, _getPrototypeOf(QuestionForm).apply(this, arguments));
  }

  _createClass(QuestionForm, [{
    key: "render",
    value: function render() {
      var _this$props = _objectSpread({}, this.props),
          question = _this$props.question;

      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "QuestionForm"
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "heading"
      }, question.heading), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "description"
      }, question.description), this.renderActions(question), this.renderInputsForm(question));
    }
  }, {
    key: "renderActions",
    value: function renderActions(question) {
      var _this$props2 = _objectSpread({}, this.props),
          handleActionClick = _this$props2.handleActionClick;

      if (question.type !== "action") {
        return;
      }

      var actions = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(question, "actions", null);

      if (!actions) {
        return null;
      } // Render message of the chosen action


      var message = null;
      var chosenAction = actions.find(function (action) {
        return action.isChose;
      });

      if (chosenAction && chosenAction.message) {
        message = react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
          className: "message"
        }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("b", null, "Message:"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
          dangerouslySetInnerHTML: {
            __html: chosenAction.message
          }
        }));
      }

      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "actions"
      }, actions.map(function (action, index) {
        switch (index) {
          case 0:
            return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Button_DarkButton__WEBPACK_IMPORTED_MODULE_4__["default"], {
              title: action.label,
              key: action.id,
              classes: ["mr-3"],
              onClick: function onClick() {
                handleActionClick(action);
              }
            });

          default:
            return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Button_LightButton__WEBPACK_IMPORTED_MODULE_3__["default"], {
              title: action.label,
              key: action.id,
              classes: ["mr-3"],
              onClick: function onClick() {
                handleActionClick(action);
              }
            });
        }
      })), message);
    }
  }, {
    key: "renderInputsForm",
    value: function renderInputsForm(question) {
      var _this$props3 = _objectSpread({}, this.props),
          handleFormSubmit = _this$props3.handleFormSubmit;

      if (question.type !== "input") {
        return;
      }

      var inputs = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(question, "inputs", null);

      if (!inputs) {
        return null;
      }

      var initialValues = {};
      inputs.forEach(function (input) {
        initialValues[input.id] = input.data || "";
      });
      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(formik__WEBPACK_IMPORTED_MODULE_2__["Formik"], {
        initialValues: initialValues,
        validate: function validate(values) {
          var errors = {};
          inputs.forEach(function (input) {
            var _input = _objectSpread({}, input),
                id = _input.id,
                type = _input.type,
                required = _input.required,
                label = _input.label,
                minLength = _input.minLength;

            var value = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(values, id, null); // Required


            if (required && !value) {
              errors[id] = "- Please enter a value for ".concat(label);
              return;
            } // Min Length


            if (minLength > 0 && value && value.length < minLength) {
              errors[id] = "- Please enter a value with at least ".concat(minLength, " characters for ").concat(label);
              return;
            } // Email


            if (type === "email" && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
              errors[id] = "- Invalid email address";
              return;
            } // Date validation


            if (type === "date") {
              var date = moment__WEBPACK_IMPORTED_MODULE_5___default()(value, "YYYY-MM-DD");

              if (!date.isValid()) {
                errors[id] = "- Invalid date";
              }
            }
          });
          return errors;
        },
        onSubmit: function onSubmit(values, formik) {
          handleFormSubmit(formik, values);
        }
      }, function (_ref) {
        var isSubmitting = _ref.isSubmitting,
            errors = _ref.errors,
            touched = _ref.touched,
            setFieldValue = _ref.setFieldValue;
        var filteredErrors = [];

        lodash__WEBPACK_IMPORTED_MODULE_1___default.a.keys(errors).filter(function (key) {
          return Boolean(touched[key]);
        }).forEach(function (key) {
          filteredErrors[key] = errors[key];
        });

        return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(formik__WEBPACK_IMPORTED_MODULE_2__["Form"], null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("table", null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("tbody", null, inputs.map(function (input) {
          var _input2 = _objectSpread({}, input),
              id = _input2.id,
              type = _input2.type,
              label = _input2.label,
              placeholder = _input2.placeholder;

          var hasError = Boolean(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(filteredErrors, id, null));
          var classes = [];

          if (hasError) {
            classes.push("error");
          }

          if (["text", "email", "url"].includes(type)) {
            return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("tr", {
              key: id
            }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("td", {
              className: "label"
            }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("label", null, label)), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("td", null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(formik__WEBPACK_IMPORTED_MODULE_2__["Field"], {
              type: type,
              name: id,
              className: classes.join(" "),
              placeholder: placeholder
            }), hasError && react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("i", {
              className: "fas fa-exclamation-circle text-danger ml-1"
            })));
          }

          if (type === "date") {
            return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("tr", {
              key: id
            }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("td", {
              className: "label"
            }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("label", null, label)), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("td", null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(formik__WEBPACK_IMPORTED_MODULE_2__["Field"], {
              name: id,
              render: function render(_ref2) {
                var field = _ref2.field;
                var date = null;
                var dateValue = field.value || null;

                if (dateValue && dateValue.trim().length > 0) {
                  date = moment__WEBPACK_IMPORTED_MODULE_5___default()(dateValue).toDate();
                }

                return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_datepicker__WEBPACK_IMPORTED_MODULE_6__["default"], {
                  dateFormat: "dd-MM-yyyy",
                  className: classes.join(" "),
                  selected: date,
                  onChange: function onChange(value) {
                    if (!value) {
                      setFieldValue(id, null);
                      return;
                    }

                    var date = moment__WEBPACK_IMPORTED_MODULE_5___default()(value).format("YYYY-MM-DD");
                    setFieldValue(id, date);
                  },
                  placeholderText: placeholder,
                  dropdownMode: "scroll",
                  withPortal: true
                });
              }
            }), hasError && react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("i", {
              className: "fas fa-exclamation-circle text-danger ml-1"
            })));
          }

          if (type === "textarea") {
            return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("tr", {
              key: id
            }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("td", {
              className: "label"
            }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("label", null, label)), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("td", null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(formik__WEBPACK_IMPORTED_MODULE_2__["Field"], {
              name: id
            }, function (_ref3) {
              var field = _ref3.field;
              return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("textarea", _extends({}, field, {
                className: classes.join(" "),
                placeholder: placeholder
              }));
            }), hasError && react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("i", {
              className: "fas fa-exclamation-circle text-danger ml-1"
            })));
          }

          return null;
        }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("tr", null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("td", null), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("td", null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Button_DarkButton__WEBPACK_IMPORTED_MODULE_4__["default"], {
          title: "Continue"
        }))), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("tr", null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("td", null), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("td", {
          className: "text-danger"
        }, filteredErrors && lodash__WEBPACK_IMPORTED_MODULE_1___default.a.keys(filteredErrors).length > 0 && react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, "Whoops!", lodash__WEBPACK_IMPORTED_MODULE_1___default.a.keys(filteredErrors).map(function (key) {
          return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
            className: "text-error",
            key: key
          }, filteredErrors[key]);
        })))))));
      });
    }
  }]);

  return QuestionForm;
}(react__WEBPACK_IMPORTED_MODULE_0__["Component"]);

/* harmony default export */ __webpack_exports__["default"] = (QuestionForm);

/***/ }),

/***/ "./src/js/components/Questionnaire/Questionnaire.js":
/*!**********************************************************!*\
  !*** ./src/js/components/Questionnaire/Questionnaire.js ***!
  \**********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var formik__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! formik */ "./node_modules/formik/dist/formik.esm.js");
/* harmony import */ var _LeftBar__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./LeftBar */ "./src/js/components/Questionnaire/LeftBar.js");
/* harmony import */ var _QuestionForm__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./QuestionForm */ "./src/js/components/Questionnaire/QuestionForm.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_4__);
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }







var Questionnaire =
/*#__PURE__*/
function (_Component) {
  _inherits(Questionnaire, _Component);

  function Questionnaire() {
    _classCallCheck(this, Questionnaire);

    return _possibleConstructorReturn(this, _getPrototypeOf(Questionnaire).apply(this, arguments));
  }

  _createClass(Questionnaire, [{
    key: "handleFormSubmit",
    value: function handleFormSubmit(formik, values) {
      var _this$props = _objectSpread({}, this.props),
          questions = _this$props.questions,
          saveAnsweredQuestion = _this$props.saveAnsweredQuestion; // Generate new question with data


      var currentQuestion = questions.find(function (question) {
        return question.isCurrent === true;
      });

      if (!currentQuestion) {
        return;
      }

      var answeredQuestion = _objectSpread({}, currentQuestion);

      lodash__WEBPACK_IMPORTED_MODULE_4___default.a.forIn(values, function (value, key) {
        var index = answeredQuestion.inputs.findIndex(function (item) {
          return item.id === key;
        });

        if (index >= 0) {
          lodash__WEBPACK_IMPORTED_MODULE_4___default.a.set(answeredQuestion, "inputs.".concat(index, ".data"), value);
        }
      });

      answeredQuestion.hasAnswer = true;
      answeredQuestion.isApplicable = true;
      saveAnsweredQuestion(answeredQuestion);
    }
  }, {
    key: "handleActionClick",
    value: function handleActionClick(action) {
      var _this$props2 = _objectSpread({}, this.props),
          questions = _this$props2.questions,
          saveAnsweredQuestion = _this$props2.saveAnsweredQuestion; // Generate new question with data


      var currentQuestion = questions.find(function (question) {
        return question.isCurrent === true;
      });

      if (!currentQuestion) {
        return;
      }

      var answeredQuestion = _objectSpread({}, currentQuestion);

      answeredQuestion.actions = answeredQuestion.actions.map(function (item) {
        item.isChose = item.id === action.id;
        return item;
      });
      answeredQuestion.hasAnswer = true;
      answeredQuestion.isApplicable = true;
      saveAnsweredQuestion(answeredQuestion);
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props3 = _objectSpread({}, this.props),
          questions = _this$props3.questions,
          onLeftBarItemClick = _this$props3.onLeftBarItemClick;

      var currentQuestion = questions.find(function (question) {
        return question.isCurrent === true;
      });
      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "Questionnaire mx-1"
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "major"
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_LeftBar__WEBPACK_IMPORTED_MODULE_2__["default"], {
        questions: questions,
        onItemClick: onLeftBarItemClick
      }), currentQuestion && react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_QuestionForm__WEBPACK_IMPORTED_MODULE_3__["default"], {
        key: currentQuestion.id,
        question: currentQuestion,
        handleFormSubmit: this.handleFormSubmit.bind(this),
        handleActionClick: this.handleActionClick.bind(this)
      })));
    }
  }]);

  return Questionnaire;
}(react__WEBPACK_IMPORTED_MODULE_0__["Component"]);

/* harmony default export */ __webpack_exports__["default"] = (Questionnaire);

/***/ }),

/***/ "./src/js/components/Questionnaire/QuestionnaireContainer.js":
/*!*******************************************************************!*\
  !*** ./src/js/components/Questionnaire/QuestionnaireContainer.js ***!
  \*******************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_redux__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-redux */ "./node_modules/react-redux/es/index.js");
/* harmony import */ var redux__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! redux */ "./node_modules/redux/es/redux.js");
/* harmony import */ var _actions_questionnarie__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../actions/questionnarie */ "./src/js/actions/questionnarie.js");
/* harmony import */ var _Questionnaire__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Questionnaire */ "./src/js/components/Questionnaire/Questionnaire.js");
/* harmony import */ var _Header_Header__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../Header/Header */ "./src/js/components/Header/Header.js");
/* harmony import */ var _Footer_Footer__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../Footer/Footer */ "./src/js/components/Footer/Footer.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }









var mapStateToProps = function mapStateToProps(state) {
  return {
    submissionState: state.questionnaireState.submissionState
  };
};

var mapDispatchToProps = function mapDispatchToProps(dispatch, props) {
  return {
    dispatchLoadSubmissionAction: function dispatchLoadSubmissionAction(submissionHash) {
      dispatch(Object(_actions_questionnarie__WEBPACK_IMPORTED_MODULE_3__["loadQuestionnaireSubmissionState"])(submissionHash));
    },
    dispatchSaveAnsweredQuestionAction: function dispatchSaveAnsweredQuestionAction(answeredQuestion) {
      dispatch(Object(_actions_questionnarie__WEBPACK_IMPORTED_MODULE_3__["putDataInQuestionnaireAnswer"])(answeredQuestion));
    },
    dispatchMoveToPreviousQuestionAction: function dispatchMoveToPreviousQuestionAction(targetQuestion) {
      dispatch(Object(_actions_questionnarie__WEBPACK_IMPORTED_MODULE_3__["moveToPreviousQuestion"])(targetQuestion));
    }
  };
};

var QuestionnaireContainer =
/*#__PURE__*/
function (_Component) {
  _inherits(QuestionnaireContainer, _Component);

  function QuestionnaireContainer() {
    _classCallCheck(this, QuestionnaireContainer);

    return _possibleConstructorReturn(this, _getPrototypeOf(QuestionnaireContainer).apply(this, arguments));
  }

  _createClass(QuestionnaireContainer, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this$props = _objectSpread({}, this.props),
          submissionHash = _this$props.submissionHash,
          dispatchLoadSubmissionAction = _this$props.dispatchLoadSubmissionAction;

      dispatchLoadSubmissionAction(submissionHash);
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props2 = _objectSpread({}, this.props),
          dispatchSaveAnsweredQuestionAction = _this$props2.dispatchSaveAnsweredQuestionAction,
          dispatchMoveToPreviousQuestionAction = _this$props2.dispatchMoveToPreviousQuestionAction;

      var _this$props$submissio = _objectSpread({}, this.props.submissionState),
          title = _this$props$submissio.title,
          siteTitle = _this$props$submissio.siteTitle,
          user = _this$props$submissio.user,
          submission = _this$props$submissio.submission;

      if (!user || !submission) {
        return null;
      }

      if (submission.status !== "in_progress") {
        return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
          className: "QuestionnaireContainer"
        }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Header_Header__WEBPACK_IMPORTED_MODULE_5__["default"], {
          title: title,
          subtitle: siteTitle
        }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
          className: "Questionnaire"
        }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("h1", null, "The questionnaire is not in progress...")), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Footer_Footer__WEBPACK_IMPORTED_MODULE_6__["default"], null));
      }

      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "QuestionnaireContainer"
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Header_Header__WEBPACK_IMPORTED_MODULE_5__["default"], {
        title: title,
        subtitle: siteTitle
      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Questionnaire__WEBPACK_IMPORTED_MODULE_4__["default"], {
        questions: submission.questions,
        saveAnsweredQuestion: function saveAnsweredQuestion(answeredQuestion) {
          dispatchSaveAnsweredQuestionAction(answeredQuestion);
        },
        onLeftBarItemClick: function onLeftBarItemClick(targetQuestion) {
          dispatchMoveToPreviousQuestionAction(targetQuestion);
        }
      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Footer_Footer__WEBPACK_IMPORTED_MODULE_6__["default"], null));
    }
  }]);

  return QuestionnaireContainer;
}(react__WEBPACK_IMPORTED_MODULE_0__["Component"]);

/* harmony default export */ __webpack_exports__["default"] = (Object(react_redux__WEBPACK_IMPORTED_MODULE_1__["connect"])(mapStateToProps, mapDispatchToProps)(QuestionnaireContainer));

/***/ }),

/***/ "./src/js/components/Questionnaire/Review.js":
/*!***************************************************!*\
  !*** ./src/js/components/Questionnaire/Review.js ***!
  \***************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _Button_LightButton__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Button/LightButton */ "./src/js/components/Button/LightButton.js");
/* harmony import */ var _Button_DarkButton__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Button/DarkButton */ "./src/js/components/Button/DarkButton.js");
/* harmony import */ var _img_icons_edit_svg__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../img/icons/edit.svg */ "./src/img/icons/edit.svg");
/* harmony import */ var _img_icons_edit_svg__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_img_icons_edit_svg__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _img_icons_pdf_svg__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../img/icons/pdf.svg */ "./src/img/icons/pdf.svg");
/* harmony import */ var _img_icons_pdf_svg__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_img_icons_pdf_svg__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _AnswersPreview__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./AnswersPreview */ "./src/js/components/Questionnaire/AnswersPreview.js");
/* harmony import */ var _utils_SubmissionDataUtil__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../utils/SubmissionDataUtil */ "./src/js/utils/SubmissionDataUtil.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }









var Review =
/*#__PURE__*/
function (_Component) {
  _inherits(Review, _Component);

  function Review() {
    _classCallCheck(this, Review);

    return _possibleConstructorReturn(this, _getPrototypeOf(Review).apply(this, arguments));
  }

  _createClass(Review, [{
    key: "render",
    value: function render() {
      var _this$props = _objectSpread({}, this.props),
          submission = _this$props.submission,
          handleSubmitButtonClick = _this$props.handleSubmitButtonClick,
          handlePDFDownloadButtonClick = _this$props.handlePDFDownloadButtonClick,
          handleEditAnswerButtonClick = _this$props.handleEditAnswerButtonClick;

      if (!submission) {
        return null;
      }

      if (submission.status !== "in_progress") {
        return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
          className: "Review"
        }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("h3", null, "The questionnaire is not in progress..."));
      }

      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "Review"
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_AnswersPreview__WEBPACK_IMPORTED_MODULE_5__["default"], {
        questions: submission.questions
      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "buttons"
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Button_LightButton__WEBPACK_IMPORTED_MODULE_1__["default"], {
        title: "EDIT ANSWERS",
        iconImage: _img_icons_edit_svg__WEBPACK_IMPORTED_MODULE_3___default.a,
        classes: ["button"],
        onClick: handleEditAnswerButtonClick
      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Button_LightButton__WEBPACK_IMPORTED_MODULE_1__["default"], {
        title: "DOWNLOAD PDF",
        iconImage: _img_icons_pdf_svg__WEBPACK_IMPORTED_MODULE_4___default.a,
        classes: ["button"],
        onClick: handlePDFDownloadButtonClick
      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Button_DarkButton__WEBPACK_IMPORTED_MODULE_2__["default"], {
        title: "SUBMIT QUESTIONNAIRE",
        classes: ["button"],
        disabled: _utils_SubmissionDataUtil__WEBPACK_IMPORTED_MODULE_6__["default"].existsUnansweredQuestion(submission.questions),
        onClick: handleSubmitButtonClick
      })));
    }
  }]);

  return Review;
}(react__WEBPACK_IMPORTED_MODULE_0__["Component"]);

/* harmony default export */ __webpack_exports__["default"] = (Review);

/***/ }),

/***/ "./src/js/components/Questionnaire/ReviewContainer.js":
/*!************************************************************!*\
  !*** ./src/js/components/Questionnaire/ReviewContainer.js ***!
  \************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_redux__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-redux */ "./node_modules/react-redux/es/index.js");
/* harmony import */ var redux__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! redux */ "./node_modules/redux/es/redux.js");
/* harmony import */ var _Header_Header__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Header/Header */ "./src/js/components/Header/Header.js");
/* harmony import */ var _Footer_Footer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../Footer/Footer */ "./src/js/components/Footer/Footer.js");
/* harmony import */ var _actions_questionnarie__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../actions/questionnarie */ "./src/js/actions/questionnarie.js");
/* harmony import */ var _Review__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Review */ "./src/js/components/Questionnaire/Review.js");
/* harmony import */ var _utils_PDFUtil__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../utils/PDFUtil */ "./src/js/utils/PDFUtil.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var _utils_URLUtil__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../utils/URLUtil */ "./src/js/utils/URLUtil.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }












var mapStateToProps = function mapStateToProps(state) {
  return {
    submissionState: state.questionnaireState.submissionState
  };
};

var mapDispatchToProps = function mapDispatchToProps(dispatch, props) {
  return {
    dispatchLoadSubmissionAction: function dispatchLoadSubmissionAction(submissionHash) {
      dispatch(Object(_actions_questionnarie__WEBPACK_IMPORTED_MODULE_5__["loadQuestionnaireSubmissionState"])(submissionHash));
    },
    dispatchSubmitQuestionnaire: function dispatchSubmitQuestionnaire() {
      dispatch(Object(_actions_questionnarie__WEBPACK_IMPORTED_MODULE_5__["submitQuestionnaire"])());
    }
  };
};

var ReviewContainer =
/*#__PURE__*/
function (_Component) {
  _inherits(ReviewContainer, _Component);

  function ReviewContainer() {
    _classCallCheck(this, ReviewContainer);

    return _possibleConstructorReturn(this, _getPrototypeOf(ReviewContainer).apply(this, arguments));
  }

  _createClass(ReviewContainer, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this$props = _objectSpread({}, this.props),
          submissionHash = _this$props.submissionHash,
          dispatchLoadSubmissionAction = _this$props.dispatchLoadSubmissionAction;

      dispatchLoadSubmissionAction(submissionHash);
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props$submissio = _objectSpread({}, this.props.submissionState),
          title = _this$props$submissio.title,
          siteTitle = _this$props$submissio.siteTitle,
          user = _this$props$submissio.user,
          submission = _this$props$submissio.submission;

      if (!user) {
        return null;
      }

      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "ReviewContainer"
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Header_Header__WEBPACK_IMPORTED_MODULE_3__["default"], {
        title: title,
        subtitle: "Review Responses"
      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Review__WEBPACK_IMPORTED_MODULE_6__["default"], {
        siteTitle: siteTitle,
        submission: submission,
        handleSubmitButtonClick: this.handleSubmitButtonClick.bind(this),
        handlePDFDownloadButtonClick: this.handlePDFDownloadButtonClick.bind(this),
        handleEditAnswerButtonClick: this.handleEditAnswerButtonClick.bind(this)
      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Footer_Footer__WEBPACK_IMPORTED_MODULE_4__["default"], null), ";");
    }
  }, {
    key: "handleSubmitButtonClick",
    value: function handleSubmitButtonClick() {
      this.props.dispatchSubmitQuestionnaire();
    }
  }, {
    key: "handlePDFDownloadButtonClick",
    value: function handlePDFDownloadButtonClick() {
      var _this$props$submissio2 = _objectSpread({}, this.props.submissionState),
          submission = _this$props$submissio2.submission,
          siteTitle = _this$props$submissio2.siteTitle;

      if (!submission) {
        return;
      }

      _utils_PDFUtil__WEBPACK_IMPORTED_MODULE_7__["default"].generatePDF({
        questions: submission.questions,
        submitter: submission.submitter,
        questionnaireTitle: submission.questionnaireTitle,
        siteTitle: siteTitle
      });
    }
  }, {
    key: "handleEditAnswerButtonClick",
    value: function handleEditAnswerButtonClick() {
      var uuid = lodash__WEBPACK_IMPORTED_MODULE_8___default.a.get(this.props.submissionState, "submission.submissionUUID", "");

      if (!uuid) {
        return;
      }

      _utils_URLUtil__WEBPACK_IMPORTED_MODULE_9__["default"].redirectToQuestionnaireEditing(uuid);
    }
  }]);

  return ReviewContainer;
}(react__WEBPACK_IMPORTED_MODULE_0__["Component"]);

/* harmony default export */ __webpack_exports__["default"] = (Object(react_redux__WEBPACK_IMPORTED_MODULE_1__["connect"])(mapStateToProps, mapDispatchToProps)(ReviewContainer));

/***/ }),

/***/ "./src/js/components/Questionnaire/Start.js":
/*!**************************************************!*\
  !*** ./src/js/components/Questionnaire/Start.js ***!
  \**************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _Button_LightButton__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Button/LightButton */ "./src/js/components/Button/LightButton.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }




var Start =
/*#__PURE__*/
function (_Component) {
  _inherits(Start, _Component);

  function Start() {
    _classCallCheck(this, Start);

    return _possibleConstructorReturn(this, _getPrototypeOf(Start).apply(this, arguments));
  }

  _createClass(Start, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
          keyInformation = _this$props.keyInformation,
          user = _this$props.user,
          onStartButtonClick = _this$props.onStartButtonClick;
      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "Start"
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "start-form"
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "info-box"
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "key-info-title"
      }, "Key Information:"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "key-info",
        dangerouslySetInnerHTML: {
          __html: keyInformation
        }
      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "user-info"
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "info-line"
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("b", null, "Your Name: "), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("span", null, user.name)), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "info-line"
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("b", null, "Your Role: "), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("span", null, user.role)), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "info-line"
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("b", null, "Email Address: "), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("span", null, user.email))), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "actions"
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Button_LightButton__WEBPACK_IMPORTED_MODULE_1__["default"], {
        title: "START",
        onClick: onStartButtonClick
      })))));
    }
  }]);

  return Start;
}(react__WEBPACK_IMPORTED_MODULE_0__["Component"]);

/* harmony default export */ __webpack_exports__["default"] = (Start);

/***/ }),

/***/ "./src/js/components/Questionnaire/StartContainer.js":
/*!***********************************************************!*\
  !*** ./src/js/components/Questionnaire/StartContainer.js ***!
  \***********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_redux__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-redux */ "./node_modules/react-redux/es/index.js");
/* harmony import */ var redux__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! redux */ "./node_modules/redux/es/redux.js");
/* harmony import */ var _Start__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Start */ "./src/js/components/Questionnaire/Start.js");
/* harmony import */ var _actions_questionnarie__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../actions/questionnarie */ "./src/js/actions/questionnarie.js");
/* harmony import */ var _Header_Header__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../Header/Header */ "./src/js/components/Header/Header.js");
/* harmony import */ var _Footer_Footer__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../Footer/Footer */ "./src/js/components/Footer/Footer.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }









var mapStateToProps = function mapStateToProps(state) {
  return {
    startState: state.questionnaireState.startState
  };
};

var mapDispatchToProps = function mapDispatchToProps(dispatch, props) {
  return {
    dispatchLoadQuestionnaireAction: function dispatchLoadQuestionnaireAction(questionnaireID) {
      dispatch(Object(_actions_questionnarie__WEBPACK_IMPORTED_MODULE_4__["loadQuestionnaireStartState"])(questionnaireID));
    },
    dispatchCreateInProgressSubmissionAction: function dispatchCreateInProgressSubmissionAction(questionnaireID) {
      dispatch(Object(_actions_questionnarie__WEBPACK_IMPORTED_MODULE_4__["createInProgressSubmission"])(questionnaireID));
    }
  };
};

var StartContainer =
/*#__PURE__*/
function (_Component) {
  _inherits(StartContainer, _Component);

  function StartContainer() {
    _classCallCheck(this, StartContainer);

    return _possibleConstructorReturn(this, _getPrototypeOf(StartContainer).apply(this, arguments));
  }

  _createClass(StartContainer, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this$props = _objectSpread({}, this.props),
          questionnaireID = _this$props.questionnaireID,
          dispatchLoadQuestionnaireAction = _this$props.dispatchLoadQuestionnaireAction;

      dispatchLoadQuestionnaireAction(questionnaireID);
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props$startStat = _objectSpread({}, this.props.startState),
          title = _this$props$startStat.title,
          subtitle = _this$props$startStat.subtitle,
          keyInformation = _this$props$startStat.keyInformation,
          user = _this$props$startStat.user;

      var _this$props2 = _objectSpread({}, this.props),
          questionnaireID = _this$props2.questionnaireID,
          dispatchCreateInProgressSubmissionAction = _this$props2.dispatchCreateInProgressSubmissionAction;

      if (!user) {
        return null;
      }

      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "StartContainer"
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Header_Header__WEBPACK_IMPORTED_MODULE_5__["default"], {
        title: title,
        subtitle: subtitle
      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Start__WEBPACK_IMPORTED_MODULE_3__["default"], {
        keyInformation: keyInformation,
        user: user,
        onStartButtonClick: function onStartButtonClick() {
          dispatchCreateInProgressSubmissionAction(questionnaireID);
        }
      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Footer_Footer__WEBPACK_IMPORTED_MODULE_6__["default"], null));
    }
  }]);

  return StartContainer;
}(react__WEBPACK_IMPORTED_MODULE_0__["Component"]);

/* harmony default export */ __webpack_exports__["default"] = (Object(react_redux__WEBPACK_IMPORTED_MODULE_1__["connect"])(mapStateToProps, mapDispatchToProps)(StartContainer));

/***/ }),

/***/ "./src/js/components/Questionnaire/Summary.js":
/*!****************************************************!*\
  !*** ./src/js/components/Questionnaire/Summary.js ***!
  \****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _Button_LightButton__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Button/LightButton */ "./src/js/components/Button/LightButton.js");
/* harmony import */ var _Button_DarkButton__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Button/DarkButton */ "./src/js/components/Button/DarkButton.js");
/* harmony import */ var _img_icons_pdf_svg__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../img/icons/pdf.svg */ "./src/img/icons/pdf.svg");
/* harmony import */ var _img_icons_pdf_svg__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_img_icons_pdf_svg__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _img_icons_edit_svg__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../img/icons/edit.svg */ "./src/img/icons/edit.svg");
/* harmony import */ var _img_icons_edit_svg__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_img_icons_edit_svg__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _utils_URLUtil__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../utils/URLUtil */ "./src/js/utils/URLUtil.js");
/* harmony import */ var _utils_SubmissionDataUtil__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../utils/SubmissionDataUtil */ "./src/js/utils/SubmissionDataUtil.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }










var prettifyStatus = function prettifyStatus(status) {
  return status.split("_").map(function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }).join(" ");
};

var Summary =
/*#__PURE__*/
function (_Component) {
  _inherits(Summary, _Component);

  function Summary() {
    _classCallCheck(this, Summary);

    return _possibleConstructorReturn(this, _getPrototypeOf(Summary).apply(this, arguments));
  }

  _createClass(Summary, [{
    key: "render",
    value: function render() {
      var _this$props = _objectSpread({}, this.props),
          submission = _this$props.submission,
          viewAs = _this$props.viewAs;

      if (!submission) {
        return null;
      }

      if (submission.status === "in_progress" && viewAs === "submitter") {
        return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
          className: "Summary"
        }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("h3", null, "Submission has not been complete..."));
      }

      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "Summary"
      }, this.renderSubmitterInfo(submission), this.renderTasks(submission), this.renderApprovals(submission), this.renderButtons(submission));
    }
  }, {
    key: "renderSubmitterInfo",
    value: function renderSubmitterInfo(submission) {
      var submitter = submission.submitter;
      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "request-info"
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("h3", null, "Request Information"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("b", null, "Submitted by:"), " ", submitter.name), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("b", null, "Role:"), " ", submitter.role), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("b", null, "Email:"), " ", submitter.email), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("b", null, "Status:"), " ", prettifyStatus(submission.status)));
    }
  }, {
    key: "renderTasks",
    value: function renderTasks(submission) {
      var _this = this;

      var taskSubmissions = submission.taskSubmissions;

      if (taskSubmissions.length === 0) {
        return null;
      }

      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "tasks"
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("h3", null, "Tasks"), taskSubmissions.map(function (_ref) {
        var uuid = _ref.uuid,
            taskName = _ref.taskName,
            status = _ref.status;

        var _this$props2 = _objectSpread({}, _this.props),
            token = _this$props2.token;

        return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
          key: uuid
        }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("button", {
          className: "btn btn-link",
          onClick: function onClick(event) {
            _utils_URLUtil__WEBPACK_IMPORTED_MODULE_6__["default"].redirectToTaskSubmission(uuid, token);
          }
        }, taskName, " (", prettifyStatus(status), ")"));
      }));
    }
  }, {
    key: "renderButtons",
    value: function renderButtons(submission) {
      var _this$props3 = _objectSpread({}, this.props),
          viewAs = _this$props3.viewAs,
          handleSubmitButtonClick = _this$props3.handleSubmitButtonClick,
          handlePDFDownloadButtonClick = _this$props3.handlePDFDownloadButtonClick,
          handleApproveButtonClick = _this$props3.handleApproveButtonClick,
          handleDenyButtonClick = _this$props3.handleDenyButtonClick,
          handleEditButtonClick = _this$props3.handleEditButtonClick;

      var downloadPDFButton = react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Button_LightButton__WEBPACK_IMPORTED_MODULE_1__["default"], {
        title: "DOWNLOAD PDF OF ANSWERS",
        iconImage: _img_icons_pdf_svg__WEBPACK_IMPORTED_MODULE_3___default.a,
        classes: ["button"],
        onClick: handlePDFDownloadButtonClick
      }); // Display buttons for submitter

      if (viewAs === "submitter") {
        // Render edit answers button for submitter in all cases
        var editAnswersButton = react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Button_LightButton__WEBPACK_IMPORTED_MODULE_1__["default"], {
          title: "EDIT ANSWERS",
          iconImage: _img_icons_edit_svg__WEBPACK_IMPORTED_MODULE_4___default.a,
          classes: ["button"],
          onClick: handleEditButtonClick
        }); // Render send for approval button for submitter only in specific submission status

        var sendForApprovalButton = react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Button_DarkButton__WEBPACK_IMPORTED_MODULE_2__["default"], {
          title: "SEND FOR APPROVAL",
          classes: ["button"],
          disabled: _utils_SubmissionDataUtil__WEBPACK_IMPORTED_MODULE_7__["default"].existsIncompleteTaskSubmission(submission.taskSubmissions),
          onClick: handleSubmitButtonClick
        });

        if (submission.status === "submitted") {
          return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
            className: "buttons"
          }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, editAnswersButton, downloadPDFButton, sendForApprovalButton), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null));
        }

        if (submission.status === "waiting_for_security_architect_approval") {
          return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
            className: "buttons"
          }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, editAnswersButton, downloadPDFButton), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null));
        }

        return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
          className: "buttons"
        }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, downloadPDFButton), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null));
      } // Display buttons for approvers


      if (viewAs === "approver") {
        var approveButton = react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Button_DarkButton__WEBPACK_IMPORTED_MODULE_2__["default"], {
          title: "APPROVE",
          classes: ["button"],
          onClick: handleApproveButtonClick
        });
        var denyButton = react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Button_LightButton__WEBPACK_IMPORTED_MODULE_1__["default"], {
          title: "DENY",
          classes: ["button"],
          onClick: handleDenyButtonClick
        });

        if (submission.status === "submitted") {
          return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
            className: "buttons"
          }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, downloadPDFButton), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null));
        }

        return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
          className: "buttons"
        }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, downloadPDFButton), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, approveButton, denyButton));
      } // Display buttons for others (either a submitter not an approver)


      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "buttons"
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, downloadPDFButton), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null));
    }
  }, {
    key: "renderApprovals",
    value: function renderApprovals(submission) {
      // TODO: Refactor - consider using constants instead of string literal
      if (submission.status === "in_progress" || submission.status === "submitted") {
        return null;
      }

      var approvalStatus = submission.approvalStatus;
      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "approvals"
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("h3", null, "Approvals"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("b", null, "Security Architect"), "\xA0-\xA0", prettifyStatus(approvalStatus.securityArchitect)), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("b", null, "Chief Information Security Officer"), "\xA0-\xA0", prettifyStatus(approvalStatus.chiefInformationSecurityOfficer)), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("b", null, "Business Owner"), "\xA0-\xA0", prettifyStatus(approvalStatus.businessOwner)));
    }
  }]);

  return Summary;
}(react__WEBPACK_IMPORTED_MODULE_0__["Component"]);

Summary.defaultProps = {
  submission: null,
  handlePDFDownloadButtonClick: function handlePDFDownloadButtonClick() {},
  handleSubmitButtonClick: function handleSubmitButtonClick() {},
  handleApproveButtonClick: function handleApproveButtonClick() {},
  handleDenyButtonClick: function handleDenyButtonClick() {},
  handleEditButtonClick: function handleEditButtonClick() {},
  viewAs: "others",
  token: ""
};
/* harmony default export */ __webpack_exports__["default"] = (Summary);

/***/ }),

/***/ "./src/js/components/Questionnaire/SummaryContainer.js":
/*!*************************************************************!*\
  !*** ./src/js/components/Questionnaire/SummaryContainer.js ***!
  \*************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_redux__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-redux */ "./node_modules/react-redux/es/index.js");
/* harmony import */ var redux__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! redux */ "./node_modules/redux/es/redux.js");
/* harmony import */ var _Header_Header__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Header/Header */ "./src/js/components/Header/Header.js");
/* harmony import */ var _Footer_Footer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../Footer/Footer */ "./src/js/components/Footer/Footer.js");
/* harmony import */ var _actions_questionnarie__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../actions/questionnarie */ "./src/js/actions/questionnarie.js");
/* harmony import */ var _Summary__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Summary */ "./src/js/components/Questionnaire/Summary.js");
/* harmony import */ var _utils_PDFUtil__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../utils/PDFUtil */ "./src/js/utils/PDFUtil.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }










var mapStateToProps = function mapStateToProps(state) {
  return {
    submissionState: state.questionnaireState.submissionState
  };
};

var mapDispatchToProps = function mapDispatchToProps(dispatch, props) {
  return {
    dispatchLoadSubmissionAction: function dispatchLoadSubmissionAction(submissionHash) {
      dispatch(Object(_actions_questionnarie__WEBPACK_IMPORTED_MODULE_5__["loadQuestionnaireSubmissionState"])(submissionHash));
    },
    dispatchSubmitForApprovalAction: function dispatchSubmitForApprovalAction(submissionID) {
      dispatch(Object(_actions_questionnarie__WEBPACK_IMPORTED_MODULE_5__["submitQuestionnaireForApproval"])(submissionID));
    },
    dispatchApproveSubmissionAction: function dispatchApproveSubmissionAction(submissionID) {
      dispatch(Object(_actions_questionnarie__WEBPACK_IMPORTED_MODULE_5__["approveQuestionnaireSubmission"])(submissionID));
    },
    dispatchDenySubmissionAction: function dispatchDenySubmissionAction(submissionID) {
      dispatch(Object(_actions_questionnarie__WEBPACK_IMPORTED_MODULE_5__["denyQuestionnaireSubmission"])(submissionID));
    },
    dispatchEditSubmissionAction: function dispatchEditSubmissionAction(submissionID) {
      dispatch(Object(_actions_questionnarie__WEBPACK_IMPORTED_MODULE_5__["editQuestionnaireSubmission"])(submissionID));
    }
  };
};

var SummaryContainer =
/*#__PURE__*/
function (_Component) {
  _inherits(SummaryContainer, _Component);

  function SummaryContainer() {
    _classCallCheck(this, SummaryContainer);

    return _possibleConstructorReturn(this, _getPrototypeOf(SummaryContainer).apply(this, arguments));
  }

  _createClass(SummaryContainer, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this$props = _objectSpread({}, this.props),
          submissionHash = _this$props.submissionHash,
          dispatchLoadSubmissionAction = _this$props.dispatchLoadSubmissionAction;

      dispatchLoadSubmissionAction(submissionHash);
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props$submissio = _objectSpread({}, this.props.submissionState),
          title = _this$props$submissio.title,
          user = _this$props$submissio.user,
          submission = _this$props$submissio.submission,
          isCurrentUserApprover = _this$props$submissio.isCurrentUserApprover;

      if (!user || !submission) {
        return null;
      } // Decide what the permission of the current user


      var viewAs = "others";

      do {
        // Check if the current user is the submitter
        if (user.id === submission.submitter.id) {
          viewAs = "submitter";
          break;
        } // Check if the current user is an approver


        if (isCurrentUserApprover) {
          viewAs = "approver";
          break;
        }
      } while (false);

      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "SummaryContainer"
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Header_Header__WEBPACK_IMPORTED_MODULE_3__["default"], {
        title: title,
        subtitle: "Summary"
      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Summary__WEBPACK_IMPORTED_MODULE_6__["default"], {
        submission: submission,
        handlePDFDownloadButtonClick: this.handlePDFDownloadButtonClick.bind(this),
        handleSubmitButtonClick: this.handleSubmitButtonClick.bind(this),
        handleApproveButtonClick: this.handleApproveButtonClick.bind(this),
        handleDenyButtonClick: this.handleDenyButtonClick.bind(this),
        handleEditButtonClick: this.handleEditButtonClick.bind(this),
        viewAs: viewAs
      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Footer_Footer__WEBPACK_IMPORTED_MODULE_4__["default"], null));
    }
  }, {
    key: "handlePDFDownloadButtonClick",
    value: function handlePDFDownloadButtonClick() {
      var _this$props$submissio2 = _objectSpread({}, this.props.submissionState),
          submission = _this$props$submissio2.submission,
          siteTitle = _this$props$submissio2.siteTitle;

      if (!submission) {
        return;
      }

      _utils_PDFUtil__WEBPACK_IMPORTED_MODULE_7__["default"].generatePDF({
        questions: submission.questions,
        submitter: submission.submitter,
        questionnaireTitle: submission.questionnaireTitle,
        siteTitle: siteTitle
      });
    }
  }, {
    key: "handleSubmitButtonClick",
    value: function handleSubmitButtonClick() {
      var _this$props$submissio3 = _objectSpread({}, this.props.submissionState),
          user = _this$props$submissio3.user,
          submission = _this$props$submissio3.submission;

      if (!user || !submission) {
        return;
      }

      this.props.dispatchSubmitForApprovalAction(submission.submissionID);
    }
  }, {
    key: "handleApproveButtonClick",
    value: function handleApproveButtonClick() {
      var _this$props$submissio4 = _objectSpread({}, this.props.submissionState),
          user = _this$props$submissio4.user,
          submission = _this$props$submissio4.submission;

      if (!user || !submission) {
        return;
      }

      this.props.dispatchApproveSubmissionAction(submission.submissionID);
    }
  }, {
    key: "handleDenyButtonClick",
    value: function handleDenyButtonClick() {
      var _this$props$submissio5 = _objectSpread({}, this.props.submissionState),
          user = _this$props$submissio5.user,
          submission = _this$props$submissio5.submission;

      if (!user || !submission) {
        return;
      }

      this.props.dispatchDenySubmissionAction(submission.submissionID);
    }
  }, {
    key: "handleEditButtonClick",
    value: function handleEditButtonClick() {
      var _this$props$submissio6 = _objectSpread({}, this.props.submissionState),
          user = _this$props$submissio6.user,
          submission = _this$props$submissio6.submission;

      if (!user || !submission) {
        return;
      }

      this.props.dispatchEditSubmissionAction(submission.submissionID);
    }
  }]);

  return SummaryContainer;
}(react__WEBPACK_IMPORTED_MODULE_0__["Component"]);

/* harmony default export */ __webpack_exports__["default"] = (Object(react_redux__WEBPACK_IMPORTED_MODULE_1__["connect"])(mapStateToProps, mapDispatchToProps)(SummaryContainer));

/***/ }),

/***/ "./src/js/components/Questionnaire/SummaryForBusinessOwner.js":
/*!********************************************************************!*\
  !*** ./src/js/components/Questionnaire/SummaryForBusinessOwner.js ***!
  \********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _img_Logo_svg__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../img/Logo.svg */ "./src/img/Logo.svg");
/* harmony import */ var _img_Logo_svg__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_img_Logo_svg__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _Footer_Footer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Footer/Footer */ "./src/js/components/Footer/Footer.js");
/* harmony import */ var _services_QuestionnaireForBusinessOwnerDataService__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../services/QuestionnaireForBusinessOwnerDataService */ "./src/js/services/QuestionnaireForBusinessOwnerDataService.js");
/* harmony import */ var _Summary__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Summary */ "./src/js/components/Questionnaire/Summary.js");
/* harmony import */ var _utils_PDFUtil__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../utils/PDFUtil */ "./src/js/utils/PDFUtil.js");
/* harmony import */ var _services_CSRFTokenService__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../services/CSRFTokenService */ "./src/js/services/CSRFTokenService.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }









var SummaryForBusinessOwnerContainer =
/*#__PURE__*/
function (_Component) {
  _inherits(SummaryForBusinessOwnerContainer, _Component);

  function SummaryForBusinessOwnerContainer(props) {
    var _this;

    _classCallCheck(this, SummaryForBusinessOwnerContainer);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(SummaryForBusinessOwnerContainer).call(this, props));
    _this.state = {
      siteTitle: "",
      submission: null
    };
    return _this;
  }

  _createClass(SummaryForBusinessOwnerContainer, [{
    key: "componentDidMount",
    value: function () {
      var _componentDidMount = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.loadData();

              case 2:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function componentDidMount() {
        return _componentDidMount.apply(this, arguments);
      }

      return componentDidMount;
    }()
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var _this$state = _objectSpread({}, this.state),
          submission = _this$state.submission,
          siteTitle = _this$state.siteTitle;

      var _this$props = _objectSpread({}, this.props),
          token = _this$props.token;

      var summary = null;

      if (submission) {
        // Business owner can only approve/deny under specific status
        var viewAs = submission.approvalStatus.securityArchitect === "approved" && submission.approvalStatus.businessOwner === "pending" ? "approver" : "others";
        summary = react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Summary__WEBPACK_IMPORTED_MODULE_4__["default"], {
          submission: submission,
          handlePDFDownloadButtonClick: function handlePDFDownloadButtonClick() {
            _this2.downloadPDF(submission, siteTitle);
          },
          handleApproveButtonClick: function handleApproveButtonClick() {
            _this2.approve(submission);
          },
          handleDenyButtonClick: function handleDenyButtonClick() {
            _this2.deny(submission);
          },
          viewAs: viewAs,
          token: token
        });
      }

      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "SummaryContainer"
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("header", {
        className: "Header"
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "top-banner"
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("img", {
        src: _img_Logo_svg__WEBPACK_IMPORTED_MODULE_1___default.a,
        className: "logo"
      })), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("h1", null, "SDLT"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("h2", null, "Summary")), summary, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Footer_Footer__WEBPACK_IMPORTED_MODULE_2__["default"], null));
    }
  }, {
    key: "downloadPDF",
    value: function () {
      var _downloadPDF = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(submission, siteTitle) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return _utils_PDFUtil__WEBPACK_IMPORTED_MODULE_5__["default"].generatePDF({
                  questions: submission.questions,
                  submitter: submission.submitter,
                  questionnaireTitle: submission.questionnaireTitle,
                  siteTitle: siteTitle
                });

              case 2:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      function downloadPDF(_x, _x2) {
        return _downloadPDF.apply(this, arguments);
      }

      return downloadPDF;
    }()
  }, {
    key: "approve",
    value: function () {
      var _approve = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(submission) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.t0 = _services_QuestionnaireForBusinessOwnerDataService__WEBPACK_IMPORTED_MODULE_3__["default"];
                _context3.t1 = submission.submissionID;
                _context3.next = 4;
                return _services_CSRFTokenService__WEBPACK_IMPORTED_MODULE_6__["default"].getCSRFToken();

              case 4:
                _context3.t2 = _context3.sent;
                _context3.t3 = this.props.token;
                _context3.t4 = {
                  submissionID: _context3.t1,
                  csrfToken: _context3.t2,
                  secureToken: _context3.t3
                };
                _context3.next = 9;
                return _context3.t0.approveQuestionnaireSubmission.call(_context3.t0, _context3.t4);

              case 9:
                _context3.next = 11;
                return this.loadData();

              case 11:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function approve(_x3) {
        return _approve.apply(this, arguments);
      }

      return approve;
    }()
  }, {
    key: "deny",
    value: function () {
      var _deny = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(submission) {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.t0 = _services_QuestionnaireForBusinessOwnerDataService__WEBPACK_IMPORTED_MODULE_3__["default"];
                _context4.t1 = submission.submissionID;
                _context4.next = 4;
                return _services_CSRFTokenService__WEBPACK_IMPORTED_MODULE_6__["default"].getCSRFToken();

              case 4:
                _context4.t2 = _context4.sent;
                _context4.t3 = this.props.token;
                _context4.t4 = {
                  submissionID: _context4.t1,
                  csrfToken: _context4.t2,
                  secureToken: _context4.t3
                };
                _context4.next = 9;
                return _context4.t0.denyQuestionnaireSubmission.call(_context4.t0, _context4.t4);

              case 9:
                _context4.next = 11;
                return this.loadData();

              case 11:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function deny(_x4) {
        return _deny.apply(this, arguments);
      }

      return deny;
    }()
  }, {
    key: "loadData",
    value: function () {
      var _loadData = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee5() {
        var data;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return _services_QuestionnaireForBusinessOwnerDataService__WEBPACK_IMPORTED_MODULE_3__["default"].fetchSubmissionData({
                  uuid: this.props.uuid,
                  secureToken: this.props.token
                });

              case 2:
                data = _context5.sent;
                this.setState({
                  siteTitle: data.siteTitle,
                  submission: data.submission
                });

              case 4:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function loadData() {
        return _loadData.apply(this, arguments);
      }

      return loadData;
    }()
  }]);

  return SummaryForBusinessOwnerContainer;
}(react__WEBPACK_IMPORTED_MODULE_0__["Component"]);

/* harmony default export */ __webpack_exports__["default"] = (SummaryForBusinessOwnerContainer);

/***/ }),

/***/ "./src/js/components/Task/TaskSubmission.js":
/*!**************************************************!*\
  !*** ./src/js/components/Task/TaskSubmission.js ***!
  \**************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _Questionnaire_Questionnaire__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Questionnaire/Questionnaire */ "./src/js/components/Questionnaire/Questionnaire.js");
/* harmony import */ var _Questionnaire_AnswersPreview__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Questionnaire/AnswersPreview */ "./src/js/components/Questionnaire/AnswersPreview.js");
/* harmony import */ var _img_icons_edit_svg__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../img/icons/edit.svg */ "./src/img/icons/edit.svg");
/* harmony import */ var _img_icons_edit_svg__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_img_icons_edit_svg__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _Button_LightButton__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../Button/LightButton */ "./src/js/components/Button/LightButton.js");
/* harmony import */ var _utils_URLUtil__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../utils/URLUtil */ "./src/js/utils/URLUtil.js");
/* harmony import */ var _Button_DarkButton__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../Button/DarkButton */ "./src/js/components/Button/DarkButton.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }









var TaskSubmission =
/*#__PURE__*/
function (_Component) {
  _inherits(TaskSubmission, _Component);

  function TaskSubmission() {
    _classCallCheck(this, TaskSubmission);

    return _possibleConstructorReturn(this, _getPrototypeOf(TaskSubmission).apply(this, arguments));
  }

  _createClass(TaskSubmission, [{
    key: "render",
    value: function render() {
      var _this$props = _objectSpread({}, this.props),
          taskSubmission = _this$props.taskSubmission,
          saveAnsweredQuestion = _this$props.saveAnsweredQuestion,
          moveToPreviousQuestion = _this$props.moveToPreviousQuestion,
          editAnswers = _this$props.editAnswers;

      var body = null; // Display questionnaire form for in-progress task submission

      if (taskSubmission.status === "in_progress") {
        body = react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Questionnaire_Questionnaire__WEBPACK_IMPORTED_MODULE_1__["default"], {
          questions: taskSubmission.questions,
          saveAnsweredQuestion: saveAnsweredQuestion,
          onLeftBarItemClick: moveToPreviousQuestion
        });
      } // Display answers preview for completed task submission


      if (taskSubmission.status === "complete") {
        body = react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Questionnaire_AnswersPreview__WEBPACK_IMPORTED_MODULE_2__["default"], {
          questions: taskSubmission.questions
        });
      }

      var backButton = taskSubmission.questionnaireSubmissionUUID ? react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Button_DarkButton__WEBPACK_IMPORTED_MODULE_6__["default"], {
        title: "BACK TO QUESTIONNAIRE SUMMARY",
        onClick: function onClick() {
          _utils_URLUtil__WEBPACK_IMPORTED_MODULE_5__["default"].redirectToQuestionnaireSummary(taskSubmission.questionnaireSubmissionUUID);
        }
      }) : null;
      var editButton = taskSubmission.status === "complete" ? react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Button_LightButton__WEBPACK_IMPORTED_MODULE_4__["default"], {
        title: "EDIT ANSWERS",
        onClick: editAnswers,
        iconImage: _img_icons_edit_svg__WEBPACK_IMPORTED_MODULE_3___default.a
      }) : null;
      var result = taskSubmission.result && taskSubmission.status === "complete" ? react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "result"
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("h3", null, "Result:"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, taskSubmission.result)) : null;
      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "TaskSubmission"
      }, result, body, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "buttons"
      }, editButton, backButton));
    }
  }]);

  return TaskSubmission;
}(react__WEBPACK_IMPORTED_MODULE_0__["Component"]);

/* harmony default export */ __webpack_exports__["default"] = (TaskSubmission);

/***/ }),

/***/ "./src/js/components/Task/TaskSubmissionContainer.js":
/*!***********************************************************!*\
  !*** ./src/js/components/Task/TaskSubmissionContainer.js ***!
  \***********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_redux__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-redux */ "./node_modules/react-redux/es/index.js");
/* harmony import */ var redux__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! redux */ "./node_modules/redux/es/redux.js");
/* harmony import */ var _Header_Header__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Header/Header */ "./src/js/components/Header/Header.js");
/* harmony import */ var _Footer_Footer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../Footer/Footer */ "./src/js/components/Footer/Footer.js");
/* harmony import */ var _actions_task__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../actions/task */ "./src/js/actions/task.js");
/* harmony import */ var _TaskSubmission__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./TaskSubmission */ "./src/js/components/Task/TaskSubmission.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }









var mapStateToProps = function mapStateToProps(state) {
  return {
    state: state.taskSubmissionState
  };
};

var mapDispatchToProps = function mapDispatchToProps(dispatch, props) {
  return {
    dispatchLoadTaskSubmissionAction: function dispatchLoadTaskSubmissionAction(uuid) {
      dispatch(Object(_actions_task__WEBPACK_IMPORTED_MODULE_5__["loadTaskSubmissionState"])(uuid));
    },
    dispatchSaveAnsweredQuestionAction: function dispatchSaveAnsweredQuestionAction(answeredQuestion) {
      dispatch(Object(_actions_task__WEBPACK_IMPORTED_MODULE_5__["saveAnsweredQuestion"])(answeredQuestion));
    },
    dispatchMoveToPreviousQuestionAction: function dispatchMoveToPreviousQuestionAction(targetQuestion) {
      dispatch(Object(_actions_task__WEBPACK_IMPORTED_MODULE_5__["moveToPreviousQuestion"])(targetQuestion));
    },
    dispatchEditAnswersAction: function dispatchEditAnswersAction() {
      dispatch(Object(_actions_task__WEBPACK_IMPORTED_MODULE_5__["editCompletedTaskSubmission"])());
    }
  };
};

var TaskSubmissionContainer =
/*#__PURE__*/
function (_Component) {
  _inherits(TaskSubmissionContainer, _Component);

  function TaskSubmissionContainer() {
    _classCallCheck(this, TaskSubmissionContainer);

    return _possibleConstructorReturn(this, _getPrototypeOf(TaskSubmissionContainer).apply(this, arguments));
  }

  _createClass(TaskSubmissionContainer, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this$props = _objectSpread({}, this.props),
          uuid = _this$props.uuid,
          dispatchLoadTaskSubmissionAction = _this$props.dispatchLoadTaskSubmissionAction;

      dispatchLoadTaskSubmissionAction(uuid);
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props2 = _objectSpread({}, this.props),
          dispatchSaveAnsweredQuestionAction = _this$props2.dispatchSaveAnsweredQuestionAction,
          dispatchMoveToPreviousQuestionAction = _this$props2.dispatchMoveToPreviousQuestionAction,
          dispatchEditAnswersAction = _this$props2.dispatchEditAnswersAction;

      var _this$props$state = _objectSpread({}, this.props.state),
          siteTitle = _this$props$state.siteTitle,
          currentUser = _this$props$state.currentUser,
          taskSubmission = _this$props$state.taskSubmission;

      if (!currentUser || !taskSubmission) {
        return null;
      }

      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "TaskSubmissionContainer"
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Header_Header__WEBPACK_IMPORTED_MODULE_3__["default"], {
        title: taskSubmission.taskName,
        subtitle: siteTitle
      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_TaskSubmission__WEBPACK_IMPORTED_MODULE_6__["default"], {
        taskSubmission: taskSubmission,
        saveAnsweredQuestion: dispatchSaveAnsweredQuestionAction,
        moveToPreviousQuestion: dispatchMoveToPreviousQuestionAction,
        editAnswers: dispatchEditAnswersAction
      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Footer_Footer__WEBPACK_IMPORTED_MODULE_4__["default"], null));
    }
  }]);

  return TaskSubmissionContainer;
}(react__WEBPACK_IMPORTED_MODULE_0__["Component"]);

/* harmony default export */ __webpack_exports__["default"] = (Object(react_redux__WEBPACK_IMPORTED_MODULE_1__["connect"])(mapStateToProps, mapDispatchToProps)(TaskSubmissionContainer));

/***/ }),

/***/ "./src/js/components/Task/TaskSubmissionForBusinessOwner.js":
/*!******************************************************************!*\
  !*** ./src/js/components/Task/TaskSubmissionForBusinessOwner.js ***!
  \******************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return TaskSubmissionForBusinessOwner; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _services_TaskForBusinessOwnerDataService__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../services/TaskForBusinessOwnerDataService */ "./src/js/services/TaskForBusinessOwnerDataService.js");
/* harmony import */ var _Header_Header__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Header/Header */ "./src/js/components/Header/Header.js");
/* harmony import */ var _Footer_Footer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Footer/Footer */ "./src/js/components/Footer/Footer.js");
/* harmony import */ var _Questionnaire_AnswersPreview__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../Questionnaire/AnswersPreview */ "./src/js/components/Questionnaire/AnswersPreview.js");
/* harmony import */ var _Button_DarkButton__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../Button/DarkButton */ "./src/js/components/Button/DarkButton.js");
/* harmony import */ var _utils_URLUtil__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../utils/URLUtil */ "./src/js/utils/URLUtil.js");
function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }









var TaskSubmissionForBusinessOwner =
/*#__PURE__*/
function (_Component) {
  _inherits(TaskSubmissionForBusinessOwner, _Component);

  function TaskSubmissionForBusinessOwner(props) {
    var _this;

    _classCallCheck(this, TaskSubmissionForBusinessOwner);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(TaskSubmissionForBusinessOwner).call(this, props));
    _this.state = {
      siteTitle: "",
      taskSubmission: null
    };
    return _this;
  }

  _createClass(TaskSubmissionForBusinessOwner, [{
    key: "componentDidMount",
    value: function () {
      var _componentDidMount = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.loadData();

              case 2:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function componentDidMount() {
        return _componentDidMount.apply(this, arguments);
      }

      return componentDidMount;
    }()
  }, {
    key: "render",
    value: function render() {
      var _this$state = _objectSpread({}, this.state),
          siteTitle = _this$state.siteTitle,
          taskSubmission = _this$state.taskSubmission;

      var _this$props = _objectSpread({}, this.props),
          token = _this$props.token;

      if (!taskSubmission) {
        return null;
      }

      var result = taskSubmission.result && taskSubmission.status === "complete" ? react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "result"
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("h3", null, "Result:"), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, taskSubmission.result)) : null;
      var backButton = taskSubmission.questionnaireSubmissionUUID ? react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Button_DarkButton__WEBPACK_IMPORTED_MODULE_5__["default"], {
        title: "BACK TO QUESTIONNAIRE SUMMARY",
        onClick: function onClick() {
          _utils_URLUtil__WEBPACK_IMPORTED_MODULE_6__["default"].redirectToQuestionnaireSummary(taskSubmission.questionnaireSubmissionUUID, token);
        }
      }) : null;
      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "TaskSubmissionContainer"
      }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Header_Header__WEBPACK_IMPORTED_MODULE_2__["default"], {
        title: taskSubmission.taskName,
        subtitle: siteTitle
      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "TaskSubmission"
      }, result, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Questionnaire_AnswersPreview__WEBPACK_IMPORTED_MODULE_4__["default"], {
        questions: taskSubmission.questions
      }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "buttons"
      }, backButton)), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Footer_Footer__WEBPACK_IMPORTED_MODULE_3__["default"], null));
    }
  }, {
    key: "loadData",
    value: function () {
      var _loadData = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2() {
        var _this$props2, uuid, token, data;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _this$props2 = _objectSpread({}, this.props), uuid = _this$props2.uuid, token = _this$props2.token;
                _context2.next = 3;
                return _services_TaskForBusinessOwnerDataService__WEBPACK_IMPORTED_MODULE_1__["default"].fetchTaskSubmissionData({
                  uuid: uuid,
                  token: token
                });

              case 3:
                data = _context2.sent;
                this.setState(data);

              case 5:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function loadData() {
        return _loadData.apply(this, arguments);
      }

      return loadData;
    }()
  }]);

  return TaskSubmissionForBusinessOwner;
}(react__WEBPACK_IMPORTED_MODULE_0__["Component"]);



/***/ }),

/***/ "./src/js/constants/errors.js":
/*!************************************!*\
  !*** ./src/js/constants/errors.js ***!
  \************************************/
/*! exports provided: DEFAULT_NETWORK_ERROR, DEFAULT_PARSE_ERROR */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DEFAULT_NETWORK_ERROR", function() { return DEFAULT_NETWORK_ERROR; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DEFAULT_PARSE_ERROR", function() { return DEFAULT_PARSE_ERROR; });
var DEFAULT_NETWORK_ERROR = new Error("There is an error when fetching data...");
var DEFAULT_PARSE_ERROR = new Error("There is an error when parsing data...");

/***/ }),

/***/ "./src/js/main.js":
/*!************************!*\
  !*** ./src/js/main.js ***!
  \************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var core_js_modules_es6_array_copy_within__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es6.array.copy-within */ "./node_modules/core-js/modules/es6.array.copy-within.js");
/* harmony import */ var core_js_modules_es6_array_copy_within__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_array_copy_within__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_es6_array_fill__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! core-js/modules/es6.array.fill */ "./node_modules/core-js/modules/es6.array.fill.js");
/* harmony import */ var core_js_modules_es6_array_fill__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_array_fill__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var core_js_modules_es6_array_find__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! core-js/modules/es6.array.find */ "./node_modules/core-js/modules/es6.array.find.js");
/* harmony import */ var core_js_modules_es6_array_find__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_array_find__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var core_js_modules_es6_array_find_index__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! core-js/modules/es6.array.find-index */ "./node_modules/core-js/modules/es6.array.find-index.js");
/* harmony import */ var core_js_modules_es6_array_find_index__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_array_find_index__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var core_js_modules_es6_array_from__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! core-js/modules/es6.array.from */ "./node_modules/core-js/modules/es6.array.from.js");
/* harmony import */ var core_js_modules_es6_array_from__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_array_from__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var core_js_modules_es7_array_includes__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! core-js/modules/es7.array.includes */ "./node_modules/core-js/modules/es7.array.includes.js");
/* harmony import */ var core_js_modules_es7_array_includes__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es7_array_includes__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var core_js_modules_es6_array_iterator__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! core-js/modules/es6.array.iterator */ "./node_modules/core-js/modules/es6.array.iterator.js");
/* harmony import */ var core_js_modules_es6_array_iterator__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_array_iterator__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var core_js_modules_es6_array_of__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! core-js/modules/es6.array.of */ "./node_modules/core-js/modules/es6.array.of.js");
/* harmony import */ var core_js_modules_es6_array_of__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_array_of__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var core_js_modules_es6_array_sort__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! core-js/modules/es6.array.sort */ "./node_modules/core-js/modules/es6.array.sort.js");
/* harmony import */ var core_js_modules_es6_array_sort__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_array_sort__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var core_js_modules_es6_array_species__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! core-js/modules/es6.array.species */ "./node_modules/core-js/modules/es6.array.species.js");
/* harmony import */ var core_js_modules_es6_array_species__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_array_species__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var core_js_modules_es6_date_to_primitive__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! core-js/modules/es6.date.to-primitive */ "./node_modules/core-js/modules/es6.date.to-primitive.js");
/* harmony import */ var core_js_modules_es6_date_to_primitive__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_date_to_primitive__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var core_js_modules_es6_function_has_instance__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! core-js/modules/es6.function.has-instance */ "./node_modules/core-js/modules/es6.function.has-instance.js");
/* harmony import */ var core_js_modules_es6_function_has_instance__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_function_has_instance__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var core_js_modules_es6_function_name__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! core-js/modules/es6.function.name */ "./node_modules/core-js/modules/es6.function.name.js");
/* harmony import */ var core_js_modules_es6_function_name__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_function_name__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var core_js_modules_es6_map__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! core-js/modules/es6.map */ "./node_modules/core-js/modules/es6.map.js");
/* harmony import */ var core_js_modules_es6_map__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_map__WEBPACK_IMPORTED_MODULE_13__);
/* harmony import */ var core_js_modules_es6_math_acosh__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! core-js/modules/es6.math.acosh */ "./node_modules/core-js/modules/es6.math.acosh.js");
/* harmony import */ var core_js_modules_es6_math_acosh__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_math_acosh__WEBPACK_IMPORTED_MODULE_14__);
/* harmony import */ var core_js_modules_es6_math_asinh__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! core-js/modules/es6.math.asinh */ "./node_modules/core-js/modules/es6.math.asinh.js");
/* harmony import */ var core_js_modules_es6_math_asinh__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_math_asinh__WEBPACK_IMPORTED_MODULE_15__);
/* harmony import */ var core_js_modules_es6_math_atanh__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! core-js/modules/es6.math.atanh */ "./node_modules/core-js/modules/es6.math.atanh.js");
/* harmony import */ var core_js_modules_es6_math_atanh__WEBPACK_IMPORTED_MODULE_16___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_math_atanh__WEBPACK_IMPORTED_MODULE_16__);
/* harmony import */ var core_js_modules_es6_math_cbrt__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! core-js/modules/es6.math.cbrt */ "./node_modules/core-js/modules/es6.math.cbrt.js");
/* harmony import */ var core_js_modules_es6_math_cbrt__WEBPACK_IMPORTED_MODULE_17___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_math_cbrt__WEBPACK_IMPORTED_MODULE_17__);
/* harmony import */ var core_js_modules_es6_math_clz32__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! core-js/modules/es6.math.clz32 */ "./node_modules/core-js/modules/es6.math.clz32.js");
/* harmony import */ var core_js_modules_es6_math_clz32__WEBPACK_IMPORTED_MODULE_18___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_math_clz32__WEBPACK_IMPORTED_MODULE_18__);
/* harmony import */ var core_js_modules_es6_math_cosh__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! core-js/modules/es6.math.cosh */ "./node_modules/core-js/modules/es6.math.cosh.js");
/* harmony import */ var core_js_modules_es6_math_cosh__WEBPACK_IMPORTED_MODULE_19___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_math_cosh__WEBPACK_IMPORTED_MODULE_19__);
/* harmony import */ var core_js_modules_es6_math_expm1__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! core-js/modules/es6.math.expm1 */ "./node_modules/core-js/modules/es6.math.expm1.js");
/* harmony import */ var core_js_modules_es6_math_expm1__WEBPACK_IMPORTED_MODULE_20___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_math_expm1__WEBPACK_IMPORTED_MODULE_20__);
/* harmony import */ var core_js_modules_es6_math_fround__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! core-js/modules/es6.math.fround */ "./node_modules/core-js/modules/es6.math.fround.js");
/* harmony import */ var core_js_modules_es6_math_fround__WEBPACK_IMPORTED_MODULE_21___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_math_fround__WEBPACK_IMPORTED_MODULE_21__);
/* harmony import */ var core_js_modules_es6_math_hypot__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! core-js/modules/es6.math.hypot */ "./node_modules/core-js/modules/es6.math.hypot.js");
/* harmony import */ var core_js_modules_es6_math_hypot__WEBPACK_IMPORTED_MODULE_22___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_math_hypot__WEBPACK_IMPORTED_MODULE_22__);
/* harmony import */ var core_js_modules_es6_math_imul__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! core-js/modules/es6.math.imul */ "./node_modules/core-js/modules/es6.math.imul.js");
/* harmony import */ var core_js_modules_es6_math_imul__WEBPACK_IMPORTED_MODULE_23___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_math_imul__WEBPACK_IMPORTED_MODULE_23__);
/* harmony import */ var core_js_modules_es6_math_log1p__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! core-js/modules/es6.math.log1p */ "./node_modules/core-js/modules/es6.math.log1p.js");
/* harmony import */ var core_js_modules_es6_math_log1p__WEBPACK_IMPORTED_MODULE_24___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_math_log1p__WEBPACK_IMPORTED_MODULE_24__);
/* harmony import */ var core_js_modules_es6_math_log10__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! core-js/modules/es6.math.log10 */ "./node_modules/core-js/modules/es6.math.log10.js");
/* harmony import */ var core_js_modules_es6_math_log10__WEBPACK_IMPORTED_MODULE_25___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_math_log10__WEBPACK_IMPORTED_MODULE_25__);
/* harmony import */ var core_js_modules_es6_math_log2__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! core-js/modules/es6.math.log2 */ "./node_modules/core-js/modules/es6.math.log2.js");
/* harmony import */ var core_js_modules_es6_math_log2__WEBPACK_IMPORTED_MODULE_26___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_math_log2__WEBPACK_IMPORTED_MODULE_26__);
/* harmony import */ var core_js_modules_es6_math_sign__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! core-js/modules/es6.math.sign */ "./node_modules/core-js/modules/es6.math.sign.js");
/* harmony import */ var core_js_modules_es6_math_sign__WEBPACK_IMPORTED_MODULE_27___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_math_sign__WEBPACK_IMPORTED_MODULE_27__);
/* harmony import */ var core_js_modules_es6_math_sinh__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! core-js/modules/es6.math.sinh */ "./node_modules/core-js/modules/es6.math.sinh.js");
/* harmony import */ var core_js_modules_es6_math_sinh__WEBPACK_IMPORTED_MODULE_28___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_math_sinh__WEBPACK_IMPORTED_MODULE_28__);
/* harmony import */ var core_js_modules_es6_math_tanh__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! core-js/modules/es6.math.tanh */ "./node_modules/core-js/modules/es6.math.tanh.js");
/* harmony import */ var core_js_modules_es6_math_tanh__WEBPACK_IMPORTED_MODULE_29___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_math_tanh__WEBPACK_IMPORTED_MODULE_29__);
/* harmony import */ var core_js_modules_es6_math_trunc__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! core-js/modules/es6.math.trunc */ "./node_modules/core-js/modules/es6.math.trunc.js");
/* harmony import */ var core_js_modules_es6_math_trunc__WEBPACK_IMPORTED_MODULE_30___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_math_trunc__WEBPACK_IMPORTED_MODULE_30__);
/* harmony import */ var core_js_modules_es6_number_constructor__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! core-js/modules/es6.number.constructor */ "./node_modules/core-js/modules/es6.number.constructor.js");
/* harmony import */ var core_js_modules_es6_number_constructor__WEBPACK_IMPORTED_MODULE_31___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_number_constructor__WEBPACK_IMPORTED_MODULE_31__);
/* harmony import */ var core_js_modules_es6_number_epsilon__WEBPACK_IMPORTED_MODULE_32__ = __webpack_require__(/*! core-js/modules/es6.number.epsilon */ "./node_modules/core-js/modules/es6.number.epsilon.js");
/* harmony import */ var core_js_modules_es6_number_epsilon__WEBPACK_IMPORTED_MODULE_32___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_number_epsilon__WEBPACK_IMPORTED_MODULE_32__);
/* harmony import */ var core_js_modules_es6_number_is_finite__WEBPACK_IMPORTED_MODULE_33__ = __webpack_require__(/*! core-js/modules/es6.number.is-finite */ "./node_modules/core-js/modules/es6.number.is-finite.js");
/* harmony import */ var core_js_modules_es6_number_is_finite__WEBPACK_IMPORTED_MODULE_33___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_number_is_finite__WEBPACK_IMPORTED_MODULE_33__);
/* harmony import */ var core_js_modules_es6_number_is_integer__WEBPACK_IMPORTED_MODULE_34__ = __webpack_require__(/*! core-js/modules/es6.number.is-integer */ "./node_modules/core-js/modules/es6.number.is-integer.js");
/* harmony import */ var core_js_modules_es6_number_is_integer__WEBPACK_IMPORTED_MODULE_34___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_number_is_integer__WEBPACK_IMPORTED_MODULE_34__);
/* harmony import */ var core_js_modules_es6_number_is_nan__WEBPACK_IMPORTED_MODULE_35__ = __webpack_require__(/*! core-js/modules/es6.number.is-nan */ "./node_modules/core-js/modules/es6.number.is-nan.js");
/* harmony import */ var core_js_modules_es6_number_is_nan__WEBPACK_IMPORTED_MODULE_35___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_number_is_nan__WEBPACK_IMPORTED_MODULE_35__);
/* harmony import */ var core_js_modules_es6_number_is_safe_integer__WEBPACK_IMPORTED_MODULE_36__ = __webpack_require__(/*! core-js/modules/es6.number.is-safe-integer */ "./node_modules/core-js/modules/es6.number.is-safe-integer.js");
/* harmony import */ var core_js_modules_es6_number_is_safe_integer__WEBPACK_IMPORTED_MODULE_36___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_number_is_safe_integer__WEBPACK_IMPORTED_MODULE_36__);
/* harmony import */ var core_js_modules_es6_number_max_safe_integer__WEBPACK_IMPORTED_MODULE_37__ = __webpack_require__(/*! core-js/modules/es6.number.max-safe-integer */ "./node_modules/core-js/modules/es6.number.max-safe-integer.js");
/* harmony import */ var core_js_modules_es6_number_max_safe_integer__WEBPACK_IMPORTED_MODULE_37___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_number_max_safe_integer__WEBPACK_IMPORTED_MODULE_37__);
/* harmony import */ var core_js_modules_es6_number_min_safe_integer__WEBPACK_IMPORTED_MODULE_38__ = __webpack_require__(/*! core-js/modules/es6.number.min-safe-integer */ "./node_modules/core-js/modules/es6.number.min-safe-integer.js");
/* harmony import */ var core_js_modules_es6_number_min_safe_integer__WEBPACK_IMPORTED_MODULE_38___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_number_min_safe_integer__WEBPACK_IMPORTED_MODULE_38__);
/* harmony import */ var core_js_modules_es6_number_parse_float__WEBPACK_IMPORTED_MODULE_39__ = __webpack_require__(/*! core-js/modules/es6.number.parse-float */ "./node_modules/core-js/modules/es6.number.parse-float.js");
/* harmony import */ var core_js_modules_es6_number_parse_float__WEBPACK_IMPORTED_MODULE_39___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_number_parse_float__WEBPACK_IMPORTED_MODULE_39__);
/* harmony import */ var core_js_modules_es6_number_parse_int__WEBPACK_IMPORTED_MODULE_40__ = __webpack_require__(/*! core-js/modules/es6.number.parse-int */ "./node_modules/core-js/modules/es6.number.parse-int.js");
/* harmony import */ var core_js_modules_es6_number_parse_int__WEBPACK_IMPORTED_MODULE_40___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_number_parse_int__WEBPACK_IMPORTED_MODULE_40__);
/* harmony import */ var core_js_modules_es6_object_assign__WEBPACK_IMPORTED_MODULE_41__ = __webpack_require__(/*! core-js/modules/es6.object.assign */ "./node_modules/core-js/modules/es6.object.assign.js");
/* harmony import */ var core_js_modules_es6_object_assign__WEBPACK_IMPORTED_MODULE_41___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_object_assign__WEBPACK_IMPORTED_MODULE_41__);
/* harmony import */ var core_js_modules_es7_object_define_getter__WEBPACK_IMPORTED_MODULE_42__ = __webpack_require__(/*! core-js/modules/es7.object.define-getter */ "./node_modules/core-js/modules/es7.object.define-getter.js");
/* harmony import */ var core_js_modules_es7_object_define_getter__WEBPACK_IMPORTED_MODULE_42___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es7_object_define_getter__WEBPACK_IMPORTED_MODULE_42__);
/* harmony import */ var core_js_modules_es7_object_define_setter__WEBPACK_IMPORTED_MODULE_43__ = __webpack_require__(/*! core-js/modules/es7.object.define-setter */ "./node_modules/core-js/modules/es7.object.define-setter.js");
/* harmony import */ var core_js_modules_es7_object_define_setter__WEBPACK_IMPORTED_MODULE_43___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es7_object_define_setter__WEBPACK_IMPORTED_MODULE_43__);
/* harmony import */ var core_js_modules_es7_object_entries__WEBPACK_IMPORTED_MODULE_44__ = __webpack_require__(/*! core-js/modules/es7.object.entries */ "./node_modules/core-js/modules/es7.object.entries.js");
/* harmony import */ var core_js_modules_es7_object_entries__WEBPACK_IMPORTED_MODULE_44___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es7_object_entries__WEBPACK_IMPORTED_MODULE_44__);
/* harmony import */ var core_js_modules_es6_object_freeze__WEBPACK_IMPORTED_MODULE_45__ = __webpack_require__(/*! core-js/modules/es6.object.freeze */ "./node_modules/core-js/modules/es6.object.freeze.js");
/* harmony import */ var core_js_modules_es6_object_freeze__WEBPACK_IMPORTED_MODULE_45___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_object_freeze__WEBPACK_IMPORTED_MODULE_45__);
/* harmony import */ var core_js_modules_es6_object_get_own_property_descriptor__WEBPACK_IMPORTED_MODULE_46__ = __webpack_require__(/*! core-js/modules/es6.object.get-own-property-descriptor */ "./node_modules/core-js/modules/es6.object.get-own-property-descriptor.js");
/* harmony import */ var core_js_modules_es6_object_get_own_property_descriptor__WEBPACK_IMPORTED_MODULE_46___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_object_get_own_property_descriptor__WEBPACK_IMPORTED_MODULE_46__);
/* harmony import */ var core_js_modules_es7_object_get_own_property_descriptors__WEBPACK_IMPORTED_MODULE_47__ = __webpack_require__(/*! core-js/modules/es7.object.get-own-property-descriptors */ "./node_modules/core-js/modules/es7.object.get-own-property-descriptors.js");
/* harmony import */ var core_js_modules_es7_object_get_own_property_descriptors__WEBPACK_IMPORTED_MODULE_47___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es7_object_get_own_property_descriptors__WEBPACK_IMPORTED_MODULE_47__);
/* harmony import */ var core_js_modules_es6_object_get_own_property_names__WEBPACK_IMPORTED_MODULE_48__ = __webpack_require__(/*! core-js/modules/es6.object.get-own-property-names */ "./node_modules/core-js/modules/es6.object.get-own-property-names.js");
/* harmony import */ var core_js_modules_es6_object_get_own_property_names__WEBPACK_IMPORTED_MODULE_48___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_object_get_own_property_names__WEBPACK_IMPORTED_MODULE_48__);
/* harmony import */ var core_js_modules_es6_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_49__ = __webpack_require__(/*! core-js/modules/es6.object.get-prototype-of */ "./node_modules/core-js/modules/es6.object.get-prototype-of.js");
/* harmony import */ var core_js_modules_es6_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_49___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_object_get_prototype_of__WEBPACK_IMPORTED_MODULE_49__);
/* harmony import */ var core_js_modules_es7_object_lookup_getter__WEBPACK_IMPORTED_MODULE_50__ = __webpack_require__(/*! core-js/modules/es7.object.lookup-getter */ "./node_modules/core-js/modules/es7.object.lookup-getter.js");
/* harmony import */ var core_js_modules_es7_object_lookup_getter__WEBPACK_IMPORTED_MODULE_50___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es7_object_lookup_getter__WEBPACK_IMPORTED_MODULE_50__);
/* harmony import */ var core_js_modules_es7_object_lookup_setter__WEBPACK_IMPORTED_MODULE_51__ = __webpack_require__(/*! core-js/modules/es7.object.lookup-setter */ "./node_modules/core-js/modules/es7.object.lookup-setter.js");
/* harmony import */ var core_js_modules_es7_object_lookup_setter__WEBPACK_IMPORTED_MODULE_51___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es7_object_lookup_setter__WEBPACK_IMPORTED_MODULE_51__);
/* harmony import */ var core_js_modules_es6_object_prevent_extensions__WEBPACK_IMPORTED_MODULE_52__ = __webpack_require__(/*! core-js/modules/es6.object.prevent-extensions */ "./node_modules/core-js/modules/es6.object.prevent-extensions.js");
/* harmony import */ var core_js_modules_es6_object_prevent_extensions__WEBPACK_IMPORTED_MODULE_52___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_object_prevent_extensions__WEBPACK_IMPORTED_MODULE_52__);
/* harmony import */ var core_js_modules_es6_object_is__WEBPACK_IMPORTED_MODULE_53__ = __webpack_require__(/*! core-js/modules/es6.object.is */ "./node_modules/core-js/modules/es6.object.is.js");
/* harmony import */ var core_js_modules_es6_object_is__WEBPACK_IMPORTED_MODULE_53___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_object_is__WEBPACK_IMPORTED_MODULE_53__);
/* harmony import */ var core_js_modules_es6_object_is_frozen__WEBPACK_IMPORTED_MODULE_54__ = __webpack_require__(/*! core-js/modules/es6.object.is-frozen */ "./node_modules/core-js/modules/es6.object.is-frozen.js");
/* harmony import */ var core_js_modules_es6_object_is_frozen__WEBPACK_IMPORTED_MODULE_54___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_object_is_frozen__WEBPACK_IMPORTED_MODULE_54__);
/* harmony import */ var core_js_modules_es6_object_is_sealed__WEBPACK_IMPORTED_MODULE_55__ = __webpack_require__(/*! core-js/modules/es6.object.is-sealed */ "./node_modules/core-js/modules/es6.object.is-sealed.js");
/* harmony import */ var core_js_modules_es6_object_is_sealed__WEBPACK_IMPORTED_MODULE_55___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_object_is_sealed__WEBPACK_IMPORTED_MODULE_55__);
/* harmony import */ var core_js_modules_es6_object_is_extensible__WEBPACK_IMPORTED_MODULE_56__ = __webpack_require__(/*! core-js/modules/es6.object.is-extensible */ "./node_modules/core-js/modules/es6.object.is-extensible.js");
/* harmony import */ var core_js_modules_es6_object_is_extensible__WEBPACK_IMPORTED_MODULE_56___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_object_is_extensible__WEBPACK_IMPORTED_MODULE_56__);
/* harmony import */ var core_js_modules_es6_object_keys__WEBPACK_IMPORTED_MODULE_57__ = __webpack_require__(/*! core-js/modules/es6.object.keys */ "./node_modules/core-js/modules/es6.object.keys.js");
/* harmony import */ var core_js_modules_es6_object_keys__WEBPACK_IMPORTED_MODULE_57___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_object_keys__WEBPACK_IMPORTED_MODULE_57__);
/* harmony import */ var core_js_modules_es6_object_seal__WEBPACK_IMPORTED_MODULE_58__ = __webpack_require__(/*! core-js/modules/es6.object.seal */ "./node_modules/core-js/modules/es6.object.seal.js");
/* harmony import */ var core_js_modules_es6_object_seal__WEBPACK_IMPORTED_MODULE_58___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_object_seal__WEBPACK_IMPORTED_MODULE_58__);
/* harmony import */ var core_js_modules_es6_object_set_prototype_of__WEBPACK_IMPORTED_MODULE_59__ = __webpack_require__(/*! core-js/modules/es6.object.set-prototype-of */ "./node_modules/core-js/modules/es6.object.set-prototype-of.js");
/* harmony import */ var core_js_modules_es6_object_set_prototype_of__WEBPACK_IMPORTED_MODULE_59___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_object_set_prototype_of__WEBPACK_IMPORTED_MODULE_59__);
/* harmony import */ var core_js_modules_es7_object_values__WEBPACK_IMPORTED_MODULE_60__ = __webpack_require__(/*! core-js/modules/es7.object.values */ "./node_modules/core-js/modules/es7.object.values.js");
/* harmony import */ var core_js_modules_es7_object_values__WEBPACK_IMPORTED_MODULE_60___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es7_object_values__WEBPACK_IMPORTED_MODULE_60__);
/* harmony import */ var core_js_modules_es6_promise__WEBPACK_IMPORTED_MODULE_61__ = __webpack_require__(/*! core-js/modules/es6.promise */ "./node_modules/core-js/modules/es6.promise.js");
/* harmony import */ var core_js_modules_es6_promise__WEBPACK_IMPORTED_MODULE_61___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_promise__WEBPACK_IMPORTED_MODULE_61__);
/* harmony import */ var core_js_modules_es7_promise_finally__WEBPACK_IMPORTED_MODULE_62__ = __webpack_require__(/*! core-js/modules/es7.promise.finally */ "./node_modules/core-js/modules/es7.promise.finally.js");
/* harmony import */ var core_js_modules_es7_promise_finally__WEBPACK_IMPORTED_MODULE_62___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es7_promise_finally__WEBPACK_IMPORTED_MODULE_62__);
/* harmony import */ var core_js_modules_es6_reflect_apply__WEBPACK_IMPORTED_MODULE_63__ = __webpack_require__(/*! core-js/modules/es6.reflect.apply */ "./node_modules/core-js/modules/es6.reflect.apply.js");
/* harmony import */ var core_js_modules_es6_reflect_apply__WEBPACK_IMPORTED_MODULE_63___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_reflect_apply__WEBPACK_IMPORTED_MODULE_63__);
/* harmony import */ var core_js_modules_es6_reflect_construct__WEBPACK_IMPORTED_MODULE_64__ = __webpack_require__(/*! core-js/modules/es6.reflect.construct */ "./node_modules/core-js/modules/es6.reflect.construct.js");
/* harmony import */ var core_js_modules_es6_reflect_construct__WEBPACK_IMPORTED_MODULE_64___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_reflect_construct__WEBPACK_IMPORTED_MODULE_64__);
/* harmony import */ var core_js_modules_es6_reflect_define_property__WEBPACK_IMPORTED_MODULE_65__ = __webpack_require__(/*! core-js/modules/es6.reflect.define-property */ "./node_modules/core-js/modules/es6.reflect.define-property.js");
/* harmony import */ var core_js_modules_es6_reflect_define_property__WEBPACK_IMPORTED_MODULE_65___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_reflect_define_property__WEBPACK_IMPORTED_MODULE_65__);
/* harmony import */ var core_js_modules_es6_reflect_delete_property__WEBPACK_IMPORTED_MODULE_66__ = __webpack_require__(/*! core-js/modules/es6.reflect.delete-property */ "./node_modules/core-js/modules/es6.reflect.delete-property.js");
/* harmony import */ var core_js_modules_es6_reflect_delete_property__WEBPACK_IMPORTED_MODULE_66___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_reflect_delete_property__WEBPACK_IMPORTED_MODULE_66__);
/* harmony import */ var core_js_modules_es6_reflect_get__WEBPACK_IMPORTED_MODULE_67__ = __webpack_require__(/*! core-js/modules/es6.reflect.get */ "./node_modules/core-js/modules/es6.reflect.get.js");
/* harmony import */ var core_js_modules_es6_reflect_get__WEBPACK_IMPORTED_MODULE_67___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_reflect_get__WEBPACK_IMPORTED_MODULE_67__);
/* harmony import */ var core_js_modules_es6_reflect_get_own_property_descriptor__WEBPACK_IMPORTED_MODULE_68__ = __webpack_require__(/*! core-js/modules/es6.reflect.get-own-property-descriptor */ "./node_modules/core-js/modules/es6.reflect.get-own-property-descriptor.js");
/* harmony import */ var core_js_modules_es6_reflect_get_own_property_descriptor__WEBPACK_IMPORTED_MODULE_68___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_reflect_get_own_property_descriptor__WEBPACK_IMPORTED_MODULE_68__);
/* harmony import */ var core_js_modules_es6_reflect_get_prototype_of__WEBPACK_IMPORTED_MODULE_69__ = __webpack_require__(/*! core-js/modules/es6.reflect.get-prototype-of */ "./node_modules/core-js/modules/es6.reflect.get-prototype-of.js");
/* harmony import */ var core_js_modules_es6_reflect_get_prototype_of__WEBPACK_IMPORTED_MODULE_69___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_reflect_get_prototype_of__WEBPACK_IMPORTED_MODULE_69__);
/* harmony import */ var core_js_modules_es6_reflect_has__WEBPACK_IMPORTED_MODULE_70__ = __webpack_require__(/*! core-js/modules/es6.reflect.has */ "./node_modules/core-js/modules/es6.reflect.has.js");
/* harmony import */ var core_js_modules_es6_reflect_has__WEBPACK_IMPORTED_MODULE_70___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_reflect_has__WEBPACK_IMPORTED_MODULE_70__);
/* harmony import */ var core_js_modules_es6_reflect_is_extensible__WEBPACK_IMPORTED_MODULE_71__ = __webpack_require__(/*! core-js/modules/es6.reflect.is-extensible */ "./node_modules/core-js/modules/es6.reflect.is-extensible.js");
/* harmony import */ var core_js_modules_es6_reflect_is_extensible__WEBPACK_IMPORTED_MODULE_71___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_reflect_is_extensible__WEBPACK_IMPORTED_MODULE_71__);
/* harmony import */ var core_js_modules_es6_reflect_own_keys__WEBPACK_IMPORTED_MODULE_72__ = __webpack_require__(/*! core-js/modules/es6.reflect.own-keys */ "./node_modules/core-js/modules/es6.reflect.own-keys.js");
/* harmony import */ var core_js_modules_es6_reflect_own_keys__WEBPACK_IMPORTED_MODULE_72___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_reflect_own_keys__WEBPACK_IMPORTED_MODULE_72__);
/* harmony import */ var core_js_modules_es6_reflect_prevent_extensions__WEBPACK_IMPORTED_MODULE_73__ = __webpack_require__(/*! core-js/modules/es6.reflect.prevent-extensions */ "./node_modules/core-js/modules/es6.reflect.prevent-extensions.js");
/* harmony import */ var core_js_modules_es6_reflect_prevent_extensions__WEBPACK_IMPORTED_MODULE_73___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_reflect_prevent_extensions__WEBPACK_IMPORTED_MODULE_73__);
/* harmony import */ var core_js_modules_es6_reflect_set__WEBPACK_IMPORTED_MODULE_74__ = __webpack_require__(/*! core-js/modules/es6.reflect.set */ "./node_modules/core-js/modules/es6.reflect.set.js");
/* harmony import */ var core_js_modules_es6_reflect_set__WEBPACK_IMPORTED_MODULE_74___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_reflect_set__WEBPACK_IMPORTED_MODULE_74__);
/* harmony import */ var core_js_modules_es6_reflect_set_prototype_of__WEBPACK_IMPORTED_MODULE_75__ = __webpack_require__(/*! core-js/modules/es6.reflect.set-prototype-of */ "./node_modules/core-js/modules/es6.reflect.set-prototype-of.js");
/* harmony import */ var core_js_modules_es6_reflect_set_prototype_of__WEBPACK_IMPORTED_MODULE_75___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_reflect_set_prototype_of__WEBPACK_IMPORTED_MODULE_75__);
/* harmony import */ var core_js_modules_es6_regexp_constructor__WEBPACK_IMPORTED_MODULE_76__ = __webpack_require__(/*! core-js/modules/es6.regexp.constructor */ "./node_modules/core-js/modules/es6.regexp.constructor.js");
/* harmony import */ var core_js_modules_es6_regexp_constructor__WEBPACK_IMPORTED_MODULE_76___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_regexp_constructor__WEBPACK_IMPORTED_MODULE_76__);
/* harmony import */ var core_js_modules_es6_regexp_flags__WEBPACK_IMPORTED_MODULE_77__ = __webpack_require__(/*! core-js/modules/es6.regexp.flags */ "./node_modules/core-js/modules/es6.regexp.flags.js");
/* harmony import */ var core_js_modules_es6_regexp_flags__WEBPACK_IMPORTED_MODULE_77___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_regexp_flags__WEBPACK_IMPORTED_MODULE_77__);
/* harmony import */ var core_js_modules_es6_regexp_match__WEBPACK_IMPORTED_MODULE_78__ = __webpack_require__(/*! core-js/modules/es6.regexp.match */ "./node_modules/core-js/modules/es6.regexp.match.js");
/* harmony import */ var core_js_modules_es6_regexp_match__WEBPACK_IMPORTED_MODULE_78___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_regexp_match__WEBPACK_IMPORTED_MODULE_78__);
/* harmony import */ var core_js_modules_es6_regexp_replace__WEBPACK_IMPORTED_MODULE_79__ = __webpack_require__(/*! core-js/modules/es6.regexp.replace */ "./node_modules/core-js/modules/es6.regexp.replace.js");
/* harmony import */ var core_js_modules_es6_regexp_replace__WEBPACK_IMPORTED_MODULE_79___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_regexp_replace__WEBPACK_IMPORTED_MODULE_79__);
/* harmony import */ var core_js_modules_es6_regexp_split__WEBPACK_IMPORTED_MODULE_80__ = __webpack_require__(/*! core-js/modules/es6.regexp.split */ "./node_modules/core-js/modules/es6.regexp.split.js");
/* harmony import */ var core_js_modules_es6_regexp_split__WEBPACK_IMPORTED_MODULE_80___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_regexp_split__WEBPACK_IMPORTED_MODULE_80__);
/* harmony import */ var core_js_modules_es6_regexp_search__WEBPACK_IMPORTED_MODULE_81__ = __webpack_require__(/*! core-js/modules/es6.regexp.search */ "./node_modules/core-js/modules/es6.regexp.search.js");
/* harmony import */ var core_js_modules_es6_regexp_search__WEBPACK_IMPORTED_MODULE_81___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_regexp_search__WEBPACK_IMPORTED_MODULE_81__);
/* harmony import */ var core_js_modules_es6_regexp_to_string__WEBPACK_IMPORTED_MODULE_82__ = __webpack_require__(/*! core-js/modules/es6.regexp.to-string */ "./node_modules/core-js/modules/es6.regexp.to-string.js");
/* harmony import */ var core_js_modules_es6_regexp_to_string__WEBPACK_IMPORTED_MODULE_82___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_regexp_to_string__WEBPACK_IMPORTED_MODULE_82__);
/* harmony import */ var core_js_modules_es6_set__WEBPACK_IMPORTED_MODULE_83__ = __webpack_require__(/*! core-js/modules/es6.set */ "./node_modules/core-js/modules/es6.set.js");
/* harmony import */ var core_js_modules_es6_set__WEBPACK_IMPORTED_MODULE_83___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_set__WEBPACK_IMPORTED_MODULE_83__);
/* harmony import */ var core_js_modules_es6_symbol__WEBPACK_IMPORTED_MODULE_84__ = __webpack_require__(/*! core-js/modules/es6.symbol */ "./node_modules/core-js/modules/es6.symbol.js");
/* harmony import */ var core_js_modules_es6_symbol__WEBPACK_IMPORTED_MODULE_84___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_symbol__WEBPACK_IMPORTED_MODULE_84__);
/* harmony import */ var core_js_modules_es7_symbol_async_iterator__WEBPACK_IMPORTED_MODULE_85__ = __webpack_require__(/*! core-js/modules/es7.symbol.async-iterator */ "./node_modules/core-js/modules/es7.symbol.async-iterator.js");
/* harmony import */ var core_js_modules_es7_symbol_async_iterator__WEBPACK_IMPORTED_MODULE_85___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es7_symbol_async_iterator__WEBPACK_IMPORTED_MODULE_85__);
/* harmony import */ var core_js_modules_es6_string_anchor__WEBPACK_IMPORTED_MODULE_86__ = __webpack_require__(/*! core-js/modules/es6.string.anchor */ "./node_modules/core-js/modules/es6.string.anchor.js");
/* harmony import */ var core_js_modules_es6_string_anchor__WEBPACK_IMPORTED_MODULE_86___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_string_anchor__WEBPACK_IMPORTED_MODULE_86__);
/* harmony import */ var core_js_modules_es6_string_big__WEBPACK_IMPORTED_MODULE_87__ = __webpack_require__(/*! core-js/modules/es6.string.big */ "./node_modules/core-js/modules/es6.string.big.js");
/* harmony import */ var core_js_modules_es6_string_big__WEBPACK_IMPORTED_MODULE_87___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_string_big__WEBPACK_IMPORTED_MODULE_87__);
/* harmony import */ var core_js_modules_es6_string_blink__WEBPACK_IMPORTED_MODULE_88__ = __webpack_require__(/*! core-js/modules/es6.string.blink */ "./node_modules/core-js/modules/es6.string.blink.js");
/* harmony import */ var core_js_modules_es6_string_blink__WEBPACK_IMPORTED_MODULE_88___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_string_blink__WEBPACK_IMPORTED_MODULE_88__);
/* harmony import */ var core_js_modules_es6_string_bold__WEBPACK_IMPORTED_MODULE_89__ = __webpack_require__(/*! core-js/modules/es6.string.bold */ "./node_modules/core-js/modules/es6.string.bold.js");
/* harmony import */ var core_js_modules_es6_string_bold__WEBPACK_IMPORTED_MODULE_89___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_string_bold__WEBPACK_IMPORTED_MODULE_89__);
/* harmony import */ var core_js_modules_es6_string_code_point_at__WEBPACK_IMPORTED_MODULE_90__ = __webpack_require__(/*! core-js/modules/es6.string.code-point-at */ "./node_modules/core-js/modules/es6.string.code-point-at.js");
/* harmony import */ var core_js_modules_es6_string_code_point_at__WEBPACK_IMPORTED_MODULE_90___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_string_code_point_at__WEBPACK_IMPORTED_MODULE_90__);
/* harmony import */ var core_js_modules_es6_string_ends_with__WEBPACK_IMPORTED_MODULE_91__ = __webpack_require__(/*! core-js/modules/es6.string.ends-with */ "./node_modules/core-js/modules/es6.string.ends-with.js");
/* harmony import */ var core_js_modules_es6_string_ends_with__WEBPACK_IMPORTED_MODULE_91___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_string_ends_with__WEBPACK_IMPORTED_MODULE_91__);
/* harmony import */ var core_js_modules_es6_string_fixed__WEBPACK_IMPORTED_MODULE_92__ = __webpack_require__(/*! core-js/modules/es6.string.fixed */ "./node_modules/core-js/modules/es6.string.fixed.js");
/* harmony import */ var core_js_modules_es6_string_fixed__WEBPACK_IMPORTED_MODULE_92___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_string_fixed__WEBPACK_IMPORTED_MODULE_92__);
/* harmony import */ var core_js_modules_es6_string_fontcolor__WEBPACK_IMPORTED_MODULE_93__ = __webpack_require__(/*! core-js/modules/es6.string.fontcolor */ "./node_modules/core-js/modules/es6.string.fontcolor.js");
/* harmony import */ var core_js_modules_es6_string_fontcolor__WEBPACK_IMPORTED_MODULE_93___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_string_fontcolor__WEBPACK_IMPORTED_MODULE_93__);
/* harmony import */ var core_js_modules_es6_string_fontsize__WEBPACK_IMPORTED_MODULE_94__ = __webpack_require__(/*! core-js/modules/es6.string.fontsize */ "./node_modules/core-js/modules/es6.string.fontsize.js");
/* harmony import */ var core_js_modules_es6_string_fontsize__WEBPACK_IMPORTED_MODULE_94___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_string_fontsize__WEBPACK_IMPORTED_MODULE_94__);
/* harmony import */ var core_js_modules_es6_string_from_code_point__WEBPACK_IMPORTED_MODULE_95__ = __webpack_require__(/*! core-js/modules/es6.string.from-code-point */ "./node_modules/core-js/modules/es6.string.from-code-point.js");
/* harmony import */ var core_js_modules_es6_string_from_code_point__WEBPACK_IMPORTED_MODULE_95___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_string_from_code_point__WEBPACK_IMPORTED_MODULE_95__);
/* harmony import */ var core_js_modules_es6_string_includes__WEBPACK_IMPORTED_MODULE_96__ = __webpack_require__(/*! core-js/modules/es6.string.includes */ "./node_modules/core-js/modules/es6.string.includes.js");
/* harmony import */ var core_js_modules_es6_string_includes__WEBPACK_IMPORTED_MODULE_96___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_string_includes__WEBPACK_IMPORTED_MODULE_96__);
/* harmony import */ var core_js_modules_es6_string_italics__WEBPACK_IMPORTED_MODULE_97__ = __webpack_require__(/*! core-js/modules/es6.string.italics */ "./node_modules/core-js/modules/es6.string.italics.js");
/* harmony import */ var core_js_modules_es6_string_italics__WEBPACK_IMPORTED_MODULE_97___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_string_italics__WEBPACK_IMPORTED_MODULE_97__);
/* harmony import */ var core_js_modules_es6_string_iterator__WEBPACK_IMPORTED_MODULE_98__ = __webpack_require__(/*! core-js/modules/es6.string.iterator */ "./node_modules/core-js/modules/es6.string.iterator.js");
/* harmony import */ var core_js_modules_es6_string_iterator__WEBPACK_IMPORTED_MODULE_98___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_string_iterator__WEBPACK_IMPORTED_MODULE_98__);
/* harmony import */ var core_js_modules_es6_string_link__WEBPACK_IMPORTED_MODULE_99__ = __webpack_require__(/*! core-js/modules/es6.string.link */ "./node_modules/core-js/modules/es6.string.link.js");
/* harmony import */ var core_js_modules_es6_string_link__WEBPACK_IMPORTED_MODULE_99___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_string_link__WEBPACK_IMPORTED_MODULE_99__);
/* harmony import */ var core_js_modules_es7_string_pad_start__WEBPACK_IMPORTED_MODULE_100__ = __webpack_require__(/*! core-js/modules/es7.string.pad-start */ "./node_modules/core-js/modules/es7.string.pad-start.js");
/* harmony import */ var core_js_modules_es7_string_pad_start__WEBPACK_IMPORTED_MODULE_100___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es7_string_pad_start__WEBPACK_IMPORTED_MODULE_100__);
/* harmony import */ var core_js_modules_es7_string_pad_end__WEBPACK_IMPORTED_MODULE_101__ = __webpack_require__(/*! core-js/modules/es7.string.pad-end */ "./node_modules/core-js/modules/es7.string.pad-end.js");
/* harmony import */ var core_js_modules_es7_string_pad_end__WEBPACK_IMPORTED_MODULE_101___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es7_string_pad_end__WEBPACK_IMPORTED_MODULE_101__);
/* harmony import */ var core_js_modules_es6_string_raw__WEBPACK_IMPORTED_MODULE_102__ = __webpack_require__(/*! core-js/modules/es6.string.raw */ "./node_modules/core-js/modules/es6.string.raw.js");
/* harmony import */ var core_js_modules_es6_string_raw__WEBPACK_IMPORTED_MODULE_102___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_string_raw__WEBPACK_IMPORTED_MODULE_102__);
/* harmony import */ var core_js_modules_es6_string_repeat__WEBPACK_IMPORTED_MODULE_103__ = __webpack_require__(/*! core-js/modules/es6.string.repeat */ "./node_modules/core-js/modules/es6.string.repeat.js");
/* harmony import */ var core_js_modules_es6_string_repeat__WEBPACK_IMPORTED_MODULE_103___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_string_repeat__WEBPACK_IMPORTED_MODULE_103__);
/* harmony import */ var core_js_modules_es6_string_small__WEBPACK_IMPORTED_MODULE_104__ = __webpack_require__(/*! core-js/modules/es6.string.small */ "./node_modules/core-js/modules/es6.string.small.js");
/* harmony import */ var core_js_modules_es6_string_small__WEBPACK_IMPORTED_MODULE_104___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_string_small__WEBPACK_IMPORTED_MODULE_104__);
/* harmony import */ var core_js_modules_es6_string_starts_with__WEBPACK_IMPORTED_MODULE_105__ = __webpack_require__(/*! core-js/modules/es6.string.starts-with */ "./node_modules/core-js/modules/es6.string.starts-with.js");
/* harmony import */ var core_js_modules_es6_string_starts_with__WEBPACK_IMPORTED_MODULE_105___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_string_starts_with__WEBPACK_IMPORTED_MODULE_105__);
/* harmony import */ var core_js_modules_es6_string_strike__WEBPACK_IMPORTED_MODULE_106__ = __webpack_require__(/*! core-js/modules/es6.string.strike */ "./node_modules/core-js/modules/es6.string.strike.js");
/* harmony import */ var core_js_modules_es6_string_strike__WEBPACK_IMPORTED_MODULE_106___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_string_strike__WEBPACK_IMPORTED_MODULE_106__);
/* harmony import */ var core_js_modules_es6_string_sub__WEBPACK_IMPORTED_MODULE_107__ = __webpack_require__(/*! core-js/modules/es6.string.sub */ "./node_modules/core-js/modules/es6.string.sub.js");
/* harmony import */ var core_js_modules_es6_string_sub__WEBPACK_IMPORTED_MODULE_107___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_string_sub__WEBPACK_IMPORTED_MODULE_107__);
/* harmony import */ var core_js_modules_es6_string_sup__WEBPACK_IMPORTED_MODULE_108__ = __webpack_require__(/*! core-js/modules/es6.string.sup */ "./node_modules/core-js/modules/es6.string.sup.js");
/* harmony import */ var core_js_modules_es6_string_sup__WEBPACK_IMPORTED_MODULE_108___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_string_sup__WEBPACK_IMPORTED_MODULE_108__);
/* harmony import */ var core_js_modules_es6_typed_array_buffer__WEBPACK_IMPORTED_MODULE_109__ = __webpack_require__(/*! core-js/modules/es6.typed.array-buffer */ "./node_modules/core-js/modules/es6.typed.array-buffer.js");
/* harmony import */ var core_js_modules_es6_typed_array_buffer__WEBPACK_IMPORTED_MODULE_109___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_typed_array_buffer__WEBPACK_IMPORTED_MODULE_109__);
/* harmony import */ var core_js_modules_es6_typed_int8_array__WEBPACK_IMPORTED_MODULE_110__ = __webpack_require__(/*! core-js/modules/es6.typed.int8-array */ "./node_modules/core-js/modules/es6.typed.int8-array.js");
/* harmony import */ var core_js_modules_es6_typed_int8_array__WEBPACK_IMPORTED_MODULE_110___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_typed_int8_array__WEBPACK_IMPORTED_MODULE_110__);
/* harmony import */ var core_js_modules_es6_typed_uint8_array__WEBPACK_IMPORTED_MODULE_111__ = __webpack_require__(/*! core-js/modules/es6.typed.uint8-array */ "./node_modules/core-js/modules/es6.typed.uint8-array.js");
/* harmony import */ var core_js_modules_es6_typed_uint8_array__WEBPACK_IMPORTED_MODULE_111___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_typed_uint8_array__WEBPACK_IMPORTED_MODULE_111__);
/* harmony import */ var core_js_modules_es6_typed_uint8_clamped_array__WEBPACK_IMPORTED_MODULE_112__ = __webpack_require__(/*! core-js/modules/es6.typed.uint8-clamped-array */ "./node_modules/core-js/modules/es6.typed.uint8-clamped-array.js");
/* harmony import */ var core_js_modules_es6_typed_uint8_clamped_array__WEBPACK_IMPORTED_MODULE_112___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_typed_uint8_clamped_array__WEBPACK_IMPORTED_MODULE_112__);
/* harmony import */ var core_js_modules_es6_typed_int16_array__WEBPACK_IMPORTED_MODULE_113__ = __webpack_require__(/*! core-js/modules/es6.typed.int16-array */ "./node_modules/core-js/modules/es6.typed.int16-array.js");
/* harmony import */ var core_js_modules_es6_typed_int16_array__WEBPACK_IMPORTED_MODULE_113___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_typed_int16_array__WEBPACK_IMPORTED_MODULE_113__);
/* harmony import */ var core_js_modules_es6_typed_uint16_array__WEBPACK_IMPORTED_MODULE_114__ = __webpack_require__(/*! core-js/modules/es6.typed.uint16-array */ "./node_modules/core-js/modules/es6.typed.uint16-array.js");
/* harmony import */ var core_js_modules_es6_typed_uint16_array__WEBPACK_IMPORTED_MODULE_114___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_typed_uint16_array__WEBPACK_IMPORTED_MODULE_114__);
/* harmony import */ var core_js_modules_es6_typed_int32_array__WEBPACK_IMPORTED_MODULE_115__ = __webpack_require__(/*! core-js/modules/es6.typed.int32-array */ "./node_modules/core-js/modules/es6.typed.int32-array.js");
/* harmony import */ var core_js_modules_es6_typed_int32_array__WEBPACK_IMPORTED_MODULE_115___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_typed_int32_array__WEBPACK_IMPORTED_MODULE_115__);
/* harmony import */ var core_js_modules_es6_typed_uint32_array__WEBPACK_IMPORTED_MODULE_116__ = __webpack_require__(/*! core-js/modules/es6.typed.uint32-array */ "./node_modules/core-js/modules/es6.typed.uint32-array.js");
/* harmony import */ var core_js_modules_es6_typed_uint32_array__WEBPACK_IMPORTED_MODULE_116___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_typed_uint32_array__WEBPACK_IMPORTED_MODULE_116__);
/* harmony import */ var core_js_modules_es6_typed_float32_array__WEBPACK_IMPORTED_MODULE_117__ = __webpack_require__(/*! core-js/modules/es6.typed.float32-array */ "./node_modules/core-js/modules/es6.typed.float32-array.js");
/* harmony import */ var core_js_modules_es6_typed_float32_array__WEBPACK_IMPORTED_MODULE_117___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_typed_float32_array__WEBPACK_IMPORTED_MODULE_117__);
/* harmony import */ var core_js_modules_es6_typed_float64_array__WEBPACK_IMPORTED_MODULE_118__ = __webpack_require__(/*! core-js/modules/es6.typed.float64-array */ "./node_modules/core-js/modules/es6.typed.float64-array.js");
/* harmony import */ var core_js_modules_es6_typed_float64_array__WEBPACK_IMPORTED_MODULE_118___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_typed_float64_array__WEBPACK_IMPORTED_MODULE_118__);
/* harmony import */ var core_js_modules_es6_weak_map__WEBPACK_IMPORTED_MODULE_119__ = __webpack_require__(/*! core-js/modules/es6.weak-map */ "./node_modules/core-js/modules/es6.weak-map.js");
/* harmony import */ var core_js_modules_es6_weak_map__WEBPACK_IMPORTED_MODULE_119___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_weak_map__WEBPACK_IMPORTED_MODULE_119__);
/* harmony import */ var core_js_modules_es6_weak_set__WEBPACK_IMPORTED_MODULE_120__ = __webpack_require__(/*! core-js/modules/es6.weak-set */ "./node_modules/core-js/modules/es6.weak-set.js");
/* harmony import */ var core_js_modules_es6_weak_set__WEBPACK_IMPORTED_MODULE_120___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es6_weak_set__WEBPACK_IMPORTED_MODULE_120__);
/* harmony import */ var core_js_modules_web_timers__WEBPACK_IMPORTED_MODULE_121__ = __webpack_require__(/*! core-js/modules/web.timers */ "./node_modules/core-js/modules/web.timers.js");
/* harmony import */ var core_js_modules_web_timers__WEBPACK_IMPORTED_MODULE_121___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_timers__WEBPACK_IMPORTED_MODULE_121__);
/* harmony import */ var core_js_modules_web_immediate__WEBPACK_IMPORTED_MODULE_122__ = __webpack_require__(/*! core-js/modules/web.immediate */ "./node_modules/core-js/modules/web.immediate.js");
/* harmony import */ var core_js_modules_web_immediate__WEBPACK_IMPORTED_MODULE_122___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_immediate__WEBPACK_IMPORTED_MODULE_122__);
/* harmony import */ var core_js_modules_web_dom_iterable__WEBPACK_IMPORTED_MODULE_123__ = __webpack_require__(/*! core-js/modules/web.dom.iterable */ "./node_modules/core-js/modules/web.dom.iterable.js");
/* harmony import */ var core_js_modules_web_dom_iterable__WEBPACK_IMPORTED_MODULE_123___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_iterable__WEBPACK_IMPORTED_MODULE_123__);
/* harmony import */ var regenerator_runtime_runtime__WEBPACK_IMPORTED_MODULE_124__ = __webpack_require__(/*! regenerator-runtime/runtime */ "./node_modules/regenerator-runtime/runtime.js");
/* harmony import */ var regenerator_runtime_runtime__WEBPACK_IMPORTED_MODULE_124___default = /*#__PURE__*/__webpack_require__.n(regenerator_runtime_runtime__WEBPACK_IMPORTED_MODULE_124__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_125__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_125___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_125__);
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_126__ = __webpack_require__(/*! react-dom */ "./node_modules/react-dom/index.js");
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_126___default = /*#__PURE__*/__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_126__);
/* harmony import */ var _components_App_MainApp__WEBPACK_IMPORTED_MODULE_127__ = __webpack_require__(/*! ./components/App/MainApp */ "./src/js/components/App/MainApp.js");
/* harmony import */ var _components_App_AnonymousApp__WEBPACK_IMPORTED_MODULE_128__ = __webpack_require__(/*! ./components/App/AnonymousApp */ "./src/js/components/App/AnonymousApp.js");
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_129__ = __webpack_require__(/*! react-router-dom */ "./node_modules/react-router-dom/es/index.js");
/* harmony import */ var react_redux__WEBPACK_IMPORTED_MODULE_130__ = __webpack_require__(/*! react-redux */ "./node_modules/react-redux/es/index.js");
/* harmony import */ var _store_store__WEBPACK_IMPORTED_MODULE_131__ = __webpack_require__(/*! ./store/store */ "./src/js/store/store.js");




































































































































window.addEventListener("load", function () {
  var mainContainer = document.getElementById("main-app");

  if (mainContainer) {
    react_dom__WEBPACK_IMPORTED_MODULE_126___default.a.render(react__WEBPACK_IMPORTED_MODULE_125___default.a.createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_129__["HashRouter"], null, react__WEBPACK_IMPORTED_MODULE_125___default.a.createElement(react_redux__WEBPACK_IMPORTED_MODULE_130__["Provider"], {
      store: _store_store__WEBPACK_IMPORTED_MODULE_131__["default"]
    }, react__WEBPACK_IMPORTED_MODULE_125___default.a.createElement(_components_App_MainApp__WEBPACK_IMPORTED_MODULE_127__["default"], null))), mainContainer);
  }

  var anonymousContainer = document.getElementById("anonymous-app");

  if (anonymousContainer) {
    react_dom__WEBPACK_IMPORTED_MODULE_126___default.a.render(react__WEBPACK_IMPORTED_MODULE_125___default.a.createElement(_components_App_AnonymousApp__WEBPACK_IMPORTED_MODULE_128__["default"], null), anonymousContainer);
  }
});

/***/ }),

/***/ "./src/js/reducers/homeState.js":
/*!**************************************!*\
  !*** ./src/js/reducers/homeState.js ***!
  \**************************************/
/*! exports provided: homeState */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "homeState", function() { return homeState; });
/* harmony import */ var _actions_ActionType__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../actions/ActionType */ "./src/js/actions/ActionType.js");

var defaultState = {
  title: "",
  subtitle: "",
  pillars: []
};
function homeState() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultState;
  var action = arguments.length > 1 ? arguments[1] : undefined;

  switch (action.type) {
    case _actions_ActionType__WEBPACK_IMPORTED_MODULE_0__["default"].HOME.LOAD_HOME_STATE_STARTED:
      return state;

    case _actions_ActionType__WEBPACK_IMPORTED_MODULE_0__["default"].HOME.LOAD_HOME_STATE_FAILED:
      return state;

    case _actions_ActionType__WEBPACK_IMPORTED_MODULE_0__["default"].HOME.LOAD_HOME_STATE_FINISHED:
      return action.payload;

    default:
      return state;
  }
}

/***/ }),

/***/ "./src/js/reducers/questionnaireState.js":
/*!***********************************************!*\
  !*** ./src/js/reducers/questionnaireState.js ***!
  \***********************************************/
/*! exports provided: startState, submissionState, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "startState", function() { return startState; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "submissionState", function() { return submissionState; });
/* harmony import */ var redux__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! redux */ "./node_modules/redux/es/redux.js");
/* harmony import */ var _actions_ActionType__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../actions/ActionType */ "./src/js/actions/ActionType.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_2__);
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }




var defaultStartState = {
  title: "",
  subtitle: "",
  keyInformation: "",
  questionnaireID: "",
  user: null
};
var defaultSubmissionState = {
  title: "",
  siteTitle: "",
  user: null,
  submission: null,
  isCurrentUserApprover: false
};
function startState() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultStartState;
  var action = arguments.length > 1 ? arguments[1] : undefined;

  if (action.type === _actions_ActionType__WEBPACK_IMPORTED_MODULE_1__["default"].QUESTIONNAIRE.LOAD_QUESTIONNAIRE_START_STATE) {
    return action.payload;
  }

  return state;
}
function submissionState() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultSubmissionState;
  var action = arguments.length > 1 ? arguments[1] : undefined;

  if (action.type === _actions_ActionType__WEBPACK_IMPORTED_MODULE_1__["default"].QUESTIONNAIRE.LOAD_QUESTIONNAIRE_SUBMISSION_STATE) {
    return action.payload;
  }

  if (action.type === _actions_ActionType__WEBPACK_IMPORTED_MODULE_1__["default"].QUESTIONNAIRE.PUT_DATA_IN_QUESTIONNAIRE_ANSWER) {
    if (!state.submission) {
      return state;
    } // Find the matched question


    var answeredQuestion = action.payload;
    var index = state.submission.questions.findIndex(function (question) {
      return question.id === answeredQuestion.id;
    });

    if (index < 0) {
      return state;
    }

    var newState = _objectSpread({}, state);

    lodash__WEBPACK_IMPORTED_MODULE_2___default.a.set(newState, "submission.questions.".concat(index), answeredQuestion);

    return newState;
  }

  if (action.type === _actions_ActionType__WEBPACK_IMPORTED_MODULE_1__["default"].QUESTIONNAIRE.MOVE_TO_ANOTHER_QUESTIONNAIRE_QUESTION) {
    var submission = state.submission;

    if (!submission) {
      return state;
    }

    var _action = _objectSpread({}, action),
        targetIndex = _action.targetIndex;

    var currentIndex = submission.questions.findIndex(function (question) {
      return question.isCurrent;
    }); // Don't move when target is wrong

    if (targetIndex < 0 || targetIndex >= submission.questions.length) {
      return state;
    }

    var _newState = _objectSpread({}, state); // Mark current question is not current anymore


    lodash__WEBPACK_IMPORTED_MODULE_2___default.a.set(_newState, "submission.questions.".concat(currentIndex, ".isCurrent"), false); // Mark target question to be current


    lodash__WEBPACK_IMPORTED_MODULE_2___default.a.set(_newState, "submission.questions.".concat(targetIndex, ".isCurrent"), true);

    return _newState;
  }

  if (action.type === _actions_ActionType__WEBPACK_IMPORTED_MODULE_1__["default"].QUESTIONNAIRE.MARK_QUESTIONNAIRE_QUESTION_NOT_APPLICABLE) {
    var _submission = state.submission;

    if (!_submission) {
      return state;
    }

    var _newState2 = _objectSpread({}, state); // Mark questions between target and current to be "not applicable"


    var nonApplicableIndexes = action.nonApplicableIndexes;

    if (nonApplicableIndexes && nonApplicableIndexes.length > 0) {
      nonApplicableIndexes.forEach(function (index) {
        var nonApplicableQuestion = _submission.questions[index];
        nonApplicableQuestion.isApplicable = false;

        lodash__WEBPACK_IMPORTED_MODULE_2___default.a.set(_newState2, "submission.questions.".concat(index), nonApplicableQuestion);
      });
    }

    return _newState2;
  }

  return state;
}
/* harmony default export */ __webpack_exports__["default"] = (Object(redux__WEBPACK_IMPORTED_MODULE_0__["combineReducers"])({
  startState: startState,
  submissionState: submissionState
}));

/***/ }),

/***/ "./src/js/reducers/rootState.js":
/*!**************************************!*\
  !*** ./src/js/reducers/rootState.js ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var redux__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! redux */ "./node_modules/redux/es/redux.js");
/* harmony import */ var _homeState__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./homeState */ "./src/js/reducers/homeState.js");
/* harmony import */ var _questionnaireState__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./questionnaireState */ "./src/js/reducers/questionnaireState.js");
/* harmony import */ var _taskSubmissionState__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./taskSubmissionState */ "./src/js/reducers/taskSubmissionState.js");




/* harmony default export */ __webpack_exports__["default"] = (Object(redux__WEBPACK_IMPORTED_MODULE_0__["combineReducers"])({
  homeState: _homeState__WEBPACK_IMPORTED_MODULE_1__["homeState"],
  questionnaireState: _questionnaireState__WEBPACK_IMPORTED_MODULE_2__["default"],
  taskSubmissionState: _taskSubmissionState__WEBPACK_IMPORTED_MODULE_3__["taskSubmissionState"]
}));

/***/ }),

/***/ "./src/js/reducers/taskSubmissionState.js":
/*!************************************************!*\
  !*** ./src/js/reducers/taskSubmissionState.js ***!
  \************************************************/
/*! exports provided: taskSubmissionState */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "taskSubmissionState", function() { return taskSubmissionState; });
/* harmony import */ var _actions_ActionType__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../actions/ActionType */ "./src/js/actions/ActionType.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_1__);
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }



var defaultStartState = {
  siteTitle: "",
  currentUser: null,
  taskSubmission: null
};
function taskSubmissionState() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultStartState;
  var action = arguments.length > 1 ? arguments[1] : undefined;
  var taskSubmission = state.taskSubmission;

  if (action.type === _actions_ActionType__WEBPACK_IMPORTED_MODULE_0__["default"].TASK.LOAD_TASK_SUBMISSION_STATE) {
    return action.payload;
  }

  if (action.type === _actions_ActionType__WEBPACK_IMPORTED_MODULE_0__["default"].TASK.PUT_DATA_IN_TASK_SUBMISSION) {
    if (!taskSubmission) {
      return state;
    } // Find the matched question


    var answeredQuestion = action.payload;
    var index = taskSubmission.questions.findIndex(function (question) {
      return question.id === answeredQuestion.id;
    });

    if (index < 0) {
      return state;
    }

    var newState = _objectSpread({}, state);

    lodash__WEBPACK_IMPORTED_MODULE_1___default.a.set(newState, "taskSubmission.questions.".concat(index), answeredQuestion);

    return newState;
  }

  if (action.type === _actions_ActionType__WEBPACK_IMPORTED_MODULE_0__["default"].TASK.MARK_TASK_QUESTION_NOT_APPLICABLE) {
    if (!taskSubmission) {
      return state;
    }

    var _newState = _objectSpread({}, state); // Mark questions between target and current to be "not applicable"


    var nonApplicableIndexes = action.payload;

    if (nonApplicableIndexes && nonApplicableIndexes.length > 0) {
      nonApplicableIndexes.forEach(function (index) {
        var nonApplicableQuestion = taskSubmission.questions[index];
        nonApplicableQuestion.isApplicable = false;

        lodash__WEBPACK_IMPORTED_MODULE_1___default.a.set(_newState, "taskSubmission.questions.".concat(index), nonApplicableQuestion);
      });
    }

    return _newState;
  }

  if (action.type === _actions_ActionType__WEBPACK_IMPORTED_MODULE_0__["default"].TASK.MOVE_TO_ANOTHER_TASK_QUESTION) {
    if (!taskSubmission) {
      return state;
    }

    var _action$payload = _objectSpread({}, action.payload),
        currentIndex = _action$payload.currentIndex,
        targetIndex = _action$payload.targetIndex; // Don't move when target is wrong


    if (targetIndex < 0 || targetIndex >= taskSubmission.questions.length) {
      return state;
    }

    var _newState2 = _objectSpread({}, state); // Mark current question is not current anymore


    lodash__WEBPACK_IMPORTED_MODULE_1___default.a.set(_newState2, "taskSubmission.questions.".concat(currentIndex, ".isCurrent"), false); // Mark target question to be current


    lodash__WEBPACK_IMPORTED_MODULE_1___default.a.set(_newState2, "taskSubmission.questions.".concat(targetIndex, ".isCurrent"), true);

    return _newState2;
  }

  return state;
}

/***/ }),

/***/ "./src/js/services/CSRFTokenService.js":
/*!*********************************************!*\
  !*** ./src/js/services/CSRFTokenService.js ***!
  \*********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return CSRFTokenService; });
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! axios */ "./node_modules/axios/index.js");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_1__);
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }




var CSRFTokenService =
/*#__PURE__*/
function () {
  function CSRFTokenService() {
    _classCallCheck(this, CSRFTokenService);
  }

  _createClass(CSRFTokenService, null, [{
    key: "getCSRFToken",
    value: function () {
      var _getCSRFToken = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee() {
        var inst, response, data, token;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                inst = axios__WEBPACK_IMPORTED_MODULE_0___default.a.create({
                  url: "/getCSRFToken",
                  method: "get",
                  headers: {
                    "x-requested-with": "XMLHttpRequest"
                  }
                });
                _context.next = 3;
                return inst.request();

              case 3:
                response = _context.sent;
                data = response.data;
                token = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(data, "CSRFToken", null);

                if (token) {
                  _context.next = 8;
                  break;
                }

                throw new Error(data);

              case 8:
                return _context.abrupt("return", token);

              case 9:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function getCSRFToken() {
        return _getCSRFToken.apply(this, arguments);
      }

      return getCSRFToken;
    }()
  }]);

  return CSRFTokenService;
}();



/***/ }),

/***/ "./src/js/services/HomeDataService.js":
/*!********************************************!*\
  !*** ./src/js/services/HomeDataService.js ***!
  \********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return HomeDataService; });
/* harmony import */ var _img_Home_poc_icon_svg__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../img/Home/poc-icon.svg */ "./src/img/Home/poc-icon.svg");
/* harmony import */ var _img_Home_poc_icon_svg__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_img_Home_poc_icon_svg__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _img_Home_saas_icon_svg__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../img/Home/saas-icon.svg */ "./src/img/Home/saas-icon.svg");
/* harmony import */ var _img_Home_saas_icon_svg__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_img_Home_saas_icon_svg__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _img_Home_prod_icon_svg__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../img/Home/prod-icon.svg */ "./src/img/Home/prod-icon.svg");
/* harmony import */ var _img_Home_prod_icon_svg__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_img_Home_prod_icon_svg__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _img_Home_bug_icon_svg__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../img/Home/bug-icon.svg */ "./src/img/Home/bug-icon.svg");
/* harmony import */ var _img_Home_bug_icon_svg__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_img_Home_bug_icon_svg__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _utils_GraphQLRequestHelper__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/GraphQLRequestHelper */ "./src/js/utils/GraphQLRequestHelper.js");
/* harmony import */ var _constants_errors__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../constants/errors */ "./src/js/constants/errors.js");
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }









var HomeDataService =
/*#__PURE__*/
function () {
  function HomeDataService() {
    _classCallCheck(this, HomeDataService);
  }

  _createClass(HomeDataService, null, [{
    key: "fetchHomeData",
    value: function () {
      var _fetchHomeData = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee() {
        var query, json, data, dashboard, title, subtitle, pillars;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                // GraphQL
                query = "\nquery {\n  readDashboard {\n    Title\n    Subtitle\n    Pillars {\n      Label\n      Type\n      Disabled\n      Questionnaire {\n        ID\n      }\n    }\n  }\n}"; // Send request

                _context.next = 3;
                return _utils_GraphQLRequestHelper__WEBPACK_IMPORTED_MODULE_5__["default"].request({
                  query: query
                });

              case 3:
                json = _context.sent;
                data = lodash__WEBPACK_IMPORTED_MODULE_4___default.a.get(json, "data.readDashboard", []);

                if (!(!Array.isArray(data) || data.length === 0)) {
                  _context.next = 7;
                  break;
                }

                throw _constants_errors__WEBPACK_IMPORTED_MODULE_6__["DEFAULT_NETWORK_ERROR"];

              case 7:
                // Parse data for use in frontend
                dashboard = data[0];
                title = lodash__WEBPACK_IMPORTED_MODULE_4___default.a.get(dashboard, "Title", "");
                subtitle = lodash__WEBPACK_IMPORTED_MODULE_4___default.a.get(dashboard, "Subtitle", "");
                pillars = lodash__WEBPACK_IMPORTED_MODULE_4___default.a.get(dashboard, "Pillars", []);

                if (Array.isArray(pillars)) {
                  _context.next = 13;
                  break;
                }

                throw _constants_errors__WEBPACK_IMPORTED_MODULE_6__["DEFAULT_NETWORK_ERROR"];

              case 13:
                pillars = pillars.map(function (item) {
                  var icon = "";

                  switch (item["Type"]) {
                    case "proof_of_concept":
                      icon = _img_Home_poc_icon_svg__WEBPACK_IMPORTED_MODULE_0___default.a;
                      break;

                    case "software_as_service":
                      icon = _img_Home_saas_icon_svg__WEBPACK_IMPORTED_MODULE_1___default.a;
                      break;

                    case "product_project_or_solution":
                      icon = _img_Home_prod_icon_svg__WEBPACK_IMPORTED_MODULE_2___default.a;
                      break;

                    case "feature_or_bug_fix":
                      icon = _img_Home_bug_icon_svg__WEBPACK_IMPORTED_MODULE_3___default.a;
                      break;
                  }

                  return {
                    title: lodash__WEBPACK_IMPORTED_MODULE_4___default.a.get(item, "Label", ""),
                    disabled: lodash__WEBPACK_IMPORTED_MODULE_4___default.a.get(item, "Disabled", true),
                    questionnaireID: lodash__WEBPACK_IMPORTED_MODULE_4___default.a.get(item, "Questionnaire.0.ID", ""),
                    icon: icon
                  };
                });
                return _context.abrupt("return", {
                  title: title,
                  subtitle: subtitle,
                  pillars: pillars
                });

              case 15:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function fetchHomeData() {
        return _fetchHomeData.apply(this, arguments);
      }

      return fetchHomeData;
    }()
  }]);

  return HomeDataService;
}();



/***/ }),

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
/* harmony import */ var _utils_QuestionParser__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/QuestionParser */ "./src/js/utils/QuestionParser.js");
/* harmony import */ var _utils_UserParser__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/UserParser */ "./src/js/utils/UserParser.js");
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
      regeneratorRuntime.mark(function _callee(argument) {
        var _argument, questionnaireID, csrfToken, query, json, submissionHash;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _argument = _objectSpread({}, argument), questionnaireID = _argument.questionnaireID, csrfToken = _argument.csrfToken;
                query = "\nmutation {\n createQuestionnaireSubmission(QuestionnaireID: ".concat(questionnaireID, "){\n   UUID\n }\n}");
                _context.next = 4;
                return _utils_GraphQLRequestHelper__WEBPACK_IMPORTED_MODULE_0__["default"].request({
                  query: query,
                  csrfToken: csrfToken
                });

              case 4:
                json = _context.sent;
                submissionHash = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(json, "data.createQuestionnaireSubmission.UUID", null);

                if (submissionHash) {
                  _context.next = 8;
                  break;
                }

                throw _constants_errors__WEBPACK_IMPORTED_MODULE_2__["DEFAULT_NETWORK_ERROR"];

              case 8:
                return _context.abrupt("return", submissionHash);

              case 9:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function createInProgressSubmission(_x) {
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
                query = "\nquery {\n  readCurrentMember {\n    ID\n    Email\n    FirstName\n    Surname\n    UserRole\n  }\n  readQuestionnaire(ID: ".concat(questionnaireID, ") {\n    ID\n    Name\n    KeyInformation\n  }\n  readSiteConfig {\n    Title\n  }\n}\n");
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
                    id: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(memberData, "ID"),
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
        }, _callee2);
      }));

      function fetchStartData(_x2) {
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
        var query, json, memberData, submissionJSON, data;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                query = "\nquery {\n  readCurrentMember {\n    ID\n    Email\n    FirstName\n    Surname\n    UserRole\n  }\n  readQuestionnaireSubmission(UUID: \"".concat(submissionHash, "\") {\n    ID\n    UUID\n    User {\n      ID\n    }\n    SubmitterName,\n    SubmitterRole,\n    SubmitterEmail,\n    QuestionnaireStatus\n    Questionnaire {\n      ID\n      Name\n    }\n    QuestionnaireData\n    AnswerData\n    CisoApprovalStatus\n    BusinessOwnerApprovalStatus\n    SecurityArchitectApprovalStatus\n    IsCurrentUserAnApprover\n    TaskSubmissions {\n      UUID\n      TaskName\n      Status\n    }\n  }\n  readSiteConfig {\n    Title\n  }\n}");
                _context3.next = 3;
                return _utils_GraphQLRequestHelper__WEBPACK_IMPORTED_MODULE_0__["default"].request({
                  query: query
                });

              case 3:
                json = _context3.sent;
                memberData = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(json, "data.readCurrentMember.0", {});
                submissionJSON = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(json, "data.readQuestionnaireSubmission.0", {});

                if (!(!memberData || !submissionJSON)) {
                  _context3.next = 8;
                  break;
                }

                throw _constants_errors__WEBPACK_IMPORTED_MODULE_2__["DEFAULT_NETWORK_ERROR"];

              case 8:
                data = {
                  title: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSON, "Questionnaire.Name", "")),
                  siteTitle: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(json, "data.readSiteConfig.0.Title", "")),
                  user: _utils_UserParser__WEBPACK_IMPORTED_MODULE_4__["default"].parseUserFromJSON(memberData),
                  isCurrentUserApprover: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSON, "IsCurrentUserAnApprover", "false") === "true",
                  submission: {
                    questionnaireID: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSON, "Questionnaire.ID", "")),
                    questionnaireTitle: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSON, "Questionnaire.Name", "")),
                    submissionID: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSON, "ID", "")),
                    submissionUUID: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSON, "UUID", "")),
                    submitter: {
                      id: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSON, "User.ID")),
                      name: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSON, "SubmitterName", "")),
                      role: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSON, "SubmitterRole", "")),
                      email: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSON, "SubmitterEmail", ""))
                    },
                    status: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSON, "QuestionnaireStatus", "")).toLowerCase().replace("-", "_"),
                    approvalStatus: {
                      chiefInformationSecurityOfficer: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSON, "CisoApprovalStatus", "")),
                      businessOwner: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSON, "BusinessOwnerApprovalStatus", "")),
                      securityArchitect: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSON, "SecurityArchitectApprovalStatus", ""))
                    },
                    questions: _utils_QuestionParser__WEBPACK_IMPORTED_MODULE_3__["default"].parseQuestionsFromJSON({
                      schemaJSON: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSON, "QuestionnaireData", "")),
                      answersJSON: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSON, "AnswerData", ""))
                    }),
                    taskSubmissions: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toArray(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSON, "TaskSubmissions", [])).map(function (item) {
                      var taskSubmission = {
                        uuid: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(item, "UUID", "")),
                        taskName: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(item, "TaskName", "")),
                        status: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(item, "Status", ""))
                      };
                      return taskSubmission;
                    })
                  }
                };
                return _context3.abrupt("return", data);

              case 10:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      function fetchSubmissionData(_x3) {
        return _fetchSubmissionData.apply(this, arguments);
      }

      return fetchSubmissionData;
    }()
  }, {
    key: "updateSubmissionData",
    value: function () {
      var _updateSubmissionData = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(argument) {
        var _argument2, submissionID, questionID, answerData, csrfToken, answerDataStr, query, json, updatedData;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _argument2 = _objectSpread({}, argument), submissionID = _argument2.submissionID, questionID = _argument2.questionID, answerData = _argument2.answerData, csrfToken = _argument2.csrfToken;
                answerDataStr = window.btoa(JSON.stringify(answerData));
                query = "\nmutation {\n  updateQuestionnaireSubmission(ID: \"".concat(submissionID, "\", QuestionID: \"").concat(questionID, "\", AnswerData: \"").concat(answerDataStr, "\") {\n    ID\n    AnswerData\n  }\n}");
                _context4.next = 5;
                return _utils_GraphQLRequestHelper__WEBPACK_IMPORTED_MODULE_0__["default"].request({
                  query: query,
                  csrfToken: csrfToken
                });

              case 5:
                json = _context4.sent;
                updatedData = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(json, "data.updateQuestionnaireSubmission.AnswerData", null);

                if (updatedData) {
                  _context4.next = 9;
                  break;
                }

                throw _constants_errors__WEBPACK_IMPORTED_MODULE_2__["DEFAULT_NETWORK_ERROR"];

              case 9:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      }));

      function updateSubmissionData(_x4) {
        return _updateSubmissionData.apply(this, arguments);
      }

      return updateSubmissionData;
    }()
  }, {
    key: "batchUpdateSubmissionData",
    value: function () {
      var _batchUpdateSubmissionData = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee5(argument) {
        var _argument3, submissionID, questionIDList, answerDataList, csrfToken, mutations, index, questionID, answerData, answerDataStr, singleQuery, query, json, updatedData;

        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _argument3 = _objectSpread({}, argument), submissionID = _argument3.submissionID, questionIDList = _argument3.questionIDList, answerDataList = _argument3.answerDataList, csrfToken = _argument3.csrfToken;

                if (!(questionIDList.length !== answerDataList.length)) {
                  _context5.next = 3;
                  break;
                }

                throw _constants_errors__WEBPACK_IMPORTED_MODULE_2__["DEFAULT_NETWORK_ERROR"];

              case 3:
                mutations = [];

                for (index = 0; index < questionIDList.length; index++) {
                  questionID = questionIDList[index];
                  answerData = answerDataList[index];
                  answerDataStr = window.btoa(JSON.stringify(answerData));
                  singleQuery = "\nupdateQuestion".concat(questionID, ": updateQuestionnaireSubmission(ID: \"").concat(submissionID, "\", QuestionID: \"").concat(questionID, "\", AnswerData: \"").concat(answerDataStr, "\") {\n  ID\n  AnswerData\n}");
                  mutations.push(singleQuery);
                }

                query = "\nmutation {\n  ".concat(mutations.join("\n"), "\n}\n");
                _context5.next = 8;
                return _utils_GraphQLRequestHelper__WEBPACK_IMPORTED_MODULE_0__["default"].request({
                  query: query,
                  csrfToken: csrfToken
                });

              case 8:
                json = _context5.sent;
                updatedData = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(json, "data", null);

                if (updatedData) {
                  _context5.next = 12;
                  break;
                }

                throw _constants_errors__WEBPACK_IMPORTED_MODULE_2__["DEFAULT_NETWORK_ERROR"];

              case 12:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5);
      }));

      function batchUpdateSubmissionData(_x5) {
        return _batchUpdateSubmissionData.apply(this, arguments);
      }

      return batchUpdateSubmissionData;
    }()
  }, {
    key: "submitQuestionnaire",
    value: function () {
      var _submitQuestionnaire = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee6(argument) {
        var _argument4, submissionID, csrfToken, query, json, status, uuid;

        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _argument4 = _objectSpread({}, argument), submissionID = _argument4.submissionID, csrfToken = _argument4.csrfToken;
                query = "\nmutation {\n updateQuestionnaireStatusToSubmitted(ID: \"".concat(submissionID, "\") {\n   QuestionnaireStatus\n   UUID\n }\n}");
                _context6.next = 4;
                return _utils_GraphQLRequestHelper__WEBPACK_IMPORTED_MODULE_0__["default"].request({
                  query: query,
                  csrfToken: csrfToken
                });

              case 4:
                json = _context6.sent;
                status = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(json, "data.updateQuestionnaireStatusToSubmitted.QuestionnaireStatus", null));
                uuid = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(json, "data.updateQuestionnaireStatusToSubmitted.UUID", null));

                if (!(!status || !uuid)) {
                  _context6.next = 9;
                  break;
                }

                throw _constants_errors__WEBPACK_IMPORTED_MODULE_2__["DEFAULT_NETWORK_ERROR"];

              case 9:
                return _context6.abrupt("return", {
                  uuid: uuid
                });

              case 10:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6);
      }));

      function submitQuestionnaire(_x6) {
        return _submitQuestionnaire.apply(this, arguments);
      }

      return submitQuestionnaire;
    }()
  }, {
    key: "submitQuestionnaireForApproval",
    value: function () {
      var _submitQuestionnaireForApproval = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee7(argument) {
        var _argument5, submissionID, csrfToken, query, json, status, uuid;

        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _argument5 = _objectSpread({}, argument), submissionID = _argument5.submissionID, csrfToken = _argument5.csrfToken;
                query = "\nmutation {\n updateQuestionnaireStatusToWaitingForSecurityArchitectApproval(ID: \"".concat(submissionID, "\") {\n   QuestionnaireStatus\n   UUID\n }\n}");
                _context7.next = 4;
                return _utils_GraphQLRequestHelper__WEBPACK_IMPORTED_MODULE_0__["default"].request({
                  query: query,
                  csrfToken: csrfToken
                });

              case 4:
                json = _context7.sent;
                status = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(json, "data.updateQuestionnaireStatusToWaitingForSecurityArchitectApproval.QuestionnaireStatus", null));
                uuid = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(json, "data.updateQuestionnaireStatusToWaitingForSecurityArchitectApproval.UUID", null));

                if (!(!status || !uuid)) {
                  _context7.next = 9;
                  break;
                }

                throw _constants_errors__WEBPACK_IMPORTED_MODULE_2__["DEFAULT_NETWORK_ERROR"];

              case 9:
                return _context7.abrupt("return", {
                  uuid: uuid
                });

              case 10:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7);
      }));

      function submitQuestionnaireForApproval(_x7) {
        return _submitQuestionnaireForApproval.apply(this, arguments);
      }

      return submitQuestionnaireForApproval;
    }()
  }, {
    key: "approveQuestionnaireSubmission",
    value: function () {
      var _approveQuestionnaireSubmission = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee8(argument) {
        var _argument6, submissionID, csrfToken, query, json, status, uuid;

        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _argument6 = _objectSpread({}, argument), submissionID = _argument6.submissionID, csrfToken = _argument6.csrfToken;
                query = "\nmutation {\n updateQuestionnaireOnApproveByGroupMember(ID: \"".concat(submissionID, "\") {\n   QuestionnaireStatus\n   UUID\n }\n}");
                _context8.next = 4;
                return _utils_GraphQLRequestHelper__WEBPACK_IMPORTED_MODULE_0__["default"].request({
                  query: query,
                  csrfToken: csrfToken
                });

              case 4:
                json = _context8.sent;
                status = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(json, "data.updateQuestionnaireOnApproveByGroupMember.QuestionnaireStatus", null));
                uuid = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(json, "data.updateQuestionnaireOnApproveByGroupMember.UUID", null));

                if (!(!status || !uuid)) {
                  _context8.next = 9;
                  break;
                }

                throw _constants_errors__WEBPACK_IMPORTED_MODULE_2__["DEFAULT_NETWORK_ERROR"];

              case 9:
                return _context8.abrupt("return", {
                  uuid: uuid
                });

              case 10:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8);
      }));

      function approveQuestionnaireSubmission(_x8) {
        return _approveQuestionnaireSubmission.apply(this, arguments);
      }

      return approveQuestionnaireSubmission;
    }()
  }, {
    key: "denyQuestionnaireSubmission",
    value: function () {
      var _denyQuestionnaireSubmission = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee9(argument) {
        var _argument7, submissionID, csrfToken, query, json, status, uuid;

        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                _argument7 = _objectSpread({}, argument), submissionID = _argument7.submissionID, csrfToken = _argument7.csrfToken;
                query = "\nmutation {\n updateQuestionnaireOnDenyByGroupMember(ID: \"".concat(submissionID, "\") {\n   QuestionnaireStatus\n   UUID\n }\n}");
                _context9.next = 4;
                return _utils_GraphQLRequestHelper__WEBPACK_IMPORTED_MODULE_0__["default"].request({
                  query: query,
                  csrfToken: csrfToken
                });

              case 4:
                json = _context9.sent;
                status = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(json, "data.updateQuestionnaireOnDenyByGroupMember.QuestionnaireStatus", null));
                uuid = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(json, "data.updateQuestionnaireOnDenyByGroupMember.UUID", null));

                if (!(!status || !uuid)) {
                  _context9.next = 9;
                  break;
                }

                throw _constants_errors__WEBPACK_IMPORTED_MODULE_2__["DEFAULT_NETWORK_ERROR"];

              case 9:
                return _context9.abrupt("return", {
                  uuid: uuid
                });

              case 10:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9);
      }));

      function denyQuestionnaireSubmission(_x9) {
        return _denyQuestionnaireSubmission.apply(this, arguments);
      }

      return denyQuestionnaireSubmission;
    }()
  }, {
    key: "editQuestionnaireSubmission",
    value: function () {
      var _editQuestionnaireSubmission = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee10(argument) {
        var _argument8, submissionID, csrfToken, query, json, status, uuid;

        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                _argument8 = _objectSpread({}, argument), submissionID = _argument8.submissionID, csrfToken = _argument8.csrfToken;
                query = "\nmutation {\n updateQuestionnaireStatusToInProgress(ID: \"".concat(submissionID, "\") {\n   QuestionnaireStatus\n   UUID\n }\n}");
                _context10.next = 4;
                return _utils_GraphQLRequestHelper__WEBPACK_IMPORTED_MODULE_0__["default"].request({
                  query: query,
                  csrfToken: csrfToken
                });

              case 4:
                json = _context10.sent;
                status = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(json, "data.updateQuestionnaireStatusToInProgress.QuestionnaireStatus", null));
                uuid = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(json, "data.updateQuestionnaireStatusToInProgress.UUID", null));

                if (!(!status || !uuid)) {
                  _context10.next = 9;
                  break;
                }

                throw _constants_errors__WEBPACK_IMPORTED_MODULE_2__["DEFAULT_NETWORK_ERROR"];

              case 9:
                return _context10.abrupt("return", {
                  uuid: uuid
                });

              case 10:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10);
      }));

      function editQuestionnaireSubmission(_x10) {
        return _editQuestionnaireSubmission.apply(this, arguments);
      }

      return editQuestionnaireSubmission;
    }()
  }]);

  return QuestionnaireDataService;
}();



/***/ }),

/***/ "./src/js/services/QuestionnaireForBusinessOwnerDataService.js":
/*!*********************************************************************!*\
  !*** ./src/js/services/QuestionnaireForBusinessOwnerDataService.js ***!
  \*********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return QuestionnaireForBusinessOwnerDataService; });
/* harmony import */ var _utils_GraphQLRequestHelper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/GraphQLRequestHelper */ "./src/js/utils/GraphQLRequestHelper.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _constants_errors__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../constants/errors */ "./src/js/constants/errors.js");
/* harmony import */ var _utils_QuestionParser__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/QuestionParser */ "./src/js/utils/QuestionParser.js");
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }






var QuestionnaireForBusinessOwnerDataService =
/*#__PURE__*/
function () {
  function QuestionnaireForBusinessOwnerDataService() {
    _classCallCheck(this, QuestionnaireForBusinessOwnerDataService);
  }

  _createClass(QuestionnaireForBusinessOwnerDataService, null, [{
    key: "fetchSubmissionData",
    value: function () {
      var _fetchSubmissionData = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(argument) {
        var _argument, uuid, secureToken, query, json, memberData, submissionJSON, data;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _argument = _objectSpread({}, argument), uuid = _argument.uuid, secureToken = _argument.secureToken;
                query = "\nquery {\n  readQuestionnaireSubmission(UUID: \"".concat(uuid, "\", SecureToken: \"").concat(secureToken, "\") {\n    ID\n    UUID\n    User {\n      ID\n    }\n    SubmitterName,\n    SubmitterRole,\n    SubmitterEmail,\n    QuestionnaireStatus\n    Questionnaire {\n      ID\n      Name\n    }\n    QuestionnaireData\n    AnswerData\n    CisoApprovalStatus\n    BusinessOwnerApprovalStatus\n    SecurityArchitectApprovalStatus\n    IsCurrentUserAnApprover\n    TaskSubmissions {\n      UUID\n      TaskName\n      Status\n    }\n  }\n  readSiteConfig {\n    Title\n  }\n}");
                _context.next = 4;
                return _utils_GraphQLRequestHelper__WEBPACK_IMPORTED_MODULE_0__["default"].request({
                  query: query
                });

              case 4:
                json = _context.sent;
                memberData = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(json, "data.readCurrentMember.0", {});
                submissionJSON = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(json, "data.readQuestionnaireSubmission.0", {});

                if (!(!memberData || !submissionJSON)) {
                  _context.next = 9;
                  break;
                }

                throw _constants_errors__WEBPACK_IMPORTED_MODULE_2__["DEFAULT_NETWORK_ERROR"];

              case 9:
                data = {
                  siteTitle: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(json, "data.readSiteConfig.0.Title", "")),
                  submission: {
                    questionnaireID: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSON, "Questionnaire.ID", "")),
                    questionnaireTitle: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSON, "Questionnaire.Name", "")),
                    submissionID: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSON, "ID", "")),
                    submissionUUID: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSON, "UUID", "")),
                    submitter: {
                      id: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSON, "User.ID")),
                      name: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSON, "SubmitterName", "")),
                      role: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSON, "SubmitterRole", "")),
                      email: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSON, "SubmitterEmail", ""))
                    },
                    status: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSON, "QuestionnaireStatus", "")).toLowerCase().replace("-", "_"),
                    approvalStatus: {
                      chiefInformationSecurityOfficer: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSON, "CisoApprovalStatus", "")),
                      businessOwner: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSON, "BusinessOwnerApprovalStatus", "")),
                      securityArchitect: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSON, "SecurityArchitectApprovalStatus", ""))
                    },
                    questions: _utils_QuestionParser__WEBPACK_IMPORTED_MODULE_3__["default"].parseQuestionsFromJSON({
                      schemaJSON: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSON, "QuestionnaireData", "")),
                      answersJSON: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSON, "AnswerData", ""))
                    }),
                    taskSubmissions: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toArray(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSON, "TaskSubmissions", [])).map(function (item) {
                      var taskSubmission = {
                        uuid: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(item, "UUID", "")),
                        taskName: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(item, "TaskName", "")),
                        status: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(item, "Status", ""))
                      };
                      return taskSubmission;
                    })
                  }
                };
                return _context.abrupt("return", data);

              case 11:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function fetchSubmissionData(_x) {
        return _fetchSubmissionData.apply(this, arguments);
      }

      return fetchSubmissionData;
    }()
  }, {
    key: "approveQuestionnaireSubmission",
    value: function () {
      var _approveQuestionnaireSubmission = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(argument) {
        var _argument2, submissionID, csrfToken, secureToken, query, json, status, uuid;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _argument2 = _objectSpread({}, argument), submissionID = _argument2.submissionID, csrfToken = _argument2.csrfToken, secureToken = _argument2.secureToken;
                query = "\nmutation {\n updateQuestionnaireStatusToApproved(ID: \"".concat(submissionID, "\", SecureToken: \"").concat(secureToken, "\") {\n   QuestionnaireStatus\n   UUID\n }\n}");
                _context2.next = 4;
                return _utils_GraphQLRequestHelper__WEBPACK_IMPORTED_MODULE_0__["default"].request({
                  query: query,
                  csrfToken: csrfToken
                });

              case 4:
                json = _context2.sent;
                status = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(json, "data.updateQuestionnaireStatusToApproved.QuestionnaireStatus", null));
                uuid = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(json, "data.updateQuestionnaireStatusToApproved.UUID", null));

                if (!(!status || !uuid)) {
                  _context2.next = 9;
                  break;
                }

                throw _constants_errors__WEBPACK_IMPORTED_MODULE_2__["DEFAULT_NETWORK_ERROR"];

              case 9:
                return _context2.abrupt("return", {
                  uuid: uuid
                });

              case 10:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      function approveQuestionnaireSubmission(_x2) {
        return _approveQuestionnaireSubmission.apply(this, arguments);
      }

      return approveQuestionnaireSubmission;
    }()
  }, {
    key: "denyQuestionnaireSubmission",
    value: function () {
      var _denyQuestionnaireSubmission = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(argument) {
        var _argument3, submissionID, csrfToken, secureToken, query, json, status, uuid;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _argument3 = _objectSpread({}, argument), submissionID = _argument3.submissionID, csrfToken = _argument3.csrfToken, secureToken = _argument3.secureToken;
                query = "\nmutation {\n updateQuestionnaireStatusToDenied(ID: \"".concat(submissionID, "\", SecureToken: \"").concat(secureToken, "\") {\n   QuestionnaireStatus\n   UUID\n }\n}");
                _context3.next = 4;
                return _utils_GraphQLRequestHelper__WEBPACK_IMPORTED_MODULE_0__["default"].request({
                  query: query,
                  csrfToken: csrfToken
                });

              case 4:
                json = _context3.sent;
                status = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(json, "data.updateQuestionnaireStatusToDenied.QuestionnaireStatus", null));
                uuid = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(json, "data.updateQuestionnaireStatusToDenied.UUID", null));

                if (!(!status || !uuid)) {
                  _context3.next = 9;
                  break;
                }

                throw _constants_errors__WEBPACK_IMPORTED_MODULE_2__["DEFAULT_NETWORK_ERROR"];

              case 9:
                return _context3.abrupt("return", {
                  uuid: uuid
                });

              case 10:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      function denyQuestionnaireSubmission(_x3) {
        return _denyQuestionnaireSubmission.apply(this, arguments);
      }

      return denyQuestionnaireSubmission;
    }()
  }]);

  return QuestionnaireForBusinessOwnerDataService;
}();



/***/ }),

/***/ "./src/js/services/TaskDataService.js":
/*!********************************************!*\
  !*** ./src/js/services/TaskDataService.js ***!
  \********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return TaskDataService; });
/* harmony import */ var _utils_GraphQLRequestHelper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/GraphQLRequestHelper */ "./src/js/utils/GraphQLRequestHelper.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _constants_errors__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../constants/errors */ "./src/js/constants/errors.js");
/* harmony import */ var _utils_QuestionParser__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/QuestionParser */ "./src/js/utils/QuestionParser.js");
/* harmony import */ var _utils_UserParser__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/UserParser */ "./src/js/utils/UserParser.js");
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }







var TaskDataService =
/*#__PURE__*/
function () {
  function TaskDataService() {
    _classCallCheck(this, TaskDataService);
  }

  _createClass(TaskDataService, null, [{
    key: "createTaskSubmissionsForQuestionnaireSubmission",
    value: function () {
      var _createTaskSubmissionsForQuestionnaireSubmission = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(argument) {
        var _argument, questionnaireSubmission, csrfToken, taskIDList, uniqueTaskIDList, mutations, query, json, updatedData;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _argument = _objectSpread({}, argument), questionnaireSubmission = _argument.questionnaireSubmission, csrfToken = _argument.csrfToken; // Find task id list for questionnaire submission

                taskIDList = [];
                questionnaireSubmission.questions.forEach(function (question) {
                  // Only applicable questions can generate task submissions
                  if (!question.isApplicable || !question.hasAnswer) {
                    return;
                  } // Only action question can generate task submissions


                  if (question.type !== "action") {
                    return;
                  } // Action data need to be valid


                  var actions = question.actions;

                  if (!actions || !Array.isArray(actions)) {
                    throw new Error("Invalid questionnaire data, please reload the questionnaire");
                  } // Push task id to the list


                  actions.forEach(function (action) {
                    if (!action.isChose) {
                      return;
                    }

                    var taskID = action.taskID;

                    if (!taskID || Number.parseInt(taskID) <= 0) {
                      return;
                    }

                    taskIDList.push(taskID);
                  });
                });
                uniqueTaskIDList = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.uniq(taskIDList); // Stop if there is no task to create

                if (!(uniqueTaskIDList.length === 0)) {
                  _context.next = 6;
                  break;
                }

                return _context.abrupt("return");

              case 6:
                // Create task submissions in a batch manner
                mutations = [];
                uniqueTaskIDList.forEach(function (taskID) {
                  var query = "\ncreateTaskSubmission".concat(taskID, ": createTaskSubmission(TaskID: \"").concat(taskID, "\", QuestionnaireSubmissionID: \"").concat(questionnaireSubmission.submissionID, "\") {\n  ID\n  UUID\n}");
                  mutations.push(query);
                });
                query = "\nmutation {\n  ".concat(mutations.join("\n"), "\n}");
                _context.next = 11;
                return _utils_GraphQLRequestHelper__WEBPACK_IMPORTED_MODULE_0__["default"].request({
                  query: query,
                  csrfToken: csrfToken
                });

              case 11:
                json = _context.sent;
                updatedData = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(json, "data", null);

                if (updatedData) {
                  _context.next = 15;
                  break;
                }

                throw _constants_errors__WEBPACK_IMPORTED_MODULE_2__["DEFAULT_NETWORK_ERROR"];

              case 15:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function createTaskSubmissionsForQuestionnaireSubmission(_x) {
        return _createTaskSubmissionsForQuestionnaireSubmission.apply(this, arguments);
      }

      return createTaskSubmissionsForQuestionnaireSubmission;
    }()
  }, {
    key: "fetchTaskSubmissionState",
    value: function () {
      var _fetchTaskSubmissionState = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(uuid) {
        var query, responseJSONObject, currentMemberJSONObject, submissionJSONObject, data;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                query = "\nquery {\n  readSiteConfig {\n    Title\n  }\n  readCurrentMember {\n    ID\n    Email\n    FirstName\n    Surname\n    UserRole\n  }\n  readTaskSubmission(UUID: \"".concat(uuid, "\") {\n    ID\n    UUID\n    TaskName\n    Status\n    Result\n    QuestionnaireSubmission {\n      UUID\n    }\n    QuestionnaireData\n    AnswerData\n  }\n}");
                _context2.next = 3;
                return _utils_GraphQLRequestHelper__WEBPACK_IMPORTED_MODULE_0__["default"].request({
                  query: query
                });

              case 3:
                responseJSONObject = _context2.sent;
                currentMemberJSONObject = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(responseJSONObject, "data.readCurrentMember.0", {});
                submissionJSONObject = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(responseJSONObject, "data.readTaskSubmission.0", {});

                if (!(!currentMemberJSONObject || !submissionJSONObject)) {
                  _context2.next = 8;
                  break;
                }

                throw _constants_errors__WEBPACK_IMPORTED_MODULE_2__["DEFAULT_NETWORK_ERROR"];

              case 8:
                data = {
                  siteTitle: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(responseJSONObject, "data.readSiteConfig.0.Title", "")),
                  currentUser: _utils_UserParser__WEBPACK_IMPORTED_MODULE_4__["default"].parseUserFromJSON(currentMemberJSONObject),
                  taskSubmission: {
                    id: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSONObject, "ID", "")),
                    uuid: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSONObject, "UUID", "")),
                    taskName: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSONObject, "TaskName", "")),
                    status: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSONObject, "Status", "")),
                    result: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSONObject, "Result", "")),
                    questionnaireSubmissionUUID: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSONObject, "QuestionnaireSubmission.UUID", "")),
                    questions: _utils_QuestionParser__WEBPACK_IMPORTED_MODULE_3__["default"].parseQuestionsFromJSON({
                      schemaJSON: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSONObject, "QuestionnaireData", "")),
                      answersJSON: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSONObject, "AnswerData", ""))
                    })
                  }
                };
                return _context2.abrupt("return", data);

              case 10:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      function fetchTaskSubmissionState(_x2) {
        return _fetchTaskSubmissionState.apply(this, arguments);
      }

      return fetchTaskSubmissionState;
    }()
  }, {
    key: "batchUpdateTaskSubmissionData",
    value: function () {
      var _batchUpdateTaskSubmissionData = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(argument) {
        var _argument2, uuid, questionIDList, answerDataList, csrfToken, mutations, index, questionID, answerData, answerDataStr, singleQuery, query, json, updatedData;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _argument2 = _objectSpread({}, argument), uuid = _argument2.uuid, questionIDList = _argument2.questionIDList, answerDataList = _argument2.answerDataList, csrfToken = _argument2.csrfToken;

                if (!(questionIDList.length !== answerDataList.length)) {
                  _context3.next = 3;
                  break;
                }

                throw _constants_errors__WEBPACK_IMPORTED_MODULE_2__["DEFAULT_NETWORK_ERROR"];

              case 3:
                mutations = [];

                for (index = 0; index < questionIDList.length; index++) {
                  questionID = questionIDList[index];
                  answerData = answerDataList[index];
                  answerDataStr = window.btoa(JSON.stringify(answerData));
                  singleQuery = "\nupdateQuestion".concat(questionID, ": updateTaskSubmission(UUID: \"").concat(uuid, "\", QuestionID: \"").concat(questionID, "\", AnswerData: \"").concat(answerDataStr, "\") {\n  UUID\n  Status\n}");
                  mutations.push(singleQuery);
                }

                query = "\nmutation {\n  ".concat(mutations.join("\n"), "\n}\n");
                _context3.next = 8;
                return _utils_GraphQLRequestHelper__WEBPACK_IMPORTED_MODULE_0__["default"].request({
                  query: query,
                  csrfToken: csrfToken
                });

              case 8:
                json = _context3.sent;
                updatedData = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(json, "data", null);

                if (updatedData) {
                  _context3.next = 12;
                  break;
                }

                throw _constants_errors__WEBPACK_IMPORTED_MODULE_2__["DEFAULT_NETWORK_ERROR"];

              case 12:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      function batchUpdateTaskSubmissionData(_x3) {
        return _batchUpdateTaskSubmissionData.apply(this, arguments);
      }

      return batchUpdateTaskSubmissionData;
    }()
  }, {
    key: "completeTaskSubmission",
    value: function () {
      var _completeTaskSubmission = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(argument) {
        var _argument3, uuid, result, csrfToken, query, json;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _argument3 = _objectSpread({}, argument), uuid = _argument3.uuid, result = _argument3.result, csrfToken = _argument3.csrfToken;
                query = "\nmutation {\n completeTaskSubmission(UUID: \"".concat(uuid, "\", Result: \"").concat(result, "\") {\n   UUID\n   Status\n }\n}");
                _context4.next = 4;
                return _utils_GraphQLRequestHelper__WEBPACK_IMPORTED_MODULE_0__["default"].request({
                  query: query,
                  csrfToken: csrfToken
                });

              case 4:
                json = _context4.sent;

                if (lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(json, "data.completeTaskSubmission.UUID", null)) {
                  _context4.next = 7;
                  break;
                }

                throw _constants_errors__WEBPACK_IMPORTED_MODULE_2__["DEFAULT_NETWORK_ERROR"];

              case 7:
                return _context4.abrupt("return", {
                  uuid: uuid
                });

              case 8:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      }));

      function completeTaskSubmission(_x4) {
        return _completeTaskSubmission.apply(this, arguments);
      }

      return completeTaskSubmission;
    }()
  }, {
    key: "editTaskSubmission",
    value: function () {
      var _editTaskSubmission = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee5(argument) {
        var _argument4, uuid, csrfToken, query, json;

        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _argument4 = _objectSpread({}, argument), uuid = _argument4.uuid, csrfToken = _argument4.csrfToken;
                query = "\nmutation {\n editTaskSubmission(UUID: \"".concat(uuid, "\") {\n   UUID\n   Status\n }\n}");
                _context5.next = 4;
                return _utils_GraphQLRequestHelper__WEBPACK_IMPORTED_MODULE_0__["default"].request({
                  query: query,
                  csrfToken: csrfToken
                });

              case 4:
                json = _context5.sent;

                if (lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(json, "data.editTaskSubmission.UUID", null)) {
                  _context5.next = 7;
                  break;
                }

                throw _constants_errors__WEBPACK_IMPORTED_MODULE_2__["DEFAULT_NETWORK_ERROR"];

              case 7:
                return _context5.abrupt("return", {
                  uuid: uuid
                });

              case 8:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5);
      }));

      function editTaskSubmission(_x5) {
        return _editTaskSubmission.apply(this, arguments);
      }

      return editTaskSubmission;
    }()
  }]);

  return TaskDataService;
}();



/***/ }),

/***/ "./src/js/services/TaskForBusinessOwnerDataService.js":
/*!************************************************************!*\
  !*** ./src/js/services/TaskForBusinessOwnerDataService.js ***!
  \************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return TaskForBusinessOwnerDataService; });
/* harmony import */ var _utils_GraphQLRequestHelper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/GraphQLRequestHelper */ "./src/js/utils/GraphQLRequestHelper.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _constants_errors__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../constants/errors */ "./src/js/constants/errors.js");
/* harmony import */ var _utils_QuestionParser__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/QuestionParser */ "./src/js/utils/QuestionParser.js");
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }






var TaskForBusinessOwnerDataService =
/*#__PURE__*/
function () {
  function TaskForBusinessOwnerDataService() {
    _classCallCheck(this, TaskForBusinessOwnerDataService);
  }

  _createClass(TaskForBusinessOwnerDataService, null, [{
    key: "fetchTaskSubmissionData",
    value: function () {
      var _fetchTaskSubmissionData = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(argument) {
        var _argument, uuid, token, query, responseJSONObject, submissionJSONObject, data;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _argument = _objectSpread({}, argument), uuid = _argument.uuid, token = _argument.token;
                query = "\nquery {\n  readSiteConfig {\n    Title\n  }\n  readTaskSubmission(UUID: \"".concat(uuid, "\", SecureToken: \"").concat(token, "\") {\n    ID\n    UUID\n    TaskName\n    Status\n    Result\n    QuestionnaireSubmission {\n      UUID\n    }\n    QuestionnaireData\n    AnswerData\n  }\n}");
                _context.next = 4;
                return _utils_GraphQLRequestHelper__WEBPACK_IMPORTED_MODULE_0__["default"].request({
                  query: query
                });

              case 4:
                responseJSONObject = _context.sent;
                submissionJSONObject = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(responseJSONObject, "data.readTaskSubmission.0", {});

                if (submissionJSONObject) {
                  _context.next = 8;
                  break;
                }

                throw _constants_errors__WEBPACK_IMPORTED_MODULE_2__["DEFAULT_NETWORK_ERROR"];

              case 8:
                data = {
                  siteTitle: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(responseJSONObject, "data.readSiteConfig.0.Title", "")),
                  taskSubmission: {
                    id: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSONObject, "ID", "")),
                    uuid: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSONObject, "UUID", "")),
                    taskName: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSONObject, "TaskName", "")),
                    status: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSONObject, "Status", "")),
                    result: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSONObject, "Result", "")),
                    questionnaireSubmissionUUID: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSONObject, "QuestionnaireSubmission.UUID", "")),
                    questions: _utils_QuestionParser__WEBPACK_IMPORTED_MODULE_3__["default"].parseQuestionsFromJSON({
                      schemaJSON: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSONObject, "QuestionnaireData", "")),
                      answersJSON: lodash__WEBPACK_IMPORTED_MODULE_1___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.get(submissionJSONObject, "AnswerData", ""))
                    })
                  }
                };
                return _context.abrupt("return", data);

              case 10:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function fetchTaskSubmissionData(_x) {
        return _fetchTaskSubmissionData.apply(this, arguments);
      }

      return fetchTaskSubmissionData;
    }()
  }]);

  return TaskForBusinessOwnerDataService;
}();



/***/ }),

/***/ "./src/js/store/store.js":
/*!*******************************!*\
  !*** ./src/js/store/store.js ***!
  \*******************************/
/*! exports provided: store, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "store", function() { return store; });
/* harmony import */ var redux__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! redux */ "./node_modules/redux/es/redux.js");
/* harmony import */ var redux_thunk__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! redux-thunk */ "./node_modules/redux-thunk/es/index.js");
/* harmony import */ var redux_logger__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! redux-logger */ "./node_modules/redux-logger/dist/redux-logger.js");
/* harmony import */ var redux_logger__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(redux_logger__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _reducers_rootState__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../reducers/rootState */ "./src/js/reducers/rootState.js");
/* harmony import */ var redux_devtools_extension__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! redux-devtools-extension */ "./node_modules/redux-devtools-extension/index.js");
/* harmony import */ var redux_devtools_extension__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(redux_devtools_extension__WEBPACK_IMPORTED_MODULE_4__);





var middleware = [redux_thunk__WEBPACK_IMPORTED_MODULE_1__["default"]];

if (true) {
  middleware.push(Object(redux_logger__WEBPACK_IMPORTED_MODULE_2__["createLogger"])({
    diff: true,
    collapsed: true
  }));
}

var store = Object(redux__WEBPACK_IMPORTED_MODULE_0__["createStore"])(_reducers_rootState__WEBPACK_IMPORTED_MODULE_3__["default"], Object(redux_devtools_extension__WEBPACK_IMPORTED_MODULE_4__["composeWithDevTools"])(redux__WEBPACK_IMPORTED_MODULE_0__["applyMiddleware"].apply(void 0, middleware)));
/* harmony default export */ __webpack_exports__["default"] = (store);

/***/ }),

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
/* harmony import */ var _URLUtil__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./URLUtil */ "./src/js/utils/URLUtil.js");
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
      regeneratorRuntime.mark(function _callee(argument) {
        var _argument, query, variables, csrfToken, headers, data, inst, response, json, errorMessage;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _argument = _objectSpread({}, argument), query = _argument.query, variables = _argument.variables, csrfToken = _argument.csrfToken;
                headers = {};

                if (csrfToken) {
                  headers["X-CSRF-TOKEN"] = csrfToken;
                }

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
                _context.next = 7;
                return inst.request();

              case 7:
                response = _context.sent;
                json = response.data; // Deal with common error

                errorMessage = lodash__WEBPACK_IMPORTED_MODULE_2___default.a.get(json, "errors.0.message", null);

                if (!errorMessage) {
                  _context.next = 13;
                  break;
                }

                // Check auth error
                // TODO: need a better way to identify the auth error (e.g, ERROR_CODE)
                if (errorMessage === "Please log in first...") {
                  _URLUtil__WEBPACK_IMPORTED_MODULE_3__["default"].redirectToLogin();
                }

                throw new Error(errorMessage);

              case 13:
                return _context.abrupt("return", json);

              case 14:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function request(_x) {
        return _request.apply(this, arguments);
      }

      return request;
    }()
  }]);

  return GraphQLRequestHelper;
}();



/***/ }),

/***/ "./src/js/utils/PDFUtil.js":
/*!*********************************!*\
  !*** ./src/js/utils/PDFUtil.js ***!
  \*********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return PDFUtil; });
/* harmony import */ var pdfmake_build_pdfmake__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! pdfmake/build/pdfmake */ "./node_modules/pdfmake/build/pdfmake.js");
/* harmony import */ var pdfmake_build_pdfmake__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(pdfmake_build_pdfmake__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var pdfmake_build_vfs_fonts__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! pdfmake/build/vfs_fonts */ "./node_modules/pdfmake/build/vfs_fonts.js");
/* harmony import */ var pdfmake_build_vfs_fonts__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(pdfmake_build_vfs_fonts__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _StringUtil__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./StringUtil */ "./src/js/utils/StringUtil.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _img_PDF_heading_jpg__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../img/PDF/heading.jpg */ "./src/img/PDF/heading.jpg");
/* harmony import */ var _img_PDF_heading_jpg__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_img_PDF_heading_jpg__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _img_PDF_footer_jpg__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../img/PDF/footer.jpg */ "./src/img/PDF/footer.jpg");
/* harmony import */ var _img_PDF_footer_jpg__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_img_PDF_footer_jpg__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! moment */ "./node_modules/moment/moment.js");
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_7__);
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }










function getImageDataByBlob(_x) {
  return _getImageDataByBlob.apply(this, arguments);
}

function _getImageDataByBlob() {
  _getImageDataByBlob = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3(blob) {
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            return _context3.abrupt("return", new Promise(function (resolve) {
              var reader = new FileReader();
              reader.addEventListener("load", function (event) {
                resolve(event.target.result);
              });
              reader.readAsDataURL(blob);
            }));

          case 1:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _getImageDataByBlob.apply(this, arguments);
}

function getImageDataByURL(_x2) {
  return _getImageDataByURL.apply(this, arguments);
}

function _getImageDataByURL() {
  _getImageDataByURL = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee4(imageURL) {
    var response, blob, data;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return fetch(imageURL);

          case 2:
            response = _context4.sent;
            _context4.next = 5;
            return response.blob();

          case 5:
            blob = _context4.sent;
            _context4.next = 8;
            return getImageDataByBlob(blob);

          case 8:
            data = _context4.sent;
            return _context4.abrupt("return", data);

          case 10:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _getImageDataByURL.apply(this, arguments);
}

var PDFUtil =
/*#__PURE__*/
function () {
  function PDFUtil() {
    _classCallCheck(this, PDFUtil);
  }

  _createClass(PDFUtil, null, [{
    key: "generatePDF",
    value: function () {
      var _generatePDF = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(args) {
        var _args, questions, submitter, questionnaireTitle, siteTitle, defaultFontSize, content, styles, defaultStyle, info, vfs, headingImageData, footerImageData;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _args = _objectSpread({}, args), questions = _args.questions, submitter = _args.submitter, questionnaireTitle = _args.questionnaireTitle, siteTitle = _args.siteTitle;
                defaultFontSize = 12;
                content = [];
                styles = {
                  questionnaireTitle: {
                    bold: true,
                    fontSize: defaultFontSize + 4,
                    color: "#004071",
                    alignment: "center"
                  },
                  siteTitle: {
                    bold: true,
                    fontSize: defaultFontSize,
                    color: "#004071",
                    alignment: "center"
                  },
                  sectionHeading: {
                    bold: true,
                    fontSize: defaultFontSize + 2,
                    color: "#004071"
                  },
                  questionHeading: {
                    bold: true
                  }
                };
                defaultStyle = {
                  fontSize: defaultFontSize
                };
                info = {
                  title: "".concat(questionnaireTitle, " - ").concat(submitter.name)
                };
                vfs = pdfmake_build_vfs_fonts__WEBPACK_IMPORTED_MODULE_1___default.a.pdfMake.vfs;
                pdfmake_build_pdfmake__WEBPACK_IMPORTED_MODULE_0___default.a.vfs = vfs; // Heading image

                _context.next = 10;
                return getImageDataByURL(_img_PDF_heading_jpg__WEBPACK_IMPORTED_MODULE_5___default.a);

              case 10:
                headingImageData = _context.sent;
                content.push({
                  image: headingImageData,
                  width: 500,
                  // Page size A4 in 72 dpi (web) = 595 X 842 pixels,
                  margin: [0, 0, 0, defaultFontSize]
                }); // Questionnaire title

                content.push({
                  text: questionnaireTitle,
                  style: "questionnaireTitle",
                  margin: [0, 0, 0, defaultFontSize / 2]
                }); // Site title

                content.push({
                  text: siteTitle,
                  style: "siteTitle",
                  margin: [0, 0, 0, defaultFontSize * 2]
                }); // Submitter info

                content.push({
                  text: "Submitted by:",
                  style: "sectionHeading",
                  margin: [0, 0, 0, defaultFontSize]
                });
                content.push({
                  text: "Name: ".concat(submitter.name),
                  style: "questionHeading",
                  margin: [0, 0, 0, defaultFontSize / 2]
                });
                content.push({
                  text: "Role: ".concat(submitter.role),
                  margin: [0, 0, 0, defaultFontSize / 2]
                });
                content.push({
                  text: "Email: ".concat(submitter.email),
                  margin: [0, 0, 0, defaultFontSize * 2]
                }); // Response heading

                content.push({
                  text: "Responses",
                  style: "sectionHeading",
                  margin: [0, 0, 0, defaultFontSize]
                }); // Questions

                questions.forEach(function (question, index) {
                  // Heading of questions
                  content.push({
                    text: "".concat(index + 1, ". ").concat(question.heading),
                    style: "questionHeading",
                    margin: [0, 0, 0, defaultFontSize / 2]
                  }); // Non-applicable questions

                  if (!question.isApplicable) {
                    content.push({
                      text: "(Not applicable)",
                      margin: [0, 0, 0, defaultFontSize]
                    });
                    return;
                  } // Empty-answer questions


                  if (!question.hasAnswer) {
                    content.push({
                      text: "(Has no answer)",
                      margin: [0, 0, 0, defaultFontSize]
                    });
                    return;
                  } // Input-type questions


                  if (question.type === "input" && question.inputs && Array.isArray(question.inputs) && question.inputs.length > 0) {
                    var renderInputData = function renderInputData(input) {
                      var data = input.data || ""; // Format data

                      if (input.type === "date") {
                        data = moment__WEBPACK_IMPORTED_MODULE_7___default()(data).format("DD-MM-YYYY");
                      } // Format textarea


                      if (input.type === "textarea") {
                        data = "\n" + data;
                      }

                      return data;
                    }; // For multiple-inputs question, display their labels


                    if (question.inputs.length > 1) {
                      question.inputs.forEach(function (input, index, arr) {
                        var isLast = index === arr.length - 1;
                        content.push({
                          text: "".concat(input.label, ": ").concat(_StringUtil__WEBPACK_IMPORTED_MODULE_3__["default"].toString(renderInputData(input))),
                          margin: [0, 0, 0, isLast ? defaultFontSize : parseInt("".concat(defaultFontSize / 3))]
                        });
                      });
                      return;
                    } // For single-input question, display its answer directly


                    content.push({
                      text: renderInputData(question.inputs[0]).trim(),
                      margin: [0, 0, 0, defaultFontSize]
                    });
                    return;
                  } // Action-type questions


                  if (question.type === "action" && question.actions && Array.isArray(question.actions)) {
                    var action = lodash__WEBPACK_IMPORTED_MODULE_4___default.a.head(question.actions.filter(function (action) {
                      return action.isChose;
                    }));

                    content.push({
                      text: action.label,
                      margin: [0, 0, 0, defaultFontSize]
                    });
                  }
                }); // Footer

                _context.next = 22;
                return getImageDataByURL(_img_PDF_footer_jpg__WEBPACK_IMPORTED_MODULE_6___default.a);

              case 22:
                footerImageData = _context.sent;
                content.push({
                  image: footerImageData,
                  width: 500,
                  margin: [0, 0, 0, defaultFontSize]
                });
                _context.prev = 24;
                _context.next = 27;
                return pdfmake_build_pdfmake__WEBPACK_IMPORTED_MODULE_0___default.a.createPdf({
                  info: info,
                  content: content,
                  styles: styles,
                  defaultStyle: defaultStyle
                }).download(info.title);

              case 27:
                _context.next = 32;
                break;

              case 29:
                _context.prev = 29;
                _context.t0 = _context["catch"](24);
                alert("Can't download PDF, please disable AdBlock!");

              case 32:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[24, 29]]);
      }));

      function generatePDF(_x3) {
        return _generatePDF.apply(this, arguments);
      }

      return generatePDF;
    }()
  }, {
    key: "blobToDataURL",
    value: function () {
      var _blobToDataURL = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(blob) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                return _context2.abrupt("return", new Promise(function (resolve) {
                  var reader = new FileReader();

                  reader.onload = function (event) {
                    resolve(event.target.result);
                  };

                  reader.readAsDataURL(blob);
                }));

              case 1:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      function blobToDataURL(_x4) {
        return _blobToDataURL.apply(this, arguments);
      }

      return blobToDataURL;
    }()
  }]);

  return PDFUtil;
}();



/***/ }),

/***/ "./src/js/utils/QuestionParser.js":
/*!****************************************!*\
  !*** ./src/js/utils/QuestionParser.js ***!
  \****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return QuestionParser; });
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _constants_errors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants/errors */ "./src/js/constants/errors.js");
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }




function parseAnswersFromJSON(answersJSON) {
  if (!answersJSON) {
    return {};
  }

  var jsonObject = JSON.parse(answersJSON);
  var answers = {};

  if (jsonObject) {
    lodash__WEBPACK_IMPORTED_MODULE_0___default.a.keys(jsonObject).forEach(function (key) {
      answers[lodash__WEBPACK_IMPORTED_MODULE_0___default.a.toString(key)] = jsonObject[key];
    });
  }

  return answers;
}

function parseSchemaFromJSON(schemaJSON) {
  var schema = JSON.parse(schemaJSON);

  if (!schema || !Array.isArray(schema)) {
    throw _constants_errors__WEBPACK_IMPORTED_MODULE_1__["DEFAULT_PARSE_ERROR"];
  }

  return schema;
}

function findCurrentQuestionID(answers) {
  var currentQuestionID = "";

  lodash__WEBPACK_IMPORTED_MODULE_0___default.a.keys(answers).forEach(function (questionID) {
    var answer = answers[questionID];

    if (!currentQuestionID && Boolean(lodash__WEBPACK_IMPORTED_MODULE_0___default.a.get(answer, "isCurrent", false))) {
      currentQuestionID = questionID;
    }
  });

  return currentQuestionID;
}

var QuestionParser =
/*#__PURE__*/
function () {
  function QuestionParser() {
    _classCallCheck(this, QuestionParser);
  }

  _createClass(QuestionParser, null, [{
    key: "parseQuestionsFromJSON",
    value: function parseQuestionsFromJSON(argument) {
      var _argument = _objectSpread({}, argument),
          schemaJSON = _argument.schemaJSON,
          answersJSON = _argument.answersJSON;

      var schema = parseSchemaFromJSON(schemaJSON);
      var answers = parseAnswersFromJSON(answersJSON);
      var currentQuestionID = findCurrentQuestionID(answers);
      return schema.map(function (questionSchema, schemaIndex) {
        var questionID = lodash__WEBPACK_IMPORTED_MODULE_0___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_0___default.a.get(questionSchema, "ID", ""));

        var hasAnswer = Boolean(lodash__WEBPACK_IMPORTED_MODULE_0___default.a.get(answers, "".concat(questionID, ".hasAnswer"), false));
        var isApplicable = Boolean(lodash__WEBPACK_IMPORTED_MODULE_0___default.a.get(answers, "".concat(questionID, ".isApplicable"), true)); // Mark the question as the current one if it is
        // Otherwise the first question will be the current one by default

        var isCurrent = false;

        if (currentQuestionID) {
          isCurrent = currentQuestionID === questionID;
        } else {
          isCurrent = schemaIndex === 0;
        }

        var inputs = null;
        var actions = null;
        var inputAnswers = hasAnswer ? lodash__WEBPACK_IMPORTED_MODULE_0___default.a.get(answers, "".concat(questionID, ".inputs"), []) : [];
        var actionAnswers = hasAnswer ? lodash__WEBPACK_IMPORTED_MODULE_0___default.a.get(answers, "".concat(questionID, ".actions"), []) : [];

        var inputSchemas = lodash__WEBPACK_IMPORTED_MODULE_0___default.a.get(questionSchema, "AnswerInputFields", []);

        var actionSchemas = lodash__WEBPACK_IMPORTED_MODULE_0___default.a.get(questionSchema, "AnswerActionFields", []);

        if (inputSchemas && Array.isArray(inputSchemas) && inputSchemas.length > 0) {
          inputs = inputSchemas.map(function (inputSchema) {
            // Schema of input
            var type = lodash__WEBPACK_IMPORTED_MODULE_0___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_0___default.a.get(inputSchema, "InputType", "")).toLowerCase();

            var validTypes = ["text", "email", "textarea", "date", "url"];

            if (!validTypes.includes(type)) {
              type = "text";
            }

            var inputID = lodash__WEBPACK_IMPORTED_MODULE_0___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_0___default.a.get(inputSchema, "ID", ""));

            var input = {
              id: inputID,
              label: lodash__WEBPACK_IMPORTED_MODULE_0___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_0___default.a.get(inputSchema, "Label", "")),
              type: type,
              required: Boolean(lodash__WEBPACK_IMPORTED_MODULE_0___default.a.get(inputSchema, "Required", false)),
              minLength: Number.parseInt(lodash__WEBPACK_IMPORTED_MODULE_0___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_0___default.a.get(inputSchema, "MinLength", 0))),
              placeholder: lodash__WEBPACK_IMPORTED_MODULE_0___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_0___default.a.get(inputSchema, "PlaceHolder", "")),
              data: null
            }; // Data of input

            if (inputAnswers && Array.isArray(inputAnswers) && inputAnswers.length > 0) {
              var answer = lodash__WEBPACK_IMPORTED_MODULE_0___default.a.head(inputAnswers.filter(function (answer) {
                return answer.id === inputID;
              }));

              if (answer) {
                var inputData = lodash__WEBPACK_IMPORTED_MODULE_0___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_0___default.a.get(answer, "data", null));

                if (inputData) {
                  input.data = inputData;
                }
              }
            }

            return input;
          });
        }

        if (actionSchemas && Array.isArray(actionSchemas) && actionSchemas.length > 0) {
          actions = actionSchemas.map(function (actionSchema) {
            // Schema of action
            var type = lodash__WEBPACK_IMPORTED_MODULE_0___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_0___default.a.get(actionSchema, "ActionType", "")).toLowerCase();

            var validTypes = ["continue", "goto", "message", "finish"];

            if (!validTypes.includes(type)) {
              type = "continue";
            }

            var actionID = lodash__WEBPACK_IMPORTED_MODULE_0___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_0___default.a.get(actionSchema, "ID", ""));

            var action = {
              id: actionID,
              label: lodash__WEBPACK_IMPORTED_MODULE_0___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_0___default.a.get(actionSchema, "Label", "")),
              type: type,
              isChose: false
            };

            if (type === "message") {
              action.message = lodash__WEBPACK_IMPORTED_MODULE_0___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_0___default.a.get(actionSchema, "Message", ""));
            }

            if (type === "goto") {
              action.goto = lodash__WEBPACK_IMPORTED_MODULE_0___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_0___default.a.get(actionSchema, "GotoID", ""));
            }

            if (type === "finish") {
              action.result = lodash__WEBPACK_IMPORTED_MODULE_0___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_0___default.a.get(actionSchema, "Result", ""));
            } // Task of action


            var taskID = lodash__WEBPACK_IMPORTED_MODULE_0___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_0___default.a.get(actionSchema, "TaskID", ""));

            action.taskID = taskID; // Data of action

            if (actionAnswers && Array.isArray(actionAnswers) && actionAnswers.length > 0) {
              var answer = lodash__WEBPACK_IMPORTED_MODULE_0___default.a.head(actionAnswers.filter(function (answer) {
                return answer.id === actionID;
              }));

              if (answer) {
                var isChose = Boolean(lodash__WEBPACK_IMPORTED_MODULE_0___default.a.get(answer, "isChose", false));
                action.isChose = isChose;
              }
            }

            return action;
          });
        }

        var question = {
          id: questionID,
          title: lodash__WEBPACK_IMPORTED_MODULE_0___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_0___default.a.get(questionSchema, "Title", "")),
          heading: lodash__WEBPACK_IMPORTED_MODULE_0___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_0___default.a.get(questionSchema, "Question", "")),
          description: lodash__WEBPACK_IMPORTED_MODULE_0___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_0___default.a.get(questionSchema, "Description", "")),
          type: lodash__WEBPACK_IMPORTED_MODULE_0___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_0___default.a.get(questionSchema, "AnswerFieldType", "")).toLowerCase() === "input" ? "input" : "action",
          isCurrent: isCurrent,
          hasAnswer: hasAnswer,
          isApplicable: isApplicable
        };

        if (inputs) {
          question.inputs = inputs;
        }

        if (actions) {
          question.actions = actions;
        }

        return question;
      });
    }
  }]);

  return QuestionParser;
}();



/***/ }),

/***/ "./src/js/utils/StringUtil.js":
/*!************************************!*\
  !*** ./src/js/utils/StringUtil.js ***!
  \************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return StringUtil; });
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var StringUtil =
/*#__PURE__*/
function () {
  function StringUtil() {
    _classCallCheck(this, StringUtil);
  }

  _createClass(StringUtil, null, [{
    key: "toString",
    value: function toString(any) {
      if (!any) {
        return "";
      }

      return "".concat(any);
    }
  }]);

  return StringUtil;
}();



/***/ }),

/***/ "./src/js/utils/SubmissionDataUtil.js":
/*!********************************************!*\
  !*** ./src/js/utils/SubmissionDataUtil.js ***!
  \********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return SubmissionDataUtil; });
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_0__);
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }



var SubmissionDataUtil =
/*#__PURE__*/
function () {
  function SubmissionDataUtil() {
    _classCallCheck(this, SubmissionDataUtil);
  }

  _createClass(SubmissionDataUtil, null, [{
    key: "transformFromFullQuestionToData",
    value: function transformFromFullQuestionToData(fullQuestion) {
      var answerData = {
        isCurrent: fullQuestion.isCurrent,
        hasAnswer: fullQuestion.hasAnswer,
        isApplicable: fullQuestion.isApplicable,
        answerType: fullQuestion.type
      };

      if (fullQuestion.type === "input" && Array.isArray(fullQuestion.inputs)) {
        answerData.inputs = fullQuestion.inputs.map(function (input) {
          var data = input.data;

          if (data && lodash__WEBPACK_IMPORTED_MODULE_0___default.a.isString(data)) {
            data = data.trim();
          }

          return {
            id: input.id,
            data: data
          };
        });
      }

      if (fullQuestion.type === "action" && Array.isArray(fullQuestion.actions)) {
        answerData.actions = fullQuestion.actions.map(function (action) {
          return {
            id: action.id,
            isChose: action.isChose
          };
        });
      }

      return answerData;
    }
  }, {
    key: "existsUnansweredQuestion",
    value: function existsUnansweredQuestion(questions) {
      var hasUnansweredQuestion = false;
      questions.forEach(function (question) {
        var _question = _objectSpread({}, question),
            hasAnswer = _question.hasAnswer,
            isApplicable = _question.isApplicable; // Invalid question state: does not have answer and still available


        if (!hasAnswer && isApplicable) {
          hasUnansweredQuestion = true;
        }
      });
      return hasUnansweredQuestion;
    }
  }, {
    key: "existsIncompleteTaskSubmission",
    value: function existsIncompleteTaskSubmission(taskSubmissions) {
      var exists = false;
      taskSubmissions.forEach(function (taskSubmission) {
        if (taskSubmission.status === "in_progress") {
          exists = true;
        }
      });
      return exists;
    }
  }, {
    key: "getDataUpdateIntent",
    value: function getDataUpdateIntent(argument) {
      var _argument = _objectSpread({}, argument),
          answeredQuestion = _argument.answeredQuestion,
          questions = _argument.questions;

      var returnPackage = {
        currentIndex: questions.findIndex(function (question) {
          return question.id === answeredQuestion.id;
        }),
        nonApplicableIndexes: [],
        targetIndex: 0,
        complete: false,
        terminate: false,
        result: ""
      }; // Process for input question

      if (answeredQuestion.type === "input") {
        if (returnPackage.currentIndex === questions.length - 1) {
          // Mark complete if this is the last question
          returnPackage.complete = true;
        } else {
          // Move to next question
          returnPackage.targetIndex = returnPackage.currentIndex + 1;
        }

        return returnPackage;
      } // If question is action type, move to the defined target


      if (answeredQuestion.type === "action") {
        if (!answeredQuestion.actions) {
          throw new Error("This question does not have any action!");
        }

        var choseAction = answeredQuestion.actions.find(function (action) {
          return action.isChose;
        });

        if (!choseAction) {
          throw new Error("This question does not have any chosen action!");
        } // "continue" | "goto" | "message" | "finish"


        if (choseAction.type === "finish") {
          // Mark all questions later to be non-applicable
          for (var i = returnPackage.currentIndex + 1; i < questions.length; i++) {
            returnPackage.nonApplicableIndexes.push(i);
          }

          returnPackage.result = choseAction.result || "";
          returnPackage.complete = true;
        }

        if (choseAction.type === "message") {
          returnPackage.terminate = true;
        }

        if (choseAction.type === "continue") {
          returnPackage.targetIndex = returnPackage.currentIndex + 1;
        }

        if (choseAction.type === "goto") {
          // Go to another question, need to mark questions between current and target to be non-applicable
          var targetID = choseAction.goto;
          returnPackage.targetIndex = questions.findIndex(function (question) {
            return question.id === targetID;
          }); // Don't move if the target index is wrong

          if (returnPackage.targetIndex <= returnPackage.currentIndex) {
            throw new Error("The next question is not set correctly!");
          } // Find questions between target and current to be "not applicable"


          if (returnPackage.targetIndex - returnPackage.currentIndex > 1) {
            var cursor = returnPackage.currentIndex + 1;

            while (cursor < returnPackage.targetIndex) {
              returnPackage.nonApplicableIndexes.push(cursor);
              cursor++;
            }
          }
        }

        if (returnPackage.currentIndex === questions.length - 1) {
          // Mark complete if this is the last question
          returnPackage.complete = true;
        }

        return returnPackage;
      }

      throw new Error("Wrong question type!");
    }
  }]);

  return SubmissionDataUtil;
}();



/***/ }),

/***/ "./src/js/utils/URLUtil.js":
/*!*********************************!*\
  !*** ./src/js/utils/URLUtil.js ***!
  \*********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return URLUtil; });
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var URLUtil =
/*#__PURE__*/
function () {
  function URLUtil() {
    _classCallCheck(this, URLUtil);
  }

  _createClass(URLUtil, null, [{
    key: "redirectToQuestionnaireEditing",
    value: function redirectToQuestionnaireEditing(uuid) {
      window.location.href = "/#/questionnaire/submission/".concat(uuid);
    }
  }, {
    key: "redirectToQuestionnaireReview",
    value: function redirectToQuestionnaireReview(uuid) {
      window.location.href = "/#/questionnaire/review/".concat(uuid);
    }
  }, {
    key: "redirectToQuestionnaireSummary",
    value: function redirectToQuestionnaireSummary(uuid) {
      var token = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";

      if (token) {
        window.location.href = "/businessOwnerApproval/#/questionnaire/summary/".concat(uuid, "?token=").concat(token);
        return;
      }

      window.location.href = "/#/questionnaire/summary/".concat(uuid);
    }
  }, {
    key: "redirectToTaskSubmission",
    value: function redirectToTaskSubmission(uuid) {
      var token = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";

      if (token) {
        window.location.href = "/businessOwnerApproval/#/task/submission/".concat(uuid, "?token=").concat(token);
        return;
      }

      window.location.href = "/#/task/submission/".concat(uuid);
    }
  }, {
    key: "redirectToLogout",
    value: function redirectToLogout() {
      window.location.href = "/Security/Logout";
    }
  }, {
    key: "redirectToLogin",
    value: function redirectToLogin() {
      window.location.href = "/Security/login?BackURL=%2F";
    }
  }]);

  return URLUtil;
}();



/***/ }),

/***/ "./src/js/utils/UserParser.js":
/*!************************************!*\
  !*** ./src/js/utils/UserParser.js ***!
  \************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return UserParser; });
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_0__);
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }



var UserParser =
/*#__PURE__*/
function () {
  function UserParser() {
    _classCallCheck(this, UserParser);
  }

  _createClass(UserParser, null, [{
    key: "parseUserFromJSON",
    value: function parseUserFromJSON(userJSON) {
      var jsonObject = typeof userJSON === "string" ? JSON.parse(userJSON) : userJSON;
      return {
        id: lodash__WEBPACK_IMPORTED_MODULE_0___default.a.toString(lodash__WEBPACK_IMPORTED_MODULE_0___default.a.get(jsonObject, "ID")),
        name: "".concat(lodash__WEBPACK_IMPORTED_MODULE_0___default.a.get(jsonObject, "FirstName"), " ").concat(lodash__WEBPACK_IMPORTED_MODULE_0___default.a.get(jsonObject, "Surname")),
        role: lodash__WEBPACK_IMPORTED_MODULE_0___default.a.get(jsonObject, "UserRole"),
        email: lodash__WEBPACK_IMPORTED_MODULE_0___default.a.get(jsonObject, "Email")
      };
    }
  }]);

  return UserParser;
}();



/***/ })

/******/ });
//# sourceMappingURL=main.bundle.js.map