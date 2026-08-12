import axios from 'axios'

/*
 * Create a reusable Axios instance.
 *
 * Instead of writing the Laravel API URL
 * every time we make a request, we configure
 * it once here.
 */
const api = axios.create({
  // Laravel API URL.
  baseURL: import.meta.env.VITE_API_URL,

  // Tell Laravel that we are sending JSON.
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

export default api
