"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.updateUser = exports.getUserByID = exports.profile = exports.logout = exports.login = exports.signUp = void 0;
const config_1 = require("../../config");
const error_middleware_1 = require("../middlewares/error.middleware");
const service_1 = require("../service");
const types_1 = require("../types/types");
const utils_1 = require("../utils");
const jwt_util_1 = require("../utils/jwt.util");
const password_util_1 = require("../utils/password.util");
const response_util_1 = require("../utils/response.util");
const user_validator_1 = __importStar(require("../validator/user.validator"));
exports.signUp = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password, bio } = user_validator_1.default.parse(req.body);
    const [userWithUserName, userWithEmail, hashedPassword] = yield Promise.all([
        service_1.UserService.getUserByEmail(email),
        service_1.UserService.getUserByEmail(email),
        (0, password_util_1.hashPassword)(password),
    ]);
    if (userWithUserName)
        return next(new utils_1.ErrorResponse("User with username already exists", types_1.statusCode.Bad_Request));
    if (userWithEmail)
        return next(new utils_1.ErrorResponse("User with email already exists", types_1.statusCode.Bad_Request));
    const newUser = yield service_1.UserService.createUser({
        username,
        email,
        password: hashedPassword,
        bio,
    });
    const token = (0, jwt_util_1.generateToken)({ id: newUser.id, username, email });
    return res
        .status(types_1.statusCode.Created)
        .cookie("token", token, { sameSite: "strict", maxAge: 60 * 1000 })
        .header("Authorization", `Bearer ${token}`)
        .json({
        success: true,
        message: "User created successfully",
        data: {
            user: newUser,
            token: token
        },
    });
}));
exports.login = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = user_validator_1.loginValidator.parse(req.body);
    const user = yield service_1.UserService.getUserByEmail(email);
    if (!user || !(yield utils_1.Password.verifyPassword(password, user.password))) {
        return next(new utils_1.ErrorResponse("Invalid email or password", types_1.statusCode.Unauthorized));
    }
    const token = (0, jwt_util_1.generateToken)({
        id: user.id,
        username: user.username,
        email: user.email,
    });
    return res
        .status(types_1.statusCode.OK)
        .cookie("token", token, { sameSite: "strict", maxAge: 60 * 1000 })
        .header("Authorization", `Bearer ${token}`)
        .json({
        success: true,
        message: `Welcome back ${user.username}`,
        data: { user, token },
    });
}));
exports.logout = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res
        .clearCookie("token", { sameSite: "strict" })
        .header("Authorization", "")
        .status(types_1.statusCode.OK)
        .json({ success: true, message: "logged out successfully" });
}));
exports.profile = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = Number((_a = req.User) === null || _a === void 0 ? void 0 : _a.id);
    if (!id)
        return next(new utils_1.ErrorResponse("User not found", types_1.statusCode.Unauthorized));
    const me = yield config_1.prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            username: true,
            email: true,
            bio: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return (0, response_util_1.SuccessResponse)(res, "User fetched successfully", me, types_1.statusCode.OK);
}));
exports.getUserByID = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!id || isNaN(id)) {
        return next(new utils_1.ErrorResponse("Invalid or missing user ID", types_1.statusCode.Bad_Request));
    }
    const user = yield config_1.prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            username: true,
            email: true,
            bio: true,
            createdAt: true,
            updatedAt: true,
        }
    });
    return (0, response_util_1.SuccessResponse)(res, "User fetched successfully", user, types_1.statusCode.OK);
}));
exports.updateUser = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = Number((_a = req.User) === null || _a === void 0 ? void 0 : _a.id);
    const bio = req.body.bio;
    if (!id)
        return next(new utils_1.ErrorResponse("User not found", types_1.statusCode.Unauthorized));
    const user = yield config_1.prisma.user.update({
        where: { id },
        data: {
            bio,
        }
    });
    return (0, response_util_1.SuccessResponse)(res, "User updated successfully", user, types_1.statusCode.OK);
}));
