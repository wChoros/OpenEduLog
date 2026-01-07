import { useEffect, useState } from 'react'
import { apiFetch } from '../../utils/api'
// @ts-ignore
import './style.sass'

interface Announcement {
   id: number
   title: string
   content: string
   createdAt: string
   user: {
      firstName: string
      lastName: string
   }
}

interface TimetableItem {
   id: number
   date: string
   lessonNumber: number
   subjectOnTeacher: {
      subject: { name: string }
      teacher: { firstName: string, lastName: string }
   }
   group: { name: string }
}

export default function TeacherOverview() {
   const [announcements, setAnnouncements] = useState<Announcement[]>([])
   const [unreadMessages, setUnreadMessages] = useState(0)
   const [nextLesson, setNextLesson] = useState<TimetableItem | null>(null)
   const [groupCount, setGroupCount] = useState(0)
   const [loading, setLoading] = useState(true)

   useEffect(() => {
      const getCookie = (name: string) => {
         const value = `; ${document.cookie}`;
         const parts = value.split(`; ${name}=`);
         if (parts.length === 2) return parts.pop()?.split(';').shift();
         return null;
      };

      const userId = getCookie('user_id');
      if (!userId) return;

      const fetchData = async () => {
         // @ts-ignore
         const apiUrl = import.meta.env.VITE_API_URL
         const now = new Date();
         const tomorrow = new Date(now);
         tomorrow.setDate(now.getDate() + 1);
         
         try {
            const [annRes, msgRes, tableRes, subRes] = await Promise.all([
               apiFetch(`${apiUrl}/announcements`),
               apiFetch(`${apiUrl}/messages/headers/received/${userId}`),
               apiFetch(`${apiUrl}/timetables/user/${userId}/${now.toISOString()}/${tomorrow.toISOString()}`),
               apiFetch(`${apiUrl}/subjects/teacher/${userId}`)
            ]);

            if (annRes.ok) setAnnouncements((await annRes.json()).slice(0, 3));
            if (msgRes.ok) {
               const mData = await msgRes.json();
               setUnreadMessages(mData.filter((m: any) => !m.isRead).length);
            }
            if (tableRes.ok) {
               const tData: TimetableItem[] = await tableRes.json();
               const sorted = tData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
               const upcoming = sorted.find(item => new Date(item.date) > now);
               setNextLesson(upcoming || null);
            }
            if (subRes.ok) {
               const sData = await subRes.json();
               // Count unique groups from subjects
               const groups = new Set();
               sData.forEach((sub: any) => {
                  sub.SubjectsOnTeachers.forEach((sot: any) => {
                     sot.GroupsOnSubjectsOnTeachers.forEach((gsot: any) => {
                        groups.add(gsot.groupId);
                     });
                  });
               });
               setGroupCount(groups.size);
            }
         } catch (error) {
            console.error('Failed to fetch teacher dashboard data:', error);
         } finally {
            setLoading(false);
         }
      };
      fetchData();
   }, []);

   return (
      <div className="overview-container">
         <header className="overview-header">
            <h1>Teacher's Pulse</h1>
            <p>Welcome back! Here's a summary of your day.</p>
         </header>

         <section className="stats-grid">
            <div className="stat-card">
               <div className="icon-box messages">
                  <img src="/icons/mail.svg" alt="messages" />
               </div>
               <div className="stat-info">
                  <span className="value">{unreadMessages}</span>
                  <span className="label">Unread Messages</span>
               </div>
            </div>
            <div className="stat-card">
               <div className="icon-box attendance">
                  <img src="/icons/timetable.svg" alt="groups" />
               </div>
               <div className="stat-info">
                  <span className="value">{groupCount}</span>
                  <span className="label">Assigned Groups</span>
               </div>
            </div>
            <div className="stat-card">
               <div className="icon-box grades">
                  <img src="/icons/timetable.svg" alt="next lesson" />
               </div>
               <div className="stat-info">
                  <span className="value" style={{ fontSize: '1.2rem' }}>
                     {nextLesson ? `${nextLesson.subjectOnTeacher.subject.name}` : 'None'}
                  </span>
                  <span className="label">Next Lesson</span>
               </div>
            </div>
         </section>

         <div className="dashboard-content-grid">
            <div className="dashboard-section highlight-section">
               <div className="section-title">
                  <h2>Upcoming Class</h2>
                  <a href="/dashboard/teacher/timetable" className="see-all">View Timetable</a>
               </div>
               <div className="glass-card">
                  {loading ? (
                     <p>Loading lesson...</p>
                  ) : nextLesson ? (
                     <div className="next-lesson-details">
                        <h3 className="subject">{nextLesson.subjectOnTeacher.subject.name}</h3>
                        <p className="group">Group: {nextLesson.group.name}</p>
                        <p className="time">Lesson #{nextLesson.lessonNumber} - {new Date(nextLesson.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <a href={`/dashboard/teacher/lesson/${nextLesson.id}`} className="action-btn">Open Lesson</a>
                     </div>
                  ) : (
                     <p>No more lessons scheduled for today.</p>
                  )}
               </div>
            </div>

            <div className="dashboard-section activity-section">
               <div className="section-title">
                  <h2>Announcements</h2>
                  <a href="/dashboard/teacher/announcements" className="see-all">Bulletin Board →</a>
               </div>
               
               <div className="announcements-feed">
                  {loading ? (
                     <p>Fetching updates...</p>
                  ) : announcements.length === 0 ? (
                     <div className="empty-announcements">
                        <p>No new announcements at the moment.</p>
                     </div>
                  ) : (
                     announcements.map((ann) => (
                        <div key={ann.id} className="announcement-card">
                           <div className="card-header">
                              <h3>{ann.title}</h3>
                              <div className="meta-info">
                                 <span className="author">{ann.user.firstName} {ann.user.lastName}</span>
                                 <span className="date">{new Date(ann.createdAt).toLocaleDateString()}</span>
                              </div>
                           </div>
                           <div className="content">{ann.content.slice(0, 100)}...</div>
                        </div>
                     ))
                  )}
               </div>
            </div>
         </div>
      </div>
   )
}
