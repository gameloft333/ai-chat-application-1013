import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { getLLMResponse } from '../services/llm-service';
import { Character } from '../types/character';
import { Message } from '../types/message';
import { MAX_CHAT_HISTORY, USE_TYPEWRITER_MODE, AI_RESPONSE_MODE } from '../config/app-config';
import { speak } from '../services/voice-service';
import ChatMessage from './ChatMessage'; // 导入 ChatMessage 组件

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
  const [thinkingMessage, setThinkingMessage] = useState<string | null>(null);
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
    setThinkingMessage(`${selectedCharacter.name} 正在思考和输入消息...`); // 设置思考提示

    try {
      const response = await getLLMResponse(selectedCharacter.id, inputMessage);
      setMessages(prevMessages => [...prevMessages, { text: response.text, isUser: false }]);
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      const errorMessage = { 
        text: error instanceof Error ? error.message : '对不起，我现在遇到了一些技术问题。让我们稍后再聊吧。', 
        isUser: false 
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
      setThinkingMessage(null); // 清除思考提示
    }
  };

  return (
    <div className="bg-white bg-opacity-10 rounded-lg shadow-2xl p-6 flex flex-col h-full">
      <div 
        ref={chatContainerRef}
        className="flex-grow overflow-y-auto mb-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent clearfix"
      >
        {messages.map((message, index) => (
          <div key={index} className="flex items-start mb-3">
            {!message.isUser && (
              <button onClick={() => speak(message.text, "voice_lily")} className="mr-2">
                <img src="/public/ui_icons/speaker-icon.png" alt="语音图标" className="w-6 h-6" />
              </button>
            )}
            <div className={`p-3 rounded-lg ${message.isUser ? 'bg-[#81e6d9] text-gray-800 ml-auto' : 'bg-gray-700 text-white mr-auto'}`}>
              {message.text}
            </div>
          </div>
        ))}
        {thinkingMessage && (
          <div className="text-gray-500 italic">{thinkingMessage}</div> // 显示思考提示
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
