"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
    date?: Date
    setDate?: (date?: Date) => void
    value?: string | Date
    onChange?: (date?: Date) => void
    disabled?: boolean
    placeholder?: string
    className?: string
    fromYear?: number
    toYear?: number
    captionLayout?: "dropdown" | "label" | "dropdown-months" | "dropdown-years"
}

export function DatePicker({
    date,
    setDate,
    value,
    onChange,
    disabled,
    placeholder = "Pick a date",
    className,
    fromYear,
    toYear,
    captionLayout
}: DatePickerProps) {
    const selectedDate = React.useMemo(() => {
        if (date) return date;
        if (value) return typeof value === 'string' ? new Date(value) : value;
        return undefined;
    }, [date, value]);

    const handleSelect = React.useCallback((newDate?: Date) => {
        if (setDate) setDate(newDate);
        if (onChange) onChange(newDate);
    }, [setDate, onChange]);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    disabled={disabled}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground",
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate && !isNaN(selectedDate.getTime()) ? format(selectedDate, "PPP") : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleSelect}
                    initialFocus
                    startMonth={fromYear ? new Date(fromYear, 0) : new Date(1900, 0)}
                    endMonth={toYear ? new Date(toYear, 11) : new Date(new Date().getFullYear() + 1, 11)}
                    captionLayout={captionLayout || "dropdown"}
                />
            </PopoverContent>
        </Popover>
    )
}
