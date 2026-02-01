'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import ClassicLayout from './ClassicLayout';
import ModernLayout from './ModernLayout';
import EnterpriseLayout from './EnterpriseLayout';
import { useAppDispatch } from '@/hooks/redux';
import { setDashboardVariant, setSidebarOpen, setTheme } from '@/redux/slices/uiSlice';

export default function DashboardWrapper({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const { dashboardVariant } = useSelector((state: RootState) => state.ui);

    // On client mount, load persisted UI state from localStorage and sync to redux
    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const raw = localStorage.getItem('uiState');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed.dashboardVariant) dispatch(setDashboardVariant(parsed.dashboardVariant));
                if (typeof parsed.sidebarOpen === 'boolean') dispatch(setSidebarOpen(parsed.sidebarOpen));
                if (parsed.theme) dispatch(setTheme(parsed.theme));
            }
        } catch (err) {
            // ignore
        }
    }, [dispatch]);

    switch (dashboardVariant) {
        case 'modern':
            return <ModernLayout>{children}</ModernLayout>;
        case 'enterprise':
            return <EnterpriseLayout>{children}</EnterpriseLayout>;
        case 'classic':
        default:
            return <ClassicLayout>{children}</ClassicLayout>;

    }
}
