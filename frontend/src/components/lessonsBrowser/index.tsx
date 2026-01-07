import { useEffect, useState } from 'react'
import { apiFetch } from '../../utils/api'
//@ts-ignore
import './style.sass'

interface Lesson {
   id: number
   date: string
   lessonNumber: number
   subjectOnTeacher: {
      subject: { name: string; id: number }
      teacher: { firstName: string; lastName: string; id: number }
   }
   group: {
      name: string
   }
   isCanceled: boolean
   isCompleted?: boolean
}

export default function LessonsBrowser() {
   const [lessons, setLessons] = useState<Lesson[]>([])
   const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([])
   const [loading, setLoading] = useState(true)
   const [filterSubject, setFilterSubject] = useState<string>('all')
   const [filterStatus, setFilterStatus] = useState<string>('all')

   useEffect(() => {
      const fetchLessons = async () => {
         // @ts-ignore
         const apiUrl = import.meta.env.VITE_API_URL
         try {
            const meRes = await apiFetch(`${apiUrl}/auth/me`)
            if (meRes.ok) {
               const userData = await meRes.json()
               
               // Fetch lessons for the teacher
               const now = new Date()
               const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
               const endDate = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString()
               
               const lessonsRes = await apiFetch(`${apiUrl}/timetables/user/${userData.id}/${startDate}/${endDate}`)
               if (lessonsRes.ok) {
                  const data = await lessonsRes.json()
                  setLessons(data)
                  setFilteredLessons(data)
               }
            }
         } catch (error) {
            console.error('Failed to fetch lessons:', error)
         } finally {
            setLoading(false)
         }
      }
      fetchLessons()
   }, [])

   useEffect(() => {
      let filtered = [...lessons]

      if (filterSubject !== 'all') {
         filtered = filtered.filter(l => l.subjectOnTeacher.subject.name === filterSubject)
      }

      if (filterStatus === 'upcoming') {
         filtered = filtered.filter(l => new Date(l.date) >= new Date() && !l.isCanceled)
      } else if (filterStatus === 'past') {
         filtered = filtered.filter(l => new Date(l.date) < new Date())
      } else if (filterStatus === 'canceled') {
         filtered = filtered.filter(l => l.isCanceled)
      }

      // Sort by date and time
      filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      setFilteredLessons(filtered)
   }, [filterSubject, filterStatus, lessons])

   // Split lessons into past and upcoming
   const now = new Date()
   const upcomingLessons = filteredLessons.filter(l => new Date(l.date) >= now && !l.isCanceled)
   const pastLessons = filteredLessons.filter(l => new Date(l.date) < now || l.isCanceled)

   // Group by date
   const groupByDate = (lessonsList: Lesson[]) => {
      return lessonsList.reduce((groups, lesson) => {
         const dateKey = new Date(lesson.date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
         })
         if (!groups[dateKey]) {
            groups[dateKey] = []
         }
         groups[dateKey].push(lesson)
         return groups
      }, {} as Record<string, Lesson[]>)
   }

   const upcomingGrouped = groupByDate(upcomingLessons)
   const pastGrouped = groupByDate(pastLessons)

   const subjects = Array.from(new Set(lessons.map(l => l.subjectOnTeacher.subject.name)))

   if (loading) return <div className="lessons-loading">Loading lessons...</div>

   const renderLessonCard = (lesson: Lesson) => {
      const lessonDate = new Date(lesson.date)
      const isPast = lessonDate < now
      
      return (
         <a
            key={lesson.id}
            href={`/dashboard/teacher/lesson/${lesson.id}`}
            className={`lesson-card ${lesson.isCanceled ? 'canceled' : ''} ${isPast ? 'past' : ''} ${lesson.isCompleted ? 'completed' : ''}`}
         >
            <div className="lesson-card-header">
               <h3 className="lesson-subject">{lesson.subjectOnTeacher.subject.name}</h3>
               <div className="badges">
                  {lesson.isCompleted && <span className="completed-badge">✓</span>}
                  {lesson.isCanceled && <span className="canceled-badge">Canceled</span>}
               </div>
            </div>
            <div className="lesson-details">
               <p className="lesson-group">
                  <img src="/icons/overview.svg" alt="" className="icon" />
                  {lesson.group.name}
               </p>
               <p className="lesson-number">
                  <img src="/icons/timetable.svg" alt="" className="icon" />
                  Lesson #{lesson.lessonNumber}
               </p>
               <p className="lesson-time">
                  <img src="/icons/mail.svg" alt="" className="icon" />
                  {lessonDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </p>
            </div>
         </a>
      )
   }

   return (
      <div className="lessons-browser-container">
         <header className="lessons-header">
            <h1>My Lessons</h1>
            <p className="lessons-subtitle">Browse and manage your lessons</p>
         </header>

         <div className="lessons-filters">
            <div className="filter-group">
               <label htmlFor="subject-filter">Subject:</label>
               <select
                  id="subject-filter"
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="filter-select"
               >
                  <option value="all">All Subjects</option>
                  {subjects.map(subject => (
                     <option key={subject} value={subject}>{subject}</option>
                  ))}
               </select>
            </div>

            <div className="filter-group">
               <label htmlFor="status-filter">Status:</label>
               <select
                  id="status-filter"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="filter-select"
               >
                  <option value="all">All Lessons</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                  <option value="canceled">Canceled</option>
               </select>
            </div>
         </div>

         <div className="lessons-stats">
            <span className="stat-item">
               <strong>{upcomingLessons.length}</strong> Upcoming
            </span>
            <span className="stat-item">
               <strong>{pastLessons.length}</strong> Past
            </span>
         </div>

         {filteredLessons.length === 0 ? (
            <div className="no-lessons">No lessons found with the current filters.</div>
         ) : (
            <>
               {/* Upcoming Lessons Section */}
               {filterStatus !== 'past' && Object.keys(upcomingGrouped).length > 0 && (
                  <div className="lessons-section">
                     <h2 className="section-header upcoming-header">
                        <img src="/icons/timetable.svg" alt="" className="section-icon" />
                        Upcoming Lessons
                     </h2>
                     {Object.entries(upcomingGrouped).map(([dateKey, dayLessons]) => (
                        <div key={dateKey} className="lessons-day-group">
                           <h3 className="day-header">{dateKey}</h3>
                           <div className="lessons-grid">
                              {dayLessons.map(renderLessonCard)}
                           </div>
                        </div>
                     ))}
                  </div>
               )}

               {/* Past Lessons Section */}
               {filterStatus !== 'upcoming' && Object.keys(pastGrouped).length > 0 && (
                  <div className="lessons-section">
                     <h2 className="section-header past-header">
                        <img src="/icons/attendance.svg" alt="" className="section-icon" />
                        Past Lessons
                     </h2>
                     {Object.entries(pastGrouped).slice(0, 10).map(([dateKey, dayLessons]) => (
                        <div key={dateKey} className="lessons-day-group">
                           <h3 className="day-header">{dateKey}</h3>
                           <div className="lessons-grid">
                              {dayLessons.map(renderLessonCard)}
                           </div>
                        </div>
                     ))}
                     {Object.keys(pastGrouped).length > 10 && (
                        <div className="show-more">
                           Showing 10 most recent past lessons
                        </div>
                     )}
                  </div>
               )}
            </>
         )}
      </div>
   )
}
