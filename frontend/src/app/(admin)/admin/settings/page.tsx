'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
    fetchAdminSettings,
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
import { Lock, Bell, UserCircle, Sun, Moon, Monitor, ShieldCheck } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function AdminSettingsPage() {
    const dispatch = useAppDispatch();
    const { admin, platform, loading } = useAppSelector((state) => state.settings);
    const { theme, setTheme } = useTheme();
    const [formData, setFormData] = useState({
        email: '',
        displayName: '',
        currentPassword: '',
        newPassword: '',
    });

    useEffect(() => {
        dispatch(fetchAdminSettings());
    }, [dispatch]);

    useEffect(() => {
        if (admin) {
            setFormData(prev => ({
                ...prev,
                email: admin.email,
                displayName: admin.displayName,
            }));
        }
    }, [admin]);

    const handleSaveAccount = () => {
        dispatch(updateAdminAccount({
            email: formData.email,
            displayName: formData.displayName,
        }));
    };

    const handleUpdatePassword = () => {
        dispatch(updateAdminPassword({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
        }));
        setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
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
        <div className="space-y-2">
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
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input 
                                        id="email" 
                                        type="email" 
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Display Name</Label>
                                    <Input 
                                        id="name" 
                                        value={formData.displayName}
                                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                    />
                                </div>
                            </div>
                            <Button onClick={handleSaveAccount}>Save Changes</Button>
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
                            <div className="space-y-2">
                                <Label htmlFor="new-pass">Change Password</Label>
                                <Input 
                                    id="new-pass" 
                                    type="password" 
                                    placeholder="New password"
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                />
                            </div>
                            <Button variant="outline" onClick={handleUpdatePassword}>Update Password</Button>
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

                    <Card>
                        <CardHeader>
                            <CardTitle>Theme Preferences</CardTitle>
                            <CardDescription>Customize the appearance of the platform</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <Moon className="h-4 w-4" />
                                        <Label>Theme Mode</Label>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Current: <span className="capitalize">{theme}</span></p>
                                </div>
                                <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
                                    <Button
                                        variant={theme === 'light' ? 'secondary' : 'ghost'}
                                        size="sm"
                                        onClick={() => setTheme('light')}
                                        className="gap-2"
                                    >
                                        <Sun className="h-4 w-4" />
                                        Light
                                    </Button>
                                    <Button
                                        variant={theme === 'dark' ? 'secondary' : 'ghost'}
                                        size="sm"
                                        onClick={() => setTheme('dark')}
                                        className="gap-2"
                                    >
                                        <Moon className="h-4 w-4" />
                                        Dark
                                    </Button>
                                    <Button
                                        variant={theme === 'system' ? 'secondary' : 'ghost'}
                                        size="sm"
                                        onClick={() => setTheme('system')}
                                        className="gap-2"
                                    >
                                        <Monitor className="h-4 w-4" />
                                        System
                                    </Button>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Dark Mode Toggle</Label>
                                    <p className="text-sm text-muted-foreground">Quickly switch to dark theme</p>
                                </div>
                                <Switch
                                    checked={theme === 'dark'}
                                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
