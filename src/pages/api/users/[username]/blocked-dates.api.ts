import { prisma } from "../../../../lib/prisma";
import dayjs from "dayjs";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405)
  }

  const username = String(req.query.username);
  const { year, month } = req.query;

  if (!(year && month)) {
    return res.status(400).json({ message: "Year or month not provided." });
  }

  const user = await prisma.user.findUnique({
    where: {
      username
    }
  })

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const availableWeekDays = await prisma.userTimeInterval.findMany({
    select: {
      week_day: true
    },
    where: {
      user_id: user.id
    }
  })

  const blockedWeekDays = [0, 1, 2, 3, 4, 5, 6].filter((weekDay) => {
    return !availableWeekDays.some(
      (availableWeekDay: { week_day: number; }) => availableWeekDay.week_day === weekDay,
    )
  })

  const blockedDatesRaw: Array<{ date: number }> = await prisma.$queryRaw`
    SELECT
      EXTRACT(DAY FROM s.date) AS date,
      COUNT(s.date) as amount,
      ((uti.end_time_in_minutes - uti.start_time_in_minutes )/ 60) AS size
    FROM schedulings s

    LEFT JOIN user_time_intervals uti
      ON uti.week_day = WEEKDAY(DATE_ADD(s.date, INTERVAL 1 DAY))

    WHERE s.user_id = ${user.id}
    AND DATE_FORMAT(s.date, "%Y-%m") = ${`${year}-${month}`}

    GROUP BY EXTRACT(DAY FROM s.date),
    size

    HAVING amount >= size
  `

  const blockedDates = blockedDatesRaw.map((blockedDate) => {
    blockedDate.date
  })

  return res.json({ blockedWeekDays, blockedDates })
}