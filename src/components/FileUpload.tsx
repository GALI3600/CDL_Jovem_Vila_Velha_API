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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Lista de Contatos</h2>
      
      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
            isDragOver
              ? 'border-[#003f88] bg-blue-50'
              : uploadStatus === 'error'
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-[#003f88] hover:bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center space-y-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              uploadStatus === 'error' ? 'bg-red-100' : 'bg-gray-100'
            }`}>
              {uploadStatus === 'error' ? (
                <AlertCircle className="w-6 h-6 text-red-500" />
              ) : (
                <Upload className="w-6 h-6 text-gray-400" />
              )}
            </div>
            
            <div>
              <p className="font-medium text-gray-900 mb-1">
                {uploadStatus === 'error' ? 'Arquivo inválido' : 'Upload do arquivo CSV'}
              </p>
              <p className="text-sm text-gray-500 mb-3">
                {uploadStatus === 'error' 
                  ? 'Selecione um arquivo CSV válido'
                  : 'Arraste aqui ou clique para selecionar'
                }
              </p>
            </div>
            
            <label className="inline-flex items-center px-4 py-2 bg-[#003f88] text-white text-sm font-medium rounded-lg hover:bg-[#002c5f] transition-colors cursor-pointer">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="hidden"
              />
              Selecionar Arquivo
            </label>
            
            <p className="text-xs text-gray-400">Apenas arquivos .csv</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* File info card */}
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-[#2cab4f]" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="p-2 hover:bg-green-100 rounded-full transition-colors"
              title="Remover arquivo"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          
          {/* Quick stats */}
          {csvData && csvData.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {csvData.length - 1} contatos encontrados
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <File className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500">
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