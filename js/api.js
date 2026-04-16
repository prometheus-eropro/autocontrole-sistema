const GAS_URL = "https://script.google.com/macros/s/AKfycbyDSdfY9ILeSHuqg08mo1ruDA1DzgkN7CKDIswZFwXeoa4d9064m_KrxVI_o1j1_AMn/exec";

window.API_URL = GAS_URL;

let CLIENTE_ID = localStorage.getItem("cliente_id") || window.CLIENTE_ID || "";

console.log("CLIENTE_ID:", CLIENTE_ID);

let PERFIL = localStorage.getItem("perfil") || "";
let PLANO = localStorage.getItem("plano") || "BASICO";
let NOME_USUARIO = localStorage.getItem("nome_usuario") || "";
let NOME_LOJA = localStorage.getItem("nome_loja") || "";



function carregarUsuariosSelect(){
  console.log("🔥 chamando carregarUsuariosSelect");
}

function jsonp(params, callback){

  const cb = "cb_" + Date.now();

  window[cb] = function(data){
    callback(data);
    delete window[cb];
    document.body.removeChild(script);
  };

  let url = GAS_URL + "?callback=" + cb;

  for(let k in params){
    if(params[k] !== undefined && params[k] !== null){
      url += "&" + encodeURIComponent(k) + "=" + encodeURIComponent(params[k]);
    }
  }

  const script = document.createElement("script");
  script.src = url;

  document.body.appendChild(script);
}

function api(action, params, callback){


  if(action === "listarLogs" && !clienteFinal){
    console.error("⛔ BLOQUEADO: cliente_id obrigatório para logs");
    return;
  }
  const clienteLS = (localStorage.getItem("cliente_id") || "").trim();

  console.log("API SEND:", action);

  if(params?.cliente_id && typeof params.cliente_id === "object"){
    params.cliente_id = params.cliente_id.id;
  }

if(PERFIL === "MASTER" && !params?.cliente_id){
  console.warn("MASTER sem cliente_id definido");
}


  let clienteFinal = null;

// 1. prioridade
if(params?.cliente_id){
  clienteFinal = params.cliente_id;
}

// 2. fallback
if(!clienteFinal && PERFIL !== "MASTER"){
  clienteFinal = clienteLS;
}

// 👇 AGORA SIM faz sentido validar
if(action === "listarLogs" && !clienteFinal){
  console.error("⛔ BLOQUEADO: cliente_id obrigatório para logs");
  return;
}

// 3. MASTER sem cliente_id só é permitido em ações específicas
if(PERFIL === "MASTER" && !clienteFinal){
  const actionsSemCliente = ["listarEmpresas"];

  if(!actionsSemCliente.includes(action)){
    console.error("MASTER tentou ação sem cliente_id:", action);
  }
}

const perfil = (localStorage.getItem("perfil") || "").toUpperCase();

let nome_usuario = "";

// 🚫 MASTER NÃO USA NOME DE USUÁRIO
if(perfil !== "MASTER"){
  nome_usuario = localStorage.getItem("nome_usuario") || "";
}
console.log("DEBUG cliente_id:", params?.cliente_id);

if(typeof params?.cliente_id === "object"){
  console.warn("⚠️ cliente_id veio errado:", params.cliente_id);
  params.cliente_id = params.cliente_id?.id || "";
}

const payload = Object.assign({}, params || {}, {
  action: action,
  cliente_id: clienteFinal,
  perfil: (localStorage.getItem("perfil") || "").toUpperCase()
});

// 👇 AQUI É O PULO DO GATO
if(perfil !== "MASTER"){
  payload.nome_usuario = nome_usuario;
}

  showLoading();

  console.log("ENVIANDO FINAL:", JSON.stringify(payload));

  // 🔥 AQUI MUDA TUDO
  jsonp(payload, function(resp){

  if(resp.ok){
    console.log("✅ SUCESSO:", resp);
  }else{
    console.error("❌ ERRO:", resp);
  }

  hideLoading();

    if(!resp){
      alert("Erro de comunicação com o servidor.");
      return;
    }

    if(resp.ok === false){
      alert(
  typeof resp.msg === "object"
    ? JSON.stringify(resp.msg, null, 2)
    : resp.msg
);

      callback && callback(resp);
      return;
    }

    if(callback){
      callback(resp);
    }

  });

}

function salvarOffline(dados){
  let fila = JSON.parse(localStorage.getItem("fila_offline") || "[]");
  fila.push(dados);
  localStorage.setItem("fila_offline", JSON.stringify(fila));
}

function totalPendentesOffline(){
  const fila = JSON.parse(localStorage.getItem("fila_offline") || "[]");
  return fila.length;
}

function sincronizarOffline(){
  const fila = JSON.parse(localStorage.getItem("fila_offline") || "[]");

  if(!fila.length) return;

  alert(
    "Conexão restabelecida.\n" +
    "Iniciando sincronização de " + fila.length + " registro(s) salvo(s) offline."
  );

  let restantes = fila.length;
  let sucesso = 0;
  let falha = 0;
  const filaRestante = [];

  fila.forEach(d => {
    const action = d.action;
    const payload = Object.assign({}, d);
    delete payload.action;

    api(action, payload, function(r){
      restantes--;

      if(r && r.ok){
        sucesso++;
      } else {
        falha++;
        filaRestante.push(d);
      }

      if(restantes === 0){
        if(falha === 0){
          localStorage.removeItem("fila_offline");
          alert(
            "Sincronização concluída com sucesso.\n" +
            "Confira os últimos lançamentos para confirmar se todos os dados foram salvos corretamente."
          );
        } else {
          localStorage.setItem("fila_offline", JSON.stringify(filaRestante));
          alert(
            "A conexão voltou, mas parte da sincronização falhou.\n" +
            "Sucesso: " + sucesso + "\n" +
            "Falha: " + falha + "\n" +
            "Confira os últimos lançamentos antes de continuar."
          );
        }
      }
    });
  });
}

window.addEventListener("online", function(){
  if(typeof atualizarStatusInternet === "function"){
    atualizarStatusInternet();
  }
  sincronizarOffline();
});

window.addEventListener("offline", function(){
  if(typeof atualizarStatusInternet === "function"){
    atualizarStatusInternet();
  }

  alert(
    "Sistema em modo offline.\n" +
    "Os próximos lançamentos serão armazenados localmente e enviados quando a internet voltar.\n" +
    "Depois da sincronização, confira os últimos registros."
  );
});

function showLoading(){
  console.log("loading...");
}

function hideLoading(){
  console.log("done.");
}



function trocarCliente(){

  const clienteId = document.getElementById("clienteSelect").value;

  localStorage.setItem("cliente_id", clienteId);

  console.log("🔁 CLIENTE TROCADO:", clienteId);

  location.reload();
}

function apiGet(params){

  const user = JSON.parse(localStorage.getItem("usuario"));

  if(user && user.cliente_id){
    params.cliente_id = user.cliente_id;
  }

  console.log("CLIENTE_ID:", params.cliente_id); // 👈 debug

  const url = API_URL + "?" + new URLSearchParams(params);

  return fetch(url).then(r => r.json());
}

function carregarResumo(){

  api("resumoDashboard", {}, function(res){

    console.log(res);

    window.usuario = res.nome_usuario;
    window.perfil = res.perfil;
    window.cliente = res.cliente_id;

    atualizarHeader();

  });

}

function apiSafe(action, data, callback){

  if(!navigator.onLine){

    salvarOffline(action, data);

    alert("⚠️ Sem internet. Salvando offline.");

    if(callback) callback({ ok:true, offline:true });

    return;
  }

  api(action, data, callback);

}
