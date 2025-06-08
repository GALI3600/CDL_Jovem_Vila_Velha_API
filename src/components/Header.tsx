import React from 'react';

const Header: React.FC = () => {
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
          <div className="flex items-center space-x-2 bg-[#2cab4f] bg-opacity-10 px-3 sm:px-4 py-2 rounded-xl border border-[#2cab4f] border-opacity-20">
            <div className="w-2 h-2 bg-[#2cab4f] rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm font-semibold text-[#2cab4f] hidden sm:inline">Sistema Online</span>
            <span className="text-xs font-semibold text-[#2cab4f] sm:hidden">Online</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;