import { ReactNode } from 'react'
import DashboardNavigation from '../dashboardNavigation/index.js'
//@ts-ignore
import './style.sass'

interface NavLink {
   to: string
   icon: string
   label: string
}

interface DashboardLayoutProps {
   roleDisplayName: string
   links: NavLink[]
   children: ReactNode
}

export default function DashboardLayout({
   roleDisplayName,
   links,
   children,
}: DashboardLayoutProps) {
   return (
      <div className="dashboard-layout">
         <DashboardNavigation roleDisplayName={roleDisplayName} links={links} />
         <div className="dashboard-content">{children}</div>
      </div>
   )
}
