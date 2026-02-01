'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
    fetchServices,
    createService,
    updateService,
    deleteService,
    toggleServiceStatus,
    Service,
} from '@/redux/slices/servicesSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Edit, Pencil, Trash2, Settings } from 'lucide-react';
import { DeleteConfirmation } from '@/components/common/DeleteConfirmation';

export default function AdminServicesPage() {
    const dispatch = useAppDispatch();
    const { items: services, loading } = useAppSelector((state) => state.services);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean;
        id: string | null;
        name: string;
    }>({ isOpen: false, id: null, name: '' });

    useEffect(() => {
        dispatch(fetchServices());
    }, [dispatch]);

    const openForNew = () => {
        setEditingServiceId(null);
        setIsDialogOpen(true);
    };

    const openForEdit = (service: Service) => {
        setEditingServiceId(service.id);
        setIsDialogOpen(true);
    };

    const openDeleteConfirmation = (id: string, name: string) => {
        setDeleteConfirmation({ isOpen: true, id, name });
    };

    const handleDelete = () => {
        if (deleteConfirmation.id) {
            dispatch(deleteService(deleteConfirmation.id));
        }
    };

    const handleToggleStatus = (id: string, currentStatus: boolean) => {
        dispatch(toggleServiceStatus({ id, status: !currentStatus }));
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Services Management</h1>
                    <p className="text-muted-foreground">
                        Manage NDIS services offered on the platform
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openForNew} className="flex items-center gap-2">
                            <Pencil className="h-4 w-4" />
                            Add Service
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>
                                {editingServiceId ? 'Edit Service' : 'Add New Service'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingServiceId
                                    ? 'Update the service details below'
                                    : 'Create a new NDIS service type'}
                            </DialogDescription>
                        </DialogHeader>
                        <ServiceForm
                            service={
                                editingServiceId
                                    ? services.find((srv) => srv.id === editingServiceId)
                                    : undefined
                            }
                            onClose={() => setIsDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Service Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {services.map((service) => (
                                <TableRow key={service.id}>
                                    <TableCell className="font-medium">{service.name}</TableCell>
                                    <TableCell className="max-w-md">
                                        <p className="text-sm text-muted-foreground truncate">
                                            {service.description}
                                        </p>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Switch
                                                checked={service.status}
                                                onCheckedChange={() =>
                                                    handleToggleStatus(service.id, service.status)
                                                }
                                            />
                                            <span className="text-sm text-muted-foreground">
                                                {service.status ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openForEdit(service)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    openDeleteConfirmation(service.id, service.name)
                                                }
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {services.length === 0 && !loading && (
                        <div className="text-center py-12 text-muted-foreground">
                            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No services configured yet</p>
                        </div>
                    )}
                </div>
            </div>

            <DeleteConfirmation
                isOpen={deleteConfirmation.isOpen}
                onClose={() => setDeleteConfirmation({ isOpen: false, id: null, name: '' })}
                onConfirm={handleDelete}
                title="Delete Service"
                itemName={deleteConfirmation.name}
                description="This action cannot be undone. This will permanently delete this service and it will no longer be available to workers."
            />
        </div>
    );
}

function ServiceForm({ service, onClose }: { service?: Service; onClose: () => void }) {
    const dispatch = useAppDispatch();
    const [formData, setFormData] = useState({
        name: service?.name || '',
        description: service?.description || '',
        status: service?.status ?? true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (service) {
            // Update existing service
            await dispatch(
                updateService({
                    ...service,
                    ...formData,
                })
            );
        } else {
            // Create new service
            await dispatch(createService(formData));
        }
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Service Name *</Label>
                <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Personal Care"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what this service includes..."
                    rows={4}
                    required
                />
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit">{service ? 'Update Service' : 'Create Service'}</Button>
            </DialogFooter>
        </form>
    );
}
