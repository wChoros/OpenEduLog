import React, { useState, useEffect } from 'react'
import './style.sass' // We'll create this SASS file next

// Define the props interface (optional, if you foresee any props)
interface LuckyNumberDisplayProps {
   maxNumber?: number // Optional prop to set the maximum possible lucky number
}

const LuckyNumberDisplay: React.FC<LuckyNumberDisplayProps> = ({ maxNumber = 30 }) => {
   const [luckyNumber, setLuckyNumber] = useState<number | null>(null)

   // Function to generate a new lucky number
   const generateLuckyNumber = () => {
      const newLuckyNumber = Math.floor(Math.random() * maxNumber) + 1
      setLuckyNumber(newLuckyNumber)
   }

   // Generate a lucky number when the component mounts
   useEffect(() => {
      generateLuckyNumber()
   }, [maxNumber]) // Rerun if maxNumber changes

   return (
      <div id="luckyNumberDisplayContainer">
         <div className="lucky-number-card">
            <h2>Your Lucky Number!</h2>
            {luckyNumber !== null ? (
               <p className="lucky-number">{luckyNumber}</p>
            ) : (
               <p className="loading-number">Generating...</p>
            )}
         </div>
      </div>
   )
}

export default LuckyNumberDisplay
