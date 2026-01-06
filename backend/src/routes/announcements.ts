import express, { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authorize } from '../middleware/authorize'

const announcementsRouter = express.Router()
const prisma = new PrismaClient()

// Get all announcements
announcementsRouter.get('/', async (req: Request, res: Response) => {
   console.log('GET /announcements request received')
   try {
      const announcements = await prisma.announcement.findMany({
         include: {
            user: {
               select: {
                  firstName: true,
                  lastName: true,
               },
            },
         },
         orderBy: {
            createdAt: 'desc',
         },
      })
      res.json(announcements)
   } catch (_error) {
      res.status(500).json({ message: 'Internal Server Error' })
   }
})

// Create announcement (Staff only)
announcementsRouter.post(
   '/',
   authorize('create', 'Announcement'),
   async (req: Request, res: Response) => {
      console.log('POST /announcements request received', req.body)
      const { title, content } = req.body
      const user = (req as Request & { body: { user: { id: number; role: string } } }).body.user

      if (!title || !content) {
         res.status(400).json({ message: 'Title and content are required' })
         return
      }

      try {
         const newAnnouncement = await prisma.announcement.create({
            data: {
               title,
               content,
               authorId: user.id,
            },
         })
         res.status(201).json(newAnnouncement)
      } catch {
         res.status(500).json({ message: 'Internal Server Error' })
      }
   }
)

// Delete announcement (Staff only)
announcementsRouter.delete(
   '/:id',
   authorize('delete', 'Announcement'),
   async (req: Request, res: Response) => {
      const { id } = req.params

      try {
         await prisma.announcement.delete({
            where: { id: parseInt(id, 10) },
         })
         res.json({ message: 'Announcement deleted' })
      } catch {
         res.status(500).json({ message: 'Internal Server Error' })
      }
   }
)

export default announcementsRouter
