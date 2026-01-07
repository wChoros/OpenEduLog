import DashboardLayout from '../../components/dashboardLayout/index.js'
import { Outlet } from 'react-router'

const teacherLinks = [
   { to: '/dashboard/teacher', icon: '/icons/overview.svg', label: 'Overview' },
   { to: '/dashboard/teacher/messages', icon: '/icons/mail.svg', label: 'Mail' },
   { to: '/dashboard/teacher/lessons', icon: '/icons/grades.svg', label: 'Lessons' },
   { to: '/dashboard/teacher/timetable', icon: '/icons/timetable.svg', label: 'Timetable' },
   { to: '/dashboard/teacher/announcements', icon: '/icons/overview.svg', label: 'Announcements' },
]

export default function Page() {
   return (
      <DashboardLayout roleDisplayName="Teacher's Panel" links={teacherLinks}>
         <Outlet />
      </DashboardLayout>
   )
}
