import DashboardWrapper from "@/components/layout/DashboardWrapper";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function WorkerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute allowedRole="worker">
            <DashboardWrapper>
                {children}
            </DashboardWrapper>
        </ProtectedRoute>
    );
}
