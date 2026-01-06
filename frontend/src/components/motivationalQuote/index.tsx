import React, { useState, useEffect } from 'react'
import './style.sass'

interface Quote {
   text: string
   author?: string
}

const learningQuotes: Quote[] = [
   {
      text: 'The beautiful thing about learning is that no one can take it away from you.',
      author: 'B.B. King',
   },
   {
      text: 'Live as if you were to die tomorrow. Learn as if you were to live forever.',
      author: 'Mahatma Gandhi',
   },
   {
      text: 'The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.',
      author: 'Brian Herbert',
   },
   {
      text: 'Tell me and I forget. Teach me and I remember. Involve me and I learn.',
      author: 'Benjamin Franklin',
   },
   {
      text: 'An investment in knowledge pays the best interest.',
      author: 'Benjamin Franklin',
   },
   {
      text: 'The only person who is educated is the one who has learned how to learn and change.',
      author: 'Carl Rogers',
   },
   {
      text: 'Develop a passion for learning. If you do, you will never cease to grow.',
      author: "Anthony J. D'Angelo",
   },
   {
      text: 'Learning is not attained by chance, it must be sought for with ardor and attended to with diligence.',
      author: 'Abigail Adams',
   },
]

const MotivationalQuote: React.FC = () => {
   const [currentQuote, setCurrentQuote] = useState<Quote | null>(null)

   const getRandomQuote = () => {
      const randomIndex = Math.floor(Math.random() * learningQuotes.length)
      setCurrentQuote(learningQuotes[randomIndex])
   }

   // Get an initial quote when the component mounts
   useEffect(() => {
      getRandomQuote()
   }, [])

   return (
      <div id="motivationalQuoteContainer">
         <div className="quote-card">
            <h2>Food for Thought</h2>
            {currentQuote ? (
               <div className="quote-content">
                  <p className="quote-text">"{currentQuote.text}"</p>
                  {currentQuote.author && <p className="quote-author">- {currentQuote.author}</p>}
               </div>
            ) : (
               <p className="loading-quote">Finding some inspiration...</p>
            )}
            <button onClick={getRandomQuote} aria-label="Get another motivational quote">
               Another One!
            </button>
         </div>
      </div>
   )
}

export default MotivationalQuote
