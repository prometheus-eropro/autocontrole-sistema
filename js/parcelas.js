// ================================
// PARCELAS
// ================================
carregarVeiculosParcelas();
async function carregarParcelas(status = ""){

  const dadosEnvio = {
    inicio: formatarDataEnvio(v("parc_filtro_inicio")),
    fim: formatarDataEnvio(v("parc_filtro_fim")),
    placa: v("parc_filtro_placa"),
    cpf: v("parc_filtro_cpf"),
    status: status || ""
  };

  console.log("📤 ENVIANDO FILTRO:", dadosEnvio);

  api("listarParcelas", dadosEnvio, function(r){

    console.log("📥 RESPOSTA BACK:", r);

    if(!r || !r.ok){
      setHTML("tb_parcelas","");
      return;
    }

    let html="";

if(!r.itens || r.itens.length===0){
  html=`
  <tr>
    <td colspan="7" style="text-align:center;color:#888;">
      Nenhuma parcela encontrada
    </td>
  </tr>`;
  setHTML("tb_parcelas",html);

document.getElementById("parc_filtro_inicio").value = "";
document.getElementById("parc_filtro_fim").value = "";
document.getElementById("parc_filtro_placa").value = "";
document.getElementById("parc_filtro_cpf").value = "";
  return;
}

let lista = r.itens;

// 🔥 AQUI É O PONTO CERTO
if(status === "PENDENTE"){
  lista = lista.filter(p =>
    p.status === "PENDENTE" || p.status === "HOJE"
  );
}

lista.forEach(p=>{

  html+=`
<tr>
  <td>${p.cpf_cliente || "-"}</td>
  <td>${p.placa || ""}</td>
  <td>${p.parcela || "-"}</td>
  <td>${moeda(p.valor || 0)}</td>
  <td>${formatarData(p.vencimento)}</td>
  <td>
  ${
    p.status === "HOJE"
      ? "PENDENTE"
      : p.status
  }
</td>
  <td>
    ${
      (p.status === "PENDENTE" || p.status === "HOJE" || p.status === "VENCIDA")
      ? `<button onclick="receberParcela('${p.venda_id}','${p.parcela}','${p.valor}')">
          Receber
        </button>`
      : "-"
    }
  </td>
</tr>
`;
});

    setHTML("tb_parcelas",html);

  });

}



// ================================
// RECEBER PARCELA
// ================================

function receberParcela(id, parcela, valor){

  if(!confirm("Confirmar recebimento da parcela?")) return;

  api("receberParcela",{
    venda_id: id,
    parcela: parcela,
    valor: valor
  },function(r){

    if(!r || !r.ok){
      alert("Erro ao receber parcela");
      return;
    }

    alert("Parcela recebida com sucesso");

    carregarParcelas("PENDENTE"); 

  });

}

function gerarCamposParcelas(){

const qtd = Number(document.getElementById("parc_qtd").value);

if(!qtd || qtd <= 0){
 alert("Informe a quantidade de parcelas");
 return;
}

const box = document.getElementById("listaParcelas");
box.innerHTML = "";

for(let i=1;i<=qtd;i++){

 const row = document.createElement("div");

 row.className = "grid";

 row.innerHTML = `

 <span>Parcela ${i}</span>

 <input type="date" id="parc_data_${i}">

 <input
 type="text"
 class="parcela_valor"
 id="parc_valor_${i}"
 placeholder="Valor da parcela">

 `;

 box.appendChild(row);

}

}

function formatarData(data){

  if(!data) return "-";

  // ISO com hora
  if(String(data).includes("T")){
    const d = new Date(data);
    return d.toLocaleDateString("pt-BR");
  }

  // formato yyyy-mm-dd
  if(String(data).includes("-")){
    const p = data.split("-");
    return `${p[2]}/${p[1]}/${p[0]}`;
  }

  return data;

}function carregarVeiculosParcelas(){

  const select = document.getElementById("filtro_placa");

  if(!select) return;

  select.innerHTML = '<option value="">Todas</option>';

  api("listarVeiculosVendidos", {}, function(r){

    if(!r || !r.ok) return;

    r.itens.forEach(v=>{
      select.innerHTML += `
        <option value="${v.placa}">
          ${v.placa} - ${v.modelo}
        </option>
      `;
    });

  });

}

function formatarDataEnvio(data){

  if(!data) return "";

  // já está yyyy-mm-dd (input date)
  if(data.includes("-")) return data;

  // se vier dd/mm/yyyy
  if(data.includes("/")){
    const [dia,mes,ano] = data.split("/");
    return `${ano}-${mes}-${dia}`;
  }

  return data;
}

function relatorioParcelas(){

  window.open("relatorios/relatorio_parcelas.html", "_blank");

}

