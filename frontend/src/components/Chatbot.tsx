import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{sender: string, text: string}[]>([
    { sender: 'bot', text: 'Hi! I am Nova AI. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages([...messages, { sender: 'user', text: input }]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: 'Our AI agents are currently operating at peak capacity processing Amazon-level infrastructure. A human representative will take over shortly!' 
      }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-80 h-96 bg-white rounded-lg shadow-2xl flex flex-col border border-gray-200 overflow-hidden">
          <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2"><MessageCircle size={20}/> Nova Support</h3>
            <button onClick={() => setIsOpen(false)} className="hover:text-cyan-400 transition"><X size={20}/></button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[80%] p-3 rounded-lg text-sm ${m.sender === 'user' ? 'bg-cyan-600 text-white self-end rounded-br-none' : 'bg-gray-200 text-gray-800 self-start rounded-bl-none'}`}>
                {m.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white border-t flex items-center gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Type your message..."
            />
            <button type="submit" className="bg-cyan-600 text-white p-2 rounded-full hover:bg-cyan-700 transition">
              <Send size={18}/>
            </button>
          </form>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-gray-900 hover:bg-gray-800 text-cyan-400 p-4 rounded-full shadow-2xl transition transform hover:scale-110 flex items-center justify-center border-2 border-cyan-500"
        >
          <MessageCircle size={28} />
        </button>
      )}
    </div>
  );
};

export default Chatbot;
