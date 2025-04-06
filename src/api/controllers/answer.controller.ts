import { prisma } from "../../config";
import { asyncHandler } from "../middlewares/error.middleware";
import { statusCode } from "../types/types";
import { ErrorResponse, SuccessResponse } from "../utils/response.util";
import { AnswerValidator } from "../validator/answer.validator"; 

export const createAnswer = asyncHandler(async (req, res, next) => {
    const validatedData = AnswerValidator.parse(req.body);
    const questionId = Number(req.params.questionId);
  
    // Validate questionId
    if (!questionId || isNaN(questionId)) {
      return next(
        new ErrorResponse("Invalid or missing question ID", statusCode.Bad_Request)
      );
    }
  
    // Validate userId
    const userId = Number(req.User?.id);
    if (!userId || isNaN(userId)) {
      return next(
        new ErrorResponse("Invalid or missing user ID", statusCode.Unauthorized)
      );
    }
  
    // Check if question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });
  
    if (!question) {
      return next(
        new ErrorResponse("Question not found", statusCode.Not_Found)
      );
    }
  
    // Create the answer with just the userId (no nested user object)
    const answer = await prisma.answer.create({
      data: {
        content: validatedData.content,
        userId: userId,  // Use the validated number
        questionId: questionId,
      },
      include: {
        user: true,  // This will include the user data in the response
      },
    });
  
    return SuccessResponse(
      res,
      "Answer created successfully",
      answer,
      statusCode.Created
    );
  });

export const getAnswersByQuestion = asyncHandler(async (req, res, next) => {
  const questionId = Number(req.params.questionId);
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  if (!questionId || isNaN(questionId)) {
    return next(
      new ErrorResponse("Invalid or missing question ID", statusCode.Bad_Request)
    );
  }

  const skip = (page - 1) * limit;
  const [answers, total] = await Promise.all([
    prisma.answer.findMany({
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
    prisma.answer.count({
      where: {
        questionId,
      },
    }),
  ]);

  if (page > Math.ceil(total / limit) && total > 0) {
    return next(new Error("This page does not exist"));
  }

  if (!answers || answers.length === 0) {
    return SuccessResponse(res, "No answers found", [], statusCode.OK);
  }

  return SuccessResponse(
    res,
    "Answers fetched successfully",
    {
      answers,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
      count: answers.length,
    },
    statusCode.OK
  );
});

// Get single answer by ID
export const getAnswerById = asyncHandler(async (req, res, next) => {
  const id = Number(req.params.id);

  if (!id || isNaN(id)) {
    return next(
      new ErrorResponse("Invalid or missing answer ID", statusCode.Bad_Request)
    );
  }

  const answer = await prisma.answer.findUnique({
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
    return next(new ErrorResponse("Answer not found", statusCode.Not_Found));
  }

  return SuccessResponse(
    res,
    "Answer fetched successfully",
    answer,
    statusCode.OK
  );
});

// Delete an answer
export const deleteAnswer = asyncHandler(async (req, res, next) => {
  const id = Number(req.params.id);

  if (!id || isNaN(id)) {
    return next(
      new ErrorResponse("Invalid or missing answer ID", statusCode.Bad_Request)
    );
  }

  const answer = await prisma.answer.findUnique({
    where: { id },
  });

  if (!answer) {
    return next(new ErrorResponse("Answer not found", statusCode.Not_Found));
  }

  if (answer.userId !== Number(req.User?.id)) {
    return next(
      new ErrorResponse(
        "You are not authorized to delete this answer",
        statusCode.Forbidden
      )
    );
  }

  await prisma.answer.delete({
    where: { id },
  });

  return SuccessResponse(
    res,
    "Answer deleted successfully",
    null,
    statusCode.OK
  );
});

export const answerByUserId = asyncHandler(async (req, res, next) => {
  const userId = Number(req.params.userId);
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  if (!userId || isNaN(userId)) {
    return next(
      new ErrorResponse("Invalid or missing user ID", statusCode.Bad_Request)
    );
  }

  const skip = (page - 1) * limit;

  const [answers, total] = await Promise.all([
    prisma.answer.findMany({
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
    prisma.answer.count({
      where: {
        userId: userId,
      },
    }),
  ]);

  // Check if page exceeds available pages
  if (page > Math.ceil(total / limit) && total > 0) {
    return next(new ErrorResponse("This page does not exist", statusCode.Bad_Request));
  }

  if (!answers || answers.length === 0) {
    return SuccessResponse(
      res,
      "No answers found for this user",
      [],
      statusCode.OK
    );
  }

  
  return SuccessResponse(
    res,
    "Answers fetched successfully",
    {
      answers,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
      count: answers.length,
    },
    statusCode.OK
  );
});