import { z } from 'zod';

/** Chuỗi dùng chung cho mọi ngôn ngữ, hoặc { vi, en }. */
const LocalizedTextSchema = z.union([
  z.string(),
  z.object({ vi: z.string().optional(), en: z.string().optional() }),
]);

const CharacterPositionSchema = z.enum(['left', 'center', 'right']);

const CharacterStateSchema = z.object({
  name: z.string(),
  pose: z.string(),
  position: CharacterPositionSchema.optional(),
  focus: z.boolean().optional(),
});

const TextboxSchema = z.object({
  name: LocalizedTextSchema.optional(),
  text: LocalizedTextSchema,
});

const ChoiceSchema = z.object({
  text: LocalizedTextSchema.nullable(),
  next: z.string(),
  condition: z.string().optional(),
});

const SceneCardSchema = z.object({
  type: z.enum(['title', 'end']),
  eyebrow: LocalizedTextSchema.optional(),
  title: LocalizedTextSchema,
  subtitle: LocalizedTextSchema.optional(),
});

export const SceneSchema = z.object({
  id: z.string(),
  bg: z.string().optional(),
  char: z.array(CharacterStateSchema).optional(),
  textbox: TextboxSchema.optional(),
  choices: z.array(ChoiceSchema).optional(),
  next: z.string().optional(),
  setFlags: z.record(z.string(), z.boolean()).optional(),
  cg: z.string().optional(),
  chapter: LocalizedTextSchema.optional(),
  card: SceneCardSchema.optional(),
});

export const StorylineSchema = z.array(SceneSchema);
