import loginForm from '../components/loginForm/index.js'
import navigationHeader from '../components/navigationHeader/index.js'
import homeFooter from '../components/homeFooter/index.js'

// @ts-ignore
import '../../public/styles/global-big.sass'
export default function Page(props: Readonly<{ message: string }>) {
   return (
      <>
         {navigationHeader()}
         <section>{loginForm(props)}</section>
         {homeFooter()}
      </>
   )
}
