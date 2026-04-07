import { z } from 'zod';

export const SceneSchema = z.object({
  id: z.string(),
  bg: z.string().optional(),
  next: z.string().optional(),
});
