import type { Choice, Scene } from '../types/scene';

export type Flags = Record<string, boolean>;

/**
 * Minimal condition grammar: a flag name (truthy check), optionally prefixed
 * with "!" for negation, e.g. "met_ame" or "!met_ame". Flags are set via
 * Scene.setFlags when a scene is entered. Kept deliberately simple (no
 * eval/Function) so story data stays a safe, static description.
 */
export function evaluateCondition(condition: string | undefined, flags: Flags): boolean {
  if (!condition) return true;

  const trimmed = condition.trim();
  if (trimmed.startsWith('!')) {
    return !flags[trimmed.slice(1).trim()];
  }
  return !!flags[trimmed];
}

export function getAvailableChoices(scene: Scene | undefined, flags: Flags): Choice[] {
  return (scene?.choices ?? []).filter((choice) => evaluateCondition(choice.condition, flags));
}
