import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-32">
          
          {/* Left side - Complete CDL Logo */}
          <div className="flex items-center">
            <img 
              src="/cdl_jovem_vila_velha_transparente.png" 
              alt="CDL Jovem Vila Velha" 
              className="h-24 object-contain"
              onError={(e) => {
                // Fallback if logo doesn't load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>

          {/* Right side - System status */}
          <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
            <div className="w-2 h-2 bg-[#2cab4f] rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">Sistema Online</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;