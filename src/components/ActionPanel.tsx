import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface ActionPanelProps {
  canSend: boolean;
  onSendMessages: () => void;
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Envio da Campanha</h2>
      
      <div className="space-y-4">
        {/* Progress section */}
        {campaignStatus === 'sending' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Progresso do Envio</span>
              <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#003f88] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Status message */}
        {campaignStatus !== 'idle' && (
          <div className={`flex items-center space-x-2 p-3 rounded-lg ${
            campaignStatus === 'success' ? 'bg-green-50 border border-green-200' :
            campaignStatus === 'error' ? 'bg-red-50 border border-red-200' :
            'bg-yellow-50 border border-yellow-200'
          }`}>
            {getStatusIcon()}
            <span className={`text-sm font-medium ${
              campaignStatus === 'success' ? 'text-green-800' :
              campaignStatus === 'error' ? 'text-red-800' :
              'text-yellow-800'
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
            className={`w-full inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              canSend && !isLoading
                ? 'bg-[#2cab4f] hover:bg-[#238a42] text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Enviando...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Send className="w-4 h-4" />
                <span>Enviar Mensagens</span>
              </div>
            )}
          </button>
          
          {campaignStatus === 'success' && (
            <button
              onClick={() => {
                setCampaignStatus('idle');
                setProgress(0);
              }}
              className="w-full px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Nova Campanha
            </button>
          )}
        </div>
        
        {/* Help text */}
        {!canSend && (
          <div className="text-xs text-gray-500 text-center p-3 bg-gray-50 rounded-lg">
            Upload um arquivo CSV e digite uma mensagem para continuar
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionPanel;