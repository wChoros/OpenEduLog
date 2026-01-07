import { ReactNode } from 'react'
//@ts-ignore
import './style.sass'

interface DashboardPageProps {
   children: ReactNode
}

export default function DashboardPage({ children }: DashboardPageProps) {
   return (
      <div className="dashboard-page-wrapper">
         {children}
      </div>
   )
}
