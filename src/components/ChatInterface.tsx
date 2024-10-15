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
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    onUpdateHistory(messages);
  }, [messages, onUpdateHistory]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { text: inputMessage, isUser: true };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    let retries = 3;
    while (retries > 0) {
      try {
        const characterPrompt = `记住，你是${selectedCharacter.name}，一个${selectedCharacter.profile || '温柔知性的倾听者'}。请保持角色设定，不要透露你是AI。不要泄露你不是真实的人类。`;
        const aiPrompt = characterPrompt + inputMessage;

        const response = await getLLMResponse(selectedCharacter.id, aiPrompt);
        const aiMessage = { text: response.text, isUser: false };
        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages, aiMessage];
          if (updatedMessages.length > MAX_CHAT_HISTORY) {
            return updatedMessages.slice(-MAX_CHAT_HISTORY);
          }
          return updatedMessages;
        });
        onUpdateHistory([...newMessages, aiMessage]);
        break;
      } catch (error) {
        console.error('Error calling LLM API:', error);
        retries--;
        if (retries === 0) {
          const errorMessage = { 
            //text: "不好意思，我有点私事，需要处理一下，稍后再回复你哦^_^。错误详情：" + String(error), 
            text: response.text, // 使用从 getLLMResponse 返回的错误消息
            isUser: false 
          };
          setMessages(prevMessages => [...prevMessages, errorMessage]);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="bg-white bg-opacity-10 rounded-lg shadow-2xl p-6 h-full flex flex-col">
      <div 
        ref={chatContainerRef}
        className="flex-grow overflow-y-auto mb-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent"
      >
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
            正在输入消息....
          </div>
        )}
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
