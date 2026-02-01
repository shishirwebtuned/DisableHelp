'use client';

import { useState, useRef } from 'react';
import { Upload, X, Eye, Download, Trash2, FileText, Image as ImageIcon, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

interface UploadedDocument {
    id: string;
    name: string;
    category: string;
    file: File;
    preview?: string;
    uploadDate: string;
    status: 'pending' | 'verified' | 'rejected';
}

export default function ClientDocumentsPage() {
    const [documents, setDocuments] = useState<UploadedDocument[]>([
        {
            id: '1',
            name: 'NDIS Plan',
            category: 'ndis',
            file: new File([], 'ndis-plan.pdf'),
            uploadDate: '2026-01-15',
            status: 'verified',
        },
        {
            id: '2',
            name: 'Medical Assessment',
            category: 'medical',
            file: new File([], 'medical-report.pdf'),
            uploadDate: '2026-01-10',
            status: 'verified',
        },
    ]);
    
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<{ [key: string]: string }>({});
    const [selectedCategory, setSelectedCategory] = useState('');
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        
        files.forEach((file) => {
            // Create preview for images
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviews((prev) => ({
                        ...prev,
                        [file.name]: reader.result as string,
                    }));
                };
                reader.readAsDataURL(file);
            }
        });
        
        setSelectedFiles((prev) => [...prev, ...files]);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        const files = Array.from(e.dataTransfer.files);
        files.forEach((file) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviews((prev) => ({
                        ...prev,
                        [file.name]: reader.result as string,
                    }));
                };
                reader.readAsDataURL(file);
            }
        });
        
        setSelectedFiles((prev) => [...prev, ...files]);
    };

    const removeFile = (fileName: string) => {
        setSelectedFiles((prev) => prev.filter((f) => f.name !== fileName));
        setPreviews((prev) => {
            const newPreviews = { ...prev };
            delete newPreviews[fileName];
            return newPreviews;
        });
    };

    const handleSubmit = async () => {
        if (selectedFiles.length === 0 || !selectedCategory) {
            alert('Please select files and category');
            return;
        }

        setIsUploading(true);

        // Simulate upload with binary data
        const formData = new FormData();
        selectedFiles.forEach((file, index) => {
            formData.append(`file_${index}`, file);
        });
        formData.append('category', selectedCategory);

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Add uploaded files to documents list
            const newDocs: UploadedDocument[] = selectedFiles.map((file, index) => ({
                id: Date.now().toString() + index,
                name: file.name,
                category: selectedCategory,
                file: file,
                preview: previews[file.name],
                uploadDate: new Date().toISOString().split('T')[0],
                status: 'pending' as const,
            }));

            setDocuments((prev) => [...newDocs, ...prev]);
            setSelectedFiles([]);
            setPreviews({});
            setSelectedCategory('');
            
            alert('Documents uploaded successfully!');
        } catch (error) {
            alert('Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const getFileIcon = (fileName: string) => {
        if (fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            return <ImageIcon className="h-5 w-5 text-blue-600" />;
        }
        return <FileText className="h-5 w-5 text-gray-600" />;
    };

    const getStatusBadge = (status: string) => {
        const config = {
            verified: { variant: 'default' as const, label: 'Verified', icon: CheckCircle },
            pending: { variant: 'secondary' as const, label: 'Pending Review', icon: Clock },
            rejected: { variant: 'destructive' as const, label: 'Rejected', icon: X },
        };
        const { variant, label, icon: Icon } = config[status as keyof typeof config];
        return (
            <Badge variant={variant} className="flex items-center gap-1">
                <Icon className="h-3 w-3" />
                {label}
            </Badge>
        );
    };

    return (
        <div className="space-y-2">
            <div>
                <h1 className="text-xl font-bold tracking-tight">My Documents</h1>
                <p className="text-muted-foreground">Upload and manage your NDIS and support documents</p>
            </div>

            {/* Upload Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Upload New Documents</CardTitle>
                    <CardDescription>Upload NDIS plans, medical reports, and other important documents</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Category Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="category">Document Category *</Label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select document category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ndis">NDIS Plan</SelectItem>
                                <SelectItem value="medical">Medical Reports</SelectItem>
                                <SelectItem value="identification">Identification</SelectItem>
                                <SelectItem value="prescription">Prescriptions</SelectItem>
                                <SelectItem value="insurance">Insurance Documents</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Drag & Drop Zone */}
                    <div
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer bg-gray-50/50 dark:bg-gray-900/20"
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*,.pdf,.doc,.docx"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold mb-2">Drop files here or click to browse</h3>
                        <p className="text-sm text-muted-foreground">
                            Supports: Images (JPG, PNG), PDFs, Word documents
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Maximum file size: 10MB per file</p>
                    </div>

                    {/* Selected Files Preview */}
                    {selectedFiles.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="font-semibold">Selected Files ({selectedFiles.length})</h4>
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {selectedFiles.map((file) => (
                                    <div
                                        key={file.name}
                                        className="relative border rounded-lg p-3 bg-white dark:bg-slate-900"
                                    >
                                        {previews[file.name] ? (
                                            <div className="relative aspect-video mb-2 rounded overflow-hidden bg-gray-100">
                                                <img
                                                    src={previews[file.name]}
                                                    alt={file.name}
                                                    className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPreviewImage(previews[file.name]);
                                                    }}
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute top-1 right-1 bg-white/80 hover:bg-white h-7 w-7"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPreviewImage(previews[file.name]);
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center h-20 bg-gray-100 dark:bg-gray-800 rounded mb-2">
                                                {getFileIcon(file.name)}
                                            </div>
                                        )}
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{file.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {(file.size / 1024).toFixed(1)} KB
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 flex-shrink-0"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeFile(file.name);
                                                }}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Upload Button */}
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSelectedFiles([]);
                                setPreviews({});
                                setSelectedCategory('');
                            }}
                            disabled={selectedFiles.length === 0 || isUploading}
                        >
                            Clear All
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={selectedFiles.length === 0 || !selectedCategory || isUploading}
                        >
                            {isUploading ? (
                                <>
                                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'File' : 'Files'}
                                </>
                            )}
                        </Button>
                    </div>

                    {isUploading && (
                        <div className="space-y-2">
                            <Progress value={66} />
                            <p className="text-sm text-muted-foreground text-center">Uploading documents...</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Uploaded Documents List */}
            <Card>
                <CardHeader>
                    <CardTitle>My Uploaded Documents</CardTitle>
                    <CardDescription>View and manage your documents</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {documents.map((doc) => (
                            <div
                                key={doc.id}
                                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                {doc.preview ? (
                                    <div
                                        className="h-16 w-16 rounded overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80"
                                        onClick={() => setPreviewImage(doc.preview || '')}
                                    >
                                        <img
                                            src={doc.preview}
                                            alt={doc.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-16 w-16 rounded bg-muted flex items-center justify-center flex-shrink-0">
                                        {getFileIcon(doc.name)}
                                    </div>
                                )}
                                
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold truncate">{doc.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline" className="text-xs">
                                            {doc.category.toUpperCase()}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(doc.uploadDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {getStatusBadge(doc.status)}
                                    <div className="flex gap-1">
                                        {doc.preview && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setPreviewImage(doc.preview || '')}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="icon">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon">
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Image Preview Modal */}
            <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Document Preview</DialogTitle>
                    </DialogHeader>
                    {previewImage && (
                        <div className="relative max-h-[70vh] overflow-auto">
                            <img
                                src={previewImage}
                                alt="Preview"
                                className="w-full h-auto rounded"
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
