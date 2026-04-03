function numFromString(valor){

  let str = String(valor || "").trim();

  if(str.includes(",") && str.includes(".")){
    str = str.replace(/\./g,"").replace(",",".");
  }
  else if(str.includes(",")){
    str = str.replace(",",".");
  }

  str = str.replace(/[^\d.-]/g,"");

  return Number(str) || 0;
}

/* ==========================
HELPERS UNIVERSAIS
========================== */

function v(id){
  const el = document.getElementById(id);
  if(!el) return "";
  return el.value || "";
}

function num(v){

  if(!v) return 0;

  let str = String(v).trim();

  // remove espaços
  str = str.replace(/\s/g,"");

  // se tiver vírgula e ponto → padrão BR
  if(str.includes(",") && str.includes(".")){
    str = str.replace(/\./g,"").replace(",",".");
  }
  // se só tiver vírgula → decimal BR
  else if(str.includes(",")){
    str = str.replace(",",".");
  }

  // remove lixo
  str = str.replace(/[^\d.-]/g,"");

  return Number(str) || 0;
}

function jsonp(params, callback){

  const cb = "cb_" + Date.now() + "_" + Math.floor(Math.random()*1000);

  const script = document.createElement("script");

  const url = new URL(GAS_URL);

  Object.keys(params).forEach(k=>{
    url.searchParams.append(k, params[k]);
  });

  url.searchParams.append("callback", cb);

  window[cb] = function(data){

    try{
      callback(data);
    }catch(err){
      console.error("Erro callback:",err);
    }

    if(script.parentNode){
      script.parentNode.removeChild(script);
    }

    setTimeout(()=>{ delete window[cb]; },1000);

  };

  script.src = url.toString();

  document.body.appendChild(script);

}

/* ==========================
INIT
========================== */

async function init_vendas(){

  carregarVeiculosVenda();
  carregarVendedoresVenda();

  prepararFormaPagamentoVenda();
  prepararTrocaVenda();

  const campo = document.getElementById("vd_comissao");
  if(campo) mascaraMoeda(campo);

}

/* ==========================
CARREGAR VEÍCULOS
========================== */

function carregarVeiculosVenda(){

return new Promise(resolve=>{

jsonp({

action:"listarVeiculosEstoque",
cliente_id:CLIENTE_ID,
perfil:PERFIL

},function(r){

const select = document.getElementById("id_veiculo");

if(!select){ resolve(); return }

select.innerHTML = '<option value="">Selecione veículo</option>';

if(!r || !r.ok){ resolve(); return }

r.itens.forEach(v => {

const opt = document.createElement("option");

opt.value = v.id;

opt.textContent =
v.placa + " • " +
v.marca + " " +
v.modelo + " • R$ " +
Number(v.valor_venda || 0).toLocaleString("pt-BR");

select.appendChild(opt);

});

resolve();

});

});

}

/* ==========================
VENDEDORES
========================== */

function carregarVendedoresVenda(){

return new Promise(resolve=>{

jsonp({

action:"listarVendedoresLojaAtivos",
cliente_id:CLIENTE_ID,
perfil:PERFIL

},function(r){

const sel = document.getElementById("vd_vendedor_loja");

if(!sel){ resolve(); return }

sel.innerHTML = "<option value=''>Selecione vendedor</option>";

if(r && r.ok){

r.itens.forEach(v=>{

const opt = document.createElement("option");

opt.value = v.id;
opt.textContent = v.nome;

sel.appendChild(opt);

});

}

resolve();

});

});

}

/* ==========================
FORMA PAGAMENTO
========================== */

function prepararFormaPagamentoVenda(){

const forma = document.getElementById("vd_forma_pagamento");

if(!forma) return;

toggleBlocosVenda();

forma.addEventListener("change",toggleBlocosVenda);

}

function toggleBlocosVenda(){

const forma = v("vd_forma_pagamento").toUpperCase();

const blocoFin = document.getElementById("bloco_financiamento");
const blocoParc = document.getElementById("bloco_parcelamento_loja");
const blocoCartao = document.getElementById("bloco_cartao");

if(blocoFin)
blocoFin.style.display = forma==="FINANCIAMENTO" ? "block":"none";

if(blocoParc)
blocoParc.style.display =
forma==="PARCELADO_LOJA" || forma==="FIADO"
? "block":"none";

if(blocoCartao)
blocoCartao.style.display = forma==="CARTAO" ? "block":"none";

}

/* ==========================
PARCELAMENTO PREVIEW
========================== */

function gerarParcelasPreview(){

const qtd = Number(v("parc_qtd"));
const valor = num(v("parc_valor"));
const data = v("parc_primeiro_vencimento");

if(!qtd || !valor || !data){
 alert("Informe quantidade, valor e data");
 return;
}

const tbody = document.getElementById("preview_parcelas");

if(!tbody) return;

tbody.innerHTML = "";

for(let i=1;i<=qtd;i++){

 const venc = new Date(data);
 venc.setMonth(venc.getMonth() + (i-1));

 const dataFormat = venc.toISOString().split("T")[0];

 const tr = document.createElement("tr");

 tr.innerHTML = `
 <td>${i}</td>

 <td>
  <input type="date"
  class="parcela_data"
  value="${dataFormat}">
 </td>

 <td>
  <input
  type="text"
  class="parcela_valor"
  value="${valor.toLocaleString('pt-BR',{minimumFractionDigits:2})}">
 </td>
 `;

 tbody.appendChild(tr);

}

}

function adicionarParcela(){

const tabela = document.getElementById("preview_parcelas");

const numero = tabela.children.length + 1;

const tr = document.createElement("tr");

tr.innerHTML = `
<td>${numero}</td>

<td>
<input type="date" class="parcela_data">
</td>

<td>
<input type="text" class="parcela_valor">
</td>
`;

tabela.appendChild(tr);

}

/* ==========================
REGISTRAR VENDA
========================== */
function registrarVenda(){

console.log("Registrando venda...");

const id_veiculo = v("id_veiculo");
const valor_venda = num(v("vd_valor_venda"));

if(!id_veiculo){
alert("Selecione o veículo.");
return;
}

if(!valor_venda){
alert("Informe valor de venda.");
return;
}

// ===== montar parcelas =====

const linhas = document.querySelectorAll("#preview_parcelas tr");

const parcelas = [];

linhas.forEach((tr,i)=>{

const data = tr.querySelector(".parcela_data")?.value;
const valor = numFromString(tr.querySelector(".parcela_valor")?.value);

if(data && valor){

parcelas.push({

numero:i+1,
vencimento:data,
valor:valor,
forma:v("parc_forma")

});

}

});

const numero_parcelas = parcelas.length;

let valorTotalParcelado = 0;

parcelas.forEach(p=>{
valorTotalParcelado += Number(p.valor || 0);
});

const dados = {

action:"registrarVenda",

cliente_id:CLIENTE_ID,
perfil:PERFIL,
usuario:NOME_USUARIO,

id_veiculo:id_veiculo,
data_venda:v("vd_data_venda"),

valor_venda:valor_venda,

entrada: num(v("vd_entrada")),

forma_pagamento:v("vd_forma_pagamento"),

banco_financiamento: v("fin_banco"),
valor_financiado: num(v("fin_valor")),
valor_parcela_financiamento: num(v("fin_valor_parcela")),
forma_parcelas:v("parc_forma"),   // ← aqui

numero_parcelas:numero_parcelas,
valor_parcela: parcelas.length ? parcelas[0].valor : 0,
parcelas: JSON.stringify(parcelas),
valor_total_parcelado:valorTotalParcelado,

tem_troca:v("vd_tem_troca"),

// VEICULO TROCA
troca_placa:v("troca_placa"),
troca_marca:v("troca_marca"),
troca_modelo:v("troca_modelo"),
troca_tipo_veiculo:v("troca_tipo"),
troca_ano_fabricacao:v("troca_ano_fabricacao"),
troca_ano_modelo:v("troca_ano_modelo"),
troca_cor:v("troca_cor"),
troca_chassi:v("troca_chassi"),
troca_renavam:v("troca_renavam"),
troca_valor: num(v("troca_valor")),
troca_valor_avaliado: num(v("troca_valor")),
troca_valor_venda: numFromString(v("troca_valor_venda")), // 🔥 NOVO
troca_combustivel: v("troca_combustivel"),

// PROPRIETARIO TROCA
troca_nome:v("troca_nome_proprietario"),
troca_cpf:v("troca_cpf_proprietario"),
troca_rg_proprietario:v("troca_rg_proprietario"),
troca_nascimento:v("troca_nascimento"),
troca_email:v("troca_email"),
troca_telefone:v("troca_telefone"),
troca_endereco:v("troca_endereco"),
troca_cidade:v("troca_cidade"),
troca_estado:v("troca_estado"),

comprador_nome:v("vd_cliente_nome"),
comprador_doc:v("vd_cliente_cpf"),
comprador_telefone:v("vd_cliente_telefone"),
comprador_email:v("vd_cliente_email"),
comprador_cidade:v("vd_cliente_cidade"),
comprador_estado:v("vd_cliente_estado"),
comprador_endereco:v("vd_cliente_endereco"),

vendedor_loja_id:v("vd_vendedor_loja"),

valor_comissao_venda: num(v("vd_comissao")),

observacoes:v("vd_observacoes")

};

console.log("DADOS VENDA:",dados);

jsonp(dados, function(r){

  console.log("RETORNO:", r);

  if(!r || !r.ok){
    alert("Erro ao registrar venda\n\n" + (r?.msg || "Erro desconhecido"));
    return;
  }

  // 💰 comissão vira despesa
  const comissao = num(v("vd_comissao"));

  if(comissao > 0){

    jsonp({
      action: "lancarDespesa",
      cliente_id: CLIENTE_ID,
      perfil: PERFIL,
      nome_usuario: NOME_USUARIO,
      criado_em: new Date().toISOString(),

      categoria: "VEICULO",
      tipo_despesa: "COMISSAO_VENDA",
      id_veiculo: id_veiculo,
      data_despesa: v("vd_data_venda"),
      descricao_despesa: "Comissão da venda",
      valor_despesa: comissao,
      forma_pagamento: "INTERNO"

    }, function(resp){
      console.log("Despesa comissão:", resp);
    });

  }

  alert("Venda registrada com sucesso!");

  limparFormularioVenda();
  carregarVeiculosVenda();

});

}

/* ==========================
LIMPAR FORM
========================== */

function limparFormularioVenda(){

const container = document.getElementById("conteudoModulo");

if(!container) return;

const campos = container.querySelectorAll("input,select,textarea");

campos.forEach(c=>{

if(c.tagName === "SELECT"){
c.selectedIndex = 0;
}else{
c.value = "";
}

});

// limpar tabela parcelas
const tabela = document.getElementById("preview_parcelas");

if(tabela){
tabela.innerHTML="";
}

}

/* ==========================
TROCA
========================== */

function prepararTrocaVenda(){

const troca = document.getElementById("vd_tem_troca");
const bloco = document.getElementById("bloco_troca");

if(!troca || !bloco) return;

troca.addEventListener("change",function(){

bloco.style.display =
troca.value==="SIM" ? "block":"none";

});

}

function coletarParcelas(){

const linhas = document.querySelectorAll("#preview_parcelas tr");

const parcelas = [];

linhas.forEach(tr=>{

const data = tr.querySelector(".parcela_data")?.value;
const valor = tr.querySelector(".parcela_valor")?.value;

if(data && valor){

parcelas.push({
data_vencimento:data,
valor:Number(valor)
});

}

});

return parcelas;

}

function mascaraMoeda(el){

el.addEventListener("input", function(){

let v = el.value.replace(/\D/g,"");

v = (Number(v)/100).toLocaleString("pt-BR",{minimumFractionDigits:2});

el.value = v;

});

}

const campo = document.getElementById("vd_comissao");

if(campo) mascaraMoeda(campo);
