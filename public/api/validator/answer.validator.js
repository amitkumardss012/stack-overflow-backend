"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnswerValidator = void 0;
const zod_1 = require("zod");
exports.AnswerValidator = zod_1.z.object({
    content: zod_1.z
        .string()
        .min(10, "Answer must be at least 10 characters long")
        .max(5000, "Answer cannot exceed 5000 characters"),
});
exports.default = exports.AnswerValidator;
