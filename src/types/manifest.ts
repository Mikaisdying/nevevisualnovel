export type Manifest = {
  backgrounds: {
    id: string;
    name: string;
  }[];
  characters: {
    id: string;
    name: string;
    poses: string[];
  }[];
};
