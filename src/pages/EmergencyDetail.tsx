import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import type { LatLngExpression } from "leaflet"
import "leaflet/dist/leaflet.css"

export default function EmergencyDetail(){

  const position: LatLngExpression = [-1.4558, -48.4902] // Belém exemplo

  return(

    <div>

      <h2>Detalhes da Emergência</h2>

      <div style={card}>

        <p><strong>Nome:</strong> Maria Silva</p>

        <p><strong>Telefone:</strong> 91 99999-9999</p>

        <p><strong>Município:</strong> Belém</p>

        <p><strong>Status:</strong> Emergência ativa</p>

      </div>

      <div style={card}>

        <h3>Localização da ocorrência</h3>

        <div style={map}>

          <MapContainer
            center={position}
            zoom={15}
            style={{height:"100%", width:"100%"}}
          >

            <TileLayer
              attribution='© OpenStreetMap'
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

const card={
  background:"#fff",
  padding:20,
  borderRadius:12,
  marginTop:20,
  boxShadow:"0 4px 12px rgba(0,0,0,0.05)"
}

const map={
  height:350,
  borderRadius:10,
  overflow:"hidden",
  marginTop:10
}