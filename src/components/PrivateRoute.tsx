 
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

type Props = {
  children: React.ReactNode
  roles?: string[]
}

export default function PrivateRoute({ children, roles }: Props){

  const { user, loading } = useAuth()

  if(loading){
    return null
  }

  // usuário não logado
  if(!user){
    return <Navigate to="/" />
  }

  // valida role se existir
  if(roles && !roles.includes(user.role)){
    return <Navigate to="/dashboard" />
  }

  return <>{children}</>

}