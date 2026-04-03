function init_documentos(){
  setTimeout(()=>{
    carregarVeiculosVendidosDocumentos();
  },100);
}

function carregarVeiculosVendidosDocumentos(){

  const sel = document.getElementById("doc_veiculo");

  if(!sel) return;

  sel.innerHTML = `<option value="">Selecione</option>`;

  api("listarVeiculosVendidos",{},function(r){

    if(!r || !r.ok) return;

    r.itens.forEach(v=>{

      const opt = document.createElement("option");

      opt.value = v.id_veiculo;
      opt.textContent = `${v.placa} - ${v.marca} ${v.modelo}`;

      sel.appendChild(opt);

    });

  });

}

function abrirFichaVendaPreenchida(id){

  if(!id){
    alert("Selecione um veículo");
    return;
  }

  const url = "relatorios/ficha_venda_preenchida1.html?id=" + id;

  window.open(url, "_blank");

}

