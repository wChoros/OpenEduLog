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

export default function AnnouncementsList() {
   const [announcements, setAnnouncements] = useState<Announcement[]>([])
   const [loading, setLoading] = useState(true)

   useEffect(() => {
      const fetchAnnouncements = async () => {
         // @ts-ignore
         const apiUrl = import.meta.env.VITE_API_URL
         try {
            const res = await apiFetch(`${apiUrl}/announcements`)
            if (res.ok) {
               const data = await res.json()
               setAnnouncements(data)
            }
         } catch (error) {
            console.error('Failed to fetch announcements:', error)
         } finally {
            setLoading(false)
         }
      }
      fetchAnnouncements()
   }, [])

   return (
      <div className="announcements-list-section">
         <div className="page-header">
            <h1>School Announcements</h1>
            <p>Official broadcasts and updates from the administration.</p>
         </div>

         <div className="announcements-container">
            {loading ? (
               <div className="loading-skeleton">
                  <div className="skeleton-card" />
                  <div className="skeleton-card" />
                  <div className="skeleton-card" />
               </div>
            ) : announcements.length === 0 ? (
               <div className="empty-state">
                  <p>Nothing to report yet. Check back soon!</p>
               </div>
            ) : (
               announcements.map((ann) => (
                  <div key={ann.id} className="announcement-item">
                     <div className="item-header">
                        <div className="title-area">
                           <h3>{ann.title}</h3>
                        </div>
                        <div className="meta-badge">
                           <span className="author-name">
                              {ann.user.firstName} {ann.user.lastName}
                           </span>
                           <span className="post-date">
                              {new Date(ann.createdAt).toLocaleDateString('en-US', {
                                 month: 'short',
                                 day: 'numeric',
                                 year: 'numeric',
                              })}
                           </span>
                        </div>
                     </div>
                     <div className="item-content">{ann.content}</div>
                  </div>
               ))
            )}
         </div>
      </div>
   )
}
