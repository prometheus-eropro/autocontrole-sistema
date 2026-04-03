self.addEventListener("install", function(event){
  event.waitUntil(
    caches.open("autocontrole-v1").then(function(cache){
      return cache.addAll([
        "/",
        "/index.html",
        "/app.html",
        "/css/style.css",
        "/js/helpers.js",
        "/js/api.js",
        "/js/auth.js",
        "/js/menu.js",
        "/js/modulos.js",
        "/modulos/dashboard.html",
        "/modulos/veiculos.html",
        "/modulos/despesas.html",
        "/modulos/vendas.html",
        "/modulos/parcelas.html",
        "/modulos/estoque.html",
        "/modulos/financeiro.html",
        "/modulos/documentos.html",
        "/modulos/configuracoes.html",
        "/logo.png",
        "/icon-192.png",
        "/icon-512.png"
      ]);
    })
  );
});

self.addEventListener("fetch", function(event){
  event.respondWith(
    caches.match(event.request).then(function(response){
      self.addEventListener("fetch", function(event){
  event.respondWith(
    caches.match(event.request).then(function(response){
      if(response){
        return response;
      }

      return fetch(event.request).catch(()=>{
        return caches.match("/index.html");
      });
    })
  );
});
    })
  );
});