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

  if (availability.length === 0) return [];

  const dayMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  const today = new Date();
  const sessions: any[] = [];

  for (const slot of availability) {
    const targetDay = dayMap[slot.day.toLowerCase()];
    if (targetDay === undefined) continue;

    for (let week = 0; week < weeksToGenerate; week++) {
      const base = new Date(today);
      base.setDate(today.getDate() + week * 7);

      const diff = (targetDay + 7 - base.getDay()) % 7;

      const sessionDate = new Date(base);
      sessionDate.setDate(base.getDate() + diff);

      for (const period of slot.period) {
        const [startHour, startMin] = period.startTime.split(":");
        const [endHour, endMin] = period.endTime.split(":");

        const startTime = new Date(sessionDate);
        startTime.setHours(Number(startHour), Number(startMin), 0);

        const endTime = new Date(sessionDate);
        endTime.setHours(Number(endHour), Number(endMin), 0);

        const durationMinutes =
          (endTime.getTime() - startTime.getTime()) / (1000 * 60);
        const totalAmount = (durationMinutes / 60) * agreement.hourlyRate;

        sessions.push({
          agreement: agreement._id,
          job: agreement.job,
          client: agreement.client,
          worker: agreement.worker,
          date: sessionDate,
          startTime,
          endTime,
          durationMinutes,
          hourlyRate: agreement.hourlyRate,
          totalAmount,
        });
      }
    }
  }

  if (sessions.length > 0) {
    await Session.insertMany(sessions);
  }

  return sessions;
};
