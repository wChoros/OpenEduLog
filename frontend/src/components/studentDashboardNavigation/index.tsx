//@ts-ignore
import './style.sass'

interface Props {
   studentName: string
   schoolName: string
}

const studentDashboardNavigation = (props: Readonly<Props>) => {
   return (
      <nav id={'studentDashboardNavigation'}>
         <header id={'studentDashboardHeader'}>
            <img src="/logos/logo-black-horizontal.png" alt="OpenEduLog" />
            <h2>Student's Panel</h2>
            <h3>{props.studentName}</h3>
            <h4>{props.schoolName}</h4>
         </header>
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
      </nav>
   )
}

export default studentDashboardNavigation
