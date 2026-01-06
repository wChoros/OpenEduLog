import React, { useState, useEffect } from 'react';
// @ts-ignore
import './style.sass'; // Assuming you have this file for styling

interface Message {
   id: number;
   title: string;
   content: string;
   date: Date;
   senderId: number;
   senderName: string;
   receivers: {
      id: number;
      name: string;
      isRead: boolean;
   }[];
}

// Define a list of placeholder messages, similar to what might be on the list page.
// Each message now conforms to the `Message` interface.
const allPlaceholderMessages: Message[] = [
  {
    id: 1001,
    title: "Welcome to Your Inbox!",
    content: "This is a sample message (ID 1001) to show how messages will appear. We hope you find this platform useful and easy to navigate. Feel free to explore all the features available to you.",
    date: new Date(Date.now() - 86400000 * 2), // Approx. 2 days ago
    senderId: 1,
    senderName: "System Admin",
    receivers: [{ id: 2001, name: "Student User", isRead: false }],
  },
  {
    id: 1002,
    title: "Reminder: Upcoming Event",
    content: "Don't forget about the webinar (ID 1002) scheduled for tomorrow at 2 PM. Ensure you have registered and have the meeting link ready.",
    date: new Date(Date.now() - 3600000 * 5), // Approx. 5 hours ago
    senderId: 2,
    senderName: "Event Coordinator",
    receivers: [{ id: 2001, name: "Student User", isRead: true }],
  },
  {
    id: 1003,
    title: "Project Update: Alpha Phase",
    content: "The alpha phase of Project Phoenix (ID 1003) is now complete. Your feedback is crucial for the next steps. Please submit your review by EOD Friday.",
    date: new Date(), // Today
    senderId: 3,
    senderName: "John Doe",
    receivers: [{ id: 2001, name: "Student User", isRead: false }],
  },
  {
    id: 1004,
    title: "Your Weekly Newsletter",
    content: "Check out the latest articles and updates in this week's newsletter (ID 1004). Highlights include new course offerings and campus events.",
    date: new Date(Date.now() - 86400000 * 1), // Approx. 1 day ago
    senderId: 4,
    senderName: "Newsletter Team",
    receivers: [{ id: 2001, name: "Student User", isRead: true }],
  },
  {
    id: 1005,
    title: "Quick Question about your Account",
    content: "Could you please confirm your recent activity (ID 1005)? We detected a login from a new device. No action needed if this was you.",
    date: new Date(Date.now() - 3600000 * 1), // Approx. 1 hour ago
    senderId: 5,
    senderName: "Support Bot",
    receivers: [{ id: 2001, name: "Student User", isRead: false }],
  },
];

const Index: React.FC = () => {
   // State to hold the currently displayed message
   const [messageData, setMessageData] = useState<Message | undefined>(undefined);
   // State to hold the message ID extracted from the URL
   const [messageIdFromUrl, setMessageIdFromUrl] = useState<string | undefined>(undefined);

   // Effect to get the message ID from the URL path when the component mounts
   useEffect(() => {
      // Example: /dashboard/student/messages/1001 -> "1001"
      const pathParts = window.location.pathname.split('/');
      const idFromPath = pathParts.pop(); // Get the last part of the path
      if (idFromPath && !isNaN(parseInt(idFromPath, 10))) {
        setMessageIdFromUrl(idFromPath);
      } else {
        console.warn("No valid message ID found in URL path.");
        // Potentially set an error state or redirect if no ID is found
      }
   }, []); // Empty dependency array means this runs once on mount

   // Effect to find and set the message data when messageIdFromUrl changes
   useEffect(() => {
      if (messageIdFromUrl) {
         const numericId = parseInt(messageIdFromUrl, 10);
         // Find the message in our placeholder list
         const foundMessage = allPlaceholderMessages.find(msg => msg.id === numericId);
         
         if (foundMessage) {
            setMessageData(foundMessage);
         } else {
            console.warn(`Message with ID ${numericId} not found in placeholders.`);
            setMessageData(undefined); // Message not found
         }
      } else {
        // If there's no messageIdFromUrl (e.g., initial state or invalid URL)
        setMessageData(undefined);
      }
   }, [messageIdFromUrl]); // Re-run when messageIdFromUrl changes

   // Display a loading message or "not found" if data isn't ready or message doesn't exist
   if (!messageData) {
      return (
        <section id="messageDetailsView"> {/* Renamed id for clarity */}
          <h1 className="dashboardSectionTitle">Message Info</h1>
          <div className="messageDetailsContainer">
            <header> {/* Kept header for consistency, even in loading state */}
               <div className={'returnButton'}>

               </div>
            </header>
            <p>Loading message data or message not found...</p>
            {/* You could add a more specific message if messageIdFromUrl exists but no message was found */}
            {messageIdFromUrl && <p>Attempted to load message ID: {messageIdFromUrl}</p>}
          </div>
        </section>
      );
   }

   // Render the message details if messageData is available
   return (
      <section id="messageDetailsView"> {/* Renamed id for clarity */}
         <h1 className="dashboardSectionTitle">Message Info</h1>
         <div className="messageDetailsContainer">
            <header>
               <div className={'returnButton'}>
                  <a href={'/dashboard/student/messages'}>
                  </a>
               </div>
            </header>
            <div className="messageRecord">
               <div className="messageField">
                  <div className="messageFieldName">Subject:</div>
                  <div className="messageFieldContent">{messageData.title}</div>
               </div>
            </div>
            <div className="messageRecord">
               <div className="messageField">
                  <div className="messageFieldName">Date:</div>
                  <div className="messageFieldContent">
                     {new Date(messageData.date).toLocaleDateString()}
                  </div>
               </div>
            </div>
            <div className="messageRecord">
               <div className="messageField">
                  <div className="messageFieldName">From:</div>
                  <div className="messageFieldContent">{messageData.senderName}</div>
               </div>
            </div>
            {messageData.receivers && messageData.receivers.length > 0 && (
                 <div className="messageRecord">
                    <div className="messageField">
                       <div className="messageFieldName">To:</div>
                       <div className="messageFieldContent">
                          {messageData.receivers.map(receiver => receiver.name).join(', ')}
                       </div>
                    </div>
                 </div>
            )}
            <div className="messageRecord">
               <div className="messageField">
                  <div className="messageFieldName">Content:</div>
                  <div className="messageFieldContent messageBody">{messageData.content}</div>
               </div>
            </div>
         </div>
      </section>
   );
};

export default Index;
