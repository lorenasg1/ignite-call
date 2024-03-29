import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";
import { z } from "zod";
import dayjs from "dayjs";
import { google } from "googleapis";
import { getGoogleOAuthToken } from "../../../../lib/google";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405)
  }

  const username = String(req.query.username);

  const user = await prisma.user.findUnique({
    where: {
      username
    }
  })

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const createSchedulingBodySchema = z.object({
    name: z.string(),
    email: z.string(),
    observations: z.string(),
    date: z.string().datetime(),
  })

  const { name, email, observations, date } = createSchedulingBodySchema.parse(req.body);

  const schedulingDate = dayjs(date).startOf('hour')

  if (schedulingDate.isBefore(new Date())) {
    return res.status(400).json({ message: "Invalid date." })
  }

  const conflictScheduling = await prisma.scheduling.findFirst({
    where: {
      user_id: user.id,
      date: schedulingDate.toDate()
    }
  })

  if (conflictScheduling) {
    return res.status(400).json({ message: "Scheduling already exists." })
  }

  const scheduling = await prisma.scheduling.create({
    data: {
      name,
      email,
      observations,
      date: schedulingDate.toDate(),
      user_id: user.id
    }
  })

  const calendar = google.calendar({
    version: 'v3',
    auth: await getGoogleOAuthToken(user.id)
  })

  await calendar.events.insert({
    calendarId: 'primary',
    conferenceDataVersion: 1,
    requestBody: {
      summary: `Ignite Call: ${name}`,
      description: observations,
      start: {
        dateTime: schedulingDate.format(),
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: schedulingDate.add(1, 'hour').format(),
        timeZone: 'America/Sao_Paulo',
      },
      attendees: [
        { email, displayName: name },
      ],
      conferenceData: {
        createRequest: {
          requestId: scheduling.id,
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
      }
    }
  })

  return res.status(201).end();
}