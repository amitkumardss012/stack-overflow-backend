import { z } from 'zod';

const QuestionValidator = z.object({
    title: z.string()
        .min(10, 'Title must be at least 10 characters long'),
    content: z.string()
        .min(30, 'Question content must be at least 30 characters long'),
    tags: z.array(z.string())
        .min(1, 'At least one tag is required')
        .max(5, 'Maximum of 5 tags allowed').optional(),
});

export default QuestionValidator;
export type QuestionType = z.infer<typeof QuestionValidator>;