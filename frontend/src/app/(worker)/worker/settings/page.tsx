    'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import DashboardStyleSwitcher from '@/components/common/DashboardStyleSwitcher';
import { Lock, MapPin, Bell, UserCircle, Mail, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { changePassword, getmee } from '@/redux/slices/authSlice';
import { toast } from 'sonner';

export default function WorkerSettingsPage() {
    const dispatch = useAppDispatch();
    const { user, isLoading } = useAppSelector((state) => state.auth);
    const { theme, setTheme } = useTheme();

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [accountData, setAccountData] = useState({
        email: '',
        phone: ''
    });

    useEffect(() => {
        if (user) {
            setAccountData({
                email: user.email || '',
                phone: '' // Assume phone isn't in user object yet or fetch it
            });
        }
    }, [user]);

    const handleUpdatePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        try {
            await dispatch(changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            })).unwrap();
            toast.success('Password updated successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            toast.error(error || 'Failed to update password');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account preferences and security</p>
            </div>

            <Tabs defaultValue="account" className="space-y-4">

                <TabsList className="grid w-full grid-cols-5  rounded-lg   justify-center items-center ">
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="emergency">Emergency</TabsTrigger>
                    <TabsTrigger value="appearance">Appearance</TabsTrigger>

                </TabsList>

                <TabsContent value="account" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserCircle className="h-5 w-5" />
                                Account Information
                            </CardTitle>
                            <CardDescription>Update your account details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-6">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={accountData.email}
                                        onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                                        disabled
                                    />
                                    <p className="text-[10px] text-muted-foreground">Email cannot be changed directly</p>
                                </div>
                                <div className="space-y-6">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={accountData.phone}
                                        onChange={(e) => setAccountData({ ...accountData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <Button disabled={isLoading}>Save Changes</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5" />
                                Password & Security
                            </CardTitle>
                            <CardDescription>Manage your password and security settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-6">
                                <Label htmlFor="current">Current Password</Label>
                                <Input
                                    id="current"
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                />
                            </div>
                            <div className="space-y-6">
                                <Label htmlFor="new">New Password</Label>
                                <Input
                                    id="new"
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                />
                            </div>
                            <div className="space-y-6">
                                <Label htmlFor="confirm">Confirm New Password</Label>
                                <Input
                                    id="confirm"
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                />
                            </div>
                            <Button onClick={handleUpdatePassword} disabled={isLoading}>
                                {isLoading ? 'Updating...' : 'Update Password'}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                Notification Preferences
                            </CardTitle>
                            <CardDescription>Choose how you want to be notified</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Email Notifications</Label>
                                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Job Alerts</Label>
                                    <p className="text-sm text-muted-foreground">Get notified about new job postings</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Message Alerts</Label>
                                    <p className="text-sm text-muted-foreground">Notifications for new messages</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Invoice Updates</Label>
                                    <p className="text-sm text-muted-foreground">Status changes on invoices</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="emergency" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Emergency Contact</CardTitle>
                            <CardDescription>Person to contact in case of emergency</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-6">
                                    <Label htmlFor="emergencyName">Full Name</Label>
                                    <Input id="emergencyName" placeholder="John Doe" />
                                </div>
                                <div className="space-y-6">
                                    <Label htmlFor="relationship">Relationship</Label>
                                    <Input id="relationship" placeholder="Spouse, Parent, etc." />
                                </div>
                                <div className="space-y-6">
                                    <Label htmlFor="emergencyPhone">Phone Number</Label>
                                    <Input id="emergencyPhone" type="tel" placeholder="+61 400 000 000" />
                                </div>
                                <div className="space-y-6">
                                    <Label htmlFor="emergencyEmail">Email (Optional)</Label>
                                    <Input id="emergencyEmail" type="email" placeholder="emergency@example.com" />
                                </div>
                            </div>
                            <Button>Save Emergency Contact</Button>
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
