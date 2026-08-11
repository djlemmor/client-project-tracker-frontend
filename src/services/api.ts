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
  baseURL: 'http://client-project-tracker-backend.test/api',

  // Tell Laravel that we are sending JSON.
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

export default api
