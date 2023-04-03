import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";
import dayjs from "dayjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405)
  }

  const username = String(req.query.username);
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ message: "Date not provided." });
  }

  const user = await prisma.user.findUnique({
    where: {
      username
    }
  })

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const referenceDate = dayjs(String(date))
  const isPastDate = referenceDate.endOf("day").isBefore(new Date())

  if (isPastDate) {
    return res.json({ possibleTimes: [], availableTimes: [] })
  }

  const userAvailability = await prisma.userTimeInterval.findFirst({
    where: {
      user_id: user.id,
      week_day: referenceDate.get('day'),
    }
  })

  if (!userAvailability) {
    return res.json({ possibleTimes: [], availableTimes: [] })
  }

  const { start_time_in_minutes, end_time_in_minutes } = userAvailability

  const startHour = start_time_in_minutes / 60
  const endHour = end_time_in_minutes / 60

  const possibleTimes = Array.from({ length: endHour - startHour }).map((_, index) => startHour + index)

  const blockedTimes = await prisma.scheduling.findMany({
    where: {
      user_id: user.id,
      date: {
        gte: referenceDate.set('hour', startHour).toDate(),
        lte: referenceDate.set('hour', endHour).toDate(),
      }
    }
  })

  const availableTimes = possibleTimes.filter(time => {
    const isTimeBlocked = blockedTimes.some(blockedTime => blockedTime.date.getHours() === time)

    const isPastTime = referenceDate.set('hour', time).isBefore(new Date())

    return !isTimeBlocked && !isPastTime
  })

  return res.json({ possibleTimes, availableTimes })
}