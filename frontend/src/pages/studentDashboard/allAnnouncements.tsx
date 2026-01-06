import AnnouncementsList from '../../components/announcementsList'
// @ts-ignore
import './dashboardPages.sass'

export default function Page() {
   return (
      <div className="dashboard-page-wrapper">
         <AnnouncementsList />
      </div>
   )
}
