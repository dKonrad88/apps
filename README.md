# Apps — launcher / biblioteca pessoal

Portal **single-file + PWA** da suíte pessoal. Instala 1 ícone ("Apps") na tela de
início e abre todos os outros apps de dentro dele. Para publicar em
`dkonrad88.github.io/apps`.

## Arquivos
- `index.html` — o app inteiro (HTML/CSS/JS, sem build).
- `manifest.json` — metadados do PWA (nome, cor, ícones).
- `sw.js` — service worker. Navegação = **network-first** (sempre pega o index mais novo
  quando online; abre offline pelo cache). Supabase nunca passa pelo cache. CDNs =
  stale-while-revalidate. Bump `CACHE='apps-v1'` para forçar limpeza de cache.
- `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` — ícones (grade 2×2 colorida
  sobre fundo escuro). Gerados via PowerShell/System.Drawing.

## Adicionar / editar um app
Tudo num único array no topo do `<script>` em `index.html`:

```js
var APPS = [
  { name:'HUB Pessoal', sub:'Central', url:'https://dkonrad88.github.io/hubpessoal/',
    icon:'ti-layout-dashboard', color:'#0F6E56', bg:'#E1F5EE' },
  // ...
];
```

- `icon` = nome de um ícone [Tabler](https://tabler.io/icons) (`ti-...`).
- `color` = cor do ícone; `bg` = fundo do quadradinho.
- `soon:true` = mostra "em breve" e não abre (placeholder do Strava já está comentado).

## Abrir na mesma janela ou nova aba
Flag no topo do `<script>`:

```js
var OPEN_IN_NEW_TAB = false;  // false = mesma janela (default) · true = nova aba
```

## Login (opcional, não obrigatório)
O portal funciona 100% sem login. Como todos os apps vivem na **mesma origin**
(`dkonrad88.github.io`) e usam o **mesmo Supabase**, a sessão é compartilhada via
`localStorage`. O launcher só **lê** a sessão existente (sem tela de login) para mostrar
"Olá, <nome>". Se não houver sessão, mostra "Biblioteca pessoal". Nada quebra se o
Supabase/CDN falhar.

## Sobre a tela de início (honesto)
- **iOS:** um app não pode criar ícones de outros apps na home (Apple bloqueia). Modelo:
  este launcher é **1 ícone que abre tudo**.
- **Android:** o `beforeinstallprompt` oferece instalar **este** launcher (botão
  "Instalar este launcher" aparece sozinho quando o navegador permite).

## Publicar (GitHub Pages)
1. Criar repo `apps` no GitHub e dar push destes arquivos.
2. Settings → Pages → branch `main` (raiz). URL: `https://dkonrad88.github.io/apps/`.
3. No iPhone: Safari → Compartilhar → "Adicionar à Tela de Início".
   ⚠️ iOS não atualiza um ícone já adicionado — se trocar o ícone depois, apagar o
   atalho antigo e re-adicionar.
