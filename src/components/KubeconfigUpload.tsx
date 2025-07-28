import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Upload, CheckCircle2, RotateCcw, Loader2, AlertCircle, Shield } from 'lucide-react';
import { uploadKubeconfig } from '../api/api';

interface KubeconfigUploadProps {
  sessionId: string;
  isReady: boolean;
  onReady: () => void;
  onReset: () => void;
  onClose?: () => void;
}

const KubeconfigUpload: React.FC<KubeconfigUploadProps> = ({ 
  sessionId, 
  isReady, 
  onReady, 
  onReset,
  onClose
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = e.target.files;
    setFile(files && files.length > 0 ? files[0] : null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    setError(null);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;
    
    setError(null);
    setUploading(true);
    
    try {
      await uploadKubeconfig(sessionId, file);
      onReady();
      setFile(null);
      
      // Auto-close dialog after successful upload
      setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleReupload = () => {
    setError(null);
    setFile(null);
    onReset();
  };

  if (isReady) {
    return (
      <div className="text-center py-4">
        <div className="p-2 bg-success/10 rounded-xl w-fit mx-auto mb-3">
          <CheckCircle2 className="h-6 w-6 text-success" />
        </div>
        <h3 className="font-medium text-text-primary mb-1 text-sm">Configuration Ready</h3>
        <p className="text-text-tertiary text-xs mb-3">
          Your kubeconfig has been uploaded successfully
        </p>
        <button
          onClick={handleReupload}
          className="flex items-center gap-1.5 button-secondary mx-auto text-xs px-3 py-1.5"
        >
          <RotateCcw className="h-3 w-3" />
          Upload New Config
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Privacy Notice */}
      <div className="flex items-start gap-2 p-2.5 bg-accent/5 border border-accent/20 rounded-lg">
        <Shield className="h-3 w-3 text-accent mt-0.5 flex-shrink-0" />
        <p className="text-xs text-text-secondary leading-relaxed">
          <span className="font-medium text-accent">Privacy:</span> Your kubeconfig is session-only and automatically deleted when the session ends.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div
          className={`border-2 border-dashed rounded-xl p-4 text-center transition-all duration-200 ${
            dragOver
              ? 'border-accent bg-accent/5'
              : file
              ? 'border-success bg-success/5'
              : 'border-border hover:border-border-light'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="space-y-2">
            <div className={`p-2 rounded-xl w-fit mx-auto ${
              file ? 'bg-success/10' : 'bg-accent/10'
            }`}>
              {file ? (
                <CheckCircle2 className="h-5 w-5 text-success" />
              ) : (
                <Upload className="h-5 w-5 text-accent" />
              )}
            </div>
            
            <div>
              <h3 className="font-medium text-text-primary mb-1 text-sm">
                {file ? 'File Selected' : 'Upload Kubeconfig'}
              </h3>
              <p className="text-text-tertiary text-xs">
                {file ? file.name : 'Drag and drop or click to browse'}
              </p>
            </div>
            
            <input
              type="file"
              accept="*"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
              id="kubeconfig-upload"
            />
            
            {!file && (
              <label
                htmlFor="kubeconfig-upload"
                className="button-secondary cursor-pointer inline-flex items-center gap-1.5 text-xs px-3 py-1.5"
              >
                <Upload className="h-3 w-3" />
                Choose File
              </label>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-2 bg-error/10 border border-error/20 rounded-lg text-error text-xs">
            <AlertCircle className="h-3 w-3" />
            {error}
          </div>
        )}

        {file && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFile(null)}
              className="button-secondary flex-1 text-xs px-3 py-1.5"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="button-primary flex-1 flex items-center justify-center gap-1.5 text-xs px-3 py-1.5"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-3 w-3" />
                  Upload
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default KubeconfigUpload;