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

interface Grade {
   id: number
   value: number
   description: string
   subjectName: string
}

export default function StudentOverview() {
   const [announcements, setAnnouncements] = useState<Announcement[]>([])
   const [grades, setGrades] = useState<Grade[]>([])
   const [unreadMessages, setUnreadMessages] = useState(0)
   const [pendingAttendance, setPendingAttendance] = useState(0)
   const [loading, setLoading] = useState(true)
   const [showModal, setShowModal] = useState(false)
   const [newTitle, setNewTitle] = useState('')
   const [newContent, setNewContent] = useState('')
   const [userRole, setUserRole] = useState<string | null>(null)

   useEffect(() => {
      const getCookie = (name: string) => {
         const value = `; ${document.cookie}`;
         const parts = value.split(`; ${name}=`);
         if (parts.length === 2) return parts.pop()?.split(';').shift();
         return null;
      };

      const userId = getCookie('user_id');
      const role = getCookie('role');
      setUserRole(role || null);

      if (!userId) return;

      const fetchData = async () => {
         // @ts-ignore
         const apiUrl = import.meta.env.VITE_API_URL
         
         try {
            const [annRes, gradesRes, attRes, msgRes] = await Promise.all([
               apiFetch(`${apiUrl}/announcements`),
               apiFetch(`${apiUrl}/grades/${userId}`),
               apiFetch(`${apiUrl}/attendance/student/${userId}`),
               apiFetch(`${apiUrl}/messages/headers/received/${userId}`)
            ]);

            if (annRes.ok) setAnnouncements((await annRes.json()).slice(0, 3));
            if (gradesRes.ok) {
               const gData = await gradesRes.json();
               setGrades(gData.slice(0, 4));
            }
            if (attRes.ok) {
               const aData = await attRes.json();
               const pendingCount = aData.filter((a: any) => 
                  (a.status === 'ABSENT' || a.status === 'LATE') && !a.justification
               ).length;
               setPendingAttendance(pendingCount);
            }
            if (msgRes.ok) {
               const mData = await msgRes.json();
               setUnreadMessages(mData.filter((m: any) => !m.isRead).length);
            }
         } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
         } finally {
            setLoading(false);
         }
      };
      fetchData();
   }, []);

   const handleCreate = async () => {
      if (!newTitle || !newContent) return
      // @ts-ignore
      const apiUrl = import.meta.env.VITE_API_URL
      try {
         const res = await apiFetch(`${apiUrl}/announcements`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newTitle, content: newContent })
         })
         if (res.ok) {
            const data = await res.json()
            setAnnouncements([{ ...data, user: { firstName: 'You', lastName: '' } }, ...announcements])
            setShowModal(false)
            setNewTitle('')
            setNewContent('')
         }
      } catch (error) {
         console.error('Error creating announcement:', error)
      }
   }

   const getGradeClass = (val: number) => {
      if (val >= 4.5) return 'high';
      if (val >= 3) return 'mid';
      return 'low';
   };

   return (
      <div className="overview-container">
         <header className="overview-header">
            <h1>Student Pulse</h1>
            <p>Here's what's happening today in your academic life.</p>
         </header>

         {pendingAttendance > 0 && (
            <div className="attendance-alert-notice">
               <div className="alert-icon-wrapper">
                  <img src="/icons/attendance.svg" alt="attendance alert" />
               </div>
               <div className="alert-content">
                  <h4>Attendance Alert</h4>
                  <p>You have {pendingAttendance} absence(s) that need justification.</p>
               </div>
               <a href="/dashboard/student/attendance" className="action-btn">Justify Now</a>
            </div>
         )}

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
                  <img src="/icons/attendance.svg" alt="attendance" />
               </div>
               <div className="stat-info">
                  <span className="value">{pendingAttendance}</span>
                  <span className="label">Needs Justification</span>
               </div>
            </div>
            <div className="stat-card">
               <div className="icon-box grades">
                  <img src="/icons/grades.svg" alt="grades" />
               </div>
               <div className="stat-info">
                  <span className="value">{grades[0]?.value || '-'}</span>
                  <span className="label">Latest Grade</span>
               </div>
            </div>
         </section>

         <div className="dashboard-content-grid">
            <div className="dashboard-section highlight-section">
               <div className="section-title">
                  <h2>Recent Achievement</h2>
                  <a href="/dashboard/student/grades" className="see-all">View All Grades</a>
               </div>
               <div className="glass-card">
                  <div className="recent-grades-list">
                     {loading ? (
                        <p>Loading your grades...</p>
                     ) : grades.length === 0 ? (
                        <p>No grades yet. Keep working hard!</p>
                     ) : (
                        grades.map(grade => (
                           <div key={grade.id} className="grade-item">
                              <div className="subject-info">
                                 <span className="subject">{grade.subjectName}</span>
                                 <span className="desc">{grade.description}</span>
                              </div>
                              <div className={`grade-pill ${getGradeClass(grade.value)}`}>
                                 {grade.value}
                              </div>
                           </div>
                        ))
                     )}
                  </div>
               </div>
            </div>

            <div className="dashboard-section activity-section">
               <div className="section-title">
                  <h2>Announcements</h2>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                     <a href="/dashboard/student/announcements" className="see-all">Bulletin Board →</a>
                     {(userRole === 'TEACHER' || userRole === 'ADMIN') && (
                        <button className="create-btn" onClick={() => setShowModal(true)}>
                           + Create New
                        </button>
                     )}
                  </div>
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

         {showModal && (
            <div className="modal-overlay">
               <div className="announcement-modal">
                  <h2>Post New Announcement</h2>
                  <input 
                     type="text" 
                     placeholder="Announcement Title" 
                     value={newTitle} 
                     onChange={(e) => setNewTitle(e.target.value)} 
                  />
                  <textarea 
                     placeholder="Details and information..." 
                     value={newContent} 
                     onChange={(e) => setNewContent(e.target.value)} 
                  />
                  <div className="modal-actions">
                     <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                     <button className="submit-btn" onClick={handleCreate}>Post Update</button>
                  </div>
               </div>
            </div>
         )}
      </div>
   )
}
