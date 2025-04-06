"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const QuestionValidator = zod_1.z.object({
    title: zod_1.z.string()
        .min(10, 'Title must be at least 10 characters long'),
    content: zod_1.z.string()
        .min(30, 'Question content must be at least 30 characters long'),
    tags: zod_1.z.array(zod_1.z.string())
        .min(1, 'At least one tag is required')
        .max(5, 'Maximum of 5 tags allowed').optional(),
});
exports.default = QuestionValidator;
