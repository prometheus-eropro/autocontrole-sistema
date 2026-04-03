function fazerLogin(){

  localStorage.removeItem("cliente_id");
  
  const cliente_id = v("login_cliente");
  const usuario = v("login_usuario");
  const senha = v("login_senha");

  const isMaster = usuario.toLowerCase() === "master";

  if(!usuario || !senha){
    alert("Informe usuário e senha.");
    return;
  }

  if(!cliente_id && !isMaster){
    alert("Informe o cliente_id.");
    return;
  }

  // 🔥 MASTER BYPASS
  if(isMaster){

    localStorage.setItem("perfil", "MASTER");
    localStorage.setItem("cliente_id", "");

    console.log("🔥 LOGIN MASTER OK");

    window.location.href = "master.html";
    return;
  }

  showLoading();

  jsonp({
    action:"loginUsuario",
    usuario: usuario,
    senha: senha,
    cliente_id: cliente_id
  }, function(r){

    if(!r || !r.ok){
      alert("Login inválido.");
      return;
    }

    CLIENTE_ID = r.cliente_id || "";
    localStorage.setItem("cliente_id", CLIENTE_ID);

    PERFIL = String(r.perfil || "").toUpperCase();
    localStorage.setItem("perfil", PERFIL);

    PLANO = String(r.plano || "BASICO").toUpperCase();
    NOME_USUARIO = r.nome_usuario || usuario;
    NOME_LOJA = r.nome_loja || "";

    // salva corretamente
    salvarLocal("perfil", PERFIL);
    salvarLocal("plano", PLANO);
    localStorage.setItem("nome_usuario", NOME_USUARIO);
    salvarLocal("nome_loja", NOME_LOJA);

    if(PERFIL === "MASTER"){
      window.location.href = "master.html";
    }else{
      window.location.href = "app.html";
    }

  });

}
function logout(){
  localStorage.clear();
  CLIENTE_ID = "";
  PERFIL = "";
  PLANO = "BASICO";
  NOME_USUARIO = "";
  NOME_LOJA = "";
  window.location.href = "index.html";
}

function limpar(v){
  return v ? v.replace(/"/g, "") : "";
}

function validarSessaoApp(){

  const clienteId = localStorage.getItem("cliente_id");
  const perfil = localStorage.getItem("perfil");

  if(!perfil){
    window.location.href = "index.html";
    return false;
  }

  // 🔥 MASTER pode entrar mesmo sem cliente_id
  if(perfil !== "MASTER" && !clienteId){
    window.location.href = "index.html";
    return false;
  }

  return true;
}

function carregarSessao(){

  const usuario = localStorage.getItem("nome_usuario");
  const perfil = localStorage.getItem("perfil");
  const loja = localStorage.getItem("nome_loja");

  if(!usuario){
    location.href="index.html";
    return;
  }

  const elUser = document.getElementById("usuarioLogado");
  const elPerfil = document.getElementById("perfilLogado");
  const elLoja = document.getElementById("lojaLogada");

  if(elUser) elUser.innerText = usuario;
  if(elPerfil) elPerfil.innerText = perfil;
  if(elLoja) elLoja.innerText = loja;

}

function logoutSistema(){

if(!confirm("Deseja sair do sistema?")) return

localStorage.removeItem("TOKEN")
localStorage.removeItem("CLIENTE_ID")
localStorage.removeItem("PERFIL")

window.location.href="index.html"
salvarLocal("CLIENTE_ID",CLIENTE_ID)
}
