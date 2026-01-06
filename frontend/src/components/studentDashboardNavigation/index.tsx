import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../../utils/api'
//@ts-ignore
import './style.sass'

const studentDashboardNavigation = () => {
   const [studentName, setStudentName] = useState('Loading...')
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
               setStudentName(`${meData.firstName} ${meData.lastName}`)
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
            // Clear other non-httpOnly cookies if any
            document.cookie = 'role=; Max-Age=0; path=/;'
            document.cookie = 'user_id=; Max-Age=0; path=/;'
            navigate('/login')
         }
      } catch (error) {
         console.error('Logout failed:', error)
      }
   }

   return (
      <nav id={'studentDashboardNavigation'}>
         <header id={'studentDashboardHeader'}>
            <img src="/logos/logo-black-horizontal.png" alt="OpenEduLog" />
            <h2>Student's Panel</h2>
            <h3>{studentName}</h3>
            <h4>{schoolName}</h4>
         </header>
         <div className="nav-links">
            <div className={'navRecord'}>
               <a href={'/dashboard/student'}>
                  <img src={'/icons/overview.svg'} alt={'overview'} />
                  <span>Overview</span>
               </a>
            </div>
            <div className={'navRecord'}>
               <a href={'/dashboard/student/messages'}>
                  <img src={'/icons/mail.svg'} alt={'courses'} />
                  <span>Mail</span>
               </a>
            </div>
            <div className={'navRecord'}>
               <a href={'/dashboard/student/grades'}>
                  <img src={'/icons/grades.svg'} alt={'grades'} />
                  <span>Grades</span>
               </a>
            </div>
            <div className={'navRecord'}>
               <a href={'/dashboard/student/timetable'}>
                  <img src={'/icons/timetable.svg'} alt={'timetable'} />
                  <span>Timetable</span>
               </a>
            </div>
            <div className={'navRecord'}>
               <a href={'/dashboard/student/attendance'}>
                  <img src={'/icons/attendance.svg'} alt={'attendance'} />
                  <span>Attendance</span>
               </a>
            </div>
            <div className={'navRecord'}>
               <a href={'/dashboard/student/announcements'}>
                  <img src={'/icons/overview.svg'} alt={'announcements'} />
                  <span>Announcements</span>
               </a>
            </div>
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

export default studentDashboardNavigation
