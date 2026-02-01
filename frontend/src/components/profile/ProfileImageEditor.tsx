'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, ZoomIn, ZoomOut, RotateCw, Move } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';

interface ProfileImageEditorProps {
    onSave: (imageData: { base64: string; binary: Blob | null }) => void;
}

export default function ProfileImageEditor({ onSave }: ProfileImageEditorProps) {
    const [profileImage, setProfileImage] = useState('https://ui.shadcn.com/avatars/01.png');
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imageBinary, setImageBinary] = useState<Blob | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    
    useEffect(() => {
        console.log('ProfileImage Data:', {
            base64: profileImage,
            hasImageBinary: !!imageBinary,
            binarySize: imageBinary?.size,
            binaryType: imageBinary?.type
        });
    }, [profileImage, imageBinary]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setOriginalImage(reader.result as string);
                setIsEditorOpen(true);
                setZoom(1);
                setRotation(0);
                setPosition({ x: 0, y: 0 });
            };
            reader.readAsDataURL(file);

            // Store the file as binary
            setImageBinary(file);
            console.log('Image uploaded as binary:', {
                name: file.name,
                size: file.size,
                type: file.type
            });
        }
    };

    const drawImageOnCanvas = () => {
        const canvas = canvasRef.current;
        const img = imageRef.current;
        if (!canvas || !img || !originalImage) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = 300;
        canvas.width = size;
        canvas.height = size;

        ctx.clearRect(0, 0, size, size);
        ctx.save();

        // Apply transformations
        ctx.translate(size / 2, size / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(zoom, zoom);
        ctx.translate(-size / 2 + position.x, -size / 2 + position.y);

        // Draw image
        const aspectRatio = img.width / img.height;
        let drawWidth = size;
        let drawHeight = size;

        if (aspectRatio > 1) {
            drawHeight = size / aspectRatio;
        } else {
            drawWidth = size * aspectRatio;
        }

        const x = (size - drawWidth) / 2;
        const y = (size - drawHeight) / 2;

        ctx.drawImage(img, x, y, drawWidth, drawHeight);
        ctx.restore();
    };

    useEffect(() => {
        if (isEditorOpen && originalImage) {
            const img = new Image();
            img.onload = () => {
                imageRef.current = img;
                drawImageOnCanvas();
            };
            img.src = originalImage;
        }
    }, [isEditorOpen, originalImage]);

    useEffect(() => {
        if (isEditorOpen) {
            drawImageOnCanvas();
        }
    }, [zoom, rotation, position, isEditorOpen]);

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleSaveCrop = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Convert canvas to base64
        const croppedBase64 = canvas.toDataURL('image/png');
        setProfileImage(croppedBase64);

        // Convert canvas to blob
        canvas.toBlob((blob) => {
            if (blob) {
                setImageBinary(blob);
                console.log('Cropped image saved as binary:', {
                    size: blob.size,
                    type: blob.type
                });
                
                // Call the onSave callback with both base64 and binary
                onSave({
                    base64: croppedBase64,
                    binary: blob
                });
            }
        }, 'image/png');

        setIsEditorOpen(false);
    };

    const handleRemovePhoto = () => {
        setProfileImage('https://ui.shadcn.com/avatars/01.png');
        setImageBinary(null);
        onSave({
            base64: 'https://ui.shadcn.com/avatars/01.png',
            binary: null
        });
        console.log('Profile image removed');
    };

    const handleSaveAndContinue = () => {
        if (imageBinary) {
            onSave({
                base64: profileImage,
                binary: imageBinary
            });
            console.log('=== Profile Image Saved ===');
            console.log('Binary Blob:', {
                size: imageBinary.size,
                type: imageBinary.type,
                hasBinary: true
            });
            alert('Profile photo saved successfully with binary data!');
        } else {
            console.log('No image binary available');
            alert('Please upload and crop an image first');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Profile Photo</h2>
                <p className="text-muted-foreground">Upload and edit your professional photo</p>
            </div>
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center gap-6">
                        <Avatar className="h-32 w-32 ring-4 ring-gray-200 dark:ring-gray-700">
                            <AvatarImage src={profileImage} />
                            <AvatarFallback>SJ</AvatarFallback>
                        </Avatar>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                        <div className="flex gap-2">
                            <Button onClick={() => fileInputRef.current?.click()}>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Photo
                            </Button>
                            <Button variant="outline" onClick={handleRemovePhoto}>
                                Remove Photo
                            </Button>
                        </div>
                    </div>
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <h4 className="font-medium mb-2">Photo Guidelines</h4>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                            <li>Use a clear, professional headshot</li>
                            <li>Face should be clearly visible</li>
                            <li>Good lighting and high quality</li>
                            <li>Appropriate attire</li>
                            <li>Image will be saved in binary format for upload</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
            
            <div className="flex justify-end">
                <Button onClick={handleSaveAndContinue} className="bg-orange-500 hover:bg-orange-600">
                    Save and Continue
                </Button>
            </div>

            {/* Image Editor Dialog */}
            <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Profile Photo</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {/* Canvas for image editing */}
                        <div className="flex justify-center bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
                            <div className="relative">
                                <canvas
                                    ref={canvasRef}
                                    width={300}
                                    height={300}
                                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-move"
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseUp}
                                />
                                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                    <Move className="h-3 w-3 inline mr-1" />
                                    Drag to move
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="space-y-4">
                            {/* Zoom Control */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <ZoomIn className="h-4 w-4" />
                                        Zoom: {zoom.toFixed(1)}x
                                    </label>
                                </div>
                                <Slider
                                    value={[zoom]}
                                    onValueChange={(value) => setZoom(value[0])}
                                    min={0.5}
                                    max={3}
                                    step={0.1}
                                    className="w-full"
                                />
                            </div>

                            {/* Rotation Control */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <RotateCw className="h-4 w-4" />
                                        Rotation: {rotation}°
                                    </label>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setRotation((rotation + 90) % 360)}
                                    >
                                        Rotate 90°
                                    </Button>
                                </div>
                                <Slider
                                    value={[rotation]}
                                    onValueChange={(value) => setRotation(value[0])}
                                    min={0}
                                    max={360}
                                    step={1}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-2 justify-center">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setZoom(1);
                                    setRotation(0);
                                    setPosition({ x: 0, y: 0 });
                                }}
                            >
                                Reset
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setZoom(Math.min(zoom + 0.1, 3))}
                            >
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))}
                            >
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditorOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveCrop} className="bg-orange-500 hover:bg-orange-600">
                            Save Photo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
