function moedaParaNumero(valor){
  if(!valor) return 0;

  if(typeof valor === "number") return valor;

  return Number(
    valor
      .toString()
      .replace(/\./g,"")
      .replace(",",".")
  ) || 0;
}

function numeroParaMoeda(valor){
  return valor.toLocaleString("pt-BR",{
    minimumFractionDigits:2,
    maximumFractionDigits:2
  });
}