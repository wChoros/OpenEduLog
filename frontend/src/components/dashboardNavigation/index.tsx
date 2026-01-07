import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { apiFetch } from '../../utils/api'
//@ts-ignore
import './style.sass'

interface NavLink {
   to: string
   icon: string
   label: string
}

interface DashboardNavigationProps {
   roleDisplayName: string
   links: NavLink[]
}

const DashboardNavigation = ({ roleDisplayName, links }: DashboardNavigationProps) => {
   const [userName, setUserName] = useState('Loading...')
   const [schoolName, setSchoolName] = useState('Loading...')
   const navigate = useNavigate()

   useEffect(() => {
      const fetchData = async () => {
         // @ts-ignore
         const apiUrl = import.meta.env.VITE_API_URL
         try {
            const [meRes, infoRes] = await Promise.all([
               apiFetch(`${apiUrl}/auth/me`),
               apiFetch(`${apiUrl}/auth/instanceinfo`)
            ])

            if (meRes.ok) {
               const meData = await meRes.json()
               setUserName(`${meData.firstName} ${meData.lastName}`)
            }
            if (infoRes.ok) {
               const infoData = await infoRes.json()
               setSchoolName(infoData.schoolName)
            }
         } catch (error) {
            console.error('Failed to fetch user/school info:', error)
         }
      }
      fetchData()
   }, [])

   const handleLogout = async () => {
      // @ts-ignore
      const apiUrl = import.meta.env.VITE_API_URL
      try {
         const res = await apiFetch(`${apiUrl}/auth/logout`, {
            method: 'POST'
         })
         if (res.ok) {
            document.cookie = 'role=; Max-Age=0; path=/;'
            document.cookie = 'user_id=; Max-Age=0; path=/;'
            navigate('/login')
         }
      } catch (error) {
         console.error('Logout failed:', error)
      }
   }

   return (
      <nav id={'dashboardNavigation'}>
         <header id={'dashboardHeader'}>
            <img src="/logos/logo-black-horizontal.png" alt="OpenEduLog" />
            <h2>{roleDisplayName}</h2>
            <h3>{userName}</h3>
            <h4>{schoolName}</h4>
         </header>
         <div className="nav-links">
            {links.map((link, index) => (
               <div key={index} className={'navRecord'}>
                  <Link to={link.to}>
                     <img src={link.icon} alt={link.label} />
                     <span>{link.label}</span>
                  </Link>
               </div>
            ))}
         </div>
         <div className="nav-footer">
            <button onClick={handleLogout} className="logout-btn">
               <img src="/icons/close.svg" alt="logout" />
               <span>Logout</span>
            </button>
         </div>
      </nav>
   )
}

export default DashboardNavigation
