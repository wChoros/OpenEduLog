import { useEffect, useState } from 'react'
import { apiFetch } from '../../utils/api'
// @ts-ignore
import './style.sass'

interface Grade {
   id: number
   value: number
   weight: number
   subjectName: string
   description: string | null
   createdAt?: string
}

interface SubjectGroup {
   subjectName: string
   grades: Grade[]
   average: number
}

interface Stats {
   gpa: string
   totalGrades: number
   bestSubject: string
   gradeDistribution: number[]
}

export default function GradesDashboard() {
   const [grades, setGrades] = useState<Grade[]>([])
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState<string | null>(null)

   useEffect(() => {
      const fetchGrades = async () => {
         const userIdCookie = document.cookie.split('; ').find((row) => row.startsWith('user_id='))
         const userId = userIdCookie ? userIdCookie.split('=')[1] : null

         if (!userId) {
            setError('User session not found')
            setLoading(false)
            return
         }

         // @ts-ignore
         const apiUrl = import.meta.env.VITE_API_URL
         try {
            const res = await apiFetch(`${apiUrl}/grades/${userId}`)
            if (res.ok) {
               const data = await res.json()
               setGrades(data)
            } else {
               const data = await res.json()
               setError(data.message || 'Failed to fetch grades')
            }
         } catch (_err) {
            setError('Network error: Failed to reach server')
         } finally {
            setLoading(false)
         }
      }

      fetchGrades()
   }, [])

   const calculateStats = (gradesList: Grade[]): Stats => {
      if (gradesList.length === 0) {
         return { gpa: '0.00', totalGrades: 0, bestSubject: 'N/A', gradeDistribution: [] }
      }

      const totalWeight = gradesList.reduce((acc, g) => acc + g.weight, 0)
      const weightedSum = gradesList.reduce((acc, g) => acc + g.value * g.weight, 0)
      const gpa = (weightedSum / totalWeight).toFixed(2)

      const subjectAverages = gradesList.reduce((acc: any, g) => {
         if (!acc[g.subjectName]) acc[g.subjectName] = { sum: 0, weight: 0 }
         acc[g.subjectName].sum += g.value * g.weight
         acc[g.subjectName].weight += g.weight
         return acc
      }, {})

      let bestSub = 'N/A'
      let maxAvg = -1
      Object.keys(subjectAverages).forEach((sub) => {
         const avg = subjectAverages[sub].sum / subjectAverages[sub].weight
         if (avg > maxAvg) {
            maxAvg = avg
            bestSub = sub
         }
      })

      return {
         gpa,
         totalGrades: gradesList.length,
         bestSubject: bestSub,
         gradeDistribution: []
      }
   }

   const groupGrades = (gradesList: Grade[]): SubjectGroup[] => {
      const groups = gradesList.reduce((acc: any, g) => {
         if (!acc[g.subjectName]) acc[g.subjectName] = []
         acc[g.subjectName].push(g)
         return acc
      }, {})

      return Object.keys(groups).map((name) => {
         const subGrades = groups[name]
         const subWeight = subGrades.reduce((acc: number, g: Grade) => acc + g.weight, 0)
         const subSum = subGrades.reduce((acc: number, g: Grade) => acc + g.value * g.weight, 0)
         return {
            subjectName: name,
            grades: subGrades,
            average: subSum / subWeight
         }
      }).sort((a, b) => b.average - a.average)
   }

   if (loading) return <div className="loader">Loading your performance...</div>
   if (error) return <div className="error-message">Error: {error}</div>

   const stats = calculateStats(grades)
   const subjectGroups = groupGrades(grades)

   return (
      <div className="grades-dashboard-section">
         <h1 className="dashboardSectionTitle">Academic Overview</h1>

         <div className="stats-grid">
            <div className="stat-card">
               <span className="stat-label">Weighted Average</span>
               <span className="stat-value gpa">{stats.gpa}</span>
               <span className="stat-subtext">Overall Performance</span>
            </div>
            <div className="stat-card">
               <span className="stat-label">Total Grades</span>
               <span className="stat-value">{stats.totalGrades}</span>
               <span className="stat-subtext">Completed Assessments</span>
            </div>
            <div className="stat-card">
               <span className="stat-label">Best Subject</span>
               <span className="stat-value" style={{ fontSize: '24px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {stats.bestSubject}
               </span>
               <span className="stat-subtext">Highest Subject Average</span>
            </div>
         </div>

         <div className="subjects-container">
            {subjectGroups.length === 0 ? (
               <div className="empty-state">No grades recorded yet. Keep up the study!</div>
            ) : (
               subjectGroups.map((group) => (
                  <div key={group.subjectName} className="subject-group">
                     <div className="subject-header">
                        <h2>{group.subjectName}</h2>
                        <div className="subject-average">
                           <span>Subject Avg:</span>
                           <div className="avg-bubble">{group.average.toFixed(2)}</div>
                        </div>
                     </div>
                     <div className="grades-list">
                        {group.grades.map((grade) => {
                           const isHigh = grade.value >= 5
                           const isLow = grade.value <= 2
                           const gradeClass = isHigh ? 'high-grade' : isLow ? 'low-grade' : 'mid-grade'
                           
                           const catClass = grade.weight >= 5 ? 'exam' : grade.weight >= 3 ? 'quiz' : 'homework'
                           const catName = grade.weight >= 5 ? 'EXAM' : grade.weight >= 3 ? 'QUIZ' : 'TASK'

                           return (
                              <div key={grade.id} className="grade-item">
                                 <div className={`grade-value-box ${gradeClass}`}>
                                    {grade.value}
                                 </div>
                                 <div className="grade-desc">
                                    <div className="desc-text">{grade.description || 'Subject Assessment'}</div>
                                    <div className="date-text">Academic Year 2024/25</div>
                                 </div>
                                 <div className="grade-weight">
                                    Weight: {grade.weight}
                                 </div>
                                 <div className={`grade-category ${catClass}`}>
                                    {catName}
                                 </div>
                              </div>
                           )
                        })}
                     </div>
                  </div>
               ))
            )}
         </div>
      </div>
   )
}
