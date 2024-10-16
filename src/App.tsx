import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import CharacterSelector from './components/CharacterSelector';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { Character } from './types/character';
import { CLEAR_MEMORY_ON_RESTART } from './config/app-config';
const API_KEY = import.meta.env.VITE_API_KEY || '';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const App: React.FC = () => {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [chatHistory, setChatHistory] = useState<Record<string, Message[]>>({});
  const [randomColor, setRandomColor] = useState<string>('');

  // 生成随机颜色的函数
  const generateRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // 在组件加载时设置随机颜色
  useEffect(() => {
    let newColor;
    do {
      newColor = generateRandomColor();
    } while (isColorSimilarToBackground(newColor)); // 确保颜色与背景色不相似
    setRandomColor(newColor);
  }, []);

  // 检查颜色是否与背景色相似的函数
  const isColorSimilarToBackground = (color: string) => {
    // 这里可以根据你的背景色进行判断
    const backgroundColor = '#1a202c'; // 示例背景色
    // 这里可以添加更复杂的颜色相似性判断逻辑
    return color === backgroundColor;
  };

  useEffect(() => {
    if (CLEAR_MEMORY_ON_RESTART) {
      localStorage.removeItem('chatHistory');
    } else {
      const savedHistory = localStorage.getItem('chatHistory');
      if (savedHistory) {
        setChatHistory(JSON.parse(savedHistory));
      }
    }
  }, []);

  const handleSelectCharacter = (character: Character) => {
    setSelectedCharacter(character);
  };

  const handleReturn = () => {
    setSelectedCharacter(null);
  };

  const updateChatHistory = (characterId: string, messages: Message[]) => {
    const updatedHistory = { ...chatHistory, [characterId]: messages };
    setChatHistory(updatedHistory);
    localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a202c] to-[#2d3748] flex flex-col">
      <header className="bg-black bg-opacity-50 text-white p-4 shadow-lg">
        <div className="container mx-auto flex items-center">
          <MessageCircle className="mr-3 text-[#81e6d9]" />
          <h1 className="text-2xl font-bold font-sans">AI Chat Companions</h1>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4 flex flex-col">
        {selectedCharacter ? (
          <div className="flex flex-col lg:flex-row gap-4 h-full">
            <button
              onClick={handleReturn}
              className="mb-2 lg:mb-0 flex items-center text-white hover:text-[#81e6d9] transition-colors"
            >
              <ArrowLeft className="mr-2" />
              返回
            </button>
            <div className="lg:w-1/3 flex-shrink-0 h-full">
              <img
                src={selectedCharacter.image}
                alt={selectedCharacter.name}
                className="w-full h-full object-cover rounded-lg shadow-2xl"
                style={{ aspectRatio: '9 / 16', objectFit: 'cover' }}
              />
            </div>
            <div className="lg:w-2/3 h-full flex flex-col">
              <ChatInterface
                selectedCharacter={selectedCharacter}
                initialMessages={chatHistory[selectedCharacter.id] || []}
                onUpdateHistory={(messages) => updateChatHistory(selectedCharacter.id, messages)}
                className="flex-grow h-full" // 确保聊天框占满剩余空间并与头像高度一致
              />
            </div>
          </div>
        ) : (
          <CharacterSelector onSelectCharacter={handleSelectCharacter} maxCharacters={8} />
        )}
      </main>
      <footer className="bg-black bg-opacity-50 text-white p-4 text-center">
        <p style={{ color: randomColor }}>&copy; 2024 AI Chat Companions. All rights reserved.</p>
      </footer>
      {CLEAR_MEMORY_ON_RESTART && (
        <div className="text-yellow-400 text-sm mt-2">
          注意: 现在处于测试模式，服务器重启时会清空聊天记录哦。
        </div>
      )}
    </div>
  );
};

export default App;
