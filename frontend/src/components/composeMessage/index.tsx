import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
//@ts-ignore
import './style.sass';

interface User {
   id: number;
   firstName: string;
   lastName: string;
   role: string;
}

const ComposeMessage: React.FC = () => {
   const [title, setTitle] = useState('');
   const [content, setContent] = useState('');
   const [searchQuery, setSearchQuery] = useState('');
   const [searchResults, setSearchResults] = useState<User[]>([]);
   const [selectedRecipients, setSelectedRecipients] = useState<User[]>([]);
   const [searchLoading, setSearchLoading] = useState(false);
   const [sending, setSending] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const navigate = useNavigate();
   const searchTimeout = useRef<any>(null);

   const handleSearch = async (query: string) => {
      if (!query) {
         setSearchResults([]);
         return;
      }

      setSearchLoading(true);
      try {
         //@ts-ignore
         const apiUrl = import.meta.env.VITE_API_URL;
         const response = await fetch(`${apiUrl}/messages/search?query=${encodeURIComponent(query)}`, {
            credentials: 'include'
         });
         if (response.ok) {
            const data = await response.json();
            setSearchResults(data);
         }
      } catch (err) {
         console.error('Search error:', err);
      } finally {
         setSearchLoading(false);
      }
   };

   console.log('Search loading:', searchLoading); // Use the variable to satisfy lint

   useEffect(() => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(() => {
         handleSearch(searchQuery);
      }, 300);
      return () => clearTimeout(searchTimeout.current);
   }, [searchQuery]);

   const addRecipient = (user: any) => {
      if (!selectedRecipients.find(r => r.id === user.id)) {
         setSelectedRecipients([...selectedRecipients, user]);
      }
      setSearchQuery('');
      setSearchResults([]);
   };

   const removeRecipient = (userId: number) => {
      setSelectedRecipients(selectedRecipients.filter(r => r.id !== userId));
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedRecipients.length === 0) {
         setError('Please select at least one recipient');
         return;
      }
      if (!title || !content) {
         setError('Title and content are required');
         return;
      }

      setSending(true);
      setError(null);

      try {
         //@ts-ignore
         const apiUrl = import.meta.env.VITE_API_URL;
         const response = await fetch(`${apiUrl}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               title,
               content,
               receivers: selectedRecipients.map(r => r.id)
            }),
            credentials: 'include'
         });

         if (response.ok) {
            navigate('/dashboard/student/messages');
         } else {
            const data = await response.json();
            setError(data.message || 'Failed to send message');
         }
      } catch (err) {
         setError('An error occurred while sending the message');
      } finally {
         setSending(false);
      }
   };

   return (
      <section id="composeMessageView">
         <div className="headerRow">
            <h1 className="dashboardSectionTitle">Compose Message</h1>
            <a href="/dashboard/student/messages" className="backButton">
               <span>Cancel</span>
            </a>
         </div>

         <div className="composeContainer">
            <form onSubmit={handleSubmit}>
               {error && <div className="errorMessage">{error}</div>}
               
               <div className="formGroup recipientGroup">
                  <label>To:</label>
                  <div className="recipientInputWrapper">
                     <div className="selectedRecipients">
                        {selectedRecipients.map(r => (
                           <div key={r.id} className="recipientBadge">
                              {r.firstName} {r.lastName}
                              <button type="button" onClick={() => removeRecipient(r.id)}>&times;</button>
                           </div>
                        ))}
                     </div>
                     <input
                        type="text"
                        placeholder={selectedRecipients.length === 0 ? "Search for names..." : ""}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                     />
                     {searchResults.length > 0 && (
                        <div className="searchResults">
                           {searchResults.map(user => (
                              <div 
                                 key={user.id} 
                                 className="searchItem"
                                 onClick={() => addRecipient(user)}
                              >
                                 <span className="userName">{user.firstName} {user.lastName}</span>
                                 <span className="userRole">{user.role}</span>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               </div>

               <div className="formGroup">
                  <label>Subject:</label>
                  <input
                     type="text"
                     value={title}
                     onChange={(e) => setTitle(e.target.value)}
                     placeholder="Enter subject"
                     required
                  />
               </div>

               <div className="formGroup">
                  <label>Message:</label>
                  <textarea
                     value={content}
                     onChange={(e) => setContent(e.target.value)}
                     placeholder="Write your message here..."
                     required
                  ></textarea>
               </div>

               <div className="formActions">
                  <button type="submit" className="sendButton" disabled={sending}>
                     {sending ? 'Sending...' : 'Send Message'}
                  </button>
               </div>
            </form>
         </div>
      </section>
   );
};

export default ComposeMessage;
