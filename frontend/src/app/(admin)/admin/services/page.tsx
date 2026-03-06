// 'use client';

// import { useEffect, useState } from 'react';
// import { useAppDispatch, useAppSelector } from '@/hooks/redux';
// import {
//     fetchServices,
//     createService,
//     updateService,
//     deleteService,
//     toggleServiceStatus,
//     Service,
// } from '@/redux/slices/servicesSlice';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Badge } from '@/components/ui/badge';
// import { Switch } from '@/components/ui/switch';
// import {
//     Table,
//     TableBody,
//     TableCell,
//     TableHead,
//     TableHeader,
//     TableRow,
// } from '@/components/ui/table';
// import {
//     Dialog,
//     DialogContent,
//     DialogDescription,
//     DialogFooter,
//     DialogHeader,
//     DialogTitle,
//     DialogTrigger,
// } from '@/components/ui/dialog';
// import { Edit, Pencil, Trash2 } from 'lucide-react';
// import { DeleteConfirmation } from '@/components/common/DeleteConfirmation';
// import Pagination from '@/components/ui/pagination';
// import Loading from '@/components/ui/loading';
// import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
// import { setFilter } from '@/redux/slices/servicesSlice';
// export default function AdminServicesPage() {
//     const dispatch = useAppDispatch();
//     const { items: services, loading, filter, total, totalPages, page: currentPageFromStore } = useAppSelector((state) => state.services);
//     const [isDialogOpen, setIsDialogOpen] = useState(false);
//     const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
//     const [deleteConfirmation, setDeleteConfirmation] = useState<{
//         isOpen: boolean;
//         id: string | null;
//         name: string;
//     }>({ isOpen: false, id: null, name: '' });
//     const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
//     const [currentPage, setCurrentPage] = useState<number>(currentPageFromStore || 1);
//     const pageSize = 10;

//     useEffect(() => {
//         // Fetch services on mount and when page or filter changes
//         dispatch(fetchServices({ page: currentPage, limit: pageSize }));
//     }, [dispatch, currentPage, statusFilter]);

//     const openForNew = () => {
//         setEditingServiceId(null);
//         setIsDialogOpen(true);
//     };

//     const openForEdit = (service: Service) => {
//         setEditingServiceId(service._id);
//         setIsDialogOpen(true);
//     };

//     const openDeleteConfirmation = (id: string, name: string) => {
//         setDeleteConfirmation({ isOpen: true, id, name });
//     };

//     const handleDelete = async () => {
//         if (!deleteConfirmation.id) return;
//         try {
//             console.debug('Deleting service id=', deleteConfirmation.id);
//             await dispatch(deleteService(deleteConfirmation.id)).unwrap();
//         } catch (err: any) {
//         } finally {
//             setDeleteConfirmation({ isOpen: false, id: null, name: '' });
//         }
//     };

//     const handleToggleStatus = async (service: Service) => {
//         try {
//             // send full service object with toggled status
//             await dispatch(toggleServiceStatus({ ...service, status: !service.status } as Service)).unwrap();
//         } catch (err: any) {
//         }
//     };

//     const filteredServices = services.filter((service) => {
//         if (statusFilter === 'all') return true;
//         if (statusFilter === 'active') return service.status === true;
//         return service.status === false;
//     });

//     return (
//         <>
//             {loading && <Loading />}
//             <div className="space-y-6">
//                 <div className="flex items-center justify-between">
//                     <div>
//                         <h1 className="text-xl font-bold tracking-tight">Services Management</h1>
//                         <p className="text-muted-foreground">
//                             Manage NDIS services offered on the platform

//                         </p>
//                     </div>


//                     <div className="flex items-center gap-2">
//                         <Select value={statusFilter} onValueChange={(val) => {
//                             const v = val as 'all' | 'active' | 'inactive';
//                             setStatusFilter(v);
//                             dispatch(setFilter(v));
//                             setCurrentPage(1);
//                             dispatch(fetchServices({ page: 1, limit: pageSize }));
//                         }}>
//                             <SelectTrigger className="w-[160px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
//                             <SelectContent>
//                                 <SelectItem value="all">All</SelectItem>
//                                 <SelectItem value="active">Active</SelectItem>
//                                 <SelectItem value="inactive">Inactive</SelectItem>
//                             </SelectContent>
//                         </Select>

//                         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//                             <DialogTrigger asChild>
//                                 <Button onClick={openForNew} className="flex items-center gap-2">
//                                     <Pencil className="h-4 w-4" />
//                                     Add Service
//                                 </Button>
//                             </DialogTrigger>
//                             <DialogContent className="sm:max-w-[600px]">
//                                 <DialogHeader>
//                                     <DialogTitle>
//                                         {editingServiceId ? 'Edit Service' : 'Add New Service'}
//                                     </DialogTitle>
//                                     <DialogDescription>
//                                         {editingServiceId
//                                             ? 'Update the service details below'
//                                             : 'Create a new NDIS service type'}
//                                     </DialogDescription>
//                                 </DialogHeader>
//                                 <ServiceForm
//                                     service={
//                                         editingServiceId
//                                             ? services.find((srv) => srv._id === editingServiceId)
//                                             : undefined
//                                     }
//                                     onClose={() => setIsDialogOpen(false)}
//                                 />
//                             </DialogContent>
//                         </Dialog>
//                     </div>
//                 </div>
//                 <div>
//                     <div className="overflow-x-auto">
//                         <Table>
//                             <TableHeader>
//                                 <TableRow>
//                                     <TableHead>#</TableHead>
//                                     <TableHead>Service Name</TableHead>
//                                     <TableHead>Code</TableHead>
//                                     <TableHead>Categories</TableHead>
//                                     <TableHead className="text-center">Status</TableHead>
//                                     {/* <TableHead> Date</TableHead> */}
//                                     <TableHead className="text-right">Actions</TableHead>
//                                 </TableRow>
//                             </TableHeader>
//                             <TableBody>
//                                 {filteredServices.map((service, index) => (
//                                     <TableRow key={service._id}>
//                                         <TableCell> {index + 1}</TableCell>
//                                         <TableCell className="font-medium">{service.name}</TableCell>
//                                         <TableCell className="max-w-md">
//                                             {service.code}
//                                         </TableCell>
//                                         <TableCell className="max-w-md">
//                                             {(service.categories || []).length > 0 ? (
//                                                 <div className="flex flex-wrap gap-2">
//                                                     {(service.categories || []).map((c) => (
//                                                         <Badge key={service._id + '-' + c}>{c}</Badge>
//                                                     ))}
//                                                 </div>
//                                             ) : (
//                                                 <span className="text-sm text-muted-foreground">—</span>
//                                             )}
//                                         </TableCell>
//                                         <TableCell className="text-center">
//                                             <div className="flex items-center justify-center gap-2">
//                                                 <Switch
//                                                     checked={service.status}
//                                                     onCheckedChange={() => handleToggleStatus(service)}
//                                                 />
//                                                 <span className="text-sm text-muted-foreground">
//                                                     {service.status ? 'Active' : 'Inactive'}
//                                                 </span>
//                                             </div>
//                                         </TableCell>
//                                         <TableCell className="text-right">
//                                             <div className="flex items-center justify-end gap-2">
//                                                 <Button
//                                                     variant="ghost"
//                                                     size="icon"
//                                                     onClick={() => openForEdit(service)}
//                                                 >
//                                                     <Edit className="h-4 w-4" />
//                                                 </Button>
//                                                 <Button
//                                                     variant="ghost"
//                                                     size="icon"
//                                                     onClick={() =>
//                                                         openDeleteConfirmation(service._id, service.name)
//                                                     }
//                                                 >
//                                                     <Trash2 className="h-4 w-4 text-destructive" />
//                                                 </Button>
//                                             </div>
//                                         </TableCell>
//                                     </TableRow>
//                                 ))}
//                             </TableBody>
//                         </Table>
//                     </div>
//                 </div>

//                 <DeleteConfirmation
//                     isOpen={deleteConfirmation.isOpen}
//                     onClose={() => setDeleteConfirmation({ isOpen: false, id: null, name: '' })}
//                     onConfirm={handleDelete}
//                     title="Delete Service"
//                     itemName={deleteConfirmation.name}
//                     description="This action cannot be undone. This will permanently delete this service and it will no longer be available to workers."
//                 />
//             </div>

//             <Pagination
//                 totalPages={totalPages || 1}
//                 currentPage={currentPage}
//                 onPageChange={(page) => {
//                     setCurrentPage(page);
//                 }}
//             />
//         </>
//     );
// }

// function ServiceForm({ service, onClose }: { service?: Service; onClose: () => void }) {
//     const dispatch = useAppDispatch();
//     const [formData, setFormData] = useState({
//         name: service?.name || '',
//         code: service?.code || '',
//         categories: service?.categories || [],
//         status: service?.status ?? true,
//     });
//     const [newCategory, setNewCategory] = useState('');

//     const addCategory = () => {
//         const cat = newCategory.trim();
//         if (!cat) return;
//         if ((formData.categories as string[]).includes(cat)) {
//             setNewCategory('');
//             return;
//         }
//         setFormData({ ...formData, categories: [...(formData.categories as string[]), cat] });
//         setNewCategory('');
//     };

//     const removeCategory = (idx: number) => {
//         setFormData({ ...formData, categories: (formData.categories as string[]).filter((_, i) => i !== idx) });
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         try {
//             if (service) {
//                 // Update existing service
//                 await dispatch(
//                     updateService({ id: service._id, data: formData as Partial<Service> })
//                 ).unwrap();
//             } else {
//                 // Create new service
//                 await dispatch(createService(formData as any)).unwrap();
//             }
//             onClose();
//         } catch (err: any) {
//         }
//     };

//     return (
//         <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="space-y-2">
//                 <Label htmlFor="name">Service Name *</Label>
//                 <Input
//                     id="name"
//                     value={formData.name}
//                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                     placeholder="e.g., Personal Care"
//                     required
//                 />
//             </div>
//             <div className="space-y-2">
//                 <Label htmlFor="code">Code *</Label>
//                 <Input
//                     id="code"
//                     value={formData.code}
//                     onChange={(e) => setFormData({ ...formData, code: e.target.value })}
//                     placeholder="Enter the service code..."
//                     required
//                 />
//             </div>

//             <div className="space-y-2">
//                 <Label>Categories</Label>
//                 <div className="flex gap-2">
//                     <Input
//                         placeholder="Add a category"
//                         value={newCategory}
//                         onChange={(e) => setNewCategory(e.target.value)}
//                         onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCategory(); } }}
//                     />
//                     <Button type="button" onClick={addCategory}>Add</Button>
//                 </div>
//                 <div className="flex flex-wrap gap-2 mt-2">
//                     {(formData.categories as string[]).map((cat, idx) => (
//                         <div key={cat + idx} className="flex items-center gap-2">
//                             <Badge>{cat}</Badge>
//                             <button type="button" className="text-sm text-destructive" onClick={() => removeCategory(idx)}>Remove</button>
//                         </div>
//                     ))}
//                 </div>
//             </div>

//             <DialogFooter>
//                 <Button type="button" variant="outline" onClick={onClose}>
//                     Cancel
//                 </Button>
//                 <Button type="submit">{service ? 'Update Service' : 'Create Service'}</Button>
//             </DialogFooter>

//         </form>
//     );
// }
