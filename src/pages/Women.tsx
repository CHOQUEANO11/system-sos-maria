import { Plus } from "lucide-react"

export default function Women(){

  return(

    <div>

      <div style={header}>

        <h2>Mulheres Cadastradas</h2>

        <button style={primaryBtn}>
          <Plus size={18}/>
          Nova Mulher
        </button>

      </div>

      <div style={card}>

        <table style={table}>

          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Município</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            <tr>
              <td align="center">Maria Silva</td>
              <td align="center">000.000.000-00</td>
              <td align="center">Belém</td>
              <td align="center">Ativa</td>
            </tr>

          </tbody>

        </table>

      </div>

    </div>

  )

}

const header={
  display:"flex",
  justifyContent:"space-between",
  alignItems:"center",
  marginBottom:20
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

const primaryBtn={
  display:"flex",
  gap:8,
  alignItems:"center",
  padding:"10px 14px",
  background:"#ec4899",
  color:"#fff",
  border:"none",
  borderRadius:8,
  cursor:"pointer"
}