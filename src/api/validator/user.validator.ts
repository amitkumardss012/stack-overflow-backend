import z from "zod";

const userValidator = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long" })
    .max(50, { message: "Username must not exceed 50 characters" })
    .regex(/^[a-zA-Z0-9-_]+$/, {
      message:
        "Username can only contain letters, numbers, dashes, and underscores",
    }),
  email: z.string().email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }).max(50, {
      message: "Password must not exceed 50 characters",
    })
    .nonempty({ message: "Password is required" }),
  bio: z
    .string()
    .max(50, { message: "Bio must not exceed 100 characters" })
    .optional(),
});

export default userValidator;
export type UserType = z.infer<typeof userValidator>;


export const loginValidator = z.object({
    email: z.string().email({ message: 'Invalid email format' }),
    password: z.string().min(1, { message: 'Password is required' }),
  });