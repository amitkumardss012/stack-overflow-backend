import { prisma } from "../../config";
import { asyncHandler } from "../middlewares/error.middleware";
import { statusCode } from "../types/types";
import { ErrorResponse } from "../utils";
import { SuccessResponse } from "../utils/response.util";

import { z } from "zod";

const toggleBookmarkSchema = z.object({
  questionId: z.number().int().positive(),
  userId: z.number().int().positive(),
});

export const toggleBookmark = asyncHandler(async (req, res, next) => {
  const questionId = Number(req.params.questionId);
  const userId = Number(req.User?.id);

  try {
    toggleBookmarkSchema.parse({ questionId, userId });

    const result = await prisma.$transaction(async (tx) => {
      const existingBookmark = await tx.bookmark.findFirst({
        where: {
          userId,
          questionId,
        },
        select: {
          id: true,
        },
      });


      if (existingBookmark) {
        await tx.bookmark.delete({
          where: {
            id: existingBookmark.id,
          },
        });
        return { bookmarked: false, bookmarkId: null };
      } else {
        const question = await tx.question.findUnique({
          where: { id: questionId },
          select: { id: true },
        });

        if (!question) {
          throw new ErrorResponse("Question not found", statusCode.Not_Found);
        }

        const bookmark = await tx.bookmark.create({
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
    });

    return SuccessResponse(
      res,
      result.bookmarked ? "Question bookmarked successfully" : "Bookmark removed successfully",
      {
        bookmarked: result.bookmarked,
        bookmarkId: result.bookmarkId,
      },
      result.bookmarked ? statusCode.Created : statusCode.OK
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(
        new ErrorResponse(
          "Invalid input: " + error.errors[0].message,
          statusCode.Bad_Request
        )
      );
    }
    if (error instanceof ErrorResponse) {
      return next(error);
    }
    return next(
      new ErrorResponse(
        "Failed to toggle bookmark",
        statusCode.Internal_Server_Error
      )
    );
  }
});

export const getAllBookmarks = asyncHandler(async (req, res, next) => {
  const userId = Number(req.params.userId);
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  if (!userId) {
    return next(
      new ErrorResponse("User ID is required", statusCode.Unauthorized)
    );
  }

  const skip = (page - 1) * limit;

  const [bookmarks, total] = await Promise.all([
    prisma.bookmark.findMany({
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

    prisma.bookmark.count({
      where: {
        userId: userId,
      },
    }),
  ]);

  if (page > Math.ceil(total / limit) && total > 0) {
    return next(
      new ErrorResponse("This page does not exist", statusCode.Bad_Request)
    );
  }

  if (!bookmarks || bookmarks.length === 0) {
    return next(new ErrorResponse("No bookmarks found", statusCode.Not_Found));
  }

  return SuccessResponse(
    res,
    "Bookmarks retrieved successfully",
    {
      bookmarks,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
      count: bookmarks.length,
    },
    statusCode.OK
  );
});
