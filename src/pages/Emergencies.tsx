import { Link } from "react-router-dom"

export default function Emergencies(){

  return(

    <div>

      <h2 style={{marginBottom:20}}>Pedidos de Ajuda</h2>

      <div style={card}>

        <table style={table}>

          <thead>
            <tr>
              <th>Nome</th>
              <th>Município</th>
              <th>Data</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>

            <tr>
              <td align="center">Maria Silva</td>
              <td align="center">Belém</td>
              <td align="center">Hoje</td>
              <td style={{color:"#ef4444"}} align="center">Emergência</td>

              <td align="center">

                <Link to="/emergency/1">
                  Ver detalhes
                </Link>

              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </div>

  )

}

const card={
  background:"#fff",
  padding:20,
  borderRadius:12,
  boxShadow:"0 4px 12px rgba(0,0,0,0.05)"
}

const table={
  width:"100%"
}