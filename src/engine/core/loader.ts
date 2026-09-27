import { StorylineSchema } from './validator';

export async function loadStoryFiles() {
  const res = await fetch('data/storyline.json');
  const data = await res.json();

  const result = StorylineSchema.safeParse(data);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.') || '<root>'}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid storyline.json: ${details}`);
  }

  return result.data;
}
