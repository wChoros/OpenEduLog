import AttendanceGrid from '../../components/attendanceGrid'
// @ts-ignore
import './dashboardPages.sass'

export default function Page() {
   return (
      <div className="dashboard-page-wrapper">
         <AttendanceGrid />
      </div>
   )
}
