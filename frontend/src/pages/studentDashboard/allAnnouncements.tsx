import { useEffect, useState } from 'react'
// @ts-ignore
import './announcements.sass'

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

export default function AllAnnouncementsPage() {
   const [announcements, setAnnouncements] = useState<Announcement[]>([])
   const [loading, setLoading] = useState(true)

   useEffect(() => {
      const fetchAnnouncements = async () => {
         // @ts-ignore
         const apiUrl = import.meta.env.VITE_API_URL
         try {
            const res = await fetch(`${apiUrl}/announcements`, {
               credentials: 'include'
            })
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
      <div className="announcements-page-v2">
         <style>{`
            .announcements-page-v2 {
               flex: 1;
               padding: 60px 40px;
               background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%);
               min-height: 100vh;
               display: flex;
               flex-direction: column;
               align-items: center;
               font-family: 'Inter', sans-serif;
            }

            .page-header {
               width: 100%;
               max-width: 900px;
               margin-bottom: 50px;
               text-align: left;
            }

            .page-header h1 {
               font-size: 42px;
               font-weight: 900;
               color: #111827;
               margin: 0;
               letter-spacing: -1px;
               background: linear-gradient(90deg, #111827 0%, #4B5563 100%);
               -webkit-background-clip: text;
               -webkit-text-fill-color: transparent;
            }

            .page-header p {
               font-size: 18px;
               color: #6B7280;
               margin-top: 12px;
               font-weight: 500;
            }

            .announcements-container {
               width: 100%;
               max-width: 900px;
               display: flex;
               flex-direction: column;
               gap: 30px;
            }

            .announcement-item {
               background: #ffffff;
               border-radius: 24px;
               padding: 40px;
               box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
               border: 1px solid rgba(229, 231, 235, 0.5);
               transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
               position: relative;
               overflow: hidden;
            }

            .announcement-item::before {
               content: '';
               position: absolute;
               top: 0;
               left: 0;
               width: 6px;
               height: 100%;
               background: linear-gradient(to bottom, #FF5722, #FF8A65);
               opacity: 0.8;
            }

            .announcement-item:hover {
               transform: translateY(-4px);
               box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            }

            .item-header {
               display: flex;
               justify-content: space-between;
               align-items: flex-start;
               margin-bottom: 24px;
            }

            .title-area h3 {
               font-size: 26px;
               font-weight: 800;
               color: #1F2937;
               margin: 0;
               line-height: 1.2;
            }

            .meta-badge {
               display: flex;
               flex-direction: column;
               align-items: flex-end;
               gap: 4px;
            }

            .author-name {
               font-size: 14px;
               font-weight: 700;
               color: #374151;
               background: #F3F4F6;
               padding: 4px 12px;
               border-radius: 100px;
            }

            .post-date {
               font-size: 12px;
               font-weight: 600;
               color: #9CA3AF;
               text-transform: uppercase;
               letter-spacing: 0.5px;
            }

            .item-content {
               font-size: 16px;
               line-height: 1.7;
               color: #4B5563;
               white-space: pre-wrap;
            }

            .loading-skeleton {
               width: 100%;
               max-width: 900px;
               display: flex;
               flex-direction: column;
               gap: 20px;
            }

            .skeleton-card {
               height: 200px;
               background: #fff;
               border-radius: 24px;
               animation: pulse 1.5s infinite ease-in-out;
            }

            @keyframes pulse {
               0% { opacity: 0.6; }
               50% { opacity: 1; }
               100% { opacity: 0.6; }
            }

            .empty-state {
               text-align: center;
               padding: 100px 0;
               color: #9CA3AF;
            }

            .empty-state i {
               font-size: 64px;
               margin-bottom: 20px;
               display: block;
            }
         `}</style>

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
                                 year: 'numeric' 
                              })}
                           </span>
                        </div>
                     </div>
                     <div className="item-content">
                        {ann.content}
                     </div>
                  </div>
               ))
            )}
         </div>
      </div>
   )
}
