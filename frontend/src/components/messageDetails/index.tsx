import { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
//@ts-ignore
import './style.sass';

interface Message {
   id: number;
   title: string;
   content: string;
   date: string;
   senderId: number;
   senderName: string;
   receivers: {
      id: number;
      name: string;
      isRead: boolean;
   }[];
}

const Index = () => {
   const [messageData, setMessageData] = useState<Message | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      const fetchMessage = async () => {
         const pathParts = window.location.pathname.split('/');
         const messageId = pathParts.pop();

         if (!messageId || isNaN(parseInt(messageId, 10))) {
            setError('Invalid message ID');
            setLoading(false);
            return;
         }

         try {
            //@ts-ignore
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await apiFetch(`${apiUrl}/messages/content/received/${messageId}`);

            if (response.ok) {
               const data = await response.json();
               setMessageData(data);
            } else {
               setError('Failed to load message');
            }
         } catch (err) {
            console.error('Error fetching message:', err);
            setError('An error occurred while loading the message');
         } finally {
            setLoading(false);
         }
      };

      fetchMessage();
   }, []);

   if (loading) {
      return (
         <section id="messageDetailsView">
            <h1 className="dashboardSectionTitle">Message Info</h1>
            <div className="statusMessage">Loading message...</div>
         </section>
      );
   }

   if (error || !messageData) {
      return (
         <section id="messageDetailsView">
            <h1 className="dashboardSectionTitle">Message Info</h1>
            <div className="statusMessage error">{error || 'Message not found'}</div>
            <div className="actions">
               <a href="/dashboard/student/messages" className="backButton">Back to Inbox</a>
            </div>
         </section>
      );
   }

   return (
      <section id="messageDetailsView">
         <div className="details-header">
            <a href="/dashboard/student/messages" className="backButton">
               <img src="/icons/arrow-left.svg" alt="back" />
               <span>Back to Inbox</span>
            </a>
            <h1 className="dashboardSectionTitle">Message Details</h1>
         </div>

         <div className="message-details-card">
            <div className="card-header">
               <div className="sender-avatar">
                  {messageData.senderName.charAt(0)}
               </div>
               <div className="header-text">
                  <h2 className="subjectLine">{messageData.title}</h2>
                  <div className="meta-info">
                     <span className="sender-name">{messageData.senderName}</span>
                     <span className="dot">•</span>
                     <span className="date-info">{new Date(messageData.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>
                  {messageData.receivers && messageData.receivers.length > 0 && (
                     <div className="receiver-line">
                        <span className="label">To: </span>
                        <span className="value">{messageData.receivers.map(r => r.name).join(', ')}</span>
                     </div>
                  )}
               </div>
            </div>
            
            <div className="message-body">
               {messageData.content}
            </div>
            
            <div className="card-footer">
               <button className="reply-button">
                  <img src="/icons/mail.svg" alt="reply" />
                  <span>Reply</span>
               </button>
            </div>
         </div>
      </section>
   );
};

export default Index;
