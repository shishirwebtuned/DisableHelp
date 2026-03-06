import DashboardWrapper from "@/components/layout/DashboardWrapper";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute allowedRole="client">
            <DashboardWrapper>
                {children}
            </DashboardWrapper>
        </ProtectedRoute>
    );
}
