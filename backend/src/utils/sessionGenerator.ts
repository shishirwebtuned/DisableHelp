import { Session } from "../models/session.model.js";

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface DaySlot {
  day: string;
  period: TimeSlot[];
}

const DAY_MAP: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

// How many sessions to generate per month, and the gap between them
const FREQUENCY_CONFIG: Record<
  string,
  { occurrences: number; intervalWeeks: number }
> = {
  weekly: { occurrences: 4, intervalWeeks: 1 },
  fortnightly: { occurrences: 2, intervalWeeks: 2 },
  monthly: { occurrences: 1, intervalWeeks: 4 }, // intervalWeeks unused but kept for clarity
};

export const generateSessionsFromSchedule = async (agreement: any) => {
  const availability: DaySlot[] = agreement.schedule || [];
  if (!availability.length) return [];

  const DEFAULT_CONFIG = { occurrences: 4, intervalWeeks: 1 };
  const config = FREQUENCY_CONFIG[agreement.frequency] ?? DEFAULT_CONFIG;
  const { occurrences, intervalWeeks } = config;

  const startDate = new Date(agreement.startDate);
  startDate.setHours(0, 0, 0, 0);

  const sessions: any[] = [];

  for (const slot of availability) {
    const targetDay = DAY_MAP[slot.day.toLowerCase()];
    if (targetDay === undefined) continue;

    // Find the first occurrence of this weekday on or after startDate
    const startDayOfWeek = startDate.getDay();
    const daysUntilTarget = (targetDay - startDayOfWeek + 7) % 7;

    const firstOccurrence = new Date(startDate);
    firstOccurrence.setDate(startDate.getDate() + daysUntilTarget);

    // Generate `occurrences` sessions, spaced `intervalWeeks` apart
    for (let i = 0; i < occurrences; i++) {
      const sessionDate = new Date(firstOccurrence);
      sessionDate.setDate(firstOccurrence.getDate() + i * intervalWeeks * 7);

      for (const period of slot.period) {
        const [startHour, startMin] = period.startTime.split(":").map(Number);
        const [endHour, endMin] = period.endTime.split(":").map(Number);

        const startMinutes = Number(startHour) * 60 + Number(startMin);
        const endMinutes = Number(endHour) * 60 + Number(endMin);
        const durationMinutes = endMinutes - startMinutes;

        if (durationMinutes <= 0) continue;

        const totalAmount = (durationMinutes / 60) * agreement.hourlyRate;

        sessions.push({
          agreement: agreement._id,
          job: agreement.job,
          client: agreement.client,
          worker: agreement.worker,
          date: new Date(sessionDate), // clone to avoid mutation
          startTime: period.startTime,
          endTime: period.endTime,
          durationMinutes,
          hourlyRate: agreement.hourlyRate,
          totalAmount,
          status: "scheduled",
        });
      }
    }
  }

  if (sessions.length) {
    await Session.insertMany(sessions);
  }

  return sessions;
};
