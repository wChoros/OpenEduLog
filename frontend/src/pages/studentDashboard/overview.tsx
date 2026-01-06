import AdvancedCalendar from '../../components/advancedCaledar'
import LuckyNumberDisplay from '../../components/luckyNumber'
import MotivationalQuote from '../../components/motivationalQuote'
import SpinningLogo from '../../components/spinningLogo'

export default function Page() {
   return (
      <>
         <style>{`
            .overview-intro {
               display: flex;
               width: 75%;
               flex-direction: column;
               align-items: center;
               justify-content: center;
               margin-top: 20px;
            }
            .components-intro {
               display: flex;
               flex-wrap: wrap;
               justify-content: center;
               gap: 20px;
            }
         `}</style>
         <div className="overview-intro">
            <h1>Students Dashboard Overview</h1>
            <div className='components-intro'>
               <AdvancedCalendar />
               <LuckyNumberDisplay />
               <MotivationalQuote />
               <SpinningLogo />
            </div>
         </div>
      </>
   )
}
