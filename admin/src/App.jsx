import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Orders from './pages/Orders'
import Products from './pages/Products'
import PreviousOrders from './pages/PreviousOrders'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/orders" element={
          <ProtectedRoute><Orders /></ProtectedRoute>
        } />
        <Route path="/products" element={
          <ProtectedRoute><Products /></ProtectedRoute>
        } />
        <Route path="/previous-orders" element={
          <ProtectedRoute><PreviousOrders /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App