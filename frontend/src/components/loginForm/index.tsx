import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
// @ts-ignore
import './style.sass'

const LoginForm = (props: Readonly<{ message: string }>) => {
   const [errorMessage, setErrorMessage] = useState<string | null>(null)
   const navigate = useNavigate()
   if (props.message) {
      setErrorMessage(props.message)
   }

   const handleSubmit = async (event: FormEvent) => {
      event.preventDefault()
      console.log('Form submitted')

      const form = event.target as HTMLFormElement
      const formData = new FormData(form)
      const data = {
         // it's either login or email in the api, so we use the same value for both depending on the input
         login: formData.get('login'),
         email: formData.get('login'),
         password: formData.get('password'),
      }
      try {
         // @ts-ignore
         const apiUrl = import.meta.env.VITE_API_URL
         const response = await fetch(`${apiUrl}/auth/login`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            credentials: 'include',
         })

         if (response.ok) {
            const result = await response.json()
            console.log('Login successful:', result)
            setErrorMessage(null) // Clear any previous error messages

            const roleCookie = document.cookie.split('; ').find((row) => row.startsWith('role='))
            if (roleCookie) {
               const role = roleCookie.split('=')[1]
               if (role === 'ADMIN') {
                  navigate('/dashboard/admin')
               } else if (role === 'TEACHER') {
                  navigate('/dashboard/teacher')
               } else if (role === 'STUDENT') {
                  navigate('/dashboard/student')
               } else {
                  setErrorMessage('Unknown role: ' + role)
               }
            } else {
               setErrorMessage('Role cookie not found')
            }
         } else if (response.status === 401) {
            setErrorMessage('Unauthorized: Incorrect username or password.')
         } else {
            setErrorMessage('Login failed: ' + response.statusText)
         }
      } catch (error) {
         console.error('Error:', error)
         setErrorMessage('An error occurred. Please try again later.')
      }
   }

   return (
      <form id="loginForm" onSubmit={handleSubmit}>
         <h2>Login</h2>
         <input type="text" name="login" placeholder="Username or Email" required />
         <input type="password" name="password" placeholder="Password" required />
         <button type="submit">Login</button>
         <p className="error-message">{errorMessage}</p>
      </form>
   )
}

export default LoginForm
