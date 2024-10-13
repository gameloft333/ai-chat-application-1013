import React from 'react';
import { Character } from '../types/character';
import { nameDatabase } from '../data/nameDatabase';

interface CharacterSelectorProps {
  onSelectCharacter: (character: Character) => void;
  maxCharacters?: number;
}

const characters: Character[] = [
  { id: 'bertha', name: nameDatabase[0].name, image: 'https://img01.sc115.com/uploads3/sc/jpgs/2211/241e4392925ef87e_sc115.com.jpg', promptFile: 'bertha.txt' },
  { id: 'veronica', name: nameDatabase[1].name, image: 'https://scpic.chinaz.net/files/default/imgs/2024-01-03/d46d05a6e91c6a8c.jpg', promptFile: 'veronica.txt' },
  { id: 'mary', name: nameDatabase[2].name, image: 'https://img01.sc115.com/uploads3/sc/jpgs/2308/d4b4138eced38ff6_sc115.com.jpg', promptFile: 'mary.txt' },
  { id: 'dana', name: nameDatabase[3].name, image: 'https://aioss.ii.cn/upload/imgb/20240909/66de4762333d2pqcSHljx.png', promptFile: 'dana.txt' },
];

const CharacterSelector: React.FC<CharacterSelectorProps> = ({ 
  onSelectCharacter, 
  maxCharacters = characters.length
}) => {
  const visibleCharacters = characters.slice(0, maxCharacters);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {visibleCharacters.map((character) => (
        <div
          key={character.id}
          className="cursor-pointer transition-all duration-300 transform hover:scale-105"
          onClick={() => onSelectCharacter(character)}
        >
          <img
            src={character.image}
            alt={character.name}
            className="w-full h-auto rounded-lg shadow-lg"
            style={{ aspectRatio: '2/3' }}
          />
          <p className="text-center text-white mt-2 font-serif">{character.name}</p>
        </div>
      ))}
    </div>
  );
};

export default CharacterSelector;
