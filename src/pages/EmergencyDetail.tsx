import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import type { LatLngExpression } from "leaflet"
import { api } from "../services/api"
import "leaflet/dist/leaflet.css"

type Emergency = {
  id: string
  latitude: number
  longitude: number
  status: string
  createdAt: string
  user:{
    name:string
    phone:string
    municipality:{
      name:string
    }
  }
}

export default function EmergencyDetail(){

  const { id } = useParams()

  const [emergency,setEmergency] = useState<Emergency | null>(null)
  const [loading,setLoading] = useState(true)

  const loadEmergency = async () => {

    try{

      const token = localStorage.getItem("token")

      const response = await api.get(`/emergencies/${id}`,{
        headers:{
          Authorization:`Bearer ${token}`
        }
      })

      setEmergency(response.data)

    }catch(error){

      console.log("Erro ao carregar emergência",error)

    }finally{
      setLoading(false)
    }

  }

  useEffect(()=>{
    loadEmergency()
  },[])

  if(loading){
    return <p>Carregando emergência...</p>
  }

  if(!emergency){
    return <p>Emergência não encontrada</p>
  }

  const position: LatLngExpression = [
    emergency.latitude,
    emergency.longitude
  ]

  return(

    <div>

      <h2 style={styles.title}>
        Detalhes da Emergência
      </h2>

      <div style={styles.card}>

        <div style={styles.grid}>

          <div>
            <p><strong>Nome:</strong> {emergency.user.name}</p>
            <p><strong>Telefone:</strong> {emergency.user.phone}</p>
          </div>

          <div>
            <p><strong>Município:</strong> {emergency.user.municipality.name}</p>
            <p>
              <strong>Status:</strong>
              <span style={styles.badge}>
                {emergency.status === "PENDING" ? "Pendente" :
                 emergency.status === "IN_PROGRESS" ? "Em Progresso" :
                 emergency.status === "RESOLVED" ? "Resolvida" : emergency.status}
              </span>
            </p>
          </div>

        </div>

      </div>

      <div style={styles.card}>

        <h3 style={{marginTop:0}}>
          Localização da ocorrência
        </h3>

        <div style={styles.map}>

          <MapContainer
            center={position}
            zoom={16}
            style={{height:"100%", width:"100%"}}
          >

            <TileLayer
              attribution="© OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={position}>
              <Popup>
                Pedido de ajuda
              </Popup>
            </Marker>

          </MapContainer>

        </div>

      </div>

    </div>

  )

}

const styles = {

  title:{
    fontSize:22,
    marginBottom:20
  },

  card:{
    background:"#fff",
    padding:25,
    borderRadius:14,
    marginTop:20,
    boxShadow:"0 6px 18px rgba(0,0,0,0.06)"
  },

  grid:{
    display:"grid",
    gridTemplateColumns:"1fr 1fr",
    gap:20
  },

  badge:{
    marginLeft:10,
    padding:"4px 10px",
    borderRadius:6,
    background:"#fee2e2",
    color:"#b91c1c",
    fontSize:12,
    fontWeight:600
  },

  map:{
    height:400,
    borderRadius:12,
    overflow:"hidden",
    marginTop:15
  }

}