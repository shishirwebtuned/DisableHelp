import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    onConfirm: () => Promise<void> | void;
    confirmLabel?: string;
    cancelLabel?: string;
    isLoading?: boolean;
}

export default function ConfirmDialog({ open, onOpenChange, title = 'Confirm', description = '', onConfirm, confirmLabel = 'OK', cancelLabel = 'Cancel', isLoading = false }: ConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[420px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>{cancelLabel}</Button>
                    <Button variant="destructive" onClick={() => onConfirm()} disabled={isLoading}>{isLoading ? 'Please wait...' : confirmLabel}</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
