import React, { useEffect, useState } from 'react'
// @ts-ignore
import './style.sass'

interface GradeDetailsData {
   id: number
   value: number
   description: string
   weight: number
   subjectName: string
   subjectId: number
   teacherFirstName: string
   teacherLastName: string
   teacherId: number
   addedAt: string
   updatedAt: string
}

const Index: React.FC = () => {
   // Store an array of grades
   const [gradesData, setGradesData] = useState<GradeDetailsData[]>([])

   useEffect(() => {
      // Get gradeId from URL
      const gradeId = window.location.pathname.split('/').pop()

      // @ts-ignore
      const apiUrl = import.meta.env.VITE_API_URL

      fetch(`${apiUrl}/grades/details/${gradeId}`, {
         method: 'GET',
         headers: { 'Content-Type': 'application/json' },
         credentials: 'include',
      })
         .then((res) => res.json())
         .then((data) => {
            // If data is an array, store it in state
            if (Array.isArray(data)) {
               setGradesData(data)
            } else {
               // If API returns a single grade object, wrap it in an array
               setGradesData([data])
            }
         })
         .catch((error) => {
            console.error('Error fetching grades:', error)
         })
   }, [])

   return (
      <section id="gradeDetails">
         <h1 className="dashboardSectionTitle">Grade Info</h1>
         <div className="gradeDetailsContainer">
            <header>
               <div className={'returnButton'}>
                  <a href={'/dashboard/student/grades'}>
                     <img src={'/icons/close.svg'} alt={'return'} />
                  </a>
               </div>
            </header>
            {gradesData.map((grade) => (
               <div key={grade.id} className="gradeRecord">
                  <table aria-hidden={true}>
                     <tbody>
                        <tr>
                           <td>Subject:</td>
                           <td>{grade.subjectName}</td>
                        </tr>
                        <tr>
                           <td>Grade:</td>
                           <td>{grade.value}</td>
                        </tr>
                        <tr>
                           <td>Description:</td>
                           <td>{grade.description}</td>
                        </tr>
                        <tr>
                           <td>Weight:</td>
                           <td>{grade.weight}</td>
                        </tr>
                        <tr>
                           <td>Teacher:</td>
                           <td>
                              {grade.teacherFirstName} {grade.teacherLastName}
                           </td>
                        </tr>
                        <tr>
                           <td>Added at:</td>
                           <td> {new Date(grade.addedAt).toLocaleString()} </td>
                        </tr>
                        <tr>
                           <td>Updated at:</td>
                           <td> {new Date(grade.updatedAt).toLocaleString()} </td>
                        </tr>
                     </tbody>
                  </table>
               </div>
            ))}
         </div>
      </section>
   )
}

export default Index
