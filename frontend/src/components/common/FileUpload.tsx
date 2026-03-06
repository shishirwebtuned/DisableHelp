import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FileText, Upload, X, File as FileIcon, ImageIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils'; // Standard shadcn utility

interface FileUploadProps {
    accept?: string;
    disabled?: boolean;
    onFileSelect: (file: File | null) => void;
    previewUrl?: string | null;
    setPreviewUrl?: (url: string | null) => void;
    onRemoveLocal?: () => void;
}

const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function FileUpload({ 
    accept = '.pdf,.jpg,.jpeg,.png', 
    disabled = false, 
    onFileSelect, 
    previewUrl, 
    setPreviewUrl, 
    onRemoveLocal 
}: FileUploadProps) {
    const [localFile, setLocalFile] = useState<File | null>(null);
    const [localPreview, setLocalPreview] = useState<string | null>(previewUrl || null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (previewUrl !== undefined && previewUrl !== localPreview) {
            setLocalPreview(previewUrl || null);
        }
    }, [previewUrl]);

    useEffect(() => {
        return () => {
            if (localPreview && localPreview.startsWith('blob:')) {
                URL.revokeObjectURL(localPreview);
            }
        };
    }, [localPreview]);

    const MAX_SIZE = 10 * 1024 * 1024;
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

    const processFile = useCallback((file: File | null) => {
        if (!file) {
            setLocalFile(null);
            onFileSelect(null);
            if (setPreviewUrl) setPreviewUrl(null);
            setLocalPreview(null);
            return;
        }

        if (!allowedTypes.includes(file.type)) {
            toast.error('Format not supported. Please use PDF, JPG, or PNG.');
            return;
        }
        if (file.size > MAX_SIZE) {
            toast.error('File is too large (max 10MB).');
            return;
        }

        setLocalFile(file);
        onFileSelect(file);
        const url = URL.createObjectURL(file);
        setLocalPreview(url);
        if (setPreviewUrl) setPreviewUrl(url);
    }, [onFileSelect, setPreviewUrl]);

    // Handlers
    const onButtonClick = () => fileInputRef.current?.click();
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        processFile(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (disabled) return;
        const file = e.dataTransfer.files?.[0] || null;
        processFile(file);
    };

    const isPdf = localFile?.type === 'application/pdf' || (localPreview?.includes('.pdf') ?? false);

    return (
        <div className="w-full space-y-3">
            <Label className="text-sm font-semibold text-foreground/80">Attachment</Label>
            
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={cn(
                    "relative group cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 ease-in-out",
                    "flex flex-col items-center justify-center gap-4 p-8",
                    isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-muted-foreground/25 hover:border-primary/50 bg-background",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={onButtonClick}
            >
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept={accept} 
                    onChange={handleChange} 
                    disabled={disabled} 
                />

                <div className="p-4 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                    <Upload className={cn("h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors")} />
                </div>

                <div className="text-center">
                    <p className="text-sm font-medium">
                        {isDragging ? "Drop it here" : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        PDF, PNG, JPG up to 10MB
                    </p>
                </div>
            </div>

            {/* Preview Section */}
            {(localFile || localPreview) && (
                <div className="relative overflow-hidden rounded-lg border bg-card animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center justify-between p-3 border-b bg-muted/30">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 bg-background rounded border">
                                {isPdf ? <FileText className="h-4 w-4 text-blue-500" /> : <ImageIcon className="h-4 w-4 text-orange-500" />}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs font-medium truncate max-w-[200px]">
                                    {localFile ? localFile.name : 'Existing Document'}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                    {localFile ? formatBytes(localFile.size) : 'Cloud Storage'}
                                </span>
                            </div>
                        </div>
                        
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                                e.stopPropagation();
                                processFile(null);
                                if (onRemoveLocal) onRemoveLocal();
                            }}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="relative h-48 w-full bg-muted/10 flex items-center justify-center">
                        {isPdf ? (
                            <div className="flex flex-col items-center gap-2">
                                <FileIcon className="h-12 w-12 text-muted-foreground/40" />
                                <span className="text-xs text-muted-foreground">PDF Preview not available</span>
                                <Button variant="outline" size="sm" asChild>
                                    <a href={localPreview || ''} target="_blank" rel="noreferrer">View PDF</a>
                                </Button>
                            </div>
                        ) : (
                            <img 
                                src={localPreview || ''} 
                                alt="Preview" 
                                className="h-full w-full object-contain p-2"
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}