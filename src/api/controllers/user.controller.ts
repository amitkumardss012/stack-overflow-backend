import { prisma } from "../../config";
import { asyncHandler } from "../middlewares/error.middleware";
import { UserService } from "../service";
import { statusCode } from "../types/types";
import { ErrorResponse, Password } from "../utils";
import { generateToken } from "../utils/jwt.util";
import { hashPassword } from "../utils/password.util";
import { SuccessResponse } from "../utils/response.util";
import userValidator, { loginValidator } from "../validator/user.validator";

export const signUp = asyncHandler(async (req, res, next) => {
  const { username, email, password, bio } = userValidator.parse(req.body);
  const [userWithUserName, userWithEmail, hashedPassword] = await Promise.all([
    UserService.getUserByEmail(email),
    UserService.getUserByEmail(email),
    hashPassword(password),
  ]);

  if (userWithUserName)
    return next(
      new ErrorResponse(
        "User with username already exists",
        statusCode.Bad_Request
      )
    );
  if (userWithEmail)
    return next(
      new ErrorResponse(
        "User with email already exists",
        statusCode.Bad_Request
      )
    );
  const newUser = await UserService.createUser({
    username,
    email,
    password: hashedPassword,
    bio,
  });
  const token = generateToken({ id: newUser.id, username, email });
  return res
    .status(statusCode.Created)
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
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = loginValidator.parse(req.body);
  const user = await UserService.getUserByEmail(email);
  if (!user || !(await Password.verifyPassword(password, user.password))) {
    return next(
      new ErrorResponse("Invalid email or password", statusCode.Unauthorized)
    );
  }

  const token = generateToken({
    id: user.id,
    username: user.username,
    email: user.email,
  });
  return res
    .status(statusCode.OK)
    .cookie("token", token, { sameSite: "strict", maxAge: 60 * 1000 })
    .header("Authorization", `Bearer ${token}`)
    .json({
      success: true,
      message: `Welcome back ${user.username}`,
      data: {user, token},
    });
});

export const logout = asyncHandler(async (req, res, next) => {
  res
    .clearCookie("token", { sameSite: "strict" })
    .header("Authorization", "")
    .status(statusCode.OK)
    .json({ success: true, message: "logged out successfully" });
});


export const profile = asyncHandler(async (req, res, next) => {
  const id = Number(req.User?.id);
  if(!id) return next(new ErrorResponse("User not found", statusCode.Unauthorized))
  const me = await prisma.user.findUnique({
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

  return SuccessResponse(res, "User fetched successfully", me, statusCode.OK);
});

export const getUserByID = asyncHandler(async (req, res, next) => {
  const id = Number(req.params.id);

  if (!id || isNaN(id)) {
    return next(
      new ErrorResponse("Invalid or missing user ID", statusCode.Bad_Request)
    );
  }

  const user = await prisma.user.findUnique({
    where: {id},
    select: {
      id: true,
      username: true,
      email: true,
      bio: true,
      createdAt: true,
      updatedAt: true,
    }
  })

  return SuccessResponse(res, "User fetched successfully", user, statusCode.OK);
});

export const updateUser = asyncHandler(async (req, res, next) => {
  const id = Number(req.User?.id);
  const bio = req.body.bio;
  if(!id) return next(new ErrorResponse("User not found", statusCode.Unauthorized))

  const user = await prisma.user.update({
    where: { id },
    data: {
      bio,
    }
  });

  return SuccessResponse(res, "User updated successfully", user, statusCode.OK);
});