function carregarResumoFinanceiro(){

  api("resumoFinanceiro",{

    data_inicio: v("filtro_inicio"),
    data_fim: v("filtro_fim")

  }, function(r){

    if(!r || !r.ok) return;

    setValue("capitalEstoque", moeda(r.capital_em_estoque || 0));
    setValue("custoCompraVendidos", moeda(r.total_compras_vendidas || 0));
    setValue("despesasEstoque", moeda(r.despesas_operacionais_estoque || 0));
    setValue("totalVendas", moeda(r.total_vendido || 0));
    setValue("despesasVendidos", moeda(r.total_despesas_vendidos || 0));
    setValue("despesasOperacionais", moeda(r.total_despesas_operacionais || 0));
    setValue("lucroFinal", moeda(r.lucro_final || 0));
    setValue("qtdEstoque", r.quantidade_estoque || 0);

  });

}