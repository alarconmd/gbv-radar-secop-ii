(() => {
  "use strict";
  const data = window.GBV_DATA;
  const list = document.getElementById("opportunity-list");
  if (!data || !Array.isArray(data.opportunities)) {
    document.getElementById("result-count").textContent = "No se pudieron cargar los datos.";
    return;
  }
  const items = data.opportunities.map((item, index) => ({...item, _index:index}));
  const controls = {
    search: document.getElementById("search"), sector: document.getElementById("sector"),
    group: document.getElementById("group"), sort: document.getElementById("sort"),
  };
  const state = {search:"", sector:"all", group:"all", sort:"priority"};
  const money = new Intl.NumberFormat("es-CO", {maximumFractionDigits:0});
  const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
  const normalize = value => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  const groupLabel = item => item.group === "core" ? `Núcleo GBV · ${item.priority}` : item.group === "ally" ? `Aliados · ${item.priority}` : "Vigilancia";
  const groupClass = item => item.group === "core" ? "" : item.group === "ally" ? "badge-ally" : "badge-watch";
  const externalLink = (url, text, className="") => `<a class="${className}" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(text)}</a>`;

  function card(item) {
    const isWatch = item.group === "watch";
    const detailsId = `details-${item.id.replace(/[^a-zA-Z0-9]/g,"-")}`;
    return `<article class="opportunity-card ${item.group}" data-id="${escapeHtml(item.id)}" data-group="${item.group}">
      <div class="card-header"><div class="card-title"><div class="badges"><span class="badge ${groupClass(item)}">${escapeHtml(groupLabel(item))}</span><span class="badge badge-ally">${escapeHtml(item.modality)}</span></div>
        <h3>${externalLink(item.url,item.summary)}</h3><div class="reference">${escapeHtml(item.reference)}</div><p class="entity">${escapeHtml(item.entityShort)}</p></div>
        <div class="card-budget"><strong>COP $${money.format(item.budget)}</strong><span>Presupuesto reportado</span></div></div>
      <div class="card-info"><div class="sector-tags">${item.sectors.map(s=>`<span class="sector-tag">${escapeHtml(s)}</span>`).join("")}</div><div class="deadline"><span>${isWatch?"Recepción futura":"Cierre SECOP"}</span><strong>${escapeHtml(item.closeDisplay)}</strong></div></div>
      <details class="card-details" id="${detailsId}"><summary>Ver análisis, objeto y datos del proceso</summary><div class="details-content">
        <div class="details-grid"><div class="detail-item"><span>Rol recomendado</span><strong>${escapeHtml(item.role)}</strong></div><div class="detail-item"><span>Encaje</span><strong>${escapeHtml(item.fit)}</strong></div>
        <div class="detail-item"><span>ID del proceso</span><strong>${escapeHtml(item.id)}</strong></div><div class="detail-item"><span>Fase / estado</span><strong>${escapeHtml(item.phase)} · ${escapeHtml(item.state)}</strong></div>
        <div class="detail-item"><span>Ubicación reportada</span><strong>${escapeHtml(item.department)} / ${escapeHtml(item.city)}</strong></div><div class="detail-item"><span>Entidad</span><strong>${escapeHtml(item.entity)}</strong></div></div>
        ${item.coreRole?`<p class="analysis"><strong>Rol sugerido:</strong> ${escapeHtml(item.coreRole)}</p>`:""}<p class="analysis">${escapeHtml(item.analysis)}</p><p class="object-text"><strong>Objeto registrado:</strong> ${escapeHtml(item.object)}</p>
      </div></details>
      <div class="card-footer"><div class="role"><strong>${isWatch?"Acción:":"Participación:"}</strong> ${escapeHtml(item.role)}</div>${externalLink(item.url,"Abrir en SECOP II ↗","button button-outline")}</div>
    </article>`;
  }

  function updateUrl() {
    try {
      const url = new URL(window.location.href);
      const values = {q:state.search,sector:state.sector,group:state.group,sort:state.sort};
      Object.entries(values).forEach(([key,value]) => {
        const defaultValue = key === "q" ? "" : key === "sort" ? "priority" : "all";
        if (value && value !== defaultValue) url.searchParams.set(key,value); else url.searchParams.delete(key);
      });
      url.hash = "radar"; history.replaceState(null,"",url);
    } catch (_) { /* La vista sigue funcionando si el navegador bloquea history. */ }
  }

  function render() {
    const query = normalize(state.search.trim());
    const filtered = items.filter(item => {
      const groupMatch = state.group === "all" || item.group === state.group;
      const sectorMatch = state.sector === "all" || item.sectors.includes(state.sector);
      const haystack = normalize([item.id,item.reference,item.summary,item.sector,item.entity,item.entityShort,item.object,item.role,item.analysis].join(" "));
      return groupMatch && sectorMatch && (!query || haystack.includes(query));
    });
    if (state.sort === "close") filtered.sort((a,b)=>a.close.localeCompare(b.close));
    if (state.sort === "budget-desc") filtered.sort((a,b)=>b.budget-a.budget);
    if (state.sort === "budget-asc") filtered.sort((a,b)=>a.budget-b.budget);
    if (state.sort === "priority") filtered.sort((a,b)=>a._index-b._index);
    list.innerHTML = filtered.map(card).join("");
    const openCount = filtered.filter(i=>i.group!=="watch").length;
    const watchCount = filtered.filter(i=>i.group==="watch").length;
    document.getElementById("result-count").textContent = `${filtered.length} de ${items.length} procesos · ${openCount} ofertas · ${watchCount} en vigilancia`;
    document.getElementById("empty-state").hidden = filtered.length !== 0;
    list.hidden = filtered.length === 0;
    updateUrl();
  }

  function syncControls() {
    controls.search.value = state.search; controls.sector.value = state.sector;
    controls.group.value = state.group; controls.sort.value = state.sort;
  }
  function resetFilters() {
    Object.assign(state,{search:"",sector:"all",group:"all",sort:"priority"});
    syncControls(); render();
  }
  function goToRadar() { document.getElementById("radar").scrollIntoView({behavior:"smooth",block:"start"}); }

  const sectorOptions = [...new Set(items.flatMap(item=>item.sectors))].sort((a,b)=>a.localeCompare(b,"es"));
  sectorOptions.forEach(sector => {
    const option = document.createElement("option"); option.value = sector; option.textContent = sector;
    controls.sector.appendChild(option);
  });
  try {
    const params = new URLSearchParams(window.location.search);
    state.search = params.get("q") || "";
    state.sector = sectorOptions.includes(params.get("sector")) ? params.get("sector") : "all";
    state.group = ["all","core","ally","watch"].includes(params.get("group")) ? params.get("group") : "all";
    state.sort = ["priority","close","budget-desc","budget-asc"].includes(params.get("sort")) ? params.get("sort") : "priority";
  } catch (_) { /* Valores predeterminados. */ }
  syncControls();

  controls.search.addEventListener("input", event => { state.search = event.target.value; render(); });
  ["sector","group","sort"].forEach(name => controls[name].addEventListener("change", event => { state[name] = event.target.value; render(); }));
  document.getElementById("filters").addEventListener("submit", event => event.preventDefault());
  document.getElementById("reset").addEventListener("click", resetFilters);
  document.getElementById("empty-reset").addEventListener("click", resetFilters);
  document.querySelectorAll(".filter-shortcut").forEach(button => button.addEventListener("click", () => {
    resetFilters(); state.group = button.dataset.group; syncControls(); render(); goToRadar();
  }));
  document.querySelectorAll(".search-shortcut").forEach(button => button.addEventListener("click", () => {
    resetFilters(); state.search = button.dataset.search; syncControls(); render(); goToRadar();
  }));

  let expanded = false;
  const expandButton = document.getElementById("expand-all");
  function setAllDetails(open) {
    document.querySelectorAll(".card-details").forEach(details => { details.open = open; });
    expanded = open; expandButton.textContent = open ? "Contraer detalles" : "Expandir detalles";
  }
  expandButton.addEventListener("click", () => setAllDetails(!expanded));
  document.getElementById("print-page").addEventListener("click", () => { setAllDetails(true); window.print(); });
  window.addEventListener("beforeprint", () => setAllDetails(true));

  const themeButton = document.getElementById("theme-toggle");
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    themeButton.textContent = theme === "dark" ? "Claro" : "Oscuro";
    themeButton.setAttribute("aria-label",theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro");
  }
  let initialTheme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  try { initialTheme = localStorage.getItem("gbv-theme") || initialTheme; } catch (_) { /* Sin persistencia. */ }
  applyTheme(initialTheme);
  themeButton.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next); try { localStorage.setItem("gbv-theme",next); } catch (_) { /* Sin persistencia. */ }
  });
  render();
})();
