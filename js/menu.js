async function abrirModulo(nome){

  showLoading();

  try{

    setStatus("Carregando módulo: " + nome + "...");

    const resp = await fetch("modulos/" + nome + ".html?v=" + Date.now());

    if(!resp.ok){
      alert("Aba não encontrada: " + nome);
      hideLoading();
      return;
    }

    const html = await resp.text();

    const alvo = document.getElementById("conteudoModulo");

    if(!alvo){
      hideLoading();
      return;
    }

    alvo.innerHTML = html;

    const fn = window["init_" + nome];

    if(typeof fn === "function"){
      await fn();
    }

    setStatus("Módulo carregado: " + nome);

  }catch(e){

    console.error(e);
    alert("Erro ao abrir módulo: " + nome);
    setStatus("Erro ao carregar módulo.");

  }finally{

    hideLoading();

  }

}


document.addEventListener("DOMContentLoaded", function(){

  if(!validarSessaoApp()) return;

const nomeLoja = localStorage.getItem("nome_loja") || "";
const nomeUsuario = localStorage.getItem("nome_usuario") || "";
const perfil = localStorage.getItem("perfil") || "";

setText("usuarioLogado",
  nomeLoja + " | " + nomeUsuario
);

setText("perfilLogado",
  "(" + perfil + ")"
);

  abrirModulo("dashboard");

});
function abrirAba(nome){

  document.querySelectorAll(".aba").forEach(a=>{
    a.style.display="none"
  })

  document.getElementById("aba"+nome).style.display="block"

  if(nome === "veiculos"){
    init_veiculos()
  }

}

function aplicarPermissoesUI(){

  const perfil = (localStorage.getItem("perfil") || "").toUpperCase();

  console.log("🔒 Aplicando permissões:", perfil);

  function esconder(id){
    const el = document.getElementById(id);
    if(el) el.style.display = "none";
  }

  // ===== ESTOQUE =====
  if(perfil === "ESTOQUE"){

    esconder("menu_veiculos"); // 🔥 FALTAVA ESSE
    esconder("menu_vendas");
    esconder("menu_despesas");
    esconder("menu_financeiro");
    esconder("menu_documentos");
    esconder("menu_parcelas");

    esconder("menu_mobile_veiculos"); // 🔥 FALTAVA ESSE
    esconder("menu_mobile_vendas");
    esconder("menu_mobile_despesas");
    esconder("menu_mobile_financeiro");
    esconder("menu_mobile_parcelas");

  }

  // ===== VENDEDOR =====
if(perfil === "VENDEDOR"){

  esconder("menu_despesas");
  esconder("menu_financeiro");
  esconder("menu_documentos");
  esconder("menu_parcelas");

  esconder("menu_mobile_despesas");
  esconder("menu_mobile_financeiro");
  esconder("menu_mobile_parcelas");

}

  // ===== ADMIN =====
  if(perfil === "ADMIN"){

    esconder("menu_financeiro");
    esconder("menu_mobile_financeiro");

  }

}

function esconderMenu(id){
  const el = document.getElementById(id);
  if(el) el.style.display = "none";
}

function aplicarPermissoesMenu(){

  const perfil = localStorage.getItem("perfil");

  console.log("Aplicando permissões:", perfil);

  if(perfil === "MASTER"){

    // mostra botão master
    document.querySelectorAll("[data-modulo]").forEach(el=>{
      el.style.display = "block";
    });

    abrirModulo("master");
    return;
  }

}