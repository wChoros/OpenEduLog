import { useEffect, useState } from 'react';
//@ts-ignore
import './style.sass';

interface MessageRecord {
   messageId: number;
   messageTitle: string;
   messageContent: string;
   date: string;
   isRead: boolean;
   senderId: number;
   senderName: string;
}

function formatDate(dateStr: string): string {
   const date = new Date(dateStr);
   const today = new Date();
   const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
   ];
   if (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
   ) {
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
   } else {
      return `${date.getDate()} ${months[date.getMonth()]}`;
   }
}

const Index = () => {
   const [messageData, setMessageData] = useState<MessageRecord[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      const fetchMessages = async () => {
         try {
            const userId = document.cookie.split('; ').find(row => row.startsWith('user_id='))?.split('=')[1];
            if (!userId) {
               setError('User not authenticated');
               setLoading(false);
               return;
            }

            //@ts-ignore
            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await fetch(`${apiUrl}/messages/headers/received/${userId}`, {
               credentials: 'include'
            });

            if (response.ok) {
               const data = await response.json();
               setMessageData(data);
            } else {
               setError('Failed to fetch messages');
            }
         } catch (err) {
            console.error('Error fetching messages:', err);
            setError('An error occurred while fetching messages');
         } finally {
            setLoading(false);
         }
      };

      fetchMessages();
   }, []);

   return (
      <section id="bigMessageView">
         <div className="headerRow">
            <h1 className="dashboardSectionTitle">Messages</h1>
            <a href="/dashboard/student/messages/compose" className="composeButton">
               <span>+ Compose</span>
            </a>
         </div>
         
         <div className="messageContainer">
            {loading ? (
               <div className="statusMessage">Loading messages...</div>
            ) : error ? (
               <div className="statusMessage error">{error}</div>
            ) : messageData.length > 0 ? (
               messageData.map((data) => (
                  <div key={data.messageId} className={`messageRecord ${data.isRead ? 'read' : 'unread'}`}>
                     <a href={`/dashboard/student/messages/${data.messageId}`}>
                        <div className="messageAuthor">{data.senderName}</div>
                        <div className="messageContentWrapper">
                           <div className="messageTitle">{data.messageTitle}</div>
                           <div className="messageActualContent">{data.messageContent}</div>
                        </div>
                        <div className="messageDate">{formatDate(data.date)}</div>
                     </a>
                  </div>
               ))
            ) : (
               <div className="statusMessage noMessages">Your inbox is empty.</div>
            )}
         </div>
      </section>
   );
};

export default Index;
