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
    gerarContratoAuto(dados); // 👈 AQUI

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

  api("listarEmpresas", {}, function(resp){

    console.log("ITEM 0:", resp.itens[0]);

    if(!resp || !resp.itens){
      console.warn("sem dados");
      return;
    }

    let html = "";

    const lista = Array.isArray(resp.itens) ? resp.itens : [];

    lista.forEach(emp=>{

      html += `
        <div class="card" style="margin-bottom:10px">

          <b>${emp.nome_loja || "SEM NOME"}</b>
          ID: ${emp.cliente_id}<br>

          <button onclick="entrarEmpresa('${emp.cliente_id}')">
            Entrar
          </button>

          <button onclick="listarUsuariosEmpresa('${emp.cliente_id}')">
            Ver usuários
          </button>

          <button onclick="gerarContratoCliente('${emp.cliente_id}')">
            📄 Contrato
          </button>

          <button onclick="toggleCliente('${emp.cliente_id}', '${emp.status}')">
            ${emp.status === "ATIVO" ? "🚫 Desativar" : "✅ Ativar"}
          </button>

          <button onclick="criarUsuario('${emp.cliente_id}')">
            ➕ Usuário
          </button>

          <button onclick="verLogs('${emp.cliente_id}')">
            📜 Logs
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
  cliente_id: clienteId
}, function(r){

    if(!r || !r.ok) return;

    let html = "<ul>";

    const lista = Array.isArray(r.itens) ? r.itens : [];

lista.forEach(u=>{
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
localStorage.setItem("modo_master", "1"); // 🔥 ESSENCIAL

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

function gerarContratoCliente(clienteId){

  api("obterCliente", {
    cliente_id: clienteId
  }, function(r){

    if(!r || !r.ok){
      alert("Erro ao buscar cliente");
      return;
    }

    gerarContratoAuto(r.dados);

  });

}

function toggleCliente(clienteId, statusAtual){

  const novoStatus = statusAtual === "ATIVO" ? "INATIVO" : "ATIVO";

  api("toggleCliente", {
    cliente_id: clienteId,
    status: novoStatus
  }, function(r){

    if(!r || !r.ok){
      alert("Erro ao atualizar status");
      return;
    }

    listarEmpresas();

  });

}

function criarUsuario(clienteId){

  const usuario = prompt("Nome do usuário:");
  const senha = prompt("Senha:");

  if(!usuario || !senha) return;

  api("criarUsuarioMaster", {
    cliente_id: clienteId,
    usuario,
    senha
  }, function(r){

    if(!r || !r.ok){
      alert("Erro ao criar usuário");
      return;
    }

    alert("Usuário criado");

  });

}

function verLogs(clienteId){

  api("listarLogs", {
    cliente_id: clienteId
  }, function(r){

    if(!r || !r.ok){
      alert("Erro ao carregar logs");
      return;
    }

    let html = "<h3>Logs</h3><ul>";

    r.itens.forEach(l=>{
      html += `<li>${l.data} - ${l.acao} - ${l.usuario}</li>`;
    });

    html += "</ul>";

    const w = window.open("", "_blank");
    w.document.write(html);

  });

}

function gerarContratoAuto(d){

  const html = `
  <html>
  <head>
    <style>
      body{font-family:Arial;padding:40px;line-height:1.6;}
      h2{text-align:center;}
    </style>
  </head>
  <body>

  <h2>CONTRATO DE LICENÇA DE USO DE SOFTWARE</h2>

  <p><b>CONTRATADA:</b><br>
  PROMETHEUS EROPRO SOLUÇÕES INTELIGENTE LTDA<br>
  CNPJ: 58.584.332/0001-40<br>
  Guaçuí – ES</p>

  <p><b>CONTRATANTE:</b><br>
  ${d.nome_loja}<br>
  ${d.nome_proprietario}<br>
  CNPJ/CPF: ${d.cnpj}<br>
  Endereço: ${d.endereco_loja}<br>
  Telefone: ${d.telefone_loja}</p>

  <p><b>VALOR:</b> R$ ${d.valor_mensal} / mês</p>

  <br><br>

  <p>Declaro estar de acordo com os termos.</p>

  <br><br><br>

  ____________________________<br>
  CONTRATANTE

  <br><br>

  ____________________________<br>
  CONTRATADA

  <script>window.print()</script>

  </body>
  </html>
  `; // 🔥 FECHA A STRING AQUI

  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();

}

function carregarResumoMaster(){

  api("resumoFinanceiroMaster", {}, function(r){

    if(!r || !r.ok) return;

    document.getElementById("total_faturamento")
      .innerText = "R$ " + r.total;

    document.getElementById("total_clientes")
      .innerText = r.ativos;

  });

}

function sairMaster(){

  localStorage.removeItem("cliente_id"); // 👈 ESSENCIAL

  localStorage.setItem("perfil", "MASTER");
  localStorage.setItem("nome_usuario", "MASTER");

  window.location.href = "master.html";
}

function logout(){

  localStorage.clear(); // 👈 para de brincar

  console.log("🚪 Logout REAL feito");

  window.location.href = "index.html"; // 👈 manda pra login
}

function salvarTeste(){

  const url = "https://script.google.com/macros/s/AKfycbyDSdfY9ILeSHuqg08mo1ruDA1DzgkN7CKDIswZFwXeoa4d9064m_KrxVI_o1j1_AMn/exec";

  const params = {
    action: "criarClienteNovo",
    nome_loja: "TESTE SIMPLES",
    cliente_id: "AC-007"
  };

  const query = new URLSearchParams(params).toString();

  fetch(url + "?" + query)
    .then(r => r.json())
    .then(resp => {
      console.log("RESPOSTA:", resp);
      alert("Enviado!");
    })
    .catch(err => {
      console.error(err);
      alert("Erro!");
    });

}