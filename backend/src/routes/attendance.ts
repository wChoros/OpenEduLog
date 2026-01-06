import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authorize } from '../middleware/authorize'

const attendanceRouter = express.Router()
const prisma = new PrismaClient()

// Get attendance for a student
attendanceRouter.get(
   '/student/:studentId',
   authorize('read', 'Attendance'),
   async (req, res) => {
      const { studentId } = req.params
      try {
         const attendance = await prisma.attendance.findMany({
            where: {
               studentId: parseInt(studentId, 10),
            },
            include: {
               timetable: {
                  include: {
                     subjectOnTeacher: {
                        include: {
                           subject: true,
                           teacher: {
                              select: {
                                 firstName: true,
                                 lastName: true,
                              },
                           },
                        },
                     },
                  },
               },
            },
            orderBy: {
               timetable: {
                  date: 'desc',
               },
            },
         })

         res.status(200).json(attendance)
         return
      } catch (error) {
         res.status(500).json({ message: `Internal Server Error: ${error}` })
      }
   }
)

// Justify absences
attendanceRouter.post(
   '/justify',
   authorize('update', 'Attendance'),
   async (req, res) => {
      const { attendanceIds, justification } = req.body
      const user = req.body.user as { id: number; role: string }

      if (!attendanceIds || !Array.isArray(attendanceIds) || justification === undefined) {
         res.status(400).json({ message: 'Missing attendanceIds (array) or justification' })
         return
      }

      try {
         // Verify all records belong to the student
         const records = await prisma.attendance.findMany({
            where: { id: { in: attendanceIds.map((id: string | number) => parseInt(id as string, 10)) } },
         })

         if (records.length !== attendanceIds.length) {
            res.status(404).json({ message: 'Some attendance records not found' })
            return
         }

         if (user.role === 'STUDENT') {
            const forbidden = records.some((r: { studentId: number }) => r.studentId !== user.id)
            if (forbidden) {
               res.status(403).json({ message: 'Forbidden: You can only justify your own absences' })
               return
            }
         }

         const updated = await prisma.attendance.updateMany({
            where: { id: { in: attendanceIds.map((id: string | number) => parseInt(id as string, 10)) } },
            data: {
               justification,
               status: 'WAITING_FOR_APPROVAL',
            },
         })

         res.status(200).json(updated)
         return
      } catch (error) {
         res.status(500).json({ message: `Internal Server Error: ${error}` })
      }
   }
)

export default attendanceRouter
