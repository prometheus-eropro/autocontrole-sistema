function init_despesas(){

  carregarVeiculosDespesa()
  carregarListaDespesas()

}

function carregarVeiculosDespesa(){

  const selCadastro = document.getElementById("d_id_veiculo")
  const selFiltro = document.getElementById("filtro_placa")

  if(selCadastro){
    selCadastro.innerHTML = '<option value="">Selecione o veículo</option>'
  }

  if(selFiltro){
    selFiltro.innerHTML = '<option value="">Todos</option>'
  }

  // 🔹 1 - ESTOQUE (cadastro)
  jsonp({
    action:"listarVeiculosEstoque",
    cliente_id:CLIENTE_ID,
    perfil:PERFIL
 }, function(r){

  console.log("VEICULOS COM DESPESAS:", r);

  if(!r || !r.ok) return

    r.itens.forEach(v => {

      if(selCadastro){
        const op1 = document.createElement("option")
        op1.value = v.id // ✅ CORRIGIDO
        op1.textContent = `${v.placa} - ${v.marca || ""} ${v.modelo || ""}`
        selCadastro.appendChild(op1)
      }

    })

  })

  // 🔹 2 - VEÍCULOS COM DESPESAS (filtro)
  jsonp({
  action:"listarVeiculosComDespesas",
  cliente_id:CLIENTE_ID,
  perfil:PERFIL
}, function(r){

  if(!r || !r.ok) return

  r.itens.forEach(v => {

    if(selFiltro){
      const op2 = document.createElement("option")
      op2.value = v.id_veiculo
      op2.textContent = `${v.placa}`
      selFiltro.appendChild(op2)
    }

  })

  // ✅ seleciona automaticamente
  if(selFiltro && selFiltro.options.length > 1){
  selFiltro.selectedIndex = 1
  carregarListaDespesas() // 🔥 ESSENCIAL
}

})

}

function carregarListaDespesas(){

  const elInicio = document.getElementById("filtro_data_inicio");
const elFim = document.getElementById("filtro_data_fim");

const inicio = elInicio ? elInicio.value : "";
const fim = elFim ? elFim.value : "";
  const elVeiculo = document.getElementById("filtro_placa");

const veiculo_id = (elVeiculo && elVeiculo.value && elVeiculo.value !== "undefined")
  ? elVeiculo.value
  : "";

console.log("SELECT VALOR:", veiculo_id); // ✅ exatamente esse nome

  const elCategoria = document.getElementById("filtro_categoria");
const categoria = elCategoria ? elCategoria.value : "";

  console.log("ENVIANDO FILTRO:", {
    inicio, fim, veiculo_id, categoria
  });
console.log("SELECT VALOR:", veiculo_id);
  api("listarDespesas", {
  cliente_id: CLIENTE_ID,
  inicio: inicio,
  fim: fim,
  veiculo_id: veiculo_id, // ✅ CERTO
  categoria: categoria
}, function(res){

    if(!res || !res.ok){
      alert("Erro ao carregar despesas");
      return;
    }

    const lista = document.getElementById("listaDespesas");
if(!lista) return;

    if(!res.itens || !res.itens.length){
      lista.innerHTML = "<tr><td colspan='5'>Sem dados</td></tr>";
      return;
    }

    let html = "";

    res.itens.forEach(d => {

      html += `
        <tr>
          <td>${d.data_despesa || ""}</td>
          <td>${d.placa || ""}</td>
          <td>${d.marca || ""} ${d.modelo || ""}</td>
          <td>${d.descricao_despesa || ""}</td>
          <td>${moeda(d.valor_despesa)}</td>
          <td>${d.forma_pagamento}</td>
        </tr>
      `;

    });

    lista.innerHTML = html;

  });

}

function toggleDespesaCategoria(){

  const categoria = document.getElementById("d_categoria")

  if(!categoria) return

  const campoVeiculo = document.getElementById("d_id_veiculo")

  if(!campoVeiculo) return

  if(categoria.value === "OPERACIONAL"){

    campoVeiculo.value = ""
    campoVeiculo.disabled = true
    campoVeiculo.style.opacity = "0.5"

  }else{

    campoVeiculo.disabled = false
    campoVeiculo.style.opacity = "1"

  }

}
function formatarMoeda(valor){
  return Number(valor || 0).toLocaleString("pt-BR",{
    minimumFractionDigits:2,
    maximumFractionDigits:2
  });
}

function lancarDespesa(){

const btn = document.getElementById("btnSalvarDespesa");

if(btn){
  btn.disabled = true;
  btn.innerText = "Salvando...";
}

  const categoria   = v("d_categoria");   // VEICULO ou OPERACIONAL
  const idVeiculo   = v("d_id_veiculo");
  const data        = v("d_data");
  const tipo        = v("d_tipo");
  const descricao   = v("d_desc");
  const valor       = v("d_valor");
  const forma       = v("d_forma");
  const comprovante = v("d_comprovante");

  if(!categoria){
  alert("Informe a categoria da despesa.");
  if(btn){
    btn.disabled = false;
    btn.innerText = "Lançar Despesa";
  }
  return;
}

if(!data){
  alert("Informe a data.");
  if(btn){
    btn.disabled = false;
    btn.innerText = "Lançar Despesa";
  }
  return;
}

if(!tipo){
  alert("Informe o tipo da despesa.");
  if(btn){
    btn.disabled = false;
    btn.innerText = "Lançar Despesa";
  }
  return;
}

if(!valor){
  alert("Informe o valor.");
  if(btn){
    btn.disabled = false;
    btn.innerText = "Lançar Despesa";
  }
  return;
}

if(categoria === "VEICULO" && !idVeiculo){
  alert("Selecione o veículo.");
  if(btn){
    btn.disabled = false;
    btn.innerText = "Lançar Despesa";
  }
  return;
}
 
  jsonp({
  action:"lancarDespesa",
  cliente_id:CLIENTE_ID,
  perfil:PERFIL,
  nome_usuario:NOME_USUARIO,

  criado_em: new Date().toISOString(), // 🔥 ADICIONA ISSO

  categoria: categoria,
  tipo_despesa: tipo,
  id_veiculo: idVeiculo || "",
  data_despesa: data,
  descricao_despesa: descricao,
  valor_despesa: num(valor), // 🔥 CORREÇÃO IMPORTANTE
  forma_pagamento: forma,
  comprovante: comprovante
}, function(r){

    if(!r || !r.ok){

  if(btn){
    btn.disabled = false;
    btn.innerText = "Lançar Despesa";
  }

  return alert(r?.msg || "Erro ao lançar despesa.");
}

    alert("Despesa lançada com sucesso!");

if(btn){
  btn.disabled = false;
  btn.innerText = "Lançar Despesa";
}

    limparFormularioDespesa();
    carregarListaDespesas();

  });

}

function brToIso(data){
  if(!data) return "";
  const [d,m,a] = data.split("/");
  return `${a}-${m}-${d}`;
}

function limparFormularioDespesa(){

  document.getElementById("d_tipo").value = "";
  document.getElementById("d_desc").value = "";
  document.getElementById("d_valor").value = "";
  document.getElementById("d_forma").value = "";
  document.getElementById("d_comprovante").value = "";

  const selVeiculo = document.getElementById("d_id_veiculo");
  if(selVeiculo) selVeiculo.value = "";

}