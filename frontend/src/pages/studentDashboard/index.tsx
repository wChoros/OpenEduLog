import studentDashboardNavigation from '../../components/studentDashboardNavigation/index.js'
import { Outlet } from 'react-router'

// @ts-ignore
import '../../../public/styles/dashboard-big.sass'

export default function Page() {
   return (
      <>
         {studentDashboardNavigation()}
         <Outlet />
      </>
   )
}
