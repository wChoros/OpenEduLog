// @ts-ignore
import './style.sass'

const navigationHeader = () => {
   return (
      <header id={'navigationHeader'}>
         <div id={'logoContainer'}>
            <img src={'./logos/logo-black-horizontal.png'} alt={'OpenEduLog logo'} />
         </div>
         <nav>
            <div className={'navRecord'}>
               <a href={'/'}>Home</a>
            </div>
            <div className={'navRecord'}>
               <a href={'/about'}>About</a>
            </div>
            <div className={'navRecord'}>
               <a href={'/contact'}>Contact</a>
            </div>
            <div className={'navRecord'}>
               <a href={'login'}>Login</a>
            </div>
            <div className={'navRecord'}>
               <a href={'/register'}>Register</a>
            </div>
         </nav>
      </header>
   )
}

export default navigationHeader
