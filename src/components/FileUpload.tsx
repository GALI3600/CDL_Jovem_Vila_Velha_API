import React, { useCallback, useState } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, Users } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  csvData: string[][] | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, selectedFile, csvData }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const validateFile = (file: File): boolean => {
    const validTypes = ['text/csv', 'application/vnd.ms-excel'];
    const validExtensions = ['.csv'];
    const hasValidType = validTypes.includes(file.type);
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    return hasValidType || hasValidExtension;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && validateFile(file)) {
      onFileSelect(file);
      setUploadStatus('success');
    } else {
      setUploadStatus('error');
      setTimeout(() => setUploadStatus('idle'), 3000);
    }
  }, [onFileSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      onFileSelect(file);
      setUploadStatus('success');
    } else {
      setUploadStatus('error');
      setTimeout(() => setUploadStatus('idle'), 3000);
    }
  };

  const removeFile = () => {
    onFileSelect(null);
    setUploadStatus('idle');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-[#003f88] mb-4 sm:mb-6">Lista de Contatos</h2>
      
      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-xl p-4 sm:p-6 text-center transition-all duration-300 ${
            isDragOver
              ? 'border-[#003f88] bg-[#003f88] bg-opacity-5 scale-105'
              : uploadStatus === 'error'
              ? 'border-red-400 bg-red-50'
              : 'border-gray-300 hover:border-[#003f88] hover:bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto ${
              uploadStatus === 'error' ? 'bg-red-100' : 'bg-[#003f88] bg-opacity-10'
            }`}>
              {uploadStatus === 'error' ? (
                <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
              ) : (
                <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-[#003f88]" />
              )}
            </div>
            
            <div className="space-y-2">
              <p className="font-semibold text-gray-900 text-sm sm:text-base">
                {uploadStatus === 'error' ? 'Arquivo inválido' : 'Upload do arquivo CSV'}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">
                {uploadStatus === 'error' 
                  ? 'Selecione um arquivo CSV válido'
                  : 'Arraste aqui ou clique para selecionar'
                }
              </p>
            </div>
            
            <label className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-[#003f88] text-white text-sm font-semibold rounded-xl hover:bg-[#002c5f] transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="hidden"
              />
              Selecionar Arquivo
            </label>
            
            <p className="text-xs text-gray-500">Apenas arquivos .csv</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* File info card */}
          <div className="flex items-center justify-between p-3 sm:p-4 bg-[#2cab4f] bg-opacity-10 border border-[#2cab4f] border-opacity-30 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#2cab4f] bg-opacity-20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#2cab4f]" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm sm:text-base truncate max-w-32 sm:max-w-none">{selectedFile.name}</p>
                <p className="text-xs sm:text-sm text-gray-600">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="p-2 hover:bg-[#2cab4f] hover:bg-opacity-20 rounded-xl transition-colors"
              title="Remover arquivo"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          
          {/* Quick stats */}
          {csvData && csvData.length > 0 && (
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-[#003f88]" />
                <span className="text-sm font-semibold text-[#003f88]">
                  {csvData.length - 1} contatos encontrados
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <File className="w-4 h-4 text-gray-600" />
                <span className="text-xs sm:text-sm text-gray-600">
                  {csvData[0]?.length || 0} colunas
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;