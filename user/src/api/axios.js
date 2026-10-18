import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:8000'
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('user_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const handleLogin = async () => {
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)
    const response = await API.post('/auth/user-login', formData)
    localStorage.setItem('user_token', response.data.access_token)
    navigate('/menu')
}

export default API