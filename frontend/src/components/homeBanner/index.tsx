import { useEffect, useState } from 'react'
// @ts-ignore
import './style.sass'

const slides: string[] = [
   '../../../slider/slide1.jpg',
   '../../../slider/slide2.jpg',
   '../../../slider/slide3.jpg',
]

const HomeBanner = () => {
   const [currentSlide, setCurrentSlide] = useState(0)

   useEffect(() => {
      const interval = setInterval(() => {
         setCurrentSlide((currentSlide + 1) % slides.length)
      }, 3000)
      return () => clearInterval(interval)
   }, [currentSlide])

   return (
      <div id={'homeBanner'}>
         <img src={slides[currentSlide]} alt={'Slide ' + (currentSlide + 1)} />
      </div>
   )
}

export default HomeBanner
