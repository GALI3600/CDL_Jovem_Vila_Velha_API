import React from 'react';
import { useApiHealth } from '../hooks/useApiHealth';

const Header: React.FC = () => {
  const { isOnline, isLoading, systemHealth } = useApiHealth();

  const getStatusText = () => {
    if (isLoading) return { full: 'Verificando...', short: 'Verificando...' };
    
    if (!systemHealth) return { full: 'Sistema Offline', short: 'Offline' };
    
    const { backend, evolutionApi } = systemHealth;
    
    if (backend.status === 'online' && evolutionApi.status === 'online') {
      return { full: 'Sistema Online', short: 'Online' };
    }
    
    if (backend.status === 'offline' && evolutionApi.status === 'offline') {
      return { full: 'Sistema Offline', short: 'Offline' };
    }
    
    // One service is down
    if (backend.status === 'offline') {
      return { full: 'BD Offline', short: 'BD Off' };
    } else {
      return { full: 'WhatsApp Offline', short: 'WA Off' };
    }
  };

  const getTooltipText = () => {
    if (!systemHealth) return 'Sistema não verificado';
    
    const { backend, evolutionApi } = systemHealth;
    const lines = [];
    
    lines.push(`Backend: ${backend.status === 'online' ? '✅ Online' : '❌ Offline'}`);
    if (backend.error) lines.push(`  ${backend.error}`);
    
    lines.push(`WhatsApp API: ${evolutionApi.status === 'online' ? '✅ Online' : '❌ Offline'}`);
    if (evolutionApi.error) lines.push(`  ${evolutionApi.error}`);
    
    return lines.join('\n');
  };

  const statusText = getStatusText();

  return (
    <header className="bg-white shadow-lg border-b-2 border-[#003f88] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24">
          
          {/* Left side - Complete CDL Logo */}
          <div className="flex items-center">
            <img 
              src="/cdl_jovem_vila_velha_transparente.png" 
              alt="CDL Jovem Vila Velha" 
              className="h-12 sm:h-16 md:h-20 object-contain"
              onError={(e) => {
                // Fallback if logo doesn't load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>

          {/* Right side - System status */}
          <div 
            className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl border transition-all duration-200 cursor-help ${
              isLoading 
                ? 'bg-[#f4c21d] bg-opacity-10 border-[#f4c21d] border-opacity-20'
                : isOnline 
                  ? 'bg-[#2cab4f] bg-opacity-10 border-[#2cab4f] border-opacity-20'
                  : 'bg-red-50 border-red-200'
            }`}
            title={getTooltipText()}
          >
            <div className={`w-2 h-2 rounded-full transition-all duration-200 ${
              isLoading 
                ? 'bg-[#f4c21d] animate-pulse'
                : isOnline 
                  ? 'bg-[#2cab4f] animate-pulse'
                  : 'bg-red-500'
            }`}></div>
            <span className={`text-xs sm:text-sm font-semibold transition-colors duration-200 ${
              isLoading 
                ? 'text-[#f4c21d]'
                : isOnline 
                  ? 'text-[#2cab4f]'
                  : 'text-red-600'
            }`}>
              <span className="hidden sm:inline">{statusText.full}</span>
              <span className="sm:hidden">{statusText.short}</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;