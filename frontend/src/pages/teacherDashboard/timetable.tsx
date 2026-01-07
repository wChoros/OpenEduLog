import DashboardPage from '../../components/dashboardPage/index.js'
import Timetable from '../../components/timetable/index.js'

export default function TimetablePage() {
   return (
      <DashboardPage>
         <Timetable basePath="/dashboard/teacher/timetable" />
      </DashboardPage>
   )
}
