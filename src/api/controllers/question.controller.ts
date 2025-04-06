import { prisma } from "../../config";
import { asyncHandler } from "../middlewares/error.middleware";
import { statusCode } from "../types/types";
import { ErrorResponse, SuccessResponse } from "../utils/response.util";
import QuestionValidator from "../validator/question.validator";

export const AskQuestion = asyncHandler(async (req, res, next) => {
  const validatData = QuestionValidator.parse(req.body);

  console.log(req.User?.id)

  const Question = await prisma.question.create({
    data: {
      title: validatData.title,
      content: validatData.content,
      userId: Number(req.User?.id),
    },
  });

  return SuccessResponse(
    res,
    "Question asked successfully",
    Question,
    statusCode.Created
  );
});

export const GetAllQuestions = asyncHandler(async (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const skip = (page - 1) * limit;
  const [questions, total] = await Promise.all([
    prisma.question.findMany({
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
    prisma.question.count(),
  ]);
  if (page > Math.ceil(total / limit) && total > 0) {
    return next(new Error("This page does not exist"));
  }

  if (!questions || questions.length === 0) {
    return SuccessResponse(res, "No questions found", [], statusCode.OK);
  }

  return SuccessResponse(
    res,
    "Questions fetched successfully",
    {
      questions,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
      count: questions.length,
    },
    statusCode.OK
  );
});

export const getQuestionById = asyncHandler(async (req, res, next) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id))
    return next(
      new ErrorResponse("Invalid id or Missing id", statusCode.Bad_Request)
    );

  const question = await prisma.question.findUnique({
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
    return next(new ErrorResponse("Question not found", statusCode.Not_Found));

  return SuccessResponse(
    res,
    "Question fetched successfully",
    question,
    statusCode.OK
  );
});

export const deleteQuestion = asyncHandler(async (req, res, next) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id))
    return next(
      new ErrorResponse("Invalid id or Missing id", statusCode.Bad_Request)
    );

  const question = await prisma.question.findUnique({
    where: {
      id,
    },
  });

  if (!question)
    return next(new ErrorResponse("Question not found", statusCode.Not_Found));

  if (question.userId !== Number(req.User?.id))
    return next(
      new ErrorResponse(
        "You are not authorized to delete this question",
        statusCode.Forbidden
      )
    );

  await prisma.question.delete({
    where: {
      id,
    },
  });

  return SuccessResponse(res, "Question deleted successfully");
});

export const serachQuestion = asyncHandler(async (req, res, next) => {
  const query = req.query.query as string;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
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
    prisma.question.count({
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
    return SuccessResponse(res, "No questions found", [], statusCode.OK);
  }

  return SuccessResponse(
    res,
    "Questions fetched successfully",
    {
      questions,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
      count: questions.length,
    },
    statusCode.OK
  );
});

export const questionByUserId = asyncHandler(async (req, res, next) => {
  const userId = Number(req.params.userId);
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;


  if (!userId || isNaN(userId)) {
    return next(
      new ErrorResponse("Invalid or missing user ID", statusCode.Bad_Request)
    );
  }

  const skip = (page - 1) * limit;

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
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
    prisma.question.count({
      where: {
        userId: userId,
      },
    }),
  ]);

 
  if (page > Math.ceil(total / limit) && total > 0) {
    return next(new ErrorResponse("This page does not exist", statusCode.Bad_Request));
  }

  
  if (!questions || questions.length === 0) {
    return SuccessResponse(
      res,
      "No questions found for this user",
      [],
      statusCode.OK
    );
  }

  
  return SuccessResponse(
    res,
    "Questions fetched successfully",
    {
      questions,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
      count: questions.length,
    },
    statusCode.OK
  );
});