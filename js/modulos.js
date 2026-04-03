// ===============================
// DASHBOARD
// ===============================
async function init_dashboard(){

if(typeof carregarDashboard === "function"){
carregarDashboard()
}

}

// ===============================
// VEICULOS
// ===============================
async function init_veiculos(){

  requestAnimationFrame(()=>{
    carregarVendedoresEntrada();
  });

}

// ===============================
// DESPESAS
// ===============================
async function init_despesas(){

if(typeof carregarVeiculosDespesa === "function"){
await carregarVeiculosDespesa()
}

if(typeof carregarListaDespesas === "function"){
await carregarListaDespesas()
}

}

// ===============================
// FINANCEIRO
// ===============================
async function init_financeiro(){

if(typeof carregarResumoFinanceiro === "function"){
carregarResumoFinanceiro()
}

}

function carregarResumoFinanceiro(){

api("resumoFinanceiro",{},function(r){

if(!r || !r.ok) return

setText("totalInvestido", moeda(r.capital_em_estoque || 0))
setText("totalVendas", moeda(r.total_vendido || 0))
setText("lucroLiquido", moeda(r.lucro_final || 0))

})

}

// ===============================
// VENDAS
// ===============================
async function init_vendas(){

if(typeof carregarVeiculosVenda === "function"){
await carregarVeiculosVenda()
}

if(typeof carregarVendedoresVenda === "function"){
await carregarVendedoresVenda()
}

if(typeof prepararFormaPagamentoVenda === "function"){
prepararFormaPagamentoVenda()
}

}

// ===============================
// ESTOQUE
// ===============================
async function init_estoque(){

setTimeout(function(){

if(typeof carregarEstoque === "function"){
carregarEstoque()
}

},100)

}
// ===============================
// PARCELAS
// ===============================
async function init_parcelas(){

if(typeof carregarParcelasPendentes === "function"){
carregarParcelasPendentes()
}

}

// ===============================
// DOCUMENTOS
// ===============================
async function init_documentos(){

if(typeof carregarVeiculosVendidosDocumentos === "function"){
carregarVeiculosVendidosDocumentos()
}

}

// ===============================
// CONFIGURAÇÕES
// ===============================
async function init_configuracoes(){

carregarDadosLoja()

}