export type CharacterPosition = 'left' | 'center' | 'right';

export type CharacterState = {
  name: string;
  pose: string;
  position: CharacterPosition;
  focus?: boolean;
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

export type Chapter = {
  id: string;
  title: string;
  scenes: Scene[];
};
