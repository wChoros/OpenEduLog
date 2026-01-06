import React, { useEffect, useState } from 'react'
// @ts-ignore
import './style.sass'

// Nested interfaces for clarity
interface Teacher {
   id: number
   firstName: string
   lastName: string
}

interface Subject {
   id: number
   name: string
}

interface SubjectOnTeacher {
   id: number
   subjectId: number
   teacherId: number
   createdAt: string
   updatedAt: string
   subject: Subject
   teacher: Teacher
}

interface Group {
   name: string
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

interface TimetableItem {
   id: number
   date: Date
   createdAt: string
   updatedAt: string
   group: Group
   groupId: number
   isCanceled: boolean
   lessonNumber: number
   subjectOnTeacher: SubjectOnTeacher
   subjectOnTeacherId: number
   substitutionTeacher: Teacher | null // or undefined
   substitutionTeacherId: number | null // or undefined
}

function getCurrentDateRange(): DateRange {
   const curr = new Date()
   const day = curr.getDay()
   const diffToMonday = day === 0 ? 6 : day - 1 // Adjust for Sunday being 0
   const diffToSunday = day === 0 ? 0 : 7 - day // Treat Sunday as the end date

   const previousMonday = new Date(curr)
   const nextSunday = new Date(curr)

   if (day === 1) {
      // If it's Monday, treat it as the start date
      previousMonday.setHours(0, 0, 0, 0) // Reset to midnight
      nextSunday.setDate(previousMonday.getDate() + 6)
      nextSunday.setHours(23, 59, 59, 999) // End of the week
   } else if (day === 0) {
      // If it's Sunday, treat it as the end date
      nextSunday.setHours(23, 59, 59, 999) // End of the day
      previousMonday.setDate(nextSunday.getDate() - 6)
      previousMonday.setHours(0, 0, 0, 0) // Start of the week
   } else {
      previousMonday.setDate(previousMonday.getDate() - diffToMonday)
      previousMonday.setHours(0, 0, 0, 0) // Reset to midnight

      nextSunday.setDate(nextSunday.getDate() + diffToSunday)
      nextSunday.setHours(23, 59, 59, 999) // End of the week
   }

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

const Index: React.FC = () => {
   const [timetableData, setTimetableData] = useState<TimetableItem[] | undefined>()
   const [dateRange] = useState(() => {
      if (
         window.location.pathname.endsWith('/dashboard/student/timetable') ||
         window.location.pathname.endsWith('/dashboard/student/timetable/')
      ) {
         return getCurrentDateRange()
      }

      const dateRangeString = window.location.pathname.split('/').pop()
      if (dateRangeString == null) {
         return getCurrentDateRange()
      }
      const range = DateRange.tryParse(dateRangeString)
      return range ? range : getCurrentDateRange()
   })

   useEffect(() => {
      // Get userId from cookie
      const userIdCookie = document.cookie.split('; ').find((row) => row.startsWith('user_id='))
      const userId = userIdCookie ? userIdCookie.split('=')[1] : null

      // @ts-ignore
      const apiUrl = import.meta.env.VITE_API_URL

      fetch(
         `${apiUrl}/timetables/user/${userId}/${dateRange.startDate.toISOString()}/${dateRange.endDate.toISOString()}`,
         {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
         }
      )
         .then((res) => res.json())
         .then((data) => {
            if (Array.isArray(data)) {
               setTimetableData(data)
            } else {
               setTimetableData([data])
            }
         })
         .catch((error) => {
            console.error('Error fetching timetable:', error)
         })
   }, [dateRange]) // refetch whenever dateRange changes

   const maxLessonNumber =
      timetableData?.reduce((max, item) => {
         return item.lessonNumber > max ? item.lessonNumber : max
      }, 0) || 0

   const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

   // TODO: add a date indicator of the current week range at the top @rKasperaszek

   return (
      <section id="timetable">
         <h1 className="dashboardSectionTitle">Timetable</h1>

         <div className="timetableHeaderActions">
            <div className="rangeDisplay">
               {formatWeekRange(dateRange)}
            </div>
            <div className="navigationControls">
               <a href="/dashboard/student/timetable" className="todayButton">Today</a>
               <div className="navArrows">
                  <a
                     href={`/dashboard/student/timetable/${addWeeksToDateRange(dateRange, -1).toString()}`}
                     className="navButton"
                     title="Previous Week"
                  >
                     <img src="/icons/arrow-left.svg" alt="previous week" />
                  </a>
                  <a
                     href={`/dashboard/student/timetable/${addWeeksToDateRange(dateRange, 1).toString()}`}
                     className="navButton"
                     title="Next Week"
                  >
                     <img src="/icons/arrow-right.svg" alt="next week" />
                  </a>
               </div>
            </div>
         </div>

         <div className={'timetableContentContainer'}>
            <div className="timetableContainer">
               <table>
                  <thead>
                     <tr>
                        <th>Lesson</th>
                        {daysOfWeek.map((day) => (
                           <th key={day}>{day}</th>
                        ))}
                     </tr>
                  </thead>
                  <tbody>
                     {Array.from({ length: maxLessonNumber }, (_, lessonIndex) => (
                        <tr key={lessonIndex}>
                           <td>Lesson {lessonIndex + 1}</td>
                           {daysOfWeek.map((_, dayIndex) => {
                              const timetableItem = timetableData?.find(
                                 (item) =>
                                    item.lessonNumber === lessonIndex + 1 &&
                                    new Date(item.date).getDay() ===
                                       (dayIndex === 6 ? 0 : dayIndex + 1) // Adjust for Sunday being 0
                              )

                              if (!timetableItem) {
                                 return <td key={dayIndex}></td>
                              }

                              const isCanceled = timetableItem.isCanceled
                              const substitutionTeacher = timetableItem.substitutionTeacher
                              const regularTeacher = timetableItem.subjectOnTeacher.teacher
                              const subjectName = timetableItem.subjectOnTeacher.subject.name

                              return (
                                 <td key={dayIndex} className={isCanceled ? 'canceled' : ''}>
                                    <span className={`subjectName ${isCanceled ? 'canceled' : ''}`}>
                                       {subjectName}
                                    </span>
                                    <br />
                                    {substitutionTeacher ? (
                                       <span className="teacherName substitution">
                                          {substitutionTeacher.firstName}{' '}
                                          {substitutionTeacher.lastName}
                                       </span>
                                    ) : (
                                       <span className="teacherName">
                                          {regularTeacher.firstName} {regularTeacher.lastName}
                                       </span>
                                    )}
                                 </td>
                              )
                           })}
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </section>
   )
}

export default Index
