'use client';
import { useState, useEffect } from 'react';
import { FileText, Upload, Download, Eye, Trash2, Plus, Loader2, FileWarning, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import FileUpload from '@/components/common/FileUpload';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePicker } from '@/components/ui/date-picker';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { format } from 'date-fns';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { getmee } from '@/redux/slices/authSlice';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';

interface Document {
    _id: string;
    name: string;
    category: string;
    uploadDate: string;
    expiryDate?: string;
    size: string;
    status: string;
    fileUrl: string;
    type: string;
}

export default function DocumentsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [expiryDate, setExpiryDate] = useState<string>('');
    const [category, setCategory] = useState('cpr');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmTarget, setConfirmTarget] = useState<string | null>(null);
    const [isUpdateMode, setIsUpdateMode] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [wwccNumber, setWwccNumber] = useState('');

    const { mee, isLoading: isAuthLoading } = useSelector((state: any) => state.auth);

    useEffect(() => {
        if (mee && (mee as any).profile) {
            const profile = (mee as any).profile;
            const personalDetails = profile.personalDetails;
            const mappedDocs: Document[] = [];

            const getStatus = (expiry?: string) => {
                if (!expiry) return 'active';
                const today = new Date();
                const expiryDate = new Date(expiry);
                const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays < 0) return 'expired';
                if (diffDays < 30) return 'expiring-soon';
                return 'active';
            };

            const getCategoryLabel = (cat: string) => {
                const labels: Record<string, string> = {
                    cpr: 'CPR Certificate',
                    firstAid: 'First Aid',
                    driverLicense: 'Driver License',
                    wwcc: 'WWCC'
                };
                return labels[cat] || cat;
            };

            if (personalDetails?.additionalTraining) {
                const training = personalDetails.additionalTraining;
                const categories = ['cpr', 'firstAid', 'driverLicense'] as const;

                categories.forEach(cat => {
                    const doc = training[cat];
                    if (doc?.file?.url) {
                        mappedDocs.push({
                            _id: cat,
                            name: getCategoryLabel(cat),
                            category: cat,
                            uploadDate: profile.updatedAt || new Date().toISOString(),
                            expiryDate: doc.expiryDate,
                            size: 'N/A',
                            status: doc.isVerified ? 'verified' : getStatus(doc.expiryDate),
                            fileUrl: doc.file.url,
                            type: doc.file.url.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'
                        });
                    }
                });
            }

            if (personalDetails?.wwcc?.file?.url) {
                const wwcc = personalDetails.wwcc;
                mappedDocs.push({
                    _id: 'wwcc',
                    name: 'WWCC',
                    category: 'wwcc',
                    uploadDate: profile.updatedAt || new Date().toISOString(),
                    expiryDate: wwcc.expiryDate,
                    size: 'N/A',
                    status: wwcc.isVerified ? 'verified' : getStatus(wwcc.expiryDate),
                    fileUrl: wwcc.file.url,
                    type: wwcc.file.url.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'
                });
            }

            setDocuments(mappedDocs);
            setIsLoading(false);
        } else if (!isAuthLoading) {
            setIsLoading(false);
        }
    }, [mee, isAuthLoading]);

    // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     if (e.target.files && e.target.files[0]) {
    //         const file = e.target.files[0];
    //         const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    //         if (!allowedTypes.includes(file.type)) {
    //             toast.error('Only PDF and Image (JPG, PNG) formats are allowed.');
    //             return;
    //         }
    //         if (file.size > 10 * 1024 * 1024) {
    //             toast.error('File size must be less than 10MB.');
    //             return;
    //         }
    //         setSelectedFile(file);
    //         if (previewUrl) URL.revokeObjectURL(previewUrl);
    //         setPreviewUrl(URL.createObjectURL(file));
    //     }
    // };

    const handleUpload = async () => {
        if (!selectedFile) {
            return;
        }

        setIsUploading(true);
        const formData = new FormData();

        if (category === 'wwcc') {
            if (expiryDate) formData.append('personalDetails[wwcc][expiryDate]', expiryDate);
            if (wwccNumber) formData.append('personalDetails[wwcc][wwccNumber]', wwccNumber);
            formData.append('wwccFile', selectedFile);
            if (isUpdateMode) {
                // also include nested key for older endpoints and indicate which file to replace
                formData.append('personalDetails[wwcc][file]', selectedFile as any);
                formData.append('fileType', 'wwccFile');
            }
            formData.append('personalDetails[wwcc][isVerified]', 'false');
        } else {
            if (expiryDate) formData.append(`personalDetails[additionalTraining][${category}][expiryDate]`, expiryDate);
            formData.append(`${category}File`, selectedFile);
            if (isUpdateMode) {
                // also include nested key for older endpoints and indicate which file to replace
                formData.append(`personalDetails[additionalTraining][${category}][file]`, selectedFile as any);
                formData.append('fileType', `${category}File`);
            }
            formData.append(`personalDetails[additionalTraining][${category}][isVerified]`, 'false');
        }

        try {
            await api.patch('profile/worker', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success('Document uploaded successfully!');
            setIsDialogOpen(false);
            setCategory('cpr');
            setWwccNumber('');
            setExpiryDate('');
            setSelectedFile(null);
            setIsUpdateMode(false);
            dispatch(getmee());
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to upload document');
        } finally {
            setIsUploading(false);
        }
    };

    // Open confirmation modal for delete
    const handleDeleteRequest = (docId: string) => {
        setConfirmTarget(docId);
        setConfirmOpen(true);
    };

    // Perform actual delete
    const handleDelete = async (docId: string | null) => {
        if (!docId) return;

        setIsDeleting(docId);
        try {
            // Preferred API: delete file by fileType
            await api.delete('profile/worker/file', { data: { fileType: `${docId}File` } });
            dispatch(getmee());
            toast.success('Document removed successfully');
        } catch (error: any) {
            // Fallback: attempt to clear fields via patch (older behavior)
            try {
                const formData = new FormData();
                if (docId === 'wwcc') {
                    formData.append('personalDetails[wwcc][file]', '');
                    formData.append('personalDetails[wwcc][expiryDate]', '');
                    formData.append('personalDetails[wwcc][wwccNumber]', '');
                    // also include top-level key
                    formData.append('wwccFile', '');
                } else {
                    formData.append(`personalDetails[additionalTraining][${docId}][file]`, '');
                    formData.append(`${docId}File`, '');
                    formData.append(`personalDetails[additionalTraining][${docId}][expiryDate]`, '');
                }
                await api.patch('profile/worker', formData);
                toast.success('Document removed successfully');
                dispatch(getmee());
            } catch (err) {
                toast.error('Failed to remove document');
                console.error('Delete fallback failed', err);
            }
        } finally {
            setIsDeleting(null);
            setConfirmOpen(false);
            setConfirmTarget(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const config: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }> = {
            verified: { variant: 'default', label: 'Verified' },
            active: { variant: 'outline', label: 'Active' },
            'expiring-soon': { variant: 'destructive', label: 'Expiring Soon' },
            expired: { variant: 'destructive', label: 'Expired' },
            pending: { variant: 'secondary', label: 'Pending Review' },
        };
        const { variant, label } = config[status] || { variant: 'secondary', label: status || 'Pending' };
        return <Badge variant={variant}>{label}</Badge>;
    };
    // Check if a category already has a document
    const isCategoryUploaded = (cat: string) => {
        return documents.some(doc => doc.category === cat);
    };

    // Check if current selected category has a document (respect update mode)
    const categoryHasDocument = !isUpdateMode && isCategoryUploaded(category);

    const handleUpdateRequest = (doc: Document) => {
        // Open upload dialog in update mode (allow replacing)
        setIsUpdateMode(true);
        setCategory(doc.category);
        setExpiryDate(doc.expiryDate || '');
        // set preview to existing file url so FileUpload shows current preview
        setPreviewUrl(doc.fileUrl || null);
        // clear selected file to force user to pick new one
        setSelectedFile(null);
        setIsDialogOpen(true);
    };

    // reset update mode and preview when dialog closes
    useEffect(() => {
        if (!isDialogOpen) {
            setIsUpdateMode(false);
            setPreviewUrl(null);
            setSelectedFile(null);
        }
    }, [isDialogOpen]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div >
                    <h1 className="text-2xl font-bold tracking-tight">Documents & Files</h1>
                    <p className="text-muted-foreground">Manage your certifications and compliance documents</p>
                </div>
                <div >
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full md:w-auto">
                                <Plus className="h-4 w-4 mr-2" />
                                Upload Document
                            </Button>
                        </DialogTrigger>
                        <DialogContent className=" max-h-[90vh]  overflow-x-hidden  sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Upload Document</DialogTitle>
                                <DialogDescription>Select a category and upload your file.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cpr" disabled={!isUpdateMode && isCategoryUploaded('cpr')}>CPR Certificate {!isUpdateMode && isCategoryUploaded('cpr') && '(Already uploaded)'}</SelectItem>
                                            <SelectItem value="firstAid" disabled={!isUpdateMode && isCategoryUploaded('firstAid')}>First Aid {!isUpdateMode && isCategoryUploaded('firstAid') && '(Already uploaded)'}</SelectItem>
                                            <SelectItem value="driverLicense" disabled={!isUpdateMode && isCategoryUploaded('driverLicense')}>Driver License {!isUpdateMode && isCategoryUploaded('driverLicense') && '(Already uploaded)'}</SelectItem>
                                            <SelectItem value="wwcc" disabled={!isUpdateMode && isCategoryUploaded('wwcc')}>WWCC {!isUpdateMode && isCategoryUploaded('wwcc') && '(Already uploaded)'}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {categoryHasDocument && (
                                        <p className="text-sm text-amber-600 dark:text-amber-500 flex items-center gap-1">
                                            <FileWarning className="h-4 w-4" />
                                            This category already has a document. Delete it first to upload a new one.
                                        </p>
                                    )}
                                </div>

                                {category === 'wwcc' && (
                                    <div className="space-y-2">
                                        <Label>WWCC Number</Label>
                                        <Input
                                            placeholder="Enter WWCC Number"
                                            value={wwccNumber}
                                            onChange={(e) => setWwccNumber(e.target.value)}
                                            disabled={categoryHasDocument}
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label>Expiry Date</Label>
                                    <DatePicker
                                        date={expiryDate ? new Date(expiryDate) : undefined}
                                        setDate={(date) => setExpiryDate(date ? format(date, 'yyyy-MM-dd') : '')}
                                        placeholder="Select expiry date"
                                        disabled={categoryHasDocument}
                                    />
                                </div>

                                <FileUpload
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onFileSelect={(file) => setSelectedFile(file)}
                                    previewUrl={previewUrl}
                                    setPreviewUrl={setPreviewUrl}
                                    disabled={categoryHasDocument}
                                    onRemoveLocal={() => {
                                        // only remove from the local form state so user can upload a new file
                                        setPreviewUrl(null);
                                        setSelectedFile(null);
                                        setIsUpdateMode(true);
                                    }}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isUploading}>Cancel</Button>
                                <Button onClick={handleUpload} disabled={isUploading || categoryHasDocument}>
                                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                                    Upload
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="all">All Files</TabsTrigger>
                    <TabsTrigger value="cpr">CPR</TabsTrigger>
                    <TabsTrigger value="firstAid">First Aid</TabsTrigger>
                    <TabsTrigger value="driverLicense">License</TabsTrigger>
                    <TabsTrigger value="wwcc">WWCC</TabsTrigger>
                </TabsList>

                {['all', 'cpr', 'firstAid', 'driverLicense', 'wwcc'].map((tab) => (
                    <TabsContent key={tab} value={tab} className="mt-0">
                        <div className=" overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="w-[100px]">Preview</TableHead>
                                        <TableHead>Document Details</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-32 text-center">
                                                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                                            </TableCell>
                                        </TableRow>
                                    ) : (tab === 'all' ? documents : documents.filter(d => d.category === tab)).length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                                No documents found in this category.
                                            </TableCell>
                                        </TableRow>
                                    ) : (tab === 'all' ? documents : documents.filter(d => d.category === tab)).map((doc) => (
                                        <TableRow key={doc._id} className="hover:bg-muted/30 transition-colors">
                                            <TableCell>
                                                <div
                                                    className="relative w-14 h-14 rounded-lg border bg-muted flex items-center justify-center overflow-hidden cursor-pointer group"
                                                    onClick={() => window.open(doc.fileUrl, '_blank')}
                                                >
                                                    {doc.type === 'application/pdf' ? (
                                                        <div className="flex flex-col items-center">
                                                            <FileText className="h-6 w-6 text-red-500" />
                                                            <span className="text-[8px] font-bold uppercase">PDF</span>
                                                        </div>
                                                    ) : (
                                                        <img src={doc.fileUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                    )}
                                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                        <Eye className="h-4 w-4 text-white" />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm">{doc.name}</span>
                                                    <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                                                        <span>{doc.expiryDate ? `Expires: ${format(new Date(doc.expiryDate), 'dd MMM yyyy')}` : 'No Expiry'}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(doc.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                                                            <Eye className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleUpdateRequest(doc)} disabled={isUploading}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                        onClick={() => handleDeleteRequest(doc._id)}
                                                        disabled={isDeleting === doc._id}
                                                    >
                                                        {isDeleting === doc._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Delete Document"
                description="Are you sure you want to remove this document? This action cannot be undone."
                onConfirm={async () => { await handleDelete(confirmTarget); }}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                isLoading={!!isDeleting}
            />
        </div>
    );
}