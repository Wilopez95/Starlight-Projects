"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useOpenFormWithCloseConfirmation = exports.CloseConfirmationFormTracker = void 0;
var react_1 = __importStar(require("react"));
var lodash_es_1 = require("lodash-es");
var react_final_form_1 = require("react-final-form");
var SidePanels_1 = require("../components/SidePanels");
var Modals_1 = require("../components/Modals");
var YouHaveUnsavedChanges_1 = __importDefault(require("../components/Modal/YouHaveUnsavedChanges"));
var ChangesTrackerContext = react_1.createContext({
    trackingFormProps: [
        'pristine',
        'submitSucceeded',
        'dirtySinceLastSubmit',
        'touched',
        'dirty',
        'submitting',
    ],
    onChange: function () { },
});
ChangesTrackerContext.displayName = 'ChangesTrackerContext';
var CloseConfirmationFormTracker = function () {
    var _a = react_1.useContext(ChangesTrackerContext), trackingFormProps = _a.trackingFormProps, onChange = _a.onChange;
    var formSubscription = react_1.useMemo(function () {
        return trackingFormProps.reduce(function (acc, propName) {
            acc[propName] = true;
            return acc;
        }, {});
    }, [trackingFormProps]);
    return (react_1.default.createElement(react_final_form_1.FormSpy, { subscription: __assign(__assign({}, formSubscription), { values: true }) }, function (formData) {
        var trackingData = trackingFormProps.reduce(function (acc, propName) {
            // @ts-ignore
            acc[propName] = formData[propName];
            return acc;
        }, {});
        onChange(trackingData);
        return null;
    }));
};
exports.CloseConfirmationFormTracker = CloseConfirmationFormTracker;
var useOpenFormWithCloseConfirmation = function (_a) {
    var _b = _a === void 0 ? {} : _a, modal = _b.modal, container = _b.container, _c = _b.stacked, stacked = _c === void 0 ? true : _c, _d = _b.closeOnSubmitted, closeOnSubmitted = _d === void 0 ? true : _d;
    var open = react_1.useCallback(function (_a) {
        var form = _a.form, anchor = _a.anchor, onCloseFn = _a.onClose, _b = _a.checkForChange, checkForChange = _b === void 0 ? function (data) {
            var pristine = data.pristine, _a = data.touched, touched = _a === void 0 ? {} : _a, dirty = data.dirty, submitSucceeded = data.submitSucceeded, submitting = data.submitting;
            var updatedManually = dirty && Object.values(touched).includes(true);
            return !!updatedManually && !pristine && !submitSucceeded && !submitting;
        } : _b;
        var trackingData = {};
        var hasChange = checkForChange;
        var trackerContext = {
            trackingFormProps: [
                'pristine',
                'touched',
                'submitSucceeded',
                'dirtySinceLastSubmit',
                'dirty',
                'submitting',
            ],
            onChange: function (nextTrackingData) {
                trackingData = nextTrackingData;
            },
        };
        var close = function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!modal) return [3 /*break*/, 2];
                        return [4 /*yield*/, Modals_1.closeModal()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, SidePanels_1.closeSidePanel()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        var onClose = function () {
            // resolve to allow close
            return new Promise(function (resolve, reject) {
                if (!hasChange(trackingData)) {
                    resolve();
                    if (onCloseFn) {
                        onCloseFn();
                    }
                    return;
                }
                Modals_1.openModal({
                    content: (react_1.default.createElement(YouHaveUnsavedChanges_1.default, { onCancel: function () {
                            resolve();
                            Modals_1.closeModal();
                            if (onCloseFn) {
                                onCloseFn();
                            }
                        }, onConfirm: function () {
                            reject();
                            Modals_1.closeModal();
                        } })),
                    stacked: true,
                });
            });
        };
        var formComponent = react_1.default.cloneElement(form, __assign(__assign({}, form.props), { onCancel: function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: 
                        // TODO: make closing logic more explicit, atm it's unclear that this hook handles closing UI pop-ups, but it does
                        return [4 /*yield*/, close()];
                        case 1:
                            // TODO: make closing logic more explicit, atm it's unclear that this hook handles closing UI pop-ups, but it does
                            _a.sent();
                            if (lodash_es_1.isFunction(form.props.onCancel)) {
                                form.props.onCancel();
                            }
                            return [2 /*return*/];
                    }
                });
            }); }, onSubmitted: function (values, result) { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!closeOnSubmitted) return [3 /*break*/, 2];
                            return [4 /*yield*/, close()];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            if (lodash_es_1.isFunction(form.props.onSubmitted)) {
                                form.props.onSubmitted(values, result);
                            }
                            return [2 /*return*/];
                    }
                });
            }); }, onChangeStep: function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, onClose()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); } }));
        if (modal) {
            Modals_1.openModal({
                content: (react_1.default.createElement(ChangesTrackerContext.Provider, { value: trackerContext }, formComponent)),
                onClose: onClose,
                stacked: stacked,
            });
            return;
        }
        SidePanels_1.openSidePanel({
            content: (react_1.default.createElement(ChangesTrackerContext.Provider, { value: trackerContext }, formComponent)),
            anchor: anchor,
            onClose: onClose,
            stacked: stacked,
            container: container,
        });
    }, [closeOnSubmitted, modal, stacked, container]);
    return [open];
};
exports.useOpenFormWithCloseConfirmation = useOpenFormWithCloseConfirmation;
//# sourceMappingURL=useOpenFormWithCloseConfirmation.js.map