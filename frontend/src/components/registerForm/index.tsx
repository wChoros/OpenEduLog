import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
//@ts-ignore
import './style.sass'

const RegisterForm = () => {
   const [errorMessage, setErrorMessage] = useState<string | null>(null)
   const [successMessage, setSuccessMessage] = useState<string | null>(null)
   const navigate = useNavigate()

   const handleSubmit = async (event: FormEvent) => {
      event.preventDefault()
      setErrorMessage(null)
      setSuccessMessage(null)

      const form = event.target as HTMLFormElement
      const formData = new FormData(form)

      const password = formData.get('password') as string
      const confirmPassword = formData.get('confirm_password') as string
      const email = formData.get('email') as string
      const confirmEmail = formData.get('confirm_email') as string

      if (password !== confirmPassword) {
         setErrorMessage('Passwords do not match')
         return
      }

      if (email !== confirmEmail) {
         setErrorMessage('Emails do not match')
         return
      }

      const data = {
         first_name: formData.get('first_name'),
         last_name: formData.get('last_name'),
         email: email,
         login: formData.get('login'),
         password: password,
         phone_number: formData.get('phone_number'),
         birth_date: formData.get('birth_date'),
         street: formData.get('street'),
         house: formData.get('house'),
         city: formData.get('city'),
         zip: formData.get('zip'),
         country: formData.get('country'),
      }

      try {
         // @ts-ignore
         const apiUrl = import.meta.env.VITE_API_URL
         const response = await fetch(`${apiUrl}/auth/register`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
         })

         if (response.ok) {
            setSuccessMessage('Registration successful! Redirecting to login...')
            setTimeout(() => {
               navigate('/login')
            }, 2000)
         } else {
            const result = await response.json()
            setErrorMessage(result.message || 'Registration failed')
         }
      } catch (error) {
         console.error('Error:', error)
         setErrorMessage('An error occurred. Please try again later.')
      }
   }

   return (
      <form id={'registerForm'} onSubmit={handleSubmit}>
         <h2>Register</h2>
         <input type="text" name="first_name" placeholder="First Name" required />
         <input type="text" name="last_name" placeholder="Last Name" required />

         <input type="email" name="email" placeholder="Email" required />
         <input type="email" name="confirm_email" placeholder="Confirm Email" required />

         <input type="tel" name="phone_number" placeholder="Phone Number" required />
         <input type="date" name="birth_date" placeholder="Birthday" required />

         <input type="text" name="street" placeholder="Street" required />
         <input type="text" name="house" placeholder="House/Apartment Number" required />
         <input type="text" name="city" placeholder="City" required />
         <input type="text" name="zip" placeholder="Zip Code" required />
         <input type="text" name="country" placeholder="Country" required />

         <input type="text" name="login" placeholder="Username" required />

         <input type="password" name="password" placeholder="Password" required />
         <input type="password" name="confirm_password" placeholder="Confirm Password" required />
         <button type="submit">Register</button>
         {errorMessage && <p className="error-message">{errorMessage}</p>}
         {successMessage && <p className="success-message" style={{ color: 'green', width: '100%', textAlign: 'center' }}>{successMessage}</p>}
      </form>
   )
}

export default RegisterForm
