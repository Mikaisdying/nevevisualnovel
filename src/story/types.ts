// Định nghĩa type cho story scene và các props liên quan
export interface CharacterState {
  id: string;
  pose: string;
  position: string;
}

export interface Textbox {
  name: string;
  text: string;
}

export interface Scene {
  id: string;
  bg: string;
  char: CharacterState[];
  textbox: Textbox;
  next?: string;
  choices?: Choice[];
}

export interface Choice {
  id: string;
  text: string;
  next: string;
}

// Props cho các component
export interface BackgroundProps {
  bg: string;
}

export interface CharacterProps {
  characters: CharacterState[];
}

export interface ForegroundProps {
  textbox: Textbox;
  choices?: Choice[];
}
