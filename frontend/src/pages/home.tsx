import navigationHeader from '../components/navigationHeader/index.js'
import homeFooter from '../components/homeFooter/index.js'
import homeBanner from '../components/homeBanner/index.js'
// @ts-ignore
import '../../public/styles/global-big.sass'

export default function Page() {
   return (
      <>
         {navigationHeader()}
         <section>{homeBanner()}</section>
         {homeFooter()}
      </>
   )
}
