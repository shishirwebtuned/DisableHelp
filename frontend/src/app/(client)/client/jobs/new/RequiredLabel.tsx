import { Label } from "@/components/ui/label";

export function RequiredLabel({ children }: { children: React.ReactNode }) {
    return (
        <Label className="flex items-center gap-1">
            {children}
            <span className="text-destructive font-semibold">*</span>
        </Label>
    );
}