import { useParams } from 'react-router-dom'
import DashboardPage from '../../components/dashboardPage/index.js'
import CheckAttendance from '../../components/checkAttendance/index.js'

export default function AttendancePage() {
   const { lessonId } = useParams()
   
   if (!lessonId) {
      return (
         <DashboardPage>
            <div style={{ padding: '40px', textAlign: 'center' }}>
               <h2>Please select a lesson to check attendance</h2>
            </div>
         </DashboardPage>
      )
   }

   return (
      <DashboardPage>
         <CheckAttendance />
      </DashboardPage>
   )
}
