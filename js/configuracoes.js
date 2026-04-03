
// =============================
// INICIALIZAÇÃO
// =============================
function init_configuracoes(){
  carregarConfigLoja();
  carregarUsuariosSelect();
}

// =============================
// CARREGAR CONFIGURAÇÕES
// =============================
function carregarConfigLoja(){

console.log("Payload:", {
  action: "buscarConfigLoja",
  cliente_id: CLIENTE_ID,
  perfil: PERFIL
});

  api("buscarConfigLoja",{
  cliente_id: CLIENTE_ID,
  perfil: PERFIL
},function(r){

    if(!r || !r.ok){
      console.warn("Configuração não encontrada");
      return;
    }

    setValue("cfg_nome_loja", r.nome_loja);
    setValue("cfg_cnpj", r.cnpj);
    setValue("cfg_ie", r.inscricao_estadual || "")
    setValue("cfg_endereco", r.endereco_loja || "");
    setValue("cfg_telefone", r.telefone);
    setValue("cfg_email", r.email);
    setValue("cfg_cidade", r.cidade);
    setValue("cfg_estado", r.estado);

  });

}


// =============================
// SALVAR CONFIGURAÇÕES
// =============================
function salvarConfigLoja(){

  const dados = {

    nome_loja: v("cfg_nome_loja"),
    cnpj: v("cfg_cnpj"),
    inscricao_estadual: v("cfg_ie"),        // 🔥 ADICIONADO
    telefone: v("cfg_telefone"),
    email: v("cfg_email"),
    endereco: v("cfg_endereco"),            // 🔥 ADICIONADO
    cidade: v("cfg_cidade"),
    estado: v("cfg_estado")

  };

  console.log("ENVIANDO:", dados); // 🔥 DEBUG PRA VOCÊ PARAR DE SOFRER

  api("salvarConfigLoja", dados, function(r){

    console.log("RESPOSTA:", r);

    if(!r || !r.ok){
      alert(r?.msg || "Erro ao salvar configurações.");
      return;
    }

    alert("Configurações salvas com sucesso.");

  });

}

function cadastrarVendedorLoja(){

  const nome = v("vl_nome");
  const cpf = v("vl_cpf");
  const telefone = v("vl_tel");
  const email = v("vl_email");
  const cargo = v("vl_cargo");
  const comissao = v("vl_valor_comissao");

  if(!nome){
    alert("Informe nome do vendedor.");
    return;
  }

  if(!cpf){
    alert("Informe CPF do vendedor.");
    return;
  }

  api("cadastrarVendedorLoja",{

    nome_vendedor_loja: nome,
    cpf_vendedor_loja: cpf,
    telefone_vendedor_loja: telefone,
    email_vendedor_loja: email,
    cargo: cargo,
    valor_comissao_padrao: comissao,
    tipo_comissao_padrao: "FIXO" // ou PERCENTUAL se quiser padrão %

  },function(r){

    if(!r || !r.ok){
      alert("Erro ao salvar vendedor.");
      return;
    }

    alert("Vendedor cadastrado com sucesso.");
    location.reload();

  });

}

function criarUsuarioSistema(){

  const usuario = v("cfg_usuario_novo");
  const senha = v("cfg_senha_nova");
  const perfil = v("cfg_perfil_novo");

  if(!usuario){
    alert("Informe o usuário.");
    return;
  }

  if(!senha){
    alert("Informe a senha.");
    return;
  }

  if(!perfil){
    alert("Selecione o perfil.");
    return;
  }

  api("criarUsuario",{

    usuario_novo: usuario,
    senha_nova: senha,
    perfil_novo: perfil

  }, function(r){

    if(!r || !r.ok){
      alert(r?.msg || "Erro ao criar usuário.");
      return;
    }

    alert("Usuário criado com sucesso.");
    location.reload();

  });

}
function alterarStatusUsuario(){

  const usuario = v("usuario_status");
  const status = v("cfg_status_usuario");

  api("alterarStatusUsuario", {
    usuario_alvo: usuario,
    novo_status: status,
    cliente_id: CLIENTE_ID,
    perfil: PERFIL
  }, function(r){

    if(r.ok){
      alert("Status atualizado");
    }else{
      alert(r.msg);
    }

  });

}
function alterarMinhaSenha(){

  const senhaAtual = v("cfg_senha_atual");
  const novaSenha = v("cfg_nova_senha");

  if(!senhaAtual || !novaSenha){
    alert("Informe senha atual e nova senha.");
    return;
  }

  api("alterarMinhaSenha",{
    senha_atual: senhaAtual,
    nova_senha: novaSenha
  }, function(r){

    if(!r || !r.ok){
      alert(r?.msg || "Erro ao alterar senha.");
      return;
    }

    alert("Senha alterada com sucesso.");
    location.reload();
  });

}
function alterarSenhaOutro(){

  const usuario = v("cfg_usuario_alvo");
  const novaSenha = v("cfg_nova_senha_outro");

  if(!usuario || !novaSenha){
    alert("Informe usuário e nova senha.");
    return;
  }

  api("alterarSenhaOutroUsuario",{
    usuario_alvo: usuario,
    nova_senha: novaSenha
  }, function(r){

    if(!r || !r.ok){
      alert(r?.msg || "Erro ao alterar senha.");
      return;
    }

    alert("Senha alterada com sucesso.");
    location.reload();
  });

}

function carregarUsuariosSelect(){

  console.log("🔥 chamando carregarUsuariosSelect");

  const select = document.getElementById("usuarioSelect");

  if(!select){
    console.error("❌ select não encontrado");
    return;
  }

  api("listarUsuarios", {}, function(resp){

    console.log("📦 resposta da API:", resp);

    if(!resp || !resp.lista){
      console.error("❌ resposta inválida", resp);
      return;
    }

    select.innerHTML = '<option value="">Selecione...</option>';

    resp.lista.forEach(u => {
      const opt = document.createElement("option");
      opt.value = u.usuario;
      opt.textContent = u.nome || u.usuario;
      select.appendChild(opt);
    });

  });

}
