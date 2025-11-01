import { z } from "zod";

export const emailSchema = z.string().email("Enter a valid email");
export const passwordSchema = z
  .string()
  .min(8, "Min 8 characters")
  .regex(/(?=.*[A-Z])/, "One uppercase required")
  .regex(/(?=.*\d)/, "One number required");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password required"),
});

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: z.string().min(2, "Name too short"),
});



