'use client';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
    updateAdminAccount,
    updateAdminPassword,
    updatePlatformSettings,
    toggleMaintenanceMode,
    toggleNewUserRegistration,
    toggleSystemAlerts,
} from '@/redux/slices/settingsSlice';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import DashboardStyleSwitcher from '@/components/common/DashboardStyleSwitcher';
import { Lock, Bell, UserCircle, ShieldCheck, Eye, EyeClosed } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
    const dispatch = useAppDispatch();
    const { admin, platform, loading } = useAppSelector((state) => state.settings);
    const mee = useAppSelector((state) => state.auth.mee.user);
    console.log("sdfdsf'mee", mee);
    const [formData, setFormData] = useState({
        email: '',
        displayName: '',
        currentPassword: '',
        newPassword: '',
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const handleSaveAccount = async () => {
        try {
            await dispatch(updateAdminAccount({
                email: formData.email,
                displayName: formData.displayName,
            })).unwrap();
            toast.success('Account updated successfully');
        } catch (error: any) {
            toast.error(error?.message || 'Failed to update account');
        }
    };

    const handleUpdatePassword = async () => {
        try {
            await dispatch(updateAdminPassword({
                email: mee?.email,
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
            })).unwrap()
            setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
        } catch (error: any) {
        }
    };

    const handleToggleMaintenanceMode = () => {
        dispatch(toggleMaintenanceMode());
        dispatch(updatePlatformSettings({ maintenanceMode: !platform?.maintenanceMode }));
    };

    const handleToggleNewUserRegistration = () => {
        dispatch(toggleNewUserRegistration());
        dispatch(updatePlatformSettings({ newUserRegistration: !platform?.newUserRegistration }));
    };

    const handleToggleSystemAlerts = () => {
        dispatch(toggleSystemAlerts());
        dispatch(updatePlatformSettings({ systemAlerts: !platform?.systemAlerts }));
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold tracking-tight">Admin Settings</h1>
                <p className="text-muted-foreground">Manage platform-wide settings and your admin account</p>
            </div>

            <Tabs defaultValue="account" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="platform">Platform</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                </TabsList>

                <TabsContent value="account" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserCircle className="h-5 w-5" />
                                Admin Account
                            </CardTitle>
                            <CardDescription>Update your administrator details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={mee?.email || ''}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className=" space-y-3">
                                    <Label htmlFor="name">Display Name</Label>
                                    <Input
                                        id="name"
                                        value={mee?.firstName || formData.displayName}
                                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                    />
                                </div>
                            </div>
                            <Button className='w-full' onClick={handleSaveAccount}>Save Changes</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5" />
                                Security
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <div className="space-y-3">
                                    <Label htmlFor="current-pass">Current Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="current-pass"
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            placeholder="Enter current password"
                                            value={formData.currentPassword}
                                            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(s => !s)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                                        >
                                            {showCurrentPassword ? <EyeClosed className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="new-pass">New Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="new-pass"
                                            type={showNewPassword ? 'text' : 'password'}
                                            placeholder="Enter new password"
                                            value={formData.newPassword}
                                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(s => !s)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                                        >
                                            {showNewPassword ? <EyeClosed className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>
                                {loading && <div className="text-center py-4">Updating password...</div>}
                                {!loading && <Button disabled={loading} className='w-full' onClick={handleUpdatePassword}>Update Password</Button>}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="platform" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5" />
                                Platform Governance
                            </CardTitle>
                            <CardDescription>General platform-wide switches</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Maintenance Mode</Label>
                                    <p className="text-sm text-muted-foreground">Take the platform offline for maintenance</p>
                                </div>
                                <Switch
                                    checked={platform?.maintenanceMode || false}
                                    onCheckedChange={handleToggleMaintenanceMode}
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>New User Registration</Label>
                                    <p className="text-sm text-muted-foreground">Allow new workers and clients to sign up</p>
                                </div>
                                <Switch
                                    checked={platform?.newUserRegistration || false}
                                    onCheckedChange={handleToggleNewUserRegistration}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                Admin Notifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>System Alerts</Label>
                                    <p className="text-sm text-muted-foreground">Notify for critical system events</p>
                                </div>
                                <Switch
                                    checked={platform?.systemAlerts || false}
                                    onCheckedChange={handleToggleSystemAlerts}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="appearance" className="space-y-4">
                    <DashboardStyleSwitcher />
                </TabsContent>
            </Tabs>
        </div>
    );
}
