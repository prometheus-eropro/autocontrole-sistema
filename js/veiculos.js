function carregarVendedoresEntrada(){

  const sel = document.getElementById("comp_vendedor_loja");

  if(!sel) return;

  api("listarVendedoresLojaAtivos",{},function(r){

    if(!r || !r.ok) return;

    sel.innerHTML = '<option value="">Selecione vendedor</option>';

    r.itens.forEach(v=>{
      const op = document.createElement("option");
      op.value = v.id || "";
      op.textContent = v.nome;
      sel.appendChild(op);
    });

  });

}
function gerarIdVeiculo_(clienteId){

  const sh = sh_(clienteId,"veiculos");

  const last = sh.getLastRow();

  const numero = String(last).padStart(5,"0");

  return "VEIC" + numero;

}
