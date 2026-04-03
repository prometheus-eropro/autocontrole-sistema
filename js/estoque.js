async function init_estoque(){

  const existeTabela = document.querySelector("#tb_estoque_body");
  if(!existeTabela) return;

  setTimeout(()=>{
    carregarEstoque();
  },100);

}

function carregarEstoque(){

  const tb = document.querySelector("#tb_estoque_body");
  if(!tb) return;

  // 🔴 OFFLINE
  if(!navigator.onLine){

    const cache = JSON.parse(localStorage.getItem("estoque_cache") || "[]");

    renderizarEstoque(cache);

    console.log("📦 usando cache offline");
    return;
  }

  // 🟢 ONLINE
  api("listarVeiculosEstoque",{},function(r){

    if(!r || !r.ok) return;

    // 💾 SALVA CACHE
    localStorage.setItem("estoque_cache", JSON.stringify(r.itens));

    renderizarEstoque(r.itens);

  });

}

function renderizarEstoque(lista){

  const tb = document.querySelector("#tb_estoque_body");
  if(!tb) return;

  tb.innerHTML = "";

  if(!lista.length){
    tb.innerHTML = "<tr><td colspan='8'>Sem dados</td></tr>";
    return;
  }

  lista.forEach(v=>{

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${v.placa || ""}</td>
      <td>${v.tipo_veiculo || ""}</td>
      <td>${v.marca || ""}</td>
      <td>${v.modelo || ""}</td>
      <td>${v.ano_fabricacao || ""}</td>
      <td>${v.ano_modelo || ""}</td>
      <td>${moeda(v.valor_venda || 0)}</td>
      <td>${v.dias_estoque || ""}</td>
    `;

    tb.appendChild(tr);

  });

}

function filtrarEstoque(){

  const filtro = String(
    document.getElementById("filtro_modelo")?.value || ""
  ).toLowerCase();

  const linhas = document.querySelectorAll("#tb_estoque_body tr");

  linhas.forEach(tr => {

    const texto = tr.innerText.toLowerCase();

    tr.style.display = texto.includes(filtro) ? "" : "none";

  });

}