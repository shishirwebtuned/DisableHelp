import { Session } from "../models/session.model.js";

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface DaySlot {
  day: string;
  period: TimeSlot[];
}

export const generateSessionsFromSchedule = async (
  agreement: any,
  weeksToGenerate = 4,
) => {
  const availability: DaySlot[] = agreement.schedule || [];

  if (!availability.length) return [];

  const dayMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  const startDate = new Date(agreement.startDate);

  const sessions: any[] = [];

  const frequencyInterval: Record<string, number> = {
    weekly: 1,
    fortnightly: 2,
    monthly: 4,
  };

  const intervalWeeks = frequencyInterval[agreement.frequency] || 1;

  for (const slot of availability) {
    const targetDay = dayMap[slot.day.toLowerCase()];

    if (targetDay === undefined) continue;

    for (let i = 0; i < weeksToGenerate; i++) {
      const base = new Date(startDate);

      base.setDate(startDate.getDate() + i * intervalWeeks * 7);

      const diff = (targetDay - base.getDay() + 7) % 7;

      const sessionDate = new Date(base);

      sessionDate.setDate(base.getDate() + diff);

      if (sessionDate < startDate) continue;

      for (const period of slot.period) {
        const [startHour, startMin] = period.startTime.split(":");

        const [endHour, endMin] = period.endTime.split(":");

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

          date: sessionDate,

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
    try {
      await Session.insertMany(sessions);
    } catch (error) {
      console.error("SESSION INSERT ERROR:");
      console.error(error);

      throw error;
    }
  }

  return sessions;
};
