"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginValidator = void 0;
const zod_1 = __importDefault(require("zod"));
const userValidator = zod_1.default.object({
    username: zod_1.default
        .string()
        .min(3, { message: "Username must be at least 3 characters long" })
        .max(50, { message: "Username must not exceed 50 characters" })
        .regex(/^[a-zA-Z0-9-_]+$/, {
        message: "Username can only contain letters, numbers, dashes, and underscores",
    }),
    email: zod_1.default.string().email({ message: "Invalid email format" }),
    password: zod_1.default
        .string()
        .min(8, { message: "Password must be at least 8 characters long" }).max(50, {
        message: "Password must not exceed 50 characters",
    })
        .nonempty({ message: "Password is required" }),
    bio: zod_1.default
        .string()
        .max(50, { message: "Bio must not exceed 100 characters" })
        .optional(),
});
exports.default = userValidator;
exports.loginValidator = zod_1.default.object({
    email: zod_1.default.string().email({ message: 'Invalid email format' }),
    password: zod_1.default.string().min(1, { message: 'Password is required' }),
});
