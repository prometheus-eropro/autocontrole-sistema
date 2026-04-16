async function abrirModulo(nome){

  const perfil = (localStorage.getItem("perfil") || "")
    .replace(/"/g, "")
    .toUpperCase();

  if(perfil === "ESTOQUE" && nome !== "estoque"){
    console.warn("Bloqueado:", nome);
    return;
  }

  if(perfil === "ESTOQUE"){
    const permitidos = ["dashboard","estoque"];
    if(!permitidos.includes(nome)){
      alert("Acesso restrito.");
      return;
    }
  }

  if(perfil === "VENDEDOR"){
    const permitidos = ["dashboard","estoque","vendas"];
    if(!permitidos.includes(nome)){
      alert("Acesso restrito.");
      return;
    }
  }

  if(perfil === "ADMIN"){
    const permitidos = ["dashboard","veiculos","vendas","parcelas","estoque","despesas","documentos"]; 
    if(!permitidos.includes(nome)){
      alert("Acesso negado para este perfil.");
      return;
    }
  }

  showLoading();

  try {
    setStatus("Carregando módulo: " + nome + "...");

    const resp = await fetch("modulos/" + nome + ".html?v=" + Date.now());

    if(!resp.ok){
      alert("Aba não encontrada: " + nome);
      return;
    }

    const html = await resp.text();
    const alvo = document.getElementById("conteudoModulo");

    if(!alvo) return;

    alvo.innerHTML = html;

    const fn = window["init_" + nome];

    if(typeof fn === "function"){
      await fn();
    }

    setStatus("Módulo carregado: " + nome);

  } catch(e){
    console.error(e);
    alert("Erro ao abrir módulo: " + nome);
  } finally {
    aplicarPermissoesUI();
    hideLoading();
  }
}

document.addEventListener("DOMContentLoaded", function(){

  if(!validarSessaoApp()) return;

  aplicarPermissoesUI();

  const nomeLoja = localStorage.getItem("nome_loja") || "";
  const nomeUsuario = localStorage.getItem("nome_usuario") || "";
  const perfil = localStorage.getItem("perfil") || "";

  setText("usuarioLogado", nomeLoja + " | " + nomeUsuario);
  setText("perfilLogado", "(" + perfil + ")");

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

  console.log("Aplicando UI:", perfil);

  const esconder = (id) => {
    const el = document.getElementById(id);
    if(el){
      el.style.setProperty("display","none","important");
    }
  };

  // MASTER e PROPRIETARIO ve tudo
  if(perfil === "MASTER" || perfil === "PROPRIETARIO"){
    return;
  }

  // ADMIN (sem financeiro)
  if(perfil === "ADMIN"){
    esconder("menu_financeiro");
  }

  // ESTOQUE (só estoque)
  if(perfil === "ESTOQUE"){
    esconder("menu_veiculos");
    esconder("menu_despesas");
    esconder("menu_vendas");
    esconder("menu_parcelas");
    esconder("menu_financeiro");
    esconder("menu_documentos");
  }

  // VENDEDOR (limitado)
  if(perfil === "VENDEDOR"){
    esconder("menu_despesas");
    esconder("menu_financeiro");
    esconder("menu_documentos");
  }

}

function esconderMenu(id){
  const el = document.getElementById(id);
  if(el) el.style.setProperty("display", "none", "important");
}

