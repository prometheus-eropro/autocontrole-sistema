const API_URL =
"https://script.google.com/macros/s/AKfycbyDSdfY9ILeSHuqg08mo1ruDA1DzgkN7CKDIswZFwXeoa4d9064m_KrxVI_o1j1_AMn/exec";


function v(id){
  const el = document.getElementById(id);
  return el ? String(el.value || "").trim() : "";
}


function moeda(valor){
  return Number(valor || 0).toLocaleString("pt-BR", {
    style:"currency",
    currency:"BRL"
  });
}

function setHTML(id, html){
  const el = document.getElementById(id);
  if(el) el.innerHTML = html;
}

function setText(id, texto){
  const el = document.getElementById(id);
  if(el) el.textContent = texto;
}

function setValue(id, valor){
  const el = document.getElementById(id);
  if(el) el.value = valor;
}

function showLoading(){
  const el = document.getElementById("loadingOverlay");
  if(el) el.style.display = "flex";
}

function hideLoading(){
  const el = document.getElementById("loadingOverlay");
  if(el) el.style.display = "none";
}

function setStatus(msg){
  const el = document.getElementById("appStatus");
  if(el) el.textContent = msg;
}

function setSelect(idOuEl, lista, placeholder){
  const el = typeof idOuEl === "string" ? document.getElementById(idOuEl) : idOuEl;
  if(!el) return;

  el.innerHTML = "";

  if(placeholder){
    const op = document.createElement("option");
    op.value = "";
    op.textContent = placeholder;
    el.appendChild(op);
  }

  (lista || []).forEach(item=>{
    const op = document.createElement("option");
    op.value = item.value ?? item.id ?? "";
    op.textContent = item.label ?? item.nome ?? "";
    el.appendChild(op);
  });
}
function atualizarStatusInternet(){

const el = document.getElementById("statusInternet")

if(!el) return

if(navigator.onLine){

el.innerHTML="🟢 Online"

}else{

el.innerHTML="🔴 Offline"

}

}

window.addEventListener("online",atualizarStatusInternet)
window.addEventListener("offline",atualizarStatusInternet)

document.addEventListener("DOMContentLoaded",atualizarStatusInternet)

// =============================
// VALIDAR CPF
// =============================
function validarCPF(cpf){

cpf = (cpf || "").replace(/\D/g,'')

if(cpf.length !== 11) return false

if(/^(\d)\1+$/.test(cpf)) return false

let soma = 0
let resto

for(let i=1;i<=9;i++)
soma += parseInt(cpf.substring(i-1,i))*(11-i)

resto = (soma*10)%11

if(resto === 10 || resto === 11) resto = 0
if(resto !== parseInt(cpf.substring(9,10))) return false

soma = 0

for(let i=1;i<=10;i++)
soma += parseInt(cpf.substring(i-1,i))*(12-i)

resto = (soma*10)%11

if(resto === 10 || resto === 11) resto = 0

return resto === parseInt(cpf.substring(10,11))

}


// =============================
// VALIDAR CNPJ
// =============================
function validarCNPJ(cnpj){

cnpj = (cnpj || "").replace(/\D/g,'')

if(cnpj.length !== 14) return false

if(/^(\d)\1+$/.test(cnpj)) return false

let tamanho = cnpj.length - 2
let numeros = cnpj.substring(0,tamanho)
let digitos = cnpj.substring(tamanho)

let soma = 0
let pos = tamanho - 7

for(let i=tamanho;i>=1;i--){
soma += numeros.charAt(tamanho-i)*pos--
if(pos < 2) pos = 9
}

let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11

if(resultado !== parseInt(digitos.charAt(0))) return false

tamanho = tamanho + 1
numeros = cnpj.substring(0,tamanho)

soma = 0
pos = tamanho - 7

for(let i=tamanho;i>=1;i--){
soma += numeros.charAt(tamanho-i)*pos--
if(pos < 2) pos = 9
}

resultado = soma % 11 < 2 ? 0 : 11 - soma % 11

return resultado === parseInt(digitos.charAt(1))

}


// =============================
// VALIDAR CHASSI
// =============================
function validarChassi(chassi){

chassi = (chassi || "").toUpperCase()

if(chassi.length !== 17) return false

if(/[IOQ]/.test(chassi)) return false

return true

}


// =============================
// VALIDAR RENAVAM
// =============================
function validarRenavam(renavam){

renavam = (renavam || "").replace(/\D/g,'')

if(renavam.length !== 11) return false

let soma = 0
let peso = 2

for(let i=10;i>=0;i--){
soma += parseInt(renavam.charAt(i))*peso
peso++
if(peso > 9) peso = 2
}

return soma % 11 === 0

}
// ===============================
// VALIDAR CPF OU CNPJ PADRÃO SISTEMA
// ===============================
function validarDocumentoSistema(doc){

doc = String(doc || "").replace(/\D/g,"")

if(!doc) return {ok:true, valor:""}

if(doc.length === 11){

if(validarCPF(doc)){
return {ok:true, valor:doc}
}

}else if(doc.length === 14){

if(validarCNPJ(doc)){
return {ok:true, valor:doc}
}

}

// documento inválido
const continuar = confirm(
"CPF/CNPJ inválido ou incompleto.\n\n" +
"Deseja continuar mesmo assim?\n\n" +
"O documento será descartado e salvo vazio."
)

if(!continuar){
return {ok:false}
}

return {ok:true, valor:""}

}
function loading(on){

const el = document.getElementById("loadingGlobal")

if(!el) return

el.style.display = on ? "flex" : "none"

}


// ================================
// API PADRÃO SISTEMA
// ================================

window.onerror = function(msg,src,line,col,error){

console.error("ERRO GLOBAL:",msg,src,line,col,error);

alert(
"Erro no sistema:\n\n"+
msg+
"\n\nArquivo: "+src+
"\nLinha: "+line
);

return false;

}

// ================================
// CARREGAR VENDEDORES DA LOJA
// ================================

async function carregarVendedoresLoja(){

api("listarVendedoresLojaAtivos",{},function(r){

if(!r || !r.ok){

console.log("Nenhum vendedor encontrado")
return

}

let html = '<option value="">Selecione vendedor</option>'

r.itens.forEach(v=>{

html += `<option value="${v.id_vendedor_loja}">
${v.nome_vendedor_loja}
</option>`

})

const sel1 = document.getElementById("vendedor_venda")
const sel2 = document.getElementById("vendedor_entrada")

if(sel1) sel1.innerHTML = html
if(sel2) sel2.innerHTML = html

})

}
function salvarEntrada(){

  console.log("SALVAR ENTRADA INICIADO");

  // ==========================
  // VALIDAÇÕES
  // ==========================

  if(!v("v_placa")){
    alert("Informe a placa do veículo");
    return;
  }

  if(!v("v_marca")){
    alert("Informe a marca");
    return;
  }

  if(!v("v_modelo")){
    alert("Informe o modelo");
    return;
  }

  if(!v("v_valor_compra")){
    alert("Informe o valor de compra");
    return;
  }

  if(!v("p_nome") || !v("p_cpf")){
    alert("Informe os dados do proprietário");
    return;
  }

  if(!v("va_nome") || !v("va_doc")){
    alert("Informe o vendedor anterior");
    return;
  }

  const compradorSelecionado = v("comp_vendedor_loja");

  // ==========================
  // ENVIO PARA API
  // ==========================


console.log("COMISSAO RAW:", v("comp_valor_comissao"))
console.log("COMISSAO TRATADA:", num(v("comp_valor_comissao")))
console.log("ELEMENTO INPUT:", document.getElementById("comp_valor_comissao"))
console.log("VALOR DIRETO INPUT:", document.getElementById("comp_valor_comissao")?.value)

      api("cadastrarEntrada", {

  // VEÍCULO
  placa: v("v_placa"),
  marca: v("v_marca"),
  modelo: v("v_modelo"),

  tipo_veiculo:
    v("tipo_veiculo") === "Outro"
      ? (v("tipo_veiculo_outro") || "Outro")
      : v("tipo_veiculo"),

  ano_fabricacao: v("v_ano_fabricacao"),
  ano_modelo: v("v_ano_modelo"),
  cor: v("v_cor"),
  combustivel: v("v_combustivel"),
  chassi: v("v_chassi"),
  renavam: v("v_renavam"),

  valor_compra: v("v_valor_compra"),
  valor_venda: v("v_valor_venda"),
  data_compra: v("data_compra"),

  // PROPRIETÁRIO
  p_nome: v("p_nome"),
  p_doc: v("p_cpf"),
  p_rg: v("p_rg"),
  p_nascimento: v("p_nascimento"),
  p_telefone: v("p_telefone"),
  p_email: v("p_email"),
  p_endereco: v("p_endereco"),
  p_cidade: v("p_cidade"),
  p_estado: v("p_estado"),

  // VENDEDOR ANTERIOR
  va_nome: v("va_nome"),
  va_doc: v("va_doc"),
  va_telefone: v("va_telefone"),
  va_email: v("va_email"),
  va_endereco: v("va_endereco"),
  va_cidade: v("va_cidade"),
  va_estado: v("va_estado"),

  // COMPRADOR / COMISSÃO
  comprador_loja_id: compradorSelecionado,
  tipo_comissao_compra: "FIXO",
  valor_comissao_compra: num(v("comp_valor_comissao"))

}, function(r){

    console.log("RETORNO:", r);

    if(!r || !r.ok){
      alert("Erro ao salvar veículo: " + (r?.msg || ""));
      return;
    }

    alert("Veículo cadastrado com sucesso!");

    limparFormularioEntrada();
    atualizarSistemaAposEntrada();

  });

}

function abrirFichaEntrada(){
  window.open("relatorios/ficha_entrada.html","_blank");
}

function abrirFichaVenda(){
  window.open("relatorios/ficha_venda_branco.html","_blank");
}

function abrirFichaCompleta(){
  window.open("relatorios/ficha_compra_branco.html","_blank");
}

function relatorioDespesas(){
  window.open("relatorios/relatorio_despesas.html","_blank");
}

function relatorioParcelas(){
  window.open("relatorios/relatorio_parcelas.html","_blank");
}

function mostrarCarregando(msg){

  let el = document.getElementById("loadingSistema");

  if(!el){
    el = document.createElement("div");
    el.id = "loadingSistema";
    el.style.position="fixed";
    el.style.top="0";
    el.style.left="0";
    el.style.width="100%";
    el.style.height="100%";
    el.style.background="rgba(0,0,0,0.5)";
    el.style.display="flex";
    el.style.alignItems="center";
    el.style.justifyContent="center";
    el.style.zIndex="9999";
    el.innerHTML=`<div style="background:#fff;padding:20px;border-radius:8px;font-weight:bold">
    ${msg || "Processando..."}
    </div>`;
    document.body.appendChild(el);
  }

  el.style.display="flex";
}

function esconderCarregando(){
  const el = document.getElementById("loadingSistema");
  if(el) el.style.display="none";
}
function abrirFichaVendaPreenchida(){

const select = document.getElementById("doc_veiculo")
if(!select) return

if(!select || !select.value){
alert("Selecione um veículo vendido")
return
}

window.open(
"relatorios/ficha_venda_preenchida.html?id="+select.value,
"_blank"
)

}

function abrirFichaCompraBranco(){

window.open("relatorios/ficha_compra_branco.html","_blank")

}

function abrirFichaVendaBranco(){

window.open("relatorios/ficha_venda_branco.html","_blank")

}
function salvarLocal(chave, valor){
localStorage.setItem(chave, JSON.stringify(valor))
}

function lerLocal(chave){
const v = localStorage.getItem(chave)
return v ? JSON.parse(v) : null
}

function removerLocal(chave){
localStorage.removeItem(chave)
}

function limparFormularioEntrada(){

const campos = [

"v_placa",
"v_marca",
"v_modelo",

// ✅ CORRETO
"tipo_veiculo",
"tipo_veiculo_outro",

"v_ano_fabricacao",
"v_ano_modelo",
"v_cor",
"v_combustivel",
"v_chassi",
"v_renavam",
"v_valor_compra",
"v_valor_venda",

// ✅ DATA COMPRA
"data_compra",

// PROPRIETÁRIO
"p_nome",
"p_cpf",
"p_rg",
"p_nascimento",
"p_telefone",
"p_email",
"p_endereco",
"p_cidade",
"p_estado",

// VENDEDOR ANTERIOR
"va_nome",
"va_doc",
"va_telefone",
"va_email",
"va_endereco",
"va_cidade",
"va_estado",

// ✅ VENDEDOR DA LOJA
"comp_vendedor_loja",

// COMISSÃO
"comp_valor_comissao"

];

campos.forEach(id => {

const el = document.getElementById(id)
if(el) el.value = ""

})

}

function atualizarSistemaAposEntrada(){

// atualizar estoque
if(typeof carregarEstoque === "function"){
carregarEstoque()
}

// atualizar vendas
if(typeof carregarVeiculosVenda === "function"){
carregarVeiculosVenda()
}

// atualizar despesas
if(typeof carregarVeiculosDespesa === "function"){
carregarVeiculosDespesa()
}

// atualizar documentos
if(typeof carregarVeiculosDocumentos === "function"){
carregarVeiculosDocumentos()
}

// atualizar dashboard
if(typeof carregarDashboard === "function"){
carregarDashboard()
}

}

function formatarData(data){

  if(!data) return "";

  try{

    const d = new Date(data);

    if(isNaN(d)) return data;

    const dia = String(d.getDate()).padStart(2,"0");
    const mes = String(d.getMonth()+1).padStart(2,"0");
    const ano = d.getFullYear();

    return `${dia}/${mes}/${ano}`;

  }catch(e){
    return data;
  }

}
function gerarParcelasLoja(){

const qtd = Number(v("parc_qtd"))
const valor = num(v("parc_valor"))
const data = v("parc_data")

if(!qtd || !valor || !data){
alert("Informe parcelas, valor e data.")
return
}

const tabela = document.getElementById("tb_parcelas")
if(!tabela) return

tabela.innerHTML=""

for(let i=1;i<=qtd;i++){

const tr=document.createElement("tr")

tr.innerHTML=`
<td>${i}</td>
<td><input type="date" value="${data}" class="parcela_data"></td>
<td><input type="number" value="${valor}" class="parcela_valor"></td>
<td>PENDENTE</td>
`

tabela.appendChild(tr)

}

}

function brToNum_(v){

if(v === null || v === undefined) return 0;

return Number(
String(v)
.replace(/\./g,"")
.replace(",",".")
);

}
function getParametroURL(nome){

const params = new URLSearchParams(window.location.search)

return params.get(nome)

}

function numBR(v){

  if(!v) return 0;

  return Number(
    String(v)
      .replace(/\./g,"")
      .replace(",",".")
      .replace(/[^\d.-]/g,"")
  );

}

function parseValorBR(v){

  if(!v) return 0;

  v = v.toString().trim();

  v = v.replace(/\./g,""); 
  v = v.replace(",","."); 

  return parseFloat(v) || 0;

}
function num(v){

  if(!v) return 0;

  return Number(
    String(v)
      .replace(/\s/g,"")   // remove espaços invisíveis
      .replace(/\./g,"")
      .replace(",",".")
      .replace(/[^\d.-]/g,"")
  ) || 0;
}

const campoComissao = document.getElementById("comp_valor_comissao");

if(campoComissao){

  campoComissao.addEventListener("blur", function(e){

    let v = e.target.value;

    if(!v) return;

    let numero = num(v);

    if(isNaN(numero)){
  e.target.value = "";
  return;
}

    e.target.value = numero.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  });

}

function addMonths_(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function parseMoeda(v){
  if(!v) return 0;

  return Number(
    String(v)
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^\d.-]/g, "")
  ) || 0;
}

function salvarOffline(action, data){

  let fila = JSON.parse(localStorage.getItem("fila_offline") || "[]");

  fila.push({
    action,
    data,
    dataHora: new Date().toISOString()
  });

  localStorage.setItem("fila_offline", JSON.stringify(fila));
}

function sincronizarFila(){

  let fila = JSON.parse(localStorage.getItem("fila_offline") || "[]");

  if(!fila.length) return;

  fila.forEach(item=>{
    api(item.action, item.data, function(){});
  });

  localStorage.removeItem("fila_offline");

  alert("Dados sincronizados!");
}