import DashboardWrapper from "@/components/layout/DashboardWrapper";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute allowedRole="admin">
            <DashboardWrapper>
                {children}
            </DashboardWrapper>
        </ProtectedRoute>
    );
}
