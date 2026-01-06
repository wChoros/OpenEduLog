import React, { useEffect, useState } from 'react'
// @ts-ignore
import './style.sass'

/**
 * Define the shape of your data.
 * Adjust to match the structure returned by your API.
 */
interface GradeData {
   id: number
   value: number
   weight: number
   subjectName: string
}

/**
 * This function maps numeric grades to a CSS class name.
 * Adjust the logic to suit your grading scale.
 */
const getGradeClass = (grade: number): string => {
   switch (grade) {
      case 1:
         return 'f'
      case 2:
         return 'e'
      case 3:
         return 'd'
      case 4:
         return 'c'
      case 5:
         return 'b'
      case 6:
         return 'a'
      default:
         return 's'
   }
}

const Index: React.FC = () => {
   // We use a state variable of type `GradeData[]` to store the fetched data
   const [gradesData, setGradesData] = useState<GradeData[]>([])

   useEffect(() => {
      // get userId from cookie
      const userIdCookie = document.cookie.split('; ').find((row) => row.startsWith('user_id='))
      const userId = userIdCookie ? userIdCookie.split('=')[1] : null

      // @ts-ignore
      const apiUrl = import.meta.env.VITE_API_URL
      fetch(`${apiUrl}/grades/${userId}`, {
         method: 'GET',
         headers: {
            'Content-Type': 'application/json',
         },
         credentials: 'include',
      })
         .then((res) => res.json())
         .then((data) => {
            if (Array.isArray(data)) {
               setGradesData(data)
            } else {
               console.error('Fetched data is not an array:', data)
            }
         })
         .catch((error) => {
            console.error('Error fetching grades:', error)
         })
   }, [])

   // Group grades by subject name
   const groupedGrades = gradesData.reduce(
      (acc, grade) => {
         if (!acc[grade.subjectName]) {
            acc[grade.subjectName] = []
         }
         acc[grade.subjectName].push(grade)
         return acc
      },
      {} as Record<string, GradeData[]>
   )

   return (
      <section id="bigGradesView">
         <h1 className="dashboardSectionTitle">Grades</h1>
         <div className="gradesContainer">
            <table>
               <thead>
                  <tr>
                     <th>Course</th>
                     <th>Partial Grades</th>
                     <th>Average</th>
                  </tr>
               </thead>
               <tbody>
                  {Object.entries(groupedGrades).map(([subjectName, grades]) => (
                     <tr key={subjectName}>
                        <td>{subjectName}</td>
                        <td>
                           {grades.map((grade) => (
                              <div key={grade.id} className={`grade ${getGradeClass(grade.value)}`}>
                                 <a href={`/dashboard/student/grades/${grade.id}`}>{grade.value}</a>
                              </div>
                           ))}
                        </td>
                        <td>
                           {(
                              grades.reduce((acc, g) => acc + g.value * g.weight, 0) /
                              grades.reduce((acc, g) => acc + g.weight, 0)
                           ).toFixed(2)}
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </section>
   )
}

export default Index
