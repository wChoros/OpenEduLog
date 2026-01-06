import { useState, useEffect } from 'react';
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
            const response = await fetch(`${apiUrl}/messages/content/received/${messageId}`, {
               credentials: 'include'
            });

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
         <div className="headerRow">
            <h1 className="dashboardSectionTitle">Message Info</h1>
            <a href="/dashboard/student/messages" className="backButton">
               <span>&larr; Back to Inbox</span>
            </a>
         </div>

         <div className="messageDetailsContainer">
            <div className="messageHeader">
               <div className="subjectLine">{messageData.title}</div>
               <div className="metaInfo">
                  <div className="senderInfo">
                     <span className="label">From:</span>
                     <span className="value">{messageData.senderName}</span>
                  </div>
                  <div className="dateInfo">
                     {new Date(messageData.date).toLocaleString()}
                  </div>
               </div>
               {messageData.receivers && messageData.receivers.length > 0 && (
                  <div className="receiverInfo">
                     <span className="label">To:</span>
                     <span className="value">
                        {messageData.receivers.map(r => r.name).join(', ')}
                     </span>
                  </div>
               )}
            </div>
            
            <div className="messageBody">
               {messageData.content}
            </div>

         </div>
      </section>
   );
};

export default Index;
