import React, { useCallback, useState } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, Users, Send, Clock } from 'lucide-react';
import { ApiService, CsvUploadResponse } from '../services/api';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  csvData: string[][] | null;
}

interface UploadResult {
  success: boolean;
  data?: CsvUploadResponse;
  error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, selectedFile, csvData }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

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

  const uploadFileToServer = async (file: File) => {
    setIsUploading(true);
    setUploadResult(null);

    try {
      const result = await ApiService.uploadCsv(file);
      setUploadResult({
        success: true,
        data: result
      });
      setUploadStatus('success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no upload';
      setUploadResult({
        success: false,
        error: errorMessage
      });
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  const processFile = async (file: File) => {
    if (!validateFile(file)) {
      setUploadStatus('error');
      setUploadResult({
        success: false,
        error: 'Arquivo deve ser um CSV válido'
      });
      setTimeout(() => setUploadStatus('idle'), 3000);
      return;
    }

    // First, read the file for local preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim() !== '');
      const data = lines.map(line => {
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
      
      // Update parent component with CSV data for preview
      onFileSelect(file);
    };
    reader.readAsText(file);

    // Then upload to server
    await uploadFileToServer(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file) {
      processFile(file);
    }
  }, [onFileSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const removeFile = () => {
    onFileSelect(null);
    setUploadStatus('idle');
    setUploadResult(null);
    setIsUploading(false);
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
              {uploadResult?.error && (
                <p className="text-xs text-red-600 mt-2 max-w-sm mx-auto">
                  {uploadResult.error}
                </p>
              )}
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
          <div className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border ${
            isUploading 
              ? 'bg-[#f4c21d] bg-opacity-10 border-[#f4c21d] border-opacity-30'
              : uploadStatus === 'success'
                ? 'bg-[#2cab4f] bg-opacity-10 border-[#2cab4f] border-opacity-30'
                : uploadStatus === 'error'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${
                isUploading 
                  ? 'bg-[#f4c21d] bg-opacity-20'
                  : uploadStatus === 'success'
                    ? 'bg-[#2cab4f] bg-opacity-20'
                    : uploadStatus === 'error'
                      ? 'bg-red-100'
                      : 'bg-gray-100'
              }`}>
                {isUploading ? (
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-[#f4c21d] animate-spin" />
                ) : uploadStatus === 'success' ? (
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#2cab4f]" />
                ) : uploadStatus === 'error' ? (
                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                ) : (
                  <Send className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                )}
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
              className="p-2 hover:bg-red-100 rounded-xl transition-colors"
              title="Remover arquivo"
              disabled={isUploading}
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Upload Status */}
          {(isUploading || uploadResult) && (
            <div className={`p-3 sm:p-4 rounded-xl border ${
              isUploading 
                ? 'bg-[#f4c21d] bg-opacity-10 border-[#f4c21d] border-opacity-30'
                : uploadResult?.success
                  ? 'bg-[#2cab4f] bg-opacity-10 border-[#2cab4f] border-opacity-30'
                  : 'bg-red-50 border-red-200'
            }`}>
              {isUploading ? (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-[#f4c21d] animate-spin" />
                  <span className="text-sm font-semibold text-[#f4c21d]">Enviando arquivo...</span>
                </div>
              ) : uploadResult?.success ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-[#2cab4f]" />
                    <span className="text-sm font-semibold text-[#2cab4f]">Upload realizado com sucesso!</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    <p><strong>{uploadResult.data?.imported_count}</strong> contatos importados de <strong>{uploadResult.data?.total_rows}</strong> linhas</p>
                    {uploadResult.data?.warnings && uploadResult.data.warnings.length > 0 && (
                      <div className="mt-2">
                        <p className="text-[#f4c21d] font-medium">Avisos:</p>
                        <ul className="list-disc list-inside space-y-1 mt-1">
                          {uploadResult.data.warnings.map((warning, index) => (
                            <li key={index} className="text-[#f4c21d]">{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <div>
                    <span className="text-sm font-semibold text-red-600">Erro no upload</span>
                    <p className="text-xs text-red-600 mt-1">{uploadResult?.error}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Quick stats - Only show if we have local CSV data */}
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