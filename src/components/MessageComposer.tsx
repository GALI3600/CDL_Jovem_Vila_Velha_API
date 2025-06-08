import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';

interface MessageComposerProps {
  csvHeaders: string[];
  message: string;
  onMessageChange: (message: string) => void;
}

const MessageComposer: React.FC<MessageComposerProps> = ({ csvHeaders, message, onMessageChange }) => {
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    setCharCount(message.length);
  }, [message]);

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('message-textarea') as HTMLTextAreaElement;
    const cursorPos = textarea.selectionStart;
    const textBefore = message.substring(0, cursorPos);
    const textAfter = message.substring(cursorPos);
    const newMessage = textBefore + `{{${variable}}}` + textAfter;
    onMessageChange(newMessage);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPos + variable.length + 4, cursorPos + variable.length + 4);
    }, 0);
  };

  const getMessagePreview = () => {
    let preview = message;
    csvHeaders.forEach(header => {
      preview = preview.replace(new RegExp(`{{${header}}}`, 'g'), `[${header}]`);
    });
    return preview || 'Digite sua mensagem...';
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-[#003f88] mb-4 sm:mb-6">Composição da Mensagem</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Message composition section */}
        <div className="space-y-4">
          <div>
            <label htmlFor="message-textarea" className="block text-sm font-semibold text-gray-700 mb-3">
              Template da Mensagem
            </label>
            <textarea
              id="message-textarea"
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder="Digite sua mensagem aqui... Use {{nome_da_coluna}} para inserir variáveis do CSV."
              className="w-full h-32 sm:h-40 p-3 sm:p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#003f88] focus:border-[#003f88] resize-none text-sm leading-relaxed transition-all duration-200"
            />
            <div className="flex justify-between items-center mt-3">
              <p className="text-xs text-gray-600 font-medium">
                Use variáveis do CSV para personalizar
              </p>
              <p className={`text-xs font-bold ${charCount > 1000 ? 'text-red-500' : charCount > 800 ? 'text-[#f4c21d]' : 'text-[#2cab4f]'}`}>
                {charCount}/1600 caracteres
              </p>
            </div>
          </div>
          
          {/* Variables section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Variáveis Disponíveis
            </label>
            {csvHeaders.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {csvHeaders.map((header, index) => (
                  <button
                    key={index}
                    onClick={() => insertVariable(header)}
                    className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 hover:bg-[#003f88] hover:bg-opacity-10 border border-gray-200 hover:border-[#003f88] rounded-lg transition-all duration-200 group"
                  >
                    <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-[#003f88] truncate">
                      {header}
                    </span>
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-[#003f88] flex-shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
                <p className="text-sm text-gray-600">
                  Upload um arquivo CSV para ver as variáveis
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* WhatsApp Preview section */}
        <div className="flex flex-col">
          <div className="text-center mb-3">
            <label className="block text-sm font-semibold text-gray-700">
              Preview WhatsApp
            </label>
          </div>
          
          {/* WhatsApp-like preview container - FIXED HEIGHT */}
          <div className="relative mx-auto flex-shrink-0" style={{ width: '280px', height: '500px' }}>
            {/* Phone frame */}
            <div className="bg-gray-900 rounded-[1.5rem] p-1.5 shadow-2xl w-full h-full">
              <div className="bg-[#e5ddd5] rounded-[1.25rem] overflow-hidden relative w-full h-full flex flex-col">
                
                {/* WhatsApp header - FIXED HEIGHT */}
                <div className="bg-[#075e54] px-3 py-2.5 flex items-center space-x-2 flex-shrink-0">
                  <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center overflow-hidden">
                    {/* CDL Logo in WhatsApp header */}
                    <img 
                      src="/CDL Icon.png" 
                      alt="CDL" 
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        // Fallback to CDL text if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<span class="text-[#003f88] text-xs font-bold">CDL</span>';
                        }
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-xs truncate">CDL Jovem Vila Velha</p>
                    <p className="text-green-200 text-xs">online</p>
                  </div>
                </div>

                
                <div className="absolute inset-0 top-12 bottom-12 opacity-5">
                  <div className="w-full h-full" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '20px 20px'
                  }} />
                </div>

                {/* Message area - FLEXIBLE HEIGHT */}
                <div className="relative flex-1 p-3 overflow-y-auto">
                  {message.trim() ? (
                    <div className="flex justify-start mt-4">
                      <div className="relative max-w-[85%]">
                        {/* Message bubble - RECEIVED (left side, white/gray) */}
                        <div className="bg-white rounded-lg px-2.5 py-2 shadow-sm relative">
                          {/* Message tail for received message */}
                          <div className="absolute -left-0.5 bottom-0 w-0 h-0 border-r-[6px] border-r-white border-b-[6px] border-b-transparent"></div>
                          
                          <p className="text-gray-800 text-xs leading-relaxed whitespace-pre-wrap break-words">
                            {getMessagePreview()}
                          </p>
                          
                          {/* Message info for received message */}
                          <div className="flex items-center justify-end mt-1">
                            <span className="text-xs text-gray-500">{getCurrentTime()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        {/* WhatsApp icon in empty state */}
                        <svg 
                          viewBox="0 0 24 24" 
                          className="w-8 h-8 text-gray-400 mx-auto mb-2 fill-current"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.106"/>
                        </svg>
                        <p className="text-gray-500 text-xs px-4">Digite uma mensagem para ver o preview</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input area simulation - FIXED HEIGHT */}
                <div className="flex-shrink-0 p-2 bg-[#f0f0f0]">
                  <div className="bg-white rounded-full px-3 py-1.5 flex items-center space-x-2">
                    <span className="text-gray-400 text-xs flex-1">Digite uma mensagem</span>
                    <div className="w-5 h-5 bg-[#075e54] rounded-full flex items-center justify-center">
                      {/* WhatsApp icon in input area */}
                      <svg 
                        viewBox="0 0 24 24" 
                        className="w-2.5 h-2.5 text-white fill-current"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.106"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-3">
            <p className="text-xs text-gray-600">
              Preview de como a mensagem será recebida no WhatsApp
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageComposer;