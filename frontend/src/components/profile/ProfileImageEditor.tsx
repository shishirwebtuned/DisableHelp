'use client';

import { useState, useRef, useEffect } from 'react';
import api from '@/lib/axios';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { getmee } from '@/redux/slices/authSlice';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, ZoomIn, ZoomOut, RotateCw, Move } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';

interface ProfileImageEditorProps {
    onSave: (imageData: { base64: string; binary: Blob | null }) => void;
    initialData?: { base64: string; binary: Blob | null };
    /** fileType sent to delete API (defaults to 'avatar') */
    fileType?: string;
}

const DEFAULT_AVATAR = '/profileImg.jpg';

export default function ProfileImageEditor({ onSave, initialData, fileType = 'avatar' }: ProfileImageEditorProps) {
    const dispatch = useAppDispatch();
    const [profileImage, setProfileImage] = useState(initialData?.base64 || '/profileImg.jpg');
    const [originalImage, setOriginalImage] = useState<string | null>(initialData?.base64 || null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imageBinary, setImageBinary] = useState<Blob | null>(initialData?.binary || null);
    const [showError, setShowError] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);

    const { user } = useAppSelector((state) => state.auth);

    const deleteUrl = user?.role === 'client'
        ? 'profile/client/file'
        : 'profile/worker/file';

    useEffect(() => {
        if (initialData) {
            setProfileImage(initialData.base64);
            setImageBinary(initialData.binary);
        }
    }, [initialData]);

    const hasPhoto = profileImage && profileImage !== DEFAULT_AVATAR;

    useEffect(() => {
        console.log('ProfileImage Editor State:', {
            hasBase64: !!profileImage,
            base64Length: profileImage?.length,
            hasBinary: !!imageBinary,
            binarySize: imageBinary?.size
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
            setShowError(false);

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

    const handleRemovePhoto = async () => {
        // Local removal first
        setProfileImage(DEFAULT_AVATAR);
        setImageBinary(null);
        onSave({
            base64: DEFAULT_AVATAR,
            binary: null
        });

        // Call server to remove the avatar file. Backend expects fileType in body.
        try {
            const payload = { fileType };
            // axios.delete with body requires `data` option
            await api.delete(deleteUrl, { data: payload });
            dispatch(getmee());
            console.log('Profile image removed on server');
        } catch (err) {
            console.error('Failed to delete profile image on server', err);
        }
    };

    const handleSaveAndContinue = () => {
        // Allow continuing if we have either a new binary OR an existing profile image URL
        if (imageBinary || (profileImage && !profileImage.startsWith('data:'))) {
            onSave({
                base64: profileImage,
                binary: imageBinary
            });
            console.log('=== Profile Image Section Saved ===', {
                hasBinary: !!imageBinary,
                imageSource: profileImage.startsWith('data:') ? 'base64/new' : 'existing-url'
            });
        } else if (profileImage && profileImage.startsWith('data:')) {
            // Case where they cropped but didn't trigger onSave yet? 
            // handleSaveCrop already calls onSave, so this might be redundant but safe
            onSave({
                base64: profileImage,
                binary: imageBinary
            });
        } else {
            console.log('No image binary or existing image available');
            alert('Please upload and crop an image first or keep your existing photo.');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-2 relative">
                    Profile Photo <span className="text-red-500 absolute left-42">*</span>

                </h2>
                <p className="lg:text-base md:text-[15px] text-sm text-muted-foreground">Upload and edit your professional photo</p>
            </div>
            <Card className={showError && !hasPhoto ? 'border-red-400' : ''}>
                <CardContent className="pt-4 md:pt-5 lg:pt-6">
                    <div className="flex flex-col items-center gap-6">
                        <div className='relative'>
                            <Avatar className="h-24 w-24 md:h-28 md:w-28 lg:h-32 lg:w-32 ring-2 ring-gray-200 dark:ring-gray-600">
                                <AvatarImage src={profileImage} />
                                <AvatarFallback>SJ</AvatarFallback>
                            </Avatar>

                            {!hasPhoto && (
                                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
                                    <span className="text-white text-[10px] font-bold">!</span>
                                </div>
                            )}
                        </div>
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
                        {showError && !hasPhoto && (
                            <p className="text-red-500 text-sm -mt-2">A profile photo is required</p>
                        )}
                    </div>
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <h4 className="font-medium mb-2 lg:text-base md:text-[15px] text-sm">Photo Guidelines</h4>
                        <ul className="text-xs md:text-[13px] lg:text-sm text-muted-foreground space-y-1 list-disc list-inside">
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
                <Button onClick={handleSaveAndContinue} className="">
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
                                <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] md:text-[11px] lg:text-xs px-2 py-1 rounded">
                                    <Move className="h-3 w-3 inline mr-1" />
                                    Drag to move
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="space-y-4">
                            {/* Zoom Control */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs md:text-[13px] lg:text-sm font-medium flex items-center gap-2">
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
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs md:text-[13px] lg:text-sm font-medium flex items-center gap-2">
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
                        <Button onClick={handleSaveCrop} className="">
                            Save Photo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
