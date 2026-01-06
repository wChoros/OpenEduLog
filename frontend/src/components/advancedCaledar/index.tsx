import React, { useState, KeyboardEvent } from 'react'
import './style.sass'

// Define the props interface
interface AdvancedCalendarProps {
   onDateSelect?: (_date: Date) => void
   initialDate?: Date
}

const AdvancedCalendar: React.FC<AdvancedCalendarProps> = ({ onDateSelect, initialDate }) => {
   const [currentDate, setCurrentDate] = useState<Date>(
      initialDate ? new Date(initialDate) : new Date()
   )
   const [selectedDate, setSelectedDate] = useState<Date | null>(
      initialDate ? new Date(initialDate) : null
   )

   const daysOfWeek: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

   // Helper function to get the number of days in a given month and year
   const getDaysInMonth = (year: number, month: number): number => {
      return new Date(year, month + 1, 0).getDate()
   }

   // Helper function to get the first day of the month (0 for Monday, 6 for Sunday)
   const getFirstDayOfMonth = (year: number, month: number): number => {
      const day = new Date(year, month, 1).getDay()
      return day === 0 ? 6 : day - 1 // Adjust Sunday (0) to be 6 (last day of the week)
   }

   // Navigate to the previous month
   const handlePrevMonth = (): void => {
      setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
   }

   // Navigate to the next month
   const handleNextMonth = (): void => {
      setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
   }

   // Handle click on a specific day
   const handleDateClick = (day: number): void => {
      const newSelectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      setSelectedDate(newSelectedDate)
      if (onDateSelect) {
         onDateSelect(newSelectedDate)
      }
   }

   // Handle keyboard interaction for day selection
   const handleDayKeyDown = (event: KeyboardEvent<HTMLDivElement>, day: number): void => {
      if (event.key === 'Enter' || event.key === ' ') {
         event.preventDefault() // Prevent page scroll on space
         handleDateClick(day)
      }
   }

   // Render the header with month/year and navigation buttons
   const renderHeader = (): JSX.Element => {
      const monthYearFormat = new Intl.DateTimeFormat('en-US', {
         month: 'long',
         year: 'numeric',
      })
      return (
         <div className="calendar-header">
            <button onClick={handlePrevMonth} aria-label="Previous month">
               &lt;
            </button>
            <h2>{monthYearFormat.format(currentDate)}</h2>
            <button onClick={handleNextMonth} aria-label="Next month">
               &gt;
            </button>
         </div>
      )
   }

   // Render the row of weekday names
   const renderDaysOfWeek = (): JSX.Element => {
      return (
         <div className="calendar-weekdays">
            {daysOfWeek.map((day) => (
               <div key={day} className="weekday-cell">
                  {day}
               </div>
            ))}
         </div>
      )
   }

   // Render the grid of calendar days
   const renderCalendarDays = (): JSX.Element => {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()

      const daysInCurrentMonth = getDaysInMonth(year, month)
      const firstDayOfCurrentMonth = getFirstDayOfMonth(year, month) // 0 for Monday, 6 for Sunday

      const daysInPrevMonth = getDaysInMonth(year, month - 1)

      const cells: JSX.Element[] = []
      const today = new Date() // For highlighting the current day

      // Days from the previous month to fill the grid
      for (let i = 0; i < firstDayOfCurrentMonth; i++) {
         const day = daysInPrevMonth - firstDayOfCurrentMonth + i + 1
         cells.push(
            <div key={`prev-${month}-${day}`} className="day-cell other-month">
               {day}
            </div>
         )
      }

      // Days of the current month
      for (let day = 1; day <= daysInCurrentMonth; day++) {
         const cellDate = new Date(year, month, day)
         let className = 'day-cell'
         if (selectedDate && cellDate.toDateString() === selectedDate.toDateString()) {
            className += ' selected'
         }
         if (cellDate.toDateString() === today.toDateString()) {
            className += ' today' // Highlight today's date
         }

         cells.push(
            <div
               key={`curr-${month}-${day}`}
               className={className}
               onClick={() => handleDateClick(day)}
               onKeyDown={(e) => handleDayKeyDown(e, day)}
               role="button"
               tabIndex={0} // Make it focusable
               aria-pressed={selectedDate?.toDateString() === cellDate.toDateString()}
               aria-label={`${new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(cellDate)}`}
            >
               {day}
            </div>
         )
      }

      // Days from the next month to fill the grid (typically up to 6 weeks or 42 cells)
      const totalCells = 42 // 6 weeks * 7 days for a consistent grid height
      const remainingCells = totalCells - cells.length
      for (let i = 1; i <= remainingCells; i++) {
         cells.push(
            <div key={`next-${month}-${i}`} className="day-cell other-month">
               {i}
            </div>
         )
      }
      return <div className="calendar-days">{cells}</div>
   }

   return (
      <div id="advancedCalendar" style={{ width: '400px', height: '400px' }}>
         {renderHeader()}
         {renderDaysOfWeek()}
         {renderCalendarDays()}
      </div>
   )
}

export default AdvancedCalendar
