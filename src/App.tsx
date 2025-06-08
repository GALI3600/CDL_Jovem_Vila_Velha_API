import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import MessageComposer from './components/MessageComposer';
import ActionPanel from './components/ActionPanel';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string[][] | null>(null);
  const [message, setMessage] = useState('');

  const handleFileSelect = useCallback((file: File | null) => {
    setSelectedFile(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const data = lines.map(line => {
          // Handle CSV parsing with proper quote handling
          const result = [];
          let current = '';
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result;
        });
        setCsvData(data);
      };
      reader.readAsText(file);
    } else {
      setCsvData(null);
    }
  }, []);

  const handleSendMessages = async () => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(resolve, 3000);
    });
  };

  const canSend = selectedFile && csvData && message.trim().length > 0;
  const csvHeaders = csvData && csvData.length > 0 ? csvData[0] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Left column - File upload and action panel */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <FileUpload
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              csvData={csvData}
            />
            
            <ActionPanel
              canSend={canSend}
              onSendMessages={handleSendMessages}
            />
          </div>
          
          {/* Right column - Message composer (spans 2 columns on lg screens) */}
          <div className="lg:col-span-2">
            <MessageComposer
              csvHeaders={csvHeaders}
              message={message}
              onMessageChange={setMessage}
            />
          </div>
        </div>
        
        {/* Footer */}
        <footer className="mt-8 sm:mt-16 pt-6 sm:pt-8 border-t border-[#003f88] border-opacity-20">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600 font-medium">
              © 2025 CDL Jovem Vila Velha - Sistema de Campanhas WhatsApp
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;