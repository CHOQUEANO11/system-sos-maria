export default function Reports(){

  return(

    <div>

      <h2>Relatórios</h2>

      <div style={grid}>

        <div style={card}>Relatório de Mulheres</div>

        <div style={card}>Relatório de Emergências</div>

        <div style={card}>Relatório por Município</div>

      </div>

    </div>

  )

}

const grid={
  display:"grid",
  gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
  gap:20,
  marginTop:20
}

const card={
  background:"#fff",
  padding:30,
  borderRadius:12,
  boxShadow:"0 4px 12px rgba(0,0,0,0.05)",
  cursor:"pointer"
}