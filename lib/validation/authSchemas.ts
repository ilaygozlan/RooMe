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

const phoneSchema = z
  .string()
  .regex(/^[0-9+\-\s()]+$/, "Invalid phone number")
  .min(10, "Phone number too short");

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: z.string().min(2, "Name too short"),
  job: z.string().min(2, "Job title required").optional(),
  phoneNumber: phoneSchema.optional(),
  gender: z.enum(["male", "female", "other", "prefer-not-to-say"]).optional(),
  birthDate: z.string().optional(),
  ownPet: z.boolean().optional(),
  smoke: z.boolean().optional(),
});



