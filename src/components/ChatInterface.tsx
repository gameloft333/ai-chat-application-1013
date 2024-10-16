import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { getLLMResponse } from '../services/llm-service';
import { Character } from '../types/character';
import { Message } from '../types/message';
import { MAX_CHAT_HISTORY, USE_TYPEWRITER_MODE } from '../config/app-config';

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
  const [typingText, setTypingText] = useState('');
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
    setIsLoading(true);
    try {
      const response = await getLLMResponse(selectedCharacter.id, inputMessage);
      if (response.error) {
        throw new Error(response.error);
      }
      const aiMessage = { text: response.text, isUser: false };
      
      if (USE_TYPEWRITER_MODE) {
        setIsLoading(false);
        let index = 0;
        const interval = setInterval(() => {
          if (index < response.text.length) {
            setTypingText((prev) => prev + response.text[index]);
            index++;
          } else {
            clearInterval(interval);
            setMessages(prevMessages => {
              const updatedMessages = [...prevMessages, aiMessage];
              return updatedMessages.length > MAX_CHAT_HISTORY 
                ? updatedMessages.slice(-MAX_CHAT_HISTORY) 
                : updatedMessages;
            });
            setTypingText('');
            onUpdateHistory([...newMessages, aiMessage]);
          }
        }, 50);
      } else {
        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages, aiMessage];
          return updatedMessages.length > MAX_CHAT_HISTORY 
            ? updatedMessages.slice(-MAX_CHAT_HISTORY) 
            : updatedMessages;
        });
        onUpdateHistory([...newMessages, aiMessage]);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      const errorMessage = { 
        text: error instanceof Error ? error.message : '对不起，我现在遇到了一些技术问题。让我们稍后再聊吧。', 
        isUser: false 
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
      // 添加这行来记录完整的错误堆栈
      console.error('Full error stack:', error instanceof Error ? error.stack : error);
    } finally {
      setIsLoading(false);
      setTypingText('');
    }
  };

  return (
    <div className="bg-white bg-opacity-10 rounded-lg shadow-2xl p-6 flex flex-col h-full">
      <div 
        ref={chatContainerRef}
        className="flex-grow overflow-y-auto mb-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent clearfix"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-3 p-3 rounded-lg ${
              message.isUser
                ? 'bg-[#81e6d9] text-gray-800 ml-auto'
                : 'bg-gray-700 text-white mr-auto'
            } inline-block max-w-[80%]`}
            style={{
              clear: 'both',
              float: message.isUser ? 'right' : 'left'
            }}
          >
            {message.text}
          </div>
        ))}
        {(USE_TYPEWRITER_MODE && typingText) || isLoading ? (
          <div 
            className="mb-3 p-3 rounded-lg bg-gray-700 text-white max-w-[80%]"
            style={{
              clear: 'both',
              float: 'left'
            }}
          >
            {typingText || `${selectedCharacter.name} 正在思考并输入消息....`}
          </div>
        ) : null}
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
