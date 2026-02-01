'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { NAV_ITEMS } from '@/lib/constants';
import { UserButton } from './UserButton';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Menu, ChevronLeft } from 'lucide-react';
import NotificationsCenter from '@/components/common/NotificationsCenter';

export default function EnterpriseLayout({ children }: { children: React.ReactNode }) {
    const { user } = useSelector((state: RootState) => state.auth);
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navItems = user?.role && NAV_ITEMS[user.role as keyof typeof NAV_ITEMS]
        ? NAV_ITEMS[user.role as keyof typeof NAV_ITEMS]
        : NAV_ITEMS.admin;

    const SidebarContent = ({ isOpen }: { isOpen: boolean }) => (
        <>
            <div className={`px-3 mb-3 flex ${
                isOpen ? 'justify-between items-center' : 'justify-center'
            }`}>
                {isOpen && (
                    <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100">Enterprise Admin</h2>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="h-8 w-8"
                >
                    {isOpen ? (
                        <ChevronLeft className="h-4 w-4" />
                    ) : (
                        <Menu className="h-4 w-4" />
                    )}
                </Button>
            </div>

            {/* Navigation Items */}
            <div className={`flex flex-col space-y-1 flex-1 ${
                isOpen ? 'px-2' : 'items-center'
            }`}>
                {navItems.map((item: any) => (
                    <Link href={item.href} key={item.href}>
                        <SidebarIcon 
                            icon={item.icon} 
                            label={item.label}
                            active={pathname === item.href}
                            isOpen={isOpen}
                        />
                    </Link>
                ))}
            </div>
        </>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - Desktop only, Expandable */}
                <aside className={`hidden md:flex flex-col py-3 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-inner z-40 transition-all duration-300 ease-in-out ${
                    sidebarOpen ? 'w-64' : 'w-16'
                }`}>
                    <SidebarContent isOpen={sidebarOpen} />
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
                    {/* Top Bar */}
                    <div className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-4 sm:px-6 gap-2">
                        <div className="flex items-center gap-2">
                            {/* Mobile Menu */}
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="md:hidden">
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-[280px] p-0">
                                    <ScrollArea className="h-full">
                                        <div className="flex flex-col py-4 h-full">
                                            <SidebarContent isOpen={true} />
                                        </div>
                                    </ScrollArea>
                                </SheetContent>
                            </Sheet>
                            <span className="md:hidden font-bold text-sm">Enterprise Admin</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <NotificationsCenter />
                            <UserButton variant="minimal" />
                        </div>
                    </div>
                    {/* Content Workspace */}
                    <div className="flex-1 overflow-auto p-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

function SidebarIcon({ icon: Icon, label, active, isOpen }: { icon: any, label?: string, active?: boolean, isOpen?: boolean }) {
    return (
        <div className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-all w-full ${
            active 
                ? 'bg-blue-600 text-white font-medium shadow-sm' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
        } ${
            isOpen ? 'justify-start' : 'justify-center'
        }`}>
            <Icon className="h-5 w-5 flex-shrink-0" />
            {isOpen && label && (
                <span className="text-sm font-medium">{label}</span>
            )}
        </div>
    )
}
