'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ChevronLeft, ChevronRight, LayoutDashboard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { NAV_ITEMS } from '@/lib/constants';
import { UserButton } from './UserButton';
import NotificationsCenter from '@/components/common/NotificationsCenter';
import { cn } from "@/lib/utils"; // Standard shadcn helper

export default function ClassicLayout({ children }: { children: React.ReactNode }) {
    const { user } = useSelector((state: RootState) => state.auth);
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const navItems = user?.role && NAV_ITEMS[user.role as keyof typeof NAV_ITEMS]
        ? NAV_ITEMS[user.role as keyof typeof NAV_ITEMS]
        : NAV_ITEMS.worker;

    const NavContent = ({ collapsed = false }: { collapsed?: boolean }) => (
        <div className="flex flex-col h-full py-3">
            {/* BRANDING */}
            <div className={cn("px-3 mb-3 flex items-center gap-2 transition-all", collapsed && "justify-center px-0")}> 
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-sm">
                    D
                </div>
                {!collapsed && (
                    <div className="flex flex-col">
                        <span className="font-bold tracking-tight text-foreground">Disable Help</span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Classic Dashboard</span>
                    </div>
                )}
            </div>

            <div className="px-2 space-y-0.5">
                {navItems.map((item: any) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href} title={collapsed ? item.label : ""}>
                            <Button 
                                variant="ghost" 
                                className={cn(
                                    "w-full justify-start gap-3 transition-all duration-150 group relative",
                                    collapsed ? "justify-center px-0 h-11" : "px-3 h-10",
                                    isActive 
                                        ? 'bg-blue-600 text-white font-medium shadow-sm' 
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                )}
                            >
                                <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-white")} />
                                {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
                                
                                {!collapsed && item.badge && (
                                    <Badge className="bg-blue-600 hover:bg-blue-600 text-[10px] h-5 px-1.5 shadow-none text-white">
                                        {item.badge}
                                    </Badge>
                                )}

                                {/* Active Indicator Bar */}
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-blue-600" />
                                )}
                            </Button>
                        </Link>
                    );
                })}
            </div>
        </div>
    );

    return (
        // 1. Fixed height container to prevent page-level scrollbars
        <div className="flex h-screen overflow-hidden bg-[#fbfaff] dark:bg-slate-950">
            
            {/* SIDEBAR */}
            <aside 
                className={cn(
                    "hidden md:flex flex-col border-r bg-white dark:bg-slate-900 transition-all duration-300 relative z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)]",
                    sidebarOpen ? 'w-64' : 'w-20'
                )}
            >
                <ScrollArea className="flex-1">
                    <NavContent collapsed={!sidebarOpen} />
                </ScrollArea>

                {/* Sidebar Toggle */}
                <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="absolute -right-3 top-20 h-6 w-6 rounded-full border shadow-sm z-50 hover:bg-purple-600 hover:text-white transition-colors"
                >
                    {sidebarOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </Button>
            </aside>

            {/* MAIN LAYOUT */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                
                {/* TOP HEADER */}
                <header className="h-16 shrink-0 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 md:px-8 flex items-center justify-between z-30">
                    <div className="flex items-center gap-4">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-72">
                                <NavContent />
                            </SheetContent>
                        </Sheet>
                        <h1 className="text-sm font-semibold text-muted-foreground md:text-base flex items-center gap-2">
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <NotificationsCenter />
                        <Separator orientation="vertical" className="h-6 mx-1" />
                        <UserButton variant="minimal" />
                    </div>
                </header>

                {/* SCROLLABLE CONTENT AREA */}
                <main className="flex-1 overflow-y-auto p-2 md:p-2 ">
                    {/* The Card now fills the space or grows with content */}
                    <div className="min-h-full   p-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}