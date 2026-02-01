'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import DashboardStyleSwitcher from '@/components/common/DashboardStyleSwitcher';
import { Lock, Bell, UserCircle, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function ClientSettingsPage() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="space-y-2">
            <div>
                <h1 className="text-xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account preferences and security</p>
            </div>

            <Tabs defaultValue="account" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                </TabsList>

                <TabsContent value="account" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserCircle className="h-5 w-5" />
                                Account Information
                            </CardTitle>
                            <CardDescription>Update your personal account details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" type="email" defaultValue="client@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input id="phone" type="tel" defaultValue="+61 411 111 111" />
                                </div>
                            </div>
                            <Button>Save Changes</Button>
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
                            <CardDescription>Manage your security settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current">Current Password</Label>
                                <Input id="current" type="password" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new">New Password</Label>
                                <Input id="new" type="password" />
                            </div>
                            <Button>Update Password</Button>
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
                                    <Label>Session Reminders</Label>
                                    <p className="text-sm text-muted-foreground">Get notified about upcoming support sessions</p>
                                </div>
                                <Switch defaultChecked />
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
