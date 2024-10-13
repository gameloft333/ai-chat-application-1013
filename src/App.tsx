import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import CharacterSelector from './components/CharacterSelector';
import { MessageCircle } from 'lucide-react';

interface Character {
  id: string;
  name: string;
  image: string;
  prompt: string;
}

const App: React.FC = () => {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  return (
    <div className="min-h-screen bg-[#2C3E50] flex flex-col">
      <header className="bg-[#34495E] text-white p-4 shadow-lg">
        <div className="container mx-auto flex items-center">
          <MessageCircle className="mr-2" />
          <h1 className="text-2xl font-bold font-serif">AI Chat Companions</h1>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4 flex flex-col lg:flex-row">
        <div className="lg:w-1/3 mb-4 lg:mb-0 lg:mr-4">
          <CharacterSelector 
            onSelectCharacter={setSelectedCharacter} 
            selectedCharacter={selectedCharacter}
            maxCharacters={4}
          />
        </div>
        <div className="lg:w-2/3">
          <ChatInterface selectedCharacter={selectedCharacter} />
        </div>
      </main>
      <footer className="bg-[#34495E] text-white p-4 text-center">
        <p>&copy; 2024 AI Chat Companions. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;