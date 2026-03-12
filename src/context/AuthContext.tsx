/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  rg: string
  name: string
  cpf: string
  email: string
  role: string
  municipalityId?: string
}

type AuthContextType = {
  user: User | null
  token: string | null
  role: string | null
  login: (token: string, user: User) => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {

  const [user,setUser] = useState<User | null>(null)
  const [token,setToken] = useState<string | null>(null)
  const [loading,setLoading] = useState(true)

  useEffect(()=>{

    const storedUser = localStorage.getItem("user")
    const storedToken = localStorage.getItem("token")

    if(storedUser && storedToken){
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
    }

    setLoading(false)

  },[])

  const login = (token:string,user:User)=>{

    localStorage.setItem("token",token)
    localStorage.setItem("user",JSON.stringify(user))

    setToken(token)
    setUser(user)

  }

  const logout = ()=>{

    localStorage.removeItem("token")
    localStorage.removeItem("user")

    setToken(null)
    setUser(null)

  }

  const role = user?.role ?? null

  return(

    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        login,
        logout,
        loading
      }}
    >

      {children}

    </AuthContext.Provider>

  )

}

export function useAuth(){

  const context = useContext(AuthContext) as AuthContextType

  if(!context){
    throw new Error("useAuth must be used inside AuthProvider")
  }

  return context

}