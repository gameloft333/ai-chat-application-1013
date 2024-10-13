import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { getLLMResponse } from '../services/llm-service';
import { Character } from '../types/character';
import { Message } from '../types/message';
import { MAX_CHAT_HISTORY } from '../config/app-config';

interface ChatInterfaceProps {
  selectedCharacter: Character;
  initialMessages: Message[];
  onUpdateHistory: (messages: Message[]) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  selectedCharacter, 
  initialMessages,
  onUpdateHistory
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    onUpdateHistory(messages);
  }, [messages, onUpdateHistory]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

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
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages, aiMessage];
        return updatedMessages.slice(-MAX_CHAT_HISTORY);
      });
    } catch (error) {
      console.error('Error getting LLM response:', error);
      const errorMessage: Message = {
        text: '我很抱歉,但我遇到了一个意外问题。您能再试一次吗?',
        isUser: false,
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white bg-opacity-10 rounded-lg shadow-2xl p-6 h-full flex flex-col">
      <div className="flex-grow overflow-y-auto mb-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-3 p-3 rounded-lg ${
              message.isUser
                ? 'bg-[#81e6d9] text-gray-800 ml-auto'
                : 'bg-gray-700 text-white'
            } max-w-[80%]`}
          >
            {message.text}
          </div>
        ))}
        {isLoading && (
          <div className="text-center text-gray-400">
            AI正在思考...
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
          placeholder="输入您的消息..."
          className="flex-grow border-2 border-gray-700 rounded-l-lg px-4 py-2 bg-gray-800 text-white focus:outline-none focus:border-[#81e6d9] transition-colors"
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          className="bg-[#81e6d9] text-gray-800 px-6 py-2 rounded-r-lg hover:bg-[#4fd1c5] transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
