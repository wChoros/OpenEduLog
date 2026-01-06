import { index, route, type RouteConfig } from '@react-router/dev/routes'

export default [
   // * matches all URLs, the ? makes it optional so it will match / as well
   route('/', 'pages/home.tsx'),
   route('login', 'pages/login.tsx'),
   route('register', 'pages/register.tsx'),
   route('/dashboard/student', 'pages/studentDashboard/index.tsx', [
      index('pages/studentDashboard/overview.tsx'),
      route('messages', 'pages/studentDashboard/messages.tsx', [
         index('components/bigMessageView/index.tsx'),
         route(':messageId', 'components/messageDetails/index.tsx'),
      ]),
      route('timetable/:weekNumber?', 'pages/studentDashboard/timetable.tsx'),
      route('grades', 'pages/studentDashboard/grades.tsx', [
         index('components/bigGradesView/index.tsx'),
         route(':gradeId', 'components/gradeDetails/index.tsx'),
      ]),
      route('attendance', 'pages/studentDashboard/attendance.tsx'),
   ]),
   route('*', 'catchall.tsx'),
] satisfies RouteConfig
