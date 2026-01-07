import DashboardPage from '../../components/dashboardPage/index.js'
import { Outlet } from 'react-router'

export default function Page() {
   return (
      <DashboardPage>
         <Outlet />
      </DashboardPage>
   )
}
