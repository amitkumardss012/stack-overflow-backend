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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.questionByUserId = exports.serachQuestion = exports.deleteQuestion = exports.getQuestionById = exports.GetAllQuestions = exports.AskQuestion = void 0;
const config_1 = require("../../config");
const error_middleware_1 = require("../middlewares/error.middleware");
const types_1 = require("../types/types");
const response_util_1 = require("../utils/response.util");
const question_validator_1 = __importDefault(require("../validator/question.validator"));
exports.AskQuestion = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const validatData = question_validator_1.default.parse(req.body);
    console.log((_a = req.User) === null || _a === void 0 ? void 0 : _a.id);
    const Question = yield config_1.prisma.question.create({
        data: {
            title: validatData.title,
            content: validatData.content,
            userId: Number((_b = req.User) === null || _b === void 0 ? void 0 : _b.id),
        },
    });
    return (0, response_util_1.SuccessResponse)(res, "Question asked successfully", Question, types_1.statusCode.Created);
}));
exports.GetAllQuestions = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const [questions, total] = yield Promise.all([
        config_1.prisma.question.findMany({
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
            include: {
                user: true,
                bookmarks: true,
            },
        }),
        config_1.prisma.question.count(),
    ]);
    if (page > Math.ceil(total / limit) && total > 0) {
        return next(new Error("This page does not exist"));
    }
    if (!questions || questions.length === 0) {
        return (0, response_util_1.SuccessResponse)(res, "No questions found", [], types_1.statusCode.OK);
    }
    return (0, response_util_1.SuccessResponse)(res, "Questions fetched successfully", {
        questions,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        count: questions.length,
    }, types_1.statusCode.OK);
}));
exports.getQuestionById = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!id || isNaN(id))
        return next(new response_util_1.ErrorResponse("Invalid id or Missing id", types_1.statusCode.Bad_Request));
    const question = yield config_1.prisma.question.findUnique({
        where: {
            id,
        },
        include: {
            user: true,
            answers: {
                include: {
                    user: true,
                },
            },
            bookmarks: true,
        },
    });
    if (!question)
        return next(new response_util_1.ErrorResponse("Question not found", types_1.statusCode.Not_Found));
    return (0, response_util_1.SuccessResponse)(res, "Question fetched successfully", question, types_1.statusCode.OK);
}));
exports.deleteQuestion = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = Number(req.params.id);
    if (!id || isNaN(id))
        return next(new response_util_1.ErrorResponse("Invalid id or Missing id", types_1.statusCode.Bad_Request));
    const question = yield config_1.prisma.question.findUnique({
        where: {
            id,
        },
    });
    if (!question)
        return next(new response_util_1.ErrorResponse("Question not found", types_1.statusCode.Not_Found));
    if (question.userId !== Number((_a = req.User) === null || _a === void 0 ? void 0 : _a.id))
        return next(new response_util_1.ErrorResponse("You are not authorized to delete this question", types_1.statusCode.Forbidden));
    yield config_1.prisma.question.delete({
        where: {
            id,
        },
    });
    return (0, response_util_1.SuccessResponse)(res, "Question deleted successfully");
}));
exports.serachQuestion = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const [questions, total] = yield Promise.all([
        config_1.prisma.question.findMany({
            skip,
            take: limit,
            where: {
                OR: [
                    {
                        title: {
                            contains: query,
                        },
                    },
                    {
                        content: {
                            contains: query,
                        },
                    },
                    {
                        user: {
                            username: {
                                contains: query,
                            },
                        },
                    },
                ],
            },
            orderBy: {
                createdAt: "desc", // --> newest first
            },
            include: {
                user: true,
            },
        }),
        config_1.prisma.question.count({
            where: {
                OR: [
                    {
                        title: {
                            contains: query,
                        },
                    },
                    {
                        content: {
                            contains: query,
                        },
                    },
                    {
                        user: {
                            username: {
                                contains: query,
                            },
                        },
                    },
                ],
            },
        }),
    ]);
    if (page > Math.ceil(total / limit) && total > 0) {
        return next(new Error("This page does not exist"));
    }
    if (questions.length === 0) {
        return (0, response_util_1.SuccessResponse)(res, "No questions found", [], types_1.statusCode.OK);
    }
    return (0, response_util_1.SuccessResponse)(res, "Questions fetched successfully", {
        questions,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        count: questions.length,
    }, types_1.statusCode.OK);
}));
exports.questionByUserId = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = Number(req.params.userId);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    if (!userId || isNaN(userId)) {
        return next(new response_util_1.ErrorResponse("Invalid or missing user ID", types_1.statusCode.Bad_Request));
    }
    const skip = (page - 1) * limit;
    const [questions, total] = yield Promise.all([
        config_1.prisma.question.findMany({
            where: {
                userId: userId,
            },
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
                answers: {
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,
                        userId: true,
                    },
                },
                bookmarks: true
            },
        }),
        config_1.prisma.question.count({
            where: {
                userId: userId,
            },
        }),
    ]);
    if (page > Math.ceil(total / limit) && total > 0) {
        return next(new response_util_1.ErrorResponse("This page does not exist", types_1.statusCode.Bad_Request));
    }
    if (!questions || questions.length === 0) {
        return (0, response_util_1.SuccessResponse)(res, "No questions found for this user", [], types_1.statusCode.OK);
    }
    return (0, response_util_1.SuccessResponse)(res, "Questions fetched successfully", {
        questions,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        count: questions.length,
    }, types_1.statusCode.OK);
}));
