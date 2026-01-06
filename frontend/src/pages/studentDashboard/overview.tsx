import StudentOverview from '../../components/studentOverview'
// @ts-ignore
import './dashboardPages.sass'

export default function Page() {
   return (
      <div className="dashboard-page-wrapper">
         <StudentOverview />
      </div>
   )
}
