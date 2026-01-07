import { useParams } from 'react-router-dom'
import DashboardPage from '../../components/dashboardPage/index.js'
import Lesson from '../../components/lesson/index.js'

export default function LessonPage() {
   const { lessonId } = useParams()
   return (
      <DashboardPage>
         <Lesson lessonId={lessonId} />
      </DashboardPage>
   )
}
