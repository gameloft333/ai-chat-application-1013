export interface Character {
  id: string;
  name: string;
  profile: string;
  image: string;
  promptFile: string;
  prompt?: string;
  avatarFile: string;
}

export const characters: Character[] = [
  { id: 'bertha', name: "Bertha", promptFile: 'bertha.txt', avatarFile: '/characters/bertha.png', image: '/characters/bertha.png' },
  { id: 'veronica', name: "Veronica", promptFile: 'veronica.txt', avatarFile: '/characters/veronica.png', image: '/characters/veronica.png' },
  { id: 'mary', name: "Mary", promptFile: 'mary.txt', avatarFile: '/characters/mary.png', image: '/characters/mary.png' },
  { id: 'dana', name: "Dana", promptFile: 'dana.txt', avatarFile: '/characters/dana.png', image: '/characters/dana.png' },
];
