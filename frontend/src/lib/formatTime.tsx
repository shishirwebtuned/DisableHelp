// Convert "HH:mm" string to 12-hour format with AM/PM
export const formatTime = (timeStr?: string) => {
    if (!timeStr) return "";

    const [hours, minutes] = timeStr.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return timeStr;

    const date = new Date();
    date.setHours(hours, minutes);

    return minutes === 0
        ? date.toLocaleTimeString([], { hour: "numeric", hour12: true })
        : date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
};

// Convert minutes to "X hr Y min" format
export const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs && mins) return `${hrs} hr ${mins} min`;
    if (hrs) return `${hrs} hr`;
    return `${mins} min`;
};