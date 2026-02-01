'use client';

import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setDashboardVariant, DashboardVariant } from '@/redux/slices/uiSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, Sparkles, Building2, Check } from 'lucide-react';


export default function DashboardStyleSwitcher() {
    const dispatch = useAppDispatch();
    const { dashboardVariant } = useAppSelector((state) => state.ui);

    const styles: { value: DashboardVariant; label: string; description: string; icon: any }[] = [
        {
            value: 'classic',
            label: 'Classic Sidebar',
            description: 'Traditional collapsible sidebar with top header',
            icon: LayoutDashboard,
        },
        {
            value: 'modern',
            label: 'Modern Minimal',
            description: 'Floating sidebar with glassmorphism effects',
            icon: Sparkles,
        },
        {
            value: 'enterprise',
            label: 'Enterprise Admin',
            description: 'Persistent slim sidebar with sub-navigation',
            icon: Building2,
        },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Dashboard Style</CardTitle>
                <CardDescription>Choose your preferred dashboard layout</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
                {styles.map((style) => {
                    const Icon = style.icon;
                    const isActive = dashboardVariant === style.value;

                    return (
                        <div
                            key={style.value}
                            className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${isActive
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                                }`}
                            onClick={() => dispatch(setDashboardVariant(style.value))}
                        >
                            {isActive && (
                                <div className="absolute top-2 right-2">
                                    <Badge variant="default" className="flex items-center gap-1">
                                        <Check className="h-3 w-3" />
                                        Active
                                    </Badge>
                                </div>
                            )}
                            <div className="flex flex-col items-center text-center space-y-3">
                                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                    }`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="font-semibold">{style.label}</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {style.description}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
