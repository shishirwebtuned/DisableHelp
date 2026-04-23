import { cn } from "@/lib/utils";

type Status = "scheduled" | "in-progress" | "completed" | "cancelled";

interface StatusBadgeProps {
    status: Status | string;
    className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
    const base =
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize";

    const variants: Record<string, string> = {
        scheduled: "bg-blue-100 text-blue-700 border border-blue-200",
        "in-progress": "bg-yellow-100 text-yellow-700 border border-yellow-200",
        completed: "bg-green-100 text-green-700 border border-green-200",
        cancelled: "bg-red-100 text-red-700 border border-red-200",
    };

    const style = variants[status] || "bg-gray-100 text-gray-600 border";

    return (
        <span className={cn(base, style, className)}>
            {status?.replace("-", " ")}
        </span>
    );
};