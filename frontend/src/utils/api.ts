export async function apiFetch(url: string, options: RequestInit = {}) {
   const defaultOptions: RequestInit = {
      ...options,
      credentials: 'include', // Ensure cookies are always sent
   }

   try {
      const response = await fetch(url, defaultOptions)

      if (response.status === 401) {
         // Session expired or unauthorized
         console.warn('Session expired (401). Redirecting to login...')

         // Clear non-httpOnly identifying cookies just in case
         document.cookie = 'role=; Max-Age=0; path=/;'
         document.cookie = 'user_id=; Max-Age=0; path=/;'

         // Redirect to login
         window.location.href = '/login'

         // Return a rejected promise to stop execution in the calling component
         return Promise.reject(new Error('Unauthorized'))
      }

      return response
   } catch (error) {
      console.error('API Fetch error:', error)
      throw error
   }
}
