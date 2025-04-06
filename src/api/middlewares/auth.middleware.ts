import { UserService } from "../service";
import { statusCode } from "../types/types";
import { ErrorResponse, Jwt } from "../utils";
import { asyncHandler } from "./error.middleware";

export const Authenticate = asyncHandler(async (req, res, next) => {
    const tokenFromCookie = req.cookies.token;
    const tokenFromHeader =
    req.headers["authorization"]?.split("Bearer ")[1]?.trim() ||
    req.headers.cookie?.split("=")[1]?.trim();

  const tokenFromHeader2 = req.headers["authorization"]
    ?.split("Bearer ")[1]
    ?.trim();
  const token = tokenFromCookie || tokenFromHeader || tokenFromHeader2;

  if(!token) return next(new ErrorResponse("Not authorized, token missing", statusCode.Unauthorized))

    let decoded;
    try {
        decoded = Jwt.verifyToken(token) as { id: number };
      } catch (error) {
        return next(
          new ErrorResponse("Invalid or expired token", statusCode.Unauthorized)
        );
      }
      const user = await UserService.getUserById(decoded?.id);
      if (!user) {
        return next(
          new ErrorResponse(
            "Not authorized, User not found",
            statusCode.Unauthorized
          )
        );
      } else {
        req.User = {
            ...user,
            id: user.id.toString()
        };
        next();
      }
});