import { z } from "zod/v4";

export const userSchema = z.object({
  name: z.string(),
  email: z.email(),
});

export type User = z.infer<typeof userSchema>;
