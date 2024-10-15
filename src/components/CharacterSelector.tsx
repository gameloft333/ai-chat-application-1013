import React from 'react';
import { Character, characters } from '../types/character';

interface CharacterSelectorProps {
  onSelectCharacter: (character: Character) => void;
  maxCharacters?: number;
}

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
            src={character.avatarFile}
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
