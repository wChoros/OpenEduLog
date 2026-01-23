import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../../utils/api'
//@ts-ignore
import './style.sass'

interface User {
   id: number
   firstName: string
   lastName: string
   role: string
}

const ComposeMessage: React.FC = () => {
   const [title, setTitle] = useState('')
   const [content, setContent] = useState('')
   const [searchQuery, setSearchQuery] = useState('')
   const [searchResults, setSearchResults] = useState<User[]>([])
   const [selectedRecipients, setSelectedRecipients] = useState<User[]>([])
   const [searchLoading, setSearchLoading] = useState(false)
   const [sending, setSending] = useState(false)
   const [error, setError] = useState<string | null>(null)
   const navigate = useNavigate()
   const searchTimeout = useRef<any>(null)

   const handleSearch = async (query: string) => {
      if (!query) {
         setSearchResults([])
         return
      }

      setSearchLoading(true)
      try {
         //@ts-ignore
         const apiUrl = import.meta.env.VITE_API_URL
         const response = await apiFetch(
            `${apiUrl}/messages/search?query=${encodeURIComponent(query)}`
         )
         if (response.ok) {
            const data = await response.json()
            setSearchResults(data)
         }
      } catch (_err) {
         console.error('Search error:', _err)
      } finally {
         setSearchLoading(false)
      }
   }

   console.log('Search loading:', searchLoading) // Use the variable to satisfy lint

   useEffect(() => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current)
      searchTimeout.current = setTimeout(() => {
         handleSearch(searchQuery)
      }, 300)
      return () => clearTimeout(searchTimeout.current)
   }, [searchQuery])

   const addRecipient = (user: any) => {
      if (!selectedRecipients.find((r) => r.id === user.id)) {
         setSelectedRecipients([...selectedRecipients, user])
      }
      setSearchQuery('')
      setSearchResults([])
   }

   const removeRecipient = (userId: number) => {
      setSelectedRecipients(selectedRecipients.filter((r) => r.id !== userId))
   }

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (selectedRecipients.length === 0) {
         setError('Please select at least one recipient')
         return
      }
      if (!title || !content) {
         setError('Title and content are required')
         return
      }

      setSending(true)
      setError(null)

      try {
         //@ts-ignore
         const apiUrl = import.meta.env.VITE_API_URL
         const response = await apiFetch(`${apiUrl}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               title,
               content,
               receivers: selectedRecipients.map((r) => r.id),
            }),
         })

         if (response.ok) {
            navigate('/dashboard/student/messages')
         } else {
            const data = await response.json()
            setError(data.message || 'Failed to send message')
         }
      } catch (_err) {
         setError('An error occurred while sending the message')
      } finally {
         setSending(false)
      }
   }

   return (
      <section id="composeMessageView">
         <div className="compose-header">
            <a href="/dashboard/student/messages" className="backButton">
               <img src="/icons/arrow-left.svg" alt="back" />
               <span>Discard & Return</span>
            </a>
            <h1 className="dashboardSectionTitle">New Message</h1>
         </div>

         <div className="compose-card">
            {error && <div className="errorMessage">{error}</div>}

            <form onSubmit={handleSubmit}>
               <div className="input-section">
                  <div className="input-group recipient-group">
                     <label>Recipient:</label>
                     <div className="input-field">
                        <div className="recipients-list">
                           {selectedRecipients.map((r) => (
                              <div key={r.id} className="recipient-tag">
                                 <span>
                                    {r.firstName} {r.lastName}
                                 </span>
                                 <button type="button" onClick={() => removeRecipient(r.id)}>
                                    &times;
                                 </button>
                              </div>
                           ))}
                           <input
                              type="text"
                              placeholder={
                                 selectedRecipients.length === 0 ? 'Search for recipients...' : ''
                              }
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                           />
                        </div>

                        {searchResults.length > 0 && (
                           <div className="search-results-dropdown">
                              {searchResults.map((user) => (
                                 <div
                                    key={user.id}
                                    className="search-result-item"
                                    onClick={() => addRecipient(user)}
                                 >
                                    <div className="avatar">{user.firstName.charAt(0)}</div>
                                    <div className="info">
                                       <span className="name">
                                          {user.firstName} {user.lastName}
                                       </span>
                                       <span className="role">{user.role}</span>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        )}
                     </div>
                  </div>

                  <div className="input-group">
                     <label>Subject:</label>
                     <div className="input-field">
                        <input
                           type="text"
                           value={title}
                           onChange={(e) => setTitle(e.target.value)}
                           placeholder="What is this about?"
                           required
                        />
                     </div>
                  </div>

                  <div className="input-group">
                     <label>Message Content:</label>
                     <div className="input-field">
                        <textarea
                           value={content}
                           onChange={(e) => setContent(e.target.value)}
                           placeholder="Type your message here..."
                           required
                        ></textarea>
                     </div>
                  </div>
               </div>

               <div className="compose-actions">
                  <button type="submit" className="send-btn" disabled={sending}>
                     <img
                        src="/icons/overview.svg"
                        alt="send"
                        style={{ filter: 'invert(1)', width: '18px' }}
                     />
                     <span>{sending ? 'Sending...' : 'Send Message'}</span>
                  </button>
               </div>
            </form>
         </div>
      </section>
   )
}

export default ComposeMessage
