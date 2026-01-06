import { useEffect, useState } from 'react'
import { apiFetch } from '../../utils/api'
// @ts-ignore
import './style.sass'

interface AttendanceRecord {
   id: number
   status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'WAITING_FOR_APPROVAL'
   justification: string | null
   studentId: number
   timetableId: number
   timetable: {
      date: string
      lessonNumber: number
      subjectOnTeacher: {
         subject: {
            name: string
         }
         teacher: {
            firstName: string
            lastName: string
         }
      }
   }
}

class DateRange {
   startDate: Date
   endDate: Date

   constructor(startDate: Date, endDate: Date) {
      this.startDate = startDate
      this.endDate = endDate
   }

   toString(): string {
      return `${this.startDate.toISOString()};${this.endDate.toISOString()}`
   }

   static tryParse(dateRangeString: string): DateRange | null {
      if (
         !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z;\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(
            dateRangeString
         )
      )
         return null
      try {
         const [start, end] = dateRangeString.split(';')
         return new DateRange(new Date(start), new Date(end))
      } catch {
         return null
      }
   }
}

function getCurrentDateRange(): DateRange {
   const curr = new Date()
   const day = curr.getDay()
   const diffToMonday = day === 0 ? 6 : day - 1
   const diffToSunday = day === 0 ? 0 : 7 - day

   const previousMonday = new Date(curr)
   const nextSunday = new Date(curr)

   previousMonday.setDate(previousMonday.getDate() - diffToMonday)
   previousMonday.setHours(0, 0, 0, 0)
   nextSunday.setDate(nextSunday.getDate() + diffToSunday)
   nextSunday.setHours(23, 59, 59, 999)

   return new DateRange(previousMonday, nextSunday)
}

function addWeeksToDateRange(dateRange: DateRange, num_of_weeks: number): DateRange {
   const start = new Date(dateRange.startDate)
   start.setDate(start.getDate() + 7 * num_of_weeks)
   const end = new Date(dateRange.endDate)
   end.setDate(end.getDate() + 7 * num_of_weeks)
   return new DateRange(start, end)
}

function formatWeekRange(dateRange: DateRange): string {
   const start = dateRange.startDate;
   const end = dateRange.endDate;
   const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
   if (start.getFullYear() === end.getFullYear()) {
      return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}, ${start.getFullYear()}`;
   }
   return `${start.toLocaleDateString('en-US', { ...options, year: 'numeric' })} - ${end.toLocaleDateString('en-US', { ...options, year: 'numeric' })}`;
}

export default function AttendanceGrid() {
   const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState<string | null>(null)
   const [selectedIds, setSelectedIds] = useState<number[]>([])
   const [showModal, setShowModal] = useState(false)
   const [justificationText, setJustificationText] = useState('')
   const [dateRange, setDateRange] = useState(getCurrentDateRange())

   const fetchAttendance = async () => {
      setLoading(true)
      const userIdCookie = document.cookie.split('; ').find((row) => row.startsWith('user_id='))
      const userId = userIdCookie ? userIdCookie.split('=')[1] : null

      if (!userId) {
         setError('User not found')
         setLoading(false)
         return
      }

      // @ts-ignore
      const apiUrl = import.meta.env.VITE_API_URL
      try {
         const res = await apiFetch(`${apiUrl}/attendance/student/${userId}`)
         const data = await res.json()
         if (res.ok) {
            setAttendance(data)
         } else {
            setError(data.message || 'Failed to fetch attendance')
         }
      } catch (err) {
         setError('Failed to fetch attendance')
      } finally {
         setLoading(false)
      }
   }

   useEffect(() => {
      fetchAttendance()
   }, [])

   const toggleSelect = (id: number, status: string) => {
      if (status === 'PRESENT' || status === 'EXCUSED' || status === 'WAITING_FOR_APPROVAL') return;
      
      setSelectedIds(prev => 
         prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      )
   }

   const handleSubmitJustification = async () => {
      if (selectedIds.length === 0) return

      // @ts-ignore
      const apiUrl = import.meta.env.VITE_API_URL
      try {
         const res = await apiFetch(`${apiUrl}/attendance/justify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               attendanceIds: selectedIds,
               justification: justificationText,
            })
         })

         if (res.ok) {
            setShowModal(false)
            setSelectedIds([])
            fetchAttendance() 
         } else {
            const data = await res.json()
            alert(data.message || 'Failed to submit justification')
         }
      } catch (err) {
         alert('Failed to submit justification')
      }
   }

   const daysOfWeek = [1, 2, 3, 4, 5, 6, 0] // Mon-Sun
   const dayNames = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
   const maxLessonNumber = 6 

   const filterAttendanceByRange = () => {
      return attendance.filter(record => {
         const d = new Date(record.timetable.date)
         return d >= dateRange.startDate && d <= dateRange.endDate
      })
   }

   const currentWeekAttendance = filterAttendanceByRange()

   if (loading && attendance.length === 0) return <div className="loader">Loading...</div>

   return (
      <div className="attendance-grid-section">
         <div className="attendance-header-flex">
            <h1 className="dashboardSectionTitle">Attendance Grid</h1>
            {selectedIds.length > 0 && (
               <button className="bulk-justify-btn" onClick={() => setShowModal(true)}>
                  Justify Selected ({selectedIds.length})
               </button>
            )}
         </div>

         <div className="attendance-nav">
            <div className="rangeDisplay">{formatWeekRange(dateRange)}</div>
            <div className="nav-controls">
               <button onClick={() => setDateRange(getCurrentDateRange())} className="today-btn">Today</button>
               <button onClick={() => setDateRange(addWeeksToDateRange(dateRange, -1))} className="nav-btn">←</button>
               <button onClick={() => setDateRange(addWeeksToDateRange(dateRange, 1))} className="nav-btn">→</button>
            </div>
         </div>

         <div className="attendance-grid-container">
            <table className="attendance-grid">
               <thead>
                  <tr>
                     <th>Lesson</th>
                     {dayNames.map((day, idx) => {
                        const d = new Date(dateRange.startDate)
                        d.setDate(d.getDate() + idx)
                        return (
                           <th key={day}>
                              <div className="day-name">{day}</div>
                              <div className="day-date">{d.getDate()} {d.toLocaleDateString('en-US', { month: 'short' })}</div>
                           </th>
                        )
                     })}
                  </tr>
               </thead>
               <tbody>
                  {Array.from({ length: maxLessonNumber }).map((_, lIdx) => (
                     <tr key={lIdx}>
                        <td className="lesson-num">L{lIdx + 1}</td>
                        {daysOfWeek.map((dayNum, dIdx) => {
                           const record = currentWeekAttendance.find(r => 
                              r.timetable.lessonNumber === lIdx + 1 && 
                              new Date(r.timetable.date).getDay() === dayNum
                           )

                           if (!record) return <td key={dIdx} className="empty-cell"></td>

                           const isSelected = selectedIds.includes(record.id)
                           const status = record.status.toLowerCase()

                           return (
                              <td 
                                 key={dIdx} 
                                 className={`attendance-cell ${status} ${isSelected ? 'selected' : ''}`}
                                 onClick={() => toggleSelect(record.id, record.status)}
                              >
                                 <div className="cell-content">
                                    <span className="subject">{record.timetable.subjectOnTeacher.subject.name}</span>
                                    <span className="status-label">{record.status.replace(/_/g, ' ')}</span>
                                    {record.justification && <span className="justified-icon">ℹ️</span>}
                                 </div>
                              </td>
                           )
                        })}
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {showModal && (
            <div className="modal-overlay">
               <div className="justification-modal">
                  <h2>Justify Absence</h2>
                  <p>You are justifying {selectedIds.length} lesson(s).</p>
                  <textarea
                     placeholder="Enter reason for absence..."
                     value={justificationText}
                     onChange={(e) => setJustificationText(e.target.value)}
                  />
                  <div className="modal-actions">
                     <button className="cancel" onClick={() => setShowModal(false)}>Cancel</button>
                     <button className="submit" onClick={handleSubmitJustification}>Submit for Approval</button>
                  </div>
               </div>
            </div>
         )}
      </div>
   )
}
