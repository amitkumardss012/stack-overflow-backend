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
exports.getAllBookmarks = exports.toggleBookmark = void 0;
const config_1 = require("../../config");
const error_middleware_1 = require("../middlewares/error.middleware");
const types_1 = require("../types/types");
const utils_1 = require("../utils");
const response_util_1 = require("../utils/response.util");
const zod_1 = require("zod");
const toggleBookmarkSchema = zod_1.z.object({
    questionId: zod_1.z.number().int().positive(),
    userId: zod_1.z.number().int().positive(),
});
exports.toggleBookmark = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const questionId = Number(req.params.questionId);
    const userId = Number((_a = req.User) === null || _a === void 0 ? void 0 : _a.id);
    try {
        toggleBookmarkSchema.parse({ questionId, userId });
        const result = yield config_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const existingBookmark = yield tx.bookmark.findFirst({
                where: {
                    userId,
                    questionId,
                },
                select: {
                    id: true,
                },
            });
            if (existingBookmark) {
                yield tx.bookmark.delete({
                    where: {
                        id: existingBookmark.id,
                    },
                });
                return { bookmarked: false, bookmarkId: null };
            }
            else {
                const question = yield tx.question.findUnique({
                    where: { id: questionId },
                    select: { id: true },
                });
                if (!question) {
                    throw new utils_1.ErrorResponse("Question not found", types_1.statusCode.Not_Found);
                }
                const bookmark = yield tx.bookmark.create({
                    data: {
                        questionId,
                        userId,
                        isBookmarked: true,
                    },
                    select: {
                        id: true,
                        questionId: true,
                        userId: true,
                        createdAt: true,
                    },
                });
                return { bookmarked: true, bookmarkId: bookmark.id };
            }
        }));
        return (0, response_util_1.SuccessResponse)(res, result.bookmarked ? "Question bookmarked successfully" : "Bookmark removed successfully", {
            bookmarked: result.bookmarked,
            bookmarkId: result.bookmarkId,
        }, result.bookmarked ? types_1.statusCode.Created : types_1.statusCode.OK);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return next(new utils_1.ErrorResponse("Invalid input: " + error.errors[0].message, types_1.statusCode.Bad_Request));
        }
        if (error instanceof utils_1.ErrorResponse) {
            return next(error);
        }
        return next(new utils_1.ErrorResponse("Failed to toggle bookmark", types_1.statusCode.Internal_Server_Error));
    }
}));
exports.getAllBookmarks = (0, error_middleware_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = Number(req.params.userId);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    if (!userId) {
        return next(new utils_1.ErrorResponse("User ID is required", types_1.statusCode.Unauthorized));
    }
    const skip = (page - 1) * limit;
    const [bookmarks, total] = yield Promise.all([
        config_1.prisma.bookmark.findMany({
            take: limit,
            skip,
            where: {
                userId: userId,
            },
            include: {
                question: {
                    include: {
                        user: true,
                        bookmarks: true,
                    }
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        }),
        config_1.prisma.bookmark.count({
            where: {
                userId: userId,
            },
        }),
    ]);
    if (page > Math.ceil(total / limit) && total > 0) {
        return next(new utils_1.ErrorResponse("This page does not exist", types_1.statusCode.Bad_Request));
    }
    if (!bookmarks || bookmarks.length === 0) {
        return next(new utils_1.ErrorResponse("No bookmarks found", types_1.statusCode.Not_Found));
    }
    return (0, response_util_1.SuccessResponse)(res, "Bookmarks retrieved successfully", {
        bookmarks,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        count: bookmarks.length,
    }, types_1.statusCode.OK);
}));
