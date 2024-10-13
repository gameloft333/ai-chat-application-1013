import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { getLLMResponse } from '../services/llm-service';

interface Message {
  text: string;
  isUser: boolean;
}

interface Character {
  id: string;
  name: string;
  image: string;
  prompt: string;
}

interface ChatInterfaceProps {
  selectedCharacter: Character | null;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ selectedCharacter }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedCharacter) {
      setMessages([{ text: `Hello! I'm your ${selectedCharacter.name}. How can I assist you today?`, isUser: false }]);
    } else {
      setMessages([]);
    }
  }, [selectedCharacter]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '' || !selectedCharacter) return;

    const userMessage: Message = { text: inputMessage, isUser: true };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const prompt = `${selectedCharacter.prompt}\n\nUser: ${inputMessage}\n\nAI:`;
      const response = await getLLMResponse(selectedCharacter.id, prompt);
      
      const aiMessage: Message = {
        text: response.text,
        isUser: false,
      };
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error('Error getting LLM response:', error);
      const errorMessage: Message = {
        text: 'I apologize, but I encountered an unexpected issue. Could you please try your request again?',
        isUser: false,
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#34495E] rounded-lg shadow-lg p-4 h-[600px] flex flex-col">
      <div className="flex-grow overflow-y-auto mb-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-700">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-2 p-2 rounded-lg ${
              message.isUser ? 'bg-[#3498DB] text-white ml-auto' : 'bg-[#2ECC71] text-white'
            } max-w-[70%]`}
          >
            {message.text}
          </div>
        ))}
        {isLoading && (
          <div className="text-center text-gray-400">
            AI is thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type your message..."
          className="flex-grow border rounded-l-lg px-4 py-2 bg-[#2C3E50] text-white focus:outline-none focus:ring-2 focus:ring-[#F1C40F]"
          disabled={isLoading || !selectedCharacter}
        />
        <button
          onClick={handleSendMessage}
          className="bg-[#E67E22] text-white px-4 py-2 rounded-r-lg hover:bg-[#D35400] transition-colors disabled:opacity-50"
          disabled={isLoading || !selectedCharacter}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;