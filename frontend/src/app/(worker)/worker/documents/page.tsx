'use client';

import { useState } from 'react';
import { FileText, Upload, Download, Eye, Trash2, Plus, Shield, Award, Briefcase, FileCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';

export default function DocumentsPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [expiryDate, setExpiryDate] = useState<string>('');

    const documentCategories = [
        { label: 'Certifications', count: 5, icon: Award },
        { label: 'Insurance', count: 2, icon: Shield },
        { label: 'Contracts', count: 3, icon: FileCheck },
        { label: 'Other', count: 4, icon: FileText },
    ];

    const documents = [
        {
            id: 1,
            name: 'NDIS Worker Screening Check',
            category: 'Certifications',
            uploadDate: '2025-06-15',
            expiryDate: '2026-06-15',
            size: '2.4 MB',
            status: 'verified',
            type: 'pdf',
        },
        {
            id: 2,
            name: 'Working with Children Check',
            category: 'Certifications',
            uploadDate: '2025-08-20',
            expiryDate: '2030-08-20',
            size: '1.8 MB',
            status: 'verified',
            type: 'pdf',
        },
        {
            id: 3,
            name: 'First Aid Certificate',
            category: 'Certifications',
            uploadDate: '2025-03-10',
            expiryDate: '2028-03-10',
            size: '1.2 MB',
            status: 'verified',
            type: 'pdf',
        },
        {
            id: 4,
            name: 'CPR Certification',
            category: 'Certifications',
            uploadDate: '2025-03-10',
            expiryDate: '2026-03-10',
            size: '980 KB',
            status: 'expiring-soon',
            type: 'pdf',
        },
        {
            id: 5,
            name: 'Public Liability Insurance',
            category: 'Insurance',
            uploadDate: '2025-12-01',
            expiryDate: '2026-12-01',
            size: '3.1 MB',
            status: 'active',
            type: 'pdf',
        },
        {
            id: 6,
            name: 'Service Agreement - John Client',
            category: 'Contracts',
            uploadDate: '2025-09-15',
            expiryDate: null,
            size: '450 KB',
            status: 'active',
            type: 'pdf',
        },
        {
            id: 7,
            name: 'Driver License',
            category: 'Other',
            uploadDate: '2025-05-01',
            expiryDate: '2028-05-01',
            size: '1.5 MB',
            status: 'verified',
            type: 'jpg',
        },
    ];

    const getStatusBadge = (status: string) => {
        const config: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }> = {
            verified: { variant: 'default', label: 'Verified' },
            active: { variant: 'outline', label: 'Active' },
            'expiring-soon': { variant: 'destructive', label: 'Expiring Soon' },
            pending: { variant: 'secondary', label: 'Pending Review' },
        };
        const { variant, label } = config[status] || { variant: 'secondary', label: status };
        return <Badge variant={variant}>{label}</Badge>;
    };

    const getFileIcon = (type: string) => {
        return <FileText className="h-4 w-4" />;
    };

    const calculateStorageUsed = () => {
        // Mock calculation
        return 12.4; // MB
    };

    const storageLimit = 100; // MB
    const storageUsed = calculateStorageUsed();
    const storagePercentage = (storageUsed / storageLimit) * 100;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Documents & Files</h1>
                    <p className="text-muted-foreground">Manage your certifications, insurance, and files</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Upload Document
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Upload Document</DialogTitle>
                            <DialogDescription>Add a new document to your profile</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="doc-name">Document Name</Label>
                                <Input id="doc-name" placeholder="e.g., First Aid Certificate" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select>
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="certifications">Certifications</SelectItem>
                                        <SelectItem value="insurance">Insurance</SelectItem>
                                        <SelectItem value="contracts">Contracts</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="expiry">Expiry Date (Optional)</Label>
                                <DatePicker
                                    date={expiryDate ? new Date(expiryDate) : undefined}
                                    setDate={(date) => setExpiryDate(date ? format(date, 'yyyy-MM-dd') : '')}
                                    placeholder="Select expiry date"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="file">File</Label>
                                <Input type="file" id="file" accept=".pdf,.jpg,.jpeg,.png" />
                                <p className="text-xs text-muted-foreground">
                                    Accepted formats: PDF, JPG, PNG (Max 10 MB)
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={() => setIsDialogOpen(false)}>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Storage Usage */}
            <Card>
                <CardHeader>
                    <CardTitle>Storage Usage</CardTitle>
                    <CardDescription>
                        {storageUsed.toFixed(1)} MB of {storageLimit} MB used
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Progress value={storagePercentage} className="h-2" />
                </CardContent>
            </Card>

            {/* Document Categories */}
            <div className="grid gap-4 md:grid-cols-4">
                {documentCategories.map((category) => (
                    <Card key={category.label}>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <category.icon className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{category.label}</p>
                                    <p className="text-2xl font-bold">{category.count}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Documents Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Your Documents</CardTitle>
                    <CardDescription>All uploaded documents and certifications</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="all">
                        <TabsList>
                            <TabsList>All Documents</TabsList>
                            <TabsTrigger value="certifications">Certifications</TabsTrigger>
                            <TabsTrigger value="insurance">Insurance</TabsTrigger>
                            <TabsTrigger value="contracts">Contracts</TabsTrigger>
                        </TabsList>
                        <TabsContent value="all" className="mt-4">
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Document Name</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Upload Date</TableHead>
                                            <TableHead>Expiry Date</TableHead>
                                            <TableHead>Size</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {documents.map((doc) => (
                                            <TableRow key={doc.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {getFileIcon(doc.type)}
                                                        <span className="font-medium">{doc.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{doc.category}</Badge>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {new Date(doc.uploadDate).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {doc.expiryDate
                                                        ? new Date(doc.expiryDate).toLocaleDateString()
                                                        : 'N/A'}
                                                </TableCell>
                                                <TableCell className="text-sm">{doc.size}</TableCell>
                                                <TableCell>{getStatusBadge(doc.status)}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm">
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
