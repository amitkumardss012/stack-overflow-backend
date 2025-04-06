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
exports.answerByUserId = exports.deleteAnswer = exports.getAnswerById = exports.getAnswersByQuestion = exports.createAnswer = void 0;
const config_1 = require("../../config");
const error_middleware_1 = require("../middlewares/error.middleware");
const types_1 = require("../types/types");
const response_util_1 = require("../utils/response.util");
const answer_validator_1 = require("../validator/answer.validator");
exports.createAnswer = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const validatedData = answer_validator_1.AnswerValidator.parse(req.body);
    const questionId = Number(req.params.questionId);
    // Validate questionId
    if (!questionId || isNaN(questionId)) {
        return next(new response_util_1.ErrorResponse("Invalid or missing question ID", types_1.statusCode.Bad_Request));
    }
    // Validate userId
    const userId = Number((_a = req.User) === null || _a === void 0 ? void 0 : _a.id);
    if (!userId || isNaN(userId)) {
        return next(new response_util_1.ErrorResponse("Invalid or missing user ID", types_1.statusCode.Unauthorized));
    }
    // Check if question exists
    const question = yield config_1.prisma.question.findUnique({
        where: { id: questionId },
    });
    if (!question) {
        return next(new response_util_1.ErrorResponse("Question not found", types_1.statusCode.Not_Found));
    }
    // Create the answer with just the userId (no nested user object)
    const answer = yield config_1.prisma.answer.create({
        data: {
            content: validatedData.content,
            userId: userId, // Use the validated number
            questionId: questionId,
        },
        include: {
            user: true, // This will include the user data in the response
        },
    });
    return (0, response_util_1.SuccessResponse)(res, "Answer created successfully", answer, types_1.statusCode.Created);
}));
exports.getAnswersByQuestion = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const questionId = Number(req.params.questionId);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    if (!questionId || isNaN(questionId)) {
        return next(new response_util_1.ErrorResponse("Invalid or missing question ID", types_1.statusCode.Bad_Request));
    }
    const skip = (page - 1) * limit;
    const [answers, total] = yield Promise.all([
        config_1.prisma.answer.findMany({
            where: {
                questionId,
            },
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
            include: {
                user: true,
            },
        }),
        config_1.prisma.answer.count({
            where: {
                questionId,
            },
        }),
    ]);
    if (page > Math.ceil(total / limit) && total > 0) {
        return next(new Error("This page does not exist"));
    }
    if (!answers || answers.length === 0) {
        return (0, response_util_1.SuccessResponse)(res, "No answers found", [], types_1.statusCode.OK);
    }
    return (0, response_util_1.SuccessResponse)(res, "Answers fetched successfully", {
        answers,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        count: answers.length,
    }, types_1.statusCode.OK);
}));
// Get single answer by ID
exports.getAnswerById = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!id || isNaN(id)) {
        return next(new response_util_1.ErrorResponse("Invalid or missing answer ID", types_1.statusCode.Bad_Request));
    }
    const answer = yield config_1.prisma.answer.findUnique({
        where: {
            id,
        },
        include: {
            user: true,
            question: {
                select: {
                    id: true,
                    title: true,
                },
            },
        },
    });
    if (!answer) {
        return next(new response_util_1.ErrorResponse("Answer not found", types_1.statusCode.Not_Found));
    }
    return (0, response_util_1.SuccessResponse)(res, "Answer fetched successfully", answer, types_1.statusCode.OK);
}));
// Delete an answer
exports.deleteAnswer = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = Number(req.params.id);
    if (!id || isNaN(id)) {
        return next(new response_util_1.ErrorResponse("Invalid or missing answer ID", types_1.statusCode.Bad_Request));
    }
    const answer = yield config_1.prisma.answer.findUnique({
        where: { id },
    });
    if (!answer) {
        return next(new response_util_1.ErrorResponse("Answer not found", types_1.statusCode.Not_Found));
    }
    if (answer.userId !== Number((_a = req.User) === null || _a === void 0 ? void 0 : _a.id)) {
        return next(new response_util_1.ErrorResponse("You are not authorized to delete this answer", types_1.statusCode.Forbidden));
    }
    yield config_1.prisma.answer.delete({
        where: { id },
    });
    return (0, response_util_1.SuccessResponse)(res, "Answer deleted successfully", null, types_1.statusCode.OK);
}));
exports.answerByUserId = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = Number(req.params.userId);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    if (!userId || isNaN(userId)) {
        return next(new response_util_1.ErrorResponse("Invalid or missing user ID", types_1.statusCode.Bad_Request));
    }
    const skip = (page - 1) * limit;
    const [answers, total] = yield Promise.all([
        config_1.prisma.answer.findMany({
            where: {
                userId: userId,
            },
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc", // Newest first
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
                question: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        }),
        config_1.prisma.answer.count({
            where: {
                userId: userId,
            },
        }),
    ]);
    // Check if page exceeds available pages
    if (page > Math.ceil(total / limit) && total > 0) {
        return next(new response_util_1.ErrorResponse("This page does not exist", types_1.statusCode.Bad_Request));
    }
    if (!answers || answers.length === 0) {
        return (0, response_util_1.SuccessResponse)(res, "No answers found for this user", [], types_1.statusCode.OK);
    }
    return (0, response_util_1.SuccessResponse)(res, "Answers fetched successfully", {
        answers,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        count: answers.length,
    }, types_1.statusCode.OK);
}));
