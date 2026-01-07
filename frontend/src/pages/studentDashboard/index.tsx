import DashboardLayout from '../../components/dashboardLayout/index.js'
import { Outlet } from 'react-router'

const studentLinks = [
   { to: '/dashboard/student', icon: '/icons/overview.svg', label: 'Overview' },
   { to: '/dashboard/student/messages', icon: '/icons/mail.svg', label: 'Mail' },
   { to: '/dashboard/student/grades', icon: '/icons/grades.svg', label: 'Grades' },
   { to: '/dashboard/student/timetable', icon: '/icons/timetable.svg', label: 'Timetable' },
   { to: '/dashboard/student/attendance', icon: '/icons/attendance.svg', label: 'Attendance' },
   { to: '/dashboard/student/announcements', icon: '/icons/overview.svg', label: 'Announcements' },
]

export default function Page() {
   return (
      <DashboardLayout roleDisplayName="Student's Panel" links={studentLinks}>
         <Outlet />
      </DashboardLayout>
   )
}
