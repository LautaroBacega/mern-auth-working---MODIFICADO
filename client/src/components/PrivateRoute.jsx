import { useSelector } from '../context/user-context.tsx'
import { Outlet, Navigate } from 'react-router-dom'

export default function PrivateRoute() {
  const { currentUser } = useSelector(state => state.user)
  return currentUser ? <Outlet/> : <Navigate to='/sign-in'/>
}
