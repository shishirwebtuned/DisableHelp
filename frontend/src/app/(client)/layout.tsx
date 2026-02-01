import DashboardWrapper from "@/components/layout/DashboardWrapper";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <DashboardWrapper>
            {children}
        </DashboardWrapper>
    );
}
