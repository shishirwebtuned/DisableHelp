import DashboardWrapper from "@/components/layout/DashboardWrapper";

export default function WorkerLayout({
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
