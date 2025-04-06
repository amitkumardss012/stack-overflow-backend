"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Authenticate = void 0;
const service_1 = require("../service");
const types_1 = require("../types/types");
const utils_1 = require("../utils");
const error_middleware_1 = require("./error.middleware");
exports.Authenticate = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    const tokenFromCookie = req.cookies.token;
    const tokenFromHeader = ((_b = (_a = req.headers["authorization"]) === null || _a === void 0 ? void 0 : _a.split("Bearer ")[1]) === null || _b === void 0 ? void 0 : _b.trim()) ||
        ((_d = (_c = req.headers.cookie) === null || _c === void 0 ? void 0 : _c.split("=")[1]) === null || _d === void 0 ? void 0 : _d.trim());
    const tokenFromHeader2 = (_f = (_e = req.headers["authorization"]) === null || _e === void 0 ? void 0 : _e.split("Bearer ")[1]) === null || _f === void 0 ? void 0 : _f.trim();
    const token = tokenFromCookie || tokenFromHeader || tokenFromHeader2;
    if (!token)
        return next(new utils_1.ErrorResponse("Not authorized, token missing", types_1.statusCode.Unauthorized));
    let decoded;
    try {
        decoded = utils_1.Jwt.verifyToken(token);
    }
    catch (error) {
        return next(new utils_1.ErrorResponse("Invalid or expired token", types_1.statusCode.Unauthorized));
    }
    const user = yield service_1.UserService.getUserById(decoded === null || decoded === void 0 ? void 0 : decoded.id);
    if (!user) {
        return next(new utils_1.ErrorResponse("Not authorized, User not found", types_1.statusCode.Unauthorized));
    }
    else {
        req.User = Object.assign(Object.assign({}, user), { id: user.id.toString() });
        next();
    }
}));
