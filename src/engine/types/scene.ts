export type CharacterPosition = 'left' | 'center' | 'right';

export type CharacterState = {
  id: string;
  pose: string;
  position: CharacterPosition;
};

export type Textbox = {
  name?: string;
  text: string;
};

export type Choice = {
  text: string;
  next: string;
  condition?: string;
};

export type Scene = {
  id: string;
  bg?: string;
  char?: CharacterState[];
  textbox?: Textbox;

  next?: string;
  choices?: Choice[];
};
