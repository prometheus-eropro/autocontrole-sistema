async function abrirModulo(nome){

  const perfil = (localStorage.getItem("perfil") || "")
    .replace(/"/g, "")
    .toUpperCase();

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

  showLoading(); // 🔥 TEM QUE FICAR AQUI DENTRO

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
    aplicarPermissoesUI(); // 🔥 AQUI
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

  const perfil = (localStorage.getItem("perfil") || "")
    .replace(/"/g, "")
    .toUpperCase();

  console.log("🔐 Perfil atual:", perfil);

  // 🔴 ESTOQUE
  if(perfil === "ESTOQUE"){
    [
      "menu_veiculos",
      "menu_despesas",
      "menu_vendas",
      "menu_parcelas",
      "menu_financeiro",
      "menu_documentos"
    ].forEach(id => {
      document.getElementById(id)?.style.setProperty("display","none","important");
    });
  }

  // 🔵 ADMIN
  if(perfil === "ADMIN"){
    [
      "menu_financeiro"
    ].forEach(id => {
      document.getElementById(id)?.style.setProperty("display","none","important");
    });
  }

}

function esconderMenu(id){
  const el = document.getElementById(id);
  if(el) el.style.setProperty("display", "none", "important");
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
