import { useEffect, useState } from 'react'
import { apiFetch } from '../../utils/api'
//@ts-ignore
import './style.sass'

interface TimetableItem {
   id: number
   date: string
   lessonNumber: number
   subjectOnTeacher: {
      subject: { name: string }
      teacher: { firstName: string; lastName: string }
   }
   group: { name: string }
   isCompleted?: boolean
}

interface LessonProps {
   lessonId: string | undefined
}

export default function Lesson({ lessonId }: LessonProps) {
   const [lesson, setLesson] = useState<TimetableItem | null>(null)
   const [loading, setLoading] = useState(true)
   const [saving, setSaving] = useState(false)

   useEffect(() => {
      const fetchData = async () => {
         // @ts-ignore
         const apiUrl = import.meta.env.VITE_API_URL
         try {
            const res = await apiFetch(`${apiUrl}/timetables/${lessonId}`)
            if (res.ok) {
               setLesson(await res.json())
            }
         } catch (error) {
            console.error('Failed to fetch lesson data:', error)
         } finally {
            setLoading(false)
         }
      }
      if (lessonId) fetchData()
   }, [lessonId])

   const handleSave = async () => {
      setSaving(true)
      // @ts-ignore
      const apiUrl = import.meta.env.VITE_API_URL
      try {
         const res = await apiFetch(`${apiUrl}/timetables/${lessonId}/complete`, {
            method: 'PATCH',
         })
         if (res.ok) {
            // Update only the isCompleted field instead of replacing the entire object
            setLesson((prev) => (prev ? { ...prev, isCompleted: true } : null))
            alert('Lesson marked as completed!')
         } else {
            alert('Failed to save lesson.')
         }
      } catch (error) {
         console.error('Failed to save lesson:', error)
         alert('An error occurred while saving.')
      } finally {
         setSaving(false)
      }
   }

   if (loading) return <div id="dashboardMain">Loading lesson...</div>

   return (
      <div id="dashboardMain">
         <div className="lesson-container">
            <header className="lesson-header">
               <h1>{lesson?.subjectOnTeacher.subject.name || 'Lesson'}</h1>
               <p>
                  {lesson?.group.name} — Lesson #{lesson?.lessonNumber}
               </p>
               {lesson?.isCompleted && <span className="completed-badge">✓ Completed</span>}
            </header>

            <div className="lesson-actions">
               <a
                  href={`/dashboard/teacher/attendance/${lessonId}`}
                  className="lesson-btn attendance"
               >
                  <img src="/icons/attendance.svg" alt="" />
                  Check Attendance
               </a>
               <button
                  className="lesson-btn grades"
                  onClick={() => alert('Adding grades coming soon!')}
               >
                  <img src="/icons/grades.svg" alt="" />
                  Add Grades
               </button>
               <button
                  className="lesson-btn save"
                  onClick={handleSave}
                  disabled={saving || lesson?.isCompleted}
               >
                  <img src="/icons/overview.svg" alt="" />
                  {lesson?.isCompleted
                     ? 'Lesson Completed'
                     : saving
                       ? 'Saving...'
                       : 'Mark as Complete'}
               </button>
            </div>

            <section className="lesson-details-placeholder">
               <div className="glass-card">
                  <h3>Lesson Content</h3>
                  <textarea
                     placeholder="Write what was discussed today..."
                     rows={10}
                     style={{
                        width: '100%',
                        padding: '15px',
                        borderRadius: '12px',
                        border: '1px solid #ddd',
                     }}
                  />
               </div>
            </section>
         </div>
      </div>
   )
}
