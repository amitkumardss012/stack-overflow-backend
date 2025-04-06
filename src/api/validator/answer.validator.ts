import { z } from 'zod';

export const AnswerValidator = z.object({
  content: z
    .string()
    .min(10, "Answer must be at least 10 characters long")
    .max(5000, "Answer cannot exceed 5000 characters"),
});

export default AnswerValidator;