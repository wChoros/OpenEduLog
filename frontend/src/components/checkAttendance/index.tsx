import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { apiFetch } from '../../utils/api'
//@ts-ignore
import './style.sass'

interface Student {
   id: number
   firstName: string
   lastName: string
}

interface TimetableData {
   id: number
   date: string
   lessonNumber: number
   subjectOnTeacher: {
      subject: { name: string }
      teacher: { firstName: string; lastName: string }
   }
   group: {
      name: string
      id: number
      StudentsOnGroups: Array<{
         student: Student
      }>
   }
}

export default function CheckAttendance() {
   const { lessonId } = useParams()
   const [lesson, setLesson] = useState<TimetableData | null>(null)
   const [attendanceMap, setAttendanceMap] = useState<Record<number, string>>({})
   const [loading, setLoading] = useState(true)
   const [saving, setSaving] = useState(false)

   useEffect(() => {
      const fetchData = async () => {
         // @ts-ignore
         const apiUrl = import.meta.env.VITE_API_URL
         try {
            const res = await apiFetch(`${apiUrl}/timetables/${lessonId}`)
            if (res.ok) {
               const data = await res.json()
               setLesson(data)
               // Initialize all students as 'PRESENT'
               const initialMap: Record<number, string> = {}
               data.group.StudentsOnGroups.forEach((sog: { student: Student }) => {
                  initialMap[sog.student.id] = 'PRESENT'
               })
               setAttendanceMap(initialMap)
            }
         } catch (error) {
            console.error('Failed to fetch lesson:', error)
         } finally {
            setLoading(false)
         }
      }
      if (lessonId) fetchData()
   }, [lessonId])

   const handleStatusChange = (studentId: number, status: string) => {
      setAttendanceMap((prev) => ({ ...prev, [studentId]: status }))
   }

   const handleSave = async () => {
      setSaving(true)
      // @ts-ignore
      const apiUrl = import.meta.env.VITE_API_URL
      try {
         const attendees = Object.entries(attendanceMap).map(([studentId, status]) => ({
            studentId: parseInt(studentId, 10),
            status,
         }))

         const res = await apiFetch(`${apiUrl}/attendance/mark`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ timetableId: lessonId, attendees }),
         })

         if (res.ok) {
            alert('Attendance saved successfully!')
         } else {
            alert('Failed to save attendance.')
         }
      } catch (error) {
         console.error('Failed to save attendance:', error)
         alert('An error occurred while saving attendance.')
      } finally {
         setSaving(false)
      }
   }

   if (loading) return <div className="attendance-loading">Loading lesson...</div>

   if (!lesson) return <div className="attendance-error">Lesson not found</div>

   return (
      <div className="check-attendance-container">
         <header className="attendance-header">
            <h1>{lesson.subjectOnTeacher.subject.name}</h1>
            <p className="lesson-meta">
               {lesson.group.name} • Lesson #{lesson.lessonNumber} •{' '}
               {new Date(lesson.date).toLocaleDateString()}
            </p>
         </header>

         <div className="attendance-list">
            {lesson.group.StudentsOnGroups?.map(({ student }) => (
               <div key={student.id} className="attendance-row">
                  <div className="student-info">
                     <span className="student-name">
                        {student.firstName} {student.lastName}
                     </span>
                  </div>
                  <div className="status-selector">
                     {['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].map((status) => (
                        <button
                           key={status}
                           className={`status-btn ${status.toLowerCase()} ${attendanceMap[student.id] === status ? 'active' : ''}`}
                           onClick={() => handleStatusChange(student.id, status)}
                        >
                           {status}
                        </button>
                     ))}
                  </div>
               </div>
            )) || <p>No students found in this group.</p>}
         </div>

         <div className="attendance-actions">
            <button className="save-btn" onClick={handleSave} disabled={saving}>
               {saving ? 'Saving...' : 'Save Attendance'}
            </button>
         </div>
      </div>
   )
}
