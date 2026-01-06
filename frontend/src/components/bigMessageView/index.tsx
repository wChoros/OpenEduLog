import { useState } from 'react';
//@ts-ignore
import './style.sass'; // Assuming you have this file for styling

interface MessageRecord {
   messageId: number;
   messageTitle: string;
   messageContent: string;
   date: Date;
   isRead: boolean;
   senderId: number;
   senderName: string;
}

// Helper function to format dates (remains unchanged)
function formatDate(date: Date): string {
   const today = new Date(); // Use current date for comparison
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

// Placeholder data for 5 messages
const placeholderMessages: MessageRecord[] = [
  {
    messageId: 1001,
    messageTitle: "Welcome to Your Inbox!",
    messageContent: "This is a sample message to show how messages will appear.",
    date: new Date(Date.now() - 86400000 * 2), // 2 days ago
    isRead: false,
    senderId: 1,
    senderName: "System Admin",
  },
  {
    messageId: 1002,
    messageTitle: "Reminder: Upcoming Event",
    messageContent: "Don't forget about the webinar scheduled for tomorrow at 2 PM.",
    date: new Date(Date.now() - 3600000 * 5), // 5 hours ago
    isRead: true,
    senderId: 2,
    senderName: "Event Coordinator",
  },
  {
    messageId: 1003,
    messageTitle: "Project Update: Alpha Phase",
    messageContent: "The alpha phase of Project Phoenix is now complete. Feedback is welcome.",
    date: new Date(), // Today
    isRead: false,
    senderId: 3,
    senderName: "John Doe",
  },
  {
    messageId: 1004,
    messageTitle: "Your Weekly Newsletter",
    messageContent: "Check out the latest articles and updates in this week's newsletter.",
    date: new Date(Date.now() - 86400000 * 1), // 1 day ago
    isRead: true,
    senderId: 4,
    senderName: "Newsletter Team",
  },
  {
    messageId: 1005,
    messageTitle: "Quick Question about your Account",
    messageContent: "Could you please confirm your recent activity? No action needed if this was you.",
    date: new Date(Date.now() - 3600000 * 1), // 1 hour ago
    isRead: false,
    senderId: 5,
    senderName: "Support Bot",
  },
];

const Index: React.FC = () => {
   // Initialize state with placeholder messages
   const [messageData, setMessageData] = useState<MessageRecord[]>(placeholderMessages);

   // Data fetching and pagination logic have been removed.
   // useEffect hook is no longer needed for fetching.
   // offset, previousButton, nextButton states are removed.
   // handlePagination function is removed.

   return (
      <>
         <section id="bigMessageView">
            <h1 className="dashboardSectionTitle">Messages</h1>
            <div className="messageContainer">
               {/* Pagination buttons are removed as they are not functional with static data */}
               {/* <div className="navigation">
                  <button className="paginationButton">
                     <img src="/icons/arrow-left.svg" alt="previous page" />
                  </button>
                  <button className="paginationButton">
                     <img src="/icons/arrow-right.svg" alt="next page" />
                  </button>
               </div>
               */}

               {/* Render messages from the placeholder data */}
               {Array.isArray(messageData) && messageData.length > 0 ? (
                  messageData.map((data) => ( // Changed 'i' to 'data.messageId' for a more stable key
                     <div key={data.messageId} className={`messageRecord ${data.isRead ? 'read' : 'unread'}`}>
                        {/* The href should ideally lead to a dynamic route if you plan to implement
                           individual message views later. For now, it's a placeholder.
                        */}
                        <a href={`/dashboard/student/messages/${data.messageId}`}>
                           <div className="messageAuthor">{data.senderName}</div>
                           <div className="messageContentWrapper"> {/* Added a wrapper for clarity if needed */}
                              <div className="messageTitle">{data.messageTitle}</div>
                              {/* The original code had 'messageContent' div nested within another 'messageContent' div.
                                 Corrected to avoid confusion, assuming the inner one is the actual text.
                              */}
                              <div className="messageActualContent">{data.messageContent}</div>
                           </div>
                           <div className="messageDate">{formatDate(new Date(data.date))}</div>
                        </a>
                     </div>
                  ))
               ) : (
                  // This part will not be reached if placeholderMessages is always populated
                  <div className="noMessages">No messages to display</div>
               )}
            </div>
         </section>
      </>
   );
};

export default Index;
