import React, { useState } from 'react';
import { Send, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface ActionPanelProps {
  canSend: boolean;
  onSendMessages: () => Promise<void>;
}

const ActionPanel: React.FC<ActionPanelProps> = ({ canSend, onSendMessages }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaignStatus, setCampaignStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);

  const handleSendMessages = async () => {
    if (!canSend) return;
    
    setIsLoading(true);
    setCampaignStatus('sending');
    setProgress(0);
    
    // Simulate sending progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsLoading(false);
          setCampaignStatus('success');
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 500);
    
    // Call the actual send function
    try {
      await onSendMessages();
    } catch (error) {
      clearInterval(interval);
      setIsLoading(false);
      setCampaignStatus('error');
      setProgress(0);
    }
  };

  const getStatusMessage = () => {
    switch (campaignStatus) {
      case 'sending':
        return 'Enviando mensagens...';
      case 'success':
        return 'Campanha enviada com sucesso!';
      case 'error':
        return 'Erro ao enviar mensagens. Tente novamente.';
      default:
        return '';
    }
  };

  const getStatusIcon = () => {
    switch (campaignStatus) {
      case 'sending':
        return <Clock className="w-4 h-4 text-[#f4c21d]" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-[#2cab4f]" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-[#003f88] mb-4 sm:mb-6">Envio da Campanha</h2>
      
      <div className="space-y-4 sm:space-y-6">
        {/* Progress section */}
        {campaignStatus === 'sending' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Progresso do Envio</span>
              <span className="text-sm font-bold text-[#003f88]">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-[#003f88] h-3 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Status message */}
        {campaignStatus !== 'idle' && (
          <div className={`flex items-center space-x-3 p-3 sm:p-4 rounded-xl border ${
            campaignStatus === 'success' ? 'bg-[#2cab4f] bg-opacity-10 border-[#2cab4f] border-opacity-30' :
            campaignStatus === 'error' ? 'bg-red-50 border-red-200' :
            'bg-[#f4c21d] bg-opacity-10 border-[#f4c21d] border-opacity-30'
          }`}>
            {getStatusIcon()}
            <span className={`text-sm font-semibold ${
              campaignStatus === 'success' ? 'text-[#2cab4f]' :
              campaignStatus === 'error' ? 'text-red-600' :
              'text-[#f4c21d]'
            }`}>
              {getStatusMessage()}
            </span>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={handleSendMessages}
            disabled={!canSend || isLoading}
            className={`w-full inline-flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-300 ${
              canSend && !isLoading
                ? 'bg-[#2cab4f] hover:bg-[#238a42] text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="text-sm sm:text-base">Enviando...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Enviar Mensagens</span>
              </div>
            )}
          </button>
          
          {campaignStatus === 'success' && (
            <button
              onClick={() => {
                setCampaignStatus('idle');
                setProgress(0);
              }}
              className="w-full px-4 sm:px-6 py-3 bg-white border-2 border-[#003f88] text-[#003f88] rounded-xl hover:bg-[#003f88] hover:text-white transition-all duration-200 font-semibold"
            >
              Nova Campanha
            </button>
          )}
        </div>
        
        {/* Help text */}
        {!canSend && (
          <div className="text-xs sm:text-sm text-gray-600 text-center p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200">
            Upload um arquivo CSV e digite uma mensagem para continuar
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionPanel;