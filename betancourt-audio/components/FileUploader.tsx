
import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project } from '../types';
import { ApiService } from '../services/api';
import { Button, GlassCard, Badge } from './UI';

interface FileUploaderProps {
  project: Project;
  onClose: () => void;
  onComplete: () => void;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'QUEUED' | 'UPLOADING' | 'COMPLETED' | 'ERROR';
  speed: string;
  eta: string;
  uploadedBytes: number;
}

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB Chunks

export const FileUploader: React.FC<FileUploaderProps> = ({ project, onClose, onComplete }) => {
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isGlobalUploading, setIsGlobalUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    const formattedFiles: UploadingFile[] = newFiles.map(f => ({
      file: f,
      progress: 0,
      status: 'QUEUED',
      speed: '0 MB/s',
      eta: '--',
      uploadedBytes: 0
    }));
    setFiles(prev => [...prev, ...formattedFiles]);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uploadFile = async (fileObj: UploadingFile, index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      newFiles[index].status = 'UPLOADING';
      return newFiles;
    });

    const file = fileObj.file;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    let startByte = fileObj.uploadedBytes || 0;
    
    // Get MyAirBridge Token/URL from Backend
    const { uploadUrl, token } = await ApiService.getUploadToken(project.id, file.name, file.size);
    
    const startTime = Date.now();

    for (let chunkIdx = Math.floor(startByte / CHUNK_SIZE); chunkIdx < totalChunks; chunkIdx++) {
      const start = chunkIdx * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      try {
        // Retry Loop for this chunk
        let retries = 3;
        while (retries > 0) {
          try {
            await ApiService.uploadChunk(uploadUrl, chunk, chunkIdx, retries);
            break; // Success
          } catch (e) {
            retries--;
            console.warn(`Retrying chunk ${chunkIdx} for ${file.name}. Attempts left: ${retries}`);
            if (retries === 0) throw e;
            await new Promise(r => setTimeout(r, 1000 * (4 - retries))); // Backoff
          }
        }

        // Update Progress Calculation
        startByte = end;
        const now = Date.now();
        const elapsed = (now - startTime) / 1000; // seconds
        const speedBytes = startByte / elapsed;
        const speedMB = (speedBytes / (1024 * 1024)).toFixed(1);
        const remainingBytes = file.size - startByte;
        const etaSeconds = remainingBytes / speedBytes;
        
        setFiles(prev => {
           const newFiles = [...prev];
           newFiles[index].progress = (startByte / file.size) * 100;
           newFiles[index].uploadedBytes = startByte;
           newFiles[index].speed = `${speedMB} MB/s`;
           newFiles[index].eta = `${Math.ceil(etaSeconds)}s`;
           return newFiles;
        });

      } catch (error) {
         setFiles(prev => {
            const newFiles = [...prev];
            newFiles[index].status = 'ERROR';
            return newFiles;
         });
         return; // Stop this file
      }
    }

    // Finalize
    await ApiService.notifyUploadComplete(project.id, file.name);
    setFiles(prev => {
        const newFiles = [...prev];
        newFiles[index].status = 'COMPLETED';
        newFiles[index].progress = 100;
        return newFiles;
    });
  };

  const startUploads = async () => {
    setIsGlobalUploading(true);
    // Sequential upload to save bandwidth, or parallel with Promise.all
    for (let i = 0; i < files.length; i++) {
        if (files[i].status !== 'COMPLETED') {
            await uploadFile(files[i], i);
        }
    }
    setIsGlobalUploading(false);
    
    if (files.every(f => f.status === 'COMPLETED')) {
        setTimeout(onComplete, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-j-dark-bg/90 dark:bg-black/90 backdrop-blur-md" onClick={onClose} />
      
      <GlassCard className="w-full max-w-3xl relative z-10 max-h-[90vh] flex flex-col p-8">
        <div className="flex justify-between items-start mb-6">
            <div>
                <h2 className="text-2xl font-serif font-bold text-j-light-text dark:text-white">Upload Stems</h2>
                <p className="text-sm text-white/60">Project: {project.title} • High-Speed Transfer active</p>
            </div>
            <button onClick={onClose} className="text-white/50 hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        {/* Drop Zone */}
        <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer mb-6 ${
                isDragging 
                ? 'border-warm-glow bg-warm-glow/10' 
                : 'border-white/10 hover:border-white/20 hover:bg-white/5'
            }`}
        >
            <input 
                type="file" 
                ref={fileInputRef} 
                multiple 
                className="hidden" 
                onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))}
            />
            <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4 text-warm-glow">
                 <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
            </div>
            <h3 className="font-bold text-white mb-1">Drag & Drop Files (WAV/AIFF)</h3>
            <p className="text-sm text-white/50">Supports +100GB files. Bit-perfect transfer.</p>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto min-h-[200px] space-y-3 pr-2">
            {files.map((f, i) => (
                <div key={i} className="bg-white/5 rounded-lg p-3 flex items-center gap-4 border border-white/5">
                    <div className="w-10 h-10 rounded bg-black/30 flex items-center justify-center text-xs font-bold text-white/40">
                        WAV
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                            <h4 className="text-sm font-medium text-white truncate">{f.file.name}</h4>
                            <span className="text-xs text-white/50">{formatSize(f.file.size)}</span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-black/30 rounded-full overflow-hidden">
                            <motion.div 
                                className={`h-full ${f.status === 'ERROR' ? 'bg-red-500' : 'bg-warm-glow'}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${f.progress}%` }}
                            />
                        </div>
                        {/* Stats */}
                        {f.status === 'UPLOADING' && (
                             <div className="flex justify-between mt-1 text-[10px] text-white/40 font-mono">
                                <span>{f.speed}</span>
                                <span>ETA: {f.eta}</span>
                             </div>
                        )}
                        {f.status === 'ERROR' && <p className="text-[10px] text-red-500 mt-1">Upload Failed. Retrying...</p>}
                    </div>
                    <div>
                         {f.status === 'COMPLETED' && <span className="text-green-500">✓</span>}
                         {f.status === 'QUEUED' && <span className="text-white/20">•</span>}
                    </div>
                </div>
            ))}
        </div>

        {files.length > 0 && !isGlobalUploading && !files.every(f => f.status === 'COMPLETED') && (
            <div className="mt-6 pt-6 border-t border-white/10 text-right">
                <Button onClick={startUploads} variant="primary">
                    Start Upload ({files.length} Files)
                </Button>
            </div>
        )}
      </GlassCard>
    </div>
  );
};
