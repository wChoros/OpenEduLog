import { useEffect, useState } from 'react'
import { apiFetch } from '../../utils/api'
//@ts-ignore
import './style.sass'

interface MessageRecord {
   messageId: number
   messageTitle: string
   messageContent: string
   date: string
   isRead: boolean
   senderId: number
   senderName: string
}

function formatDate(dateStr: string): string {
   const date = new Date(dateStr)
   const today = new Date()
   const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
   ]
   if (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
   ) {
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
   } else {
      return `${date.getDate()} ${months[date.getMonth()]}`
   }
}

const Index = () => {
   const [messageData, setMessageData] = useState<MessageRecord[]>([])
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState<string | null>(null)

   useEffect(() => {
      const fetchMessages = async () => {
         // @ts-ignore
         const apiUrl = import.meta.env.VITE_API_URL
         const userId = document.cookie
            .split('; ')
            .find((row) => row.startsWith('user_id='))
            ?.split('=')[1]

         if (!userId) {
            setError('User not authenticated')
            setLoading(false)
            return
         }

         try {
            const response = await apiFetch(`${apiUrl}/messages/headers/received/${userId}`)
            if (response.ok) {
               const data = await response.json()
               setMessageData(data)
            } else {
               setError('Failed to fetch messages')
            }
         } catch (err) {
            console.error('Error fetching messages:', err)
            setError('An error occurred while fetching messages')
         } finally {
            setLoading(false)
         }
      }

      fetchMessages()
   }, [])

   return (
      <section id="bigMessageView">
         <div className="messages-header">
            <div className="header-content">
               <h1 className="dashboardSectionTitle">Inbox</h1>
               <p className="section-subtitle">
                  You have {messageData.filter((m) => !m.isRead).length} unread messages.
               </p>
            </div>
            <a href="/dashboard/student/messages/compose" className="composeButton">
               <img
                  src="/icons/overview.svg"
                  alt="compose"
                  style={{ filter: 'invert(1)', width: '18px' }}
               />
               <span>Compose Message</span>
            </a>
         </div>

         <div className="messages-list-wrapper">
            {loading ? (
               <div className="status-container">
                  <div className="loader"></div>
                  <p>Fetching your messages...</p>
               </div>
            ) : error ? (
               <div className="status-container error">
                  <img src="/icons/attendance.svg" alt="error" />
                  <p>{error}</p>
               </div>
            ) : messageData.length > 0 ? (
               <div className="messages-list">
                  {messageData.map((data) => (
                     <a
                        href={`/dashboard/student/messages/${data.messageId}`}
                        key={data.messageId}
                        className={`message-row ${data.isRead ? 'read' : 'unread'}`}
                     >
                        <div className="status-indicator"></div>
                        <div className="sender-avatar">{data.senderName.charAt(0)}</div>
                        <div className="message-main">
                           <div className="message-top">
                              <span className="sender-name">{data.senderName}</span>
                              <span className="message-time">{formatDate(data.date)}</span>
                           </div>
                           <div className="message-subject">{data.messageTitle}</div>
                           <div className="message-snippet">{data.messageContent}</div>
                        </div>
                        <div className="message-actions">
                           <img src="/icons/timetable.svg" alt="view" className="view-icon" />
                        </div>
                     </a>
                  ))}
               </div>
            ) : (
               <div className="status-container empty">
                  <img src="/icons/mail.svg" alt="empty" />
                  <p>Your inbox is pristine. No messages found.</p>
               </div>
            )}
         </div>
      </section>
   )
}

export default Index
