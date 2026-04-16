function carregarDashboard(){

api("resumoDashboard",{

cliente_id: CLIENTE_ID,
perfil: PERFIL

},function(r){

if(!r || !r.ok){
console.error("Erro dashboard", r);
return;
}

setText("cardEstoqueQtd", r.estoque || 0);
setText("dash_vendidos_mes",r.vendidos_mes || 0);
setText("dash_parcelas",r.parcelas_abertas || 0);
setText("dash_vencidas",r.parcelas_vencidas || 0);
setText("dash_hoje",r.parcelas_hoje || 0);

if(PERFIL === "ADMIN" || PERFIL === "PROPRIETARIO"){
mostrarAlertas(r);
}

});

}

function carregarDashboardAlertas(){
  api("resumoFinanceiro", {}, function(r){
    if(!r || !r.ok) return;

    setText("dash_vencidas", r.parcelas_atrasadas || 0);
    setText("dash_hoje", r.parcelas_vencem_hoje || 0);
  });
}

function mostrarAlertas(r){

let html = "";

if(r.parcelas_vencidas > 0){

html += `
<div class="alerta alerta-vermelho">
⚠ ${r.parcelas_vencidas} parcelas vencidas
</div>
`;

}

if(r.parcelas_hoje > 0){

html += `
<div class="alerta alerta-amarelo">
📅 ${r.parcelas_hoje} parcelas vencem hoje
</div>
`;

}

if(html){

setHTML("dashboardAlertas",html);

}

}
function carregarCardEstoque(){

api("listarVeiculosEstoque",{

cliente_id: CLIENTE_ID,
perfil: PERFIL

},function(r){

if(!r || !r.ok) return

const lista = r.itens || []

setText("parcelasHoje", lista.length)

})

}

async function init_dashboard(){

  const clienteId = localStorage.getItem("cliente_id");
  const perfil = (localStorage.getItem("perfil") || "").trim();

  const logado = (
    (clienteId && clienteId !== "null" && clienteId !== "undefined") ||
    perfil === "MASTER"
  );

  if(logado){
    carregarDashboard();
    carregarResumo();
    carregarEstoque();
    carregarCardEstoque();
    carregarDadosLoja();

  }else{
    console.warn("Usuário não logado");
    window.location.href = "index.html"; // volta pro login
  }
}

document.addEventListener("DOMContentLoaded", init_dashboard);

function carregarResumo(){
  console.log("carregarResumo chamado");
}

function carregarDadosLoja(){

  api("dadosLoja", {
    cliente_id: CLIENTE_ID,
    perfil: PERFIL
  }, function(r){

    if(!r || !r.ok) return;

    document.querySelector(".empresa-nome").innerText =
      r.nome_loja || "SEM NOME";

  });

}

