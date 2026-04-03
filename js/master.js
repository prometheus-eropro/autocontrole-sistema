// ==============================
// 🔥 CRIAR NOVA LOJA
// ==============================
function criarNovaLoja(){

  const dados = {
    nome_loja: v("nova_loja_nome"),
    usuario: v("novo_usuario"),
    senha: v("nova_senha"),

    nome_proprietario: v("novo_nome_proprietario"),
    telefone_loja: v("novo_telefone"),
    cidade_loja: v("nova_cidade"),
    email_loja: v("novo_email"),

    cnpj: v("novo_cnpj"),
    inscricao_estadual: v("novo_ie"),
    estado_loja: v("novo_estado"),
    endereco_loja: v("novo_endereco"),

    plano: v("novo_plano"),
    valor_mensal: num(v("novo_valor_mensal"))
  };

  if(!dados.nome_loja || !dados.usuario || !dados.senha){
    alert("Preencha nome da loja, usuário e senha.");
    return;
  }

  if(dados.senha.length < 6){
    alert("Senha mínima de 6 caracteres.");
    return;
  }

  console.log("CRIANDO LOJA:", dados);

  api("criarClienteNovo", dados, function(r){

    if(!r || !r.ok){
      alert(r?.msg || "Erro ao criar cliente");
      return;
    }

    alert("✅ Loja criada!\nID: " + r.cliente_id);

    limparFormularioNovaLoja();

  });

}


// ==============================
// 🧹 LIMPAR FORMULÁRIO
// ==============================
function limparFormularioNovaLoja(){

  [
    "nova_loja_nome",
    "novo_usuario",
    "nova_senha",
    "novo_nome_proprietario",
    "novo_telefone",
    "nova_cidade",
    "novo_email",
    "novo_cnpj",
    "novo_ie",
    "novo_estado",
    "novo_endereco",
    "novo_valor_mensal"
  ].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.value = "";
  });

}
function listarEmpresas(){

  api("listarEmpresas", {}, function(r){

    if(!r || !r.ok){
      alert("Erro ao carregar empresas");
      return;
    }

    let html = "";

    r.itens.forEach(emp=>{

      html += `
        <div class="card" style="margin-bottom:10px">

          <b>${emp.nome}</b><br>
          ID: ${emp.cliente_id}<br>

          <button onclick="entrarEmpresa('${emp.cliente_id}')">
            Entrar
          </button>

          <button onclick="listarUsuariosEmpresa('${emp.cliente_id}')">
            Ver usuários
          </button>

          <div id="usuarios_${emp.cliente_id}"></div>

        </div>
      `;

    });

    document.getElementById("lista_empresas").innerHTML = html;

  });

}
function listarUsuariosEmpresa(clienteId){

  api("listarUsuariosPorCliente", {
  cliente_id: clienteId,
  perfil: "MASTER"
}, function(r){

    if(!r || !r.ok) return;

    let html = "<ul>";

    r.itens.forEach(u=>{
      html += `
  <li>
    ${u.usuario} - ${u.perfil}

    <button onclick="abrirTrocaSenha('${u.usuario}')">
      🔑 Alterar senha
    </button>

  </li>
`;
    });

    html += "</ul>";

    document.getElementById("usuarios_"+clienteId).innerHTML = html;

  });

}

function listarEmpresas_(){

  const sh = SpreadsheetApp
    .openById("15NqtFk8oTUjmyiaRYvXWLwkaG-cs_KeZHbjwza-CGmQ")
    .getSheetByName("clientes_AutoControle");

  const dados = sh.getDataRange().getValues();

  const itens = [];

  for(let i=1;i<dados.length;i++){

    itens.push({
      cliente_id: dados[i][0],
      nome: dados[i][1],
      status: dados[i][3]
    });

  }

  return { ok:true, itens };

}

function listarUsuariosPorCliente_(e){

  const clienteId = e.parameter.cliente_id;

  const sh = SpreadsheetApp
    .openById("15NqtFk8oTUjmyiaRYvXWLwkaG-cs_KeZHbjwza-CGmQ")
    .getSheetByName("usuarios_AutoControle");

  const dados = sh.getDataRange().getValues();
  const headers = dados[0];

  const idxUsuario = headers.indexOf("usuario");
  const idxPerfil = headers.indexOf("perfil");
  const idxCliente = headers.indexOf("cliente_id");

  const itens = [];

  for(let i=1;i<dados.length;i++){

    if(String(dados[i][idxCliente]) === clienteId){

      itens.push({
        usuario: dados[i][idxUsuario],
        perfil: dados[i][idxPerfil]
      });

    }

  }

  return { ok:true, itens };

}

// ==============================
// 🧾 GERAR CONTRATO
// ==============================
function gerarContratoNovaLoja(){

  const nome = v("nova_loja_nome");
  const prop = v("novo_nome_proprietario");
  const cidade = v("nova_cidade");
  const plano = v("novo_plano");
  const valor = v("novo_valor_mensal");

  const html = `
    <html>
    <head>
      <title>Contrato</title>
      <style>
        body{font-family:Arial;padding:20px;}
        h2{text-align:center;}
      </style>
    </head>
    <body>

    <h2>Contrato de Prestação de Serviço</h2>

    <p><b>Empresa:</b> ${nome}</p>
    <p><b>Responsável:</b> ${prop}</p>
    <p><b>Cidade:</b> ${cidade}</p>

    <p><b>Plano:</b> ${plano}</p>
    <p><b>Valor:</b> R$ ${valor}</p>

    <br><br>

    <p>Declaro estar de acordo com os termos do sistema AutoControle.</p>

    <br><br>

    ____________________________<br>
    Assinatura

    <script>
      window.print();
    </script>

    </body>
    </html>
  `;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();

}

function abrirTrocaSenha(usuario){

  document.getElementById("senha_usuario_alvo").value = usuario;
  document.getElementById("modalSenha").style.display = "block";

}

function fecharModalSenha(){
  document.getElementById("modalSenha").style.display = "none";
}

function confirmarTrocaSenha(){

  const usuario = document.getElementById("senha_usuario_alvo").value;
  const novaSenha = document.getElementById("nova_senha_master").value;

  if(!novaSenha || novaSenha.length < 6){
    alert("Senha mínima de 6 caracteres");
    return;
  }

  api("resetarSenhaMaster", {
    usuario: usuario,
    nova_senha: novaSenha,
    perfil: "MASTER"
  }, function(r){

    if(!r || !r.ok){
      alert("Erro ao alterar senha");
      return;
    }

    alert("Senha alterada com sucesso");
    fecharModalSenha();

  });

}

function entrarEmpresa(clienteId){

  localStorage.setItem("cliente_id", clienteId);
  localStorage.setItem("perfil", "MASTER");

  // 🔥 ADICIONE ISSO
  localStorage.setItem("nome_usuario", "MASTER");
  localStorage.setItem("nome_loja", "Modo Master");

  window.location.href = "app.html";
}

window.addEventListener("online", ()=>{
  console.log("🌐 Internet voltou");
  sincronizarFila();
});