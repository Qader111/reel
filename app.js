/* ============================================================
   QJ's Reel v2 — app.js (4 pages + router)
   ============================================================ */

const state = {
  movies: [],
  loaded: false,
};

const app = document.getElementById("app");

/* ---------- Utilities ---------- */

function ratingColor(r) {
  if (r == null) return "#6b6a66";
  if (r >= 8.5) return "#8fd694";
  if (r >= 7)   return "#bfd67f";
  if (r >= 5)   return "#e8a87c";
  if (r >= 3)   return "#d97757";
  return "#e06363";
}

function normalizePlatform(p) {
  if (!p) return null;
  const s = p.trim();
  const map = {
    "netflix": "Netflix",
    "hbo max": "HBO Max", "hbo": "HBO Max", "max": "HBO Max",
    "prime video": "Prime Video", "amazon prime": "Prime Video", "prime": "Prime Video",
    "disney": "Disney+", "disney+": "Disney+", "disney plus": "Disney+",
    "hotstar": "Hotstar",
    "apple tv": "Apple TV+", "apple tv+": "Apple TV+",
    "hulu": "Hulu",
    "paramount+": "Paramount+", "paramount +": "Paramount+", "paramount plus": "Paramount+",
    "einthusian": "Einthusian", "einthuian": "Einthusian", "einthusiaan": "Einthusian", "einthusiann": "Einthusian",
    "pak drama": "Pakistani Drama", "pakistani drama": "Pakistani Drama", "pak dramaa": "Pakistani Drama",
    "pak movie": "Pakistani Film", "pakistani film": "Pakistani Film",
    "hindi movie": "Hindi Film", "hindi": "Hindi Film",
    "punjabi": "Punjabi Film", "punjabi film": "Punjabi Film",
    "youtube": "YouTube", "youtube original": "YouTube",
    "anime": "Anime",
    "theater": "Theater",
    "crunchy roll": "Crunchyroll", "crunchyroll": "Crunchyroll",
    "tubi": "Tubi", "starz": "Starz", "plex": "Plex",
    "solar movies": "Solar Movies",
    "movie pluto": "Pluto TV",
    "quitt.net": "Quitt.net", "quitt.nett": "Quitt.net",
    "netlfix": "Netflix",
  };
  return map[s.toLowerCase()] || s;
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function debounce(fn, ms = 150) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

function verdict(r, status) {
  if (status === "unwatched") return "Not watched yet.";
  if (status === "partial" && r == null) return "Started watching, jury still out.";
  if (status === "partial") return "Still catching up — more to watch.";
  if (r == null) return "Watched, no rating recorded.";
  if (r >= 9.5) return "A masterpiece. Would rewatch.";
  if (r >= 8.5) return "Exceptional. Highly recommended.";
  if (r >= 7)   return "Solid. Worth your time.";
  if (r >= 5.5) return "Watchable, nothing special.";
  if (r >= 3.5) return "Mediocre. Skip unless curious.";
  if (r >= 2)   return "Bad. Life is short.";
  return "A waste of runtime.";
}

/* ---------- Load ---------- */

async function load() {
  try {
    const res = await fetch("movies.json");
    const raw = await res.json();
    state.movies = raw.map(m => ({
      ...m,
      platformNorm: normalizePlatform(m.platform),
    }));
    state.loaded = true;
    route();
  } catch (e) {
    app.innerHTML = `<div class="wrap loading"><p>Failed to load data: ${escapeHtml(e.message)}</p></div>`;
  }
}

/* ---------- Router ---------- */

function currentRoute() {
  const hash = location.hash || "#/";
  if (hash === "#/" || hash === "#") return "home";
  if (hash === "#/watched") return "watched";
  if (hash === "#/unwatched") return "unwatched";
  if (hash === "#/stats") return "stats";
  return "home";
}

function route() {
  if (!state.loaded) return;
  const r = currentRoute();

  // nav active state
  document.querySelectorAll("#top-nav a").forEach(a => {
    a.classList.toggle("active", a.dataset.route === r);
  });

  // render
  if (r === "home")      renderHome();
  else if (r === "watched")   renderList("watched");
  else if (r === "unwatched") renderList("unwatched");
  else if (r === "stats")     renderStats();

  window.scrollTo({ top: 0, behavior: "instant" });
}

window.addEventListener("hashchange", route);

/* ============================================================
   HOME PAGE
   ============================================================ */

function renderHome() {
  const { movies } = state;
  const total = movies.length;
  const watched = movies.filter(m => (m.status || (m.watched ? "watched" : "unwatched")) === "watched").length;
  const partial = movies.filter(m => m.status === "partial").length;
  const unwatched = movies.filter(m => (m.status || (m.watched ? "watched" : "unwatched")) === "unwatched").length;
  const rated = movies.filter(m => m.rating != null);
  const avg = rated.length ? (rated.reduce((s,m) => s + m.rating, 0) / rated.length).toFixed(2) : "—";

  // Top 10: highest rated entries with any "watched" component (watched OR partial)
  const top10 = [...movies]
    .filter(m => {
      const s = m.status || (m.watched ? "watched" : "unwatched");
      return (s === "watched" || s === "partial") && m.rating != null;
    })
    .sort((a, b) => b.rating - a.rating || (b.id - a.id))
    .slice(0, 10);

  app.innerHTML = `
    <section class="home">
      <div class="wrap">

        <!-- HERO -->
        <div class="hero-home">
          <p class="kicker">A personal ledger · est. ${new Date().getFullYear() - 6}</p>
          <h1>A running log of films<br/>and shows, rated <em>honestly</em>.</h1>
          <p class="lead">
            No algorithms, no recommendations. Just the brilliant, the middling,
            and the occasional 1/10 catastrophe — all in one place.
          </p>
          <div class="hero-chips">
            <a class="hero-chip" href="#/watched"><strong>${total}</strong>Total entries</a>
            <a class="hero-chip" href="#/watched"><strong>${watched}</strong>Watched</a>
            ${partial > 0 ? `<a class="hero-chip" href="#/watched"><strong>${partial}</strong>In progress</a>` : ""}
            <a class="hero-chip" href="#/unwatched"><strong>${unwatched}</strong>Watchlist</a>
            <a class="hero-chip" href="#/stats"><strong>${avg}</strong>Average score</a>
          </div>
        </div>

        <!-- TOP 10 -->
        <section class="top10">
          <div class="section-head">
            <div class="title-block">
              <span class="sec-num">01 · The Favorites</span>
              <h2>Top 10 of all time</h2>
              <p class="sec-sub">The highest-rated entries from the library.</p>
            </div>
          </div>
          <div class="top10-row">
            ${top10.map((m, i) => top10Item(m, i + 1)).join("")}
          </div>
        </section>

        <!-- RANDOM PICKER -->
        <section class="picker-section">
          <div class="section-head">
            <div class="title-block">
              <span class="sec-num">02 · The Oracle</span>
              <h2>Can't decide? Roll the dice.</h2>
              <p class="sec-sub">Set a range, pick a pool, and let chance do the work.</p>
            </div>
          </div>
          <div class="picker-card">
            <div class="picker-grid">
              <div class="picker-inputs">
                <div class="picker-row">
                  <div class="picker-field">
                    <label>From (ID)</label>
                    <input type="number" id="p-start" class="picker-input" value="1" min="1" max="${total}" />
                  </div>
                  <div class="picker-field">
                    <label>To (ID)</label>
                    <input type="number" id="p-end" class="picker-input" value="${total}" min="1" max="${total}" />
                  </div>
                </div>
                <div class="picker-row">
                  <div class="picker-field" style="flex:1 1 100%;">
                    <label>Pool</label>
                    <select id="p-pool" class="picker-select">
                      <option value="all">All entries</option>
                      <option value="watched">Only watched</option>
                      <option value="unwatched">Only watchlist</option>
                    </select>
                  </div>
                </div>
                <button id="p-btn" class="picker-btn">Roll the dice →</button>
              </div>
              <div id="p-result" class="picker-result empty">
                <span>Your pick will appear here.</span>
              </div>
            </div>
          </div>
        </section>

        <!-- RECENTLY ADDED -->
        <section class="recent-section">
          <div class="section-head">
            <div class="title-block">
              <span class="sec-num">03 · Latest Entries</span>
              <h2>Recently logged</h2>
              <p class="sec-sub">The last 12 additions to the ledger.</p>
            </div>
          </div>
          <div class="poster-grid">
            ${[...movies].sort((a,b) => b.id - a.id).slice(0, 12).map(posterCard).join("")}
          </div>
        </section>

      </div>
    </section>
  `;

  // hook picker
  document.getElementById("p-btn").addEventListener("click", rollRandom);
  // hook cards
  app.querySelectorAll("[data-id]").forEach(el => {
    el.addEventListener("click", () => openModal(Number(el.dataset.id)));
  });
}

function top10Item(m, rank) {
  const color = ratingColor(m.rating);
  const poster = m.poster
    ? `<img class="poster-img" src="${escapeHtml(m.poster)}" alt="${escapeHtml(m.title)}" loading="lazy" />`
    : `<div class="poster-fallback">
         <div class="t">${escapeHtml(m.title)}</div>
         <div class="r">${m.rating}/10</div>
       </div>`;
  return `
    <div class="top10-item" data-id="${m.id}">
      <span class="top10-num">${rank}</span>
      <div class="poster-wrap" style="--rating-color:${color};">
        ${poster}
        <div class="meta">
          <span>${escapeHtml(m.title.length > 22 ? m.title.slice(0, 22) + "…" : m.title)}</span>
          <span class="r">${m.rating}</span>
        </div>
      </div>
    </div>
  `;
}

function rollRandom() {
  const total = state.movies.length;
  let s = parseInt(document.getElementById("p-start").value, 10);
  let e = parseInt(document.getElementById("p-end").value, 10);
  if (isNaN(s) || s < 1) s = 1;
  if (isNaN(e) || e > total) e = total;
  if (s > e) [s, e] = [e, s];
  const pool = document.getElementById("p-pool").value;

  const candidates = state.movies.filter(m => {
    if (m.id < s || m.id > e) return false;
    const status = m.status || (m.watched ? "watched" : "unwatched");
    if (pool === "watched" && !(status === "watched" || status === "partial")) return false;
    if (pool === "unwatched" && !(status === "unwatched" || status === "partial")) return false;
    return true;
  });

  const result = document.getElementById("p-result");

  if (candidates.length === 0) {
    result.className = "picker-result empty";
    result.innerHTML = `<span>No entries match that range and pool.</span>`;
    return;
  }

  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  const pickStatus = pick.status || (pick.watched ? "watched" : "unwatched");
  const pickStatusLabel = { watched: "Watched", partial: "In progress", unwatched: "Watchlist" }[pickStatus];
  result.className = "picker-result";
  const color = ratingColor(pick.rating);
  const posterEl = pick.poster
    ? `<img src="${escapeHtml(pick.poster)}" alt="${escapeHtml(pick.title)}" />`
    : `<div class="no-poster" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--ink-mute);font-size:11px;padding:10px;text-align:center;">No poster</div>`;
  const ratingLine = pick.rating != null
    ? `<span class="rating">${pick.rating}/10</span>`
    : `<span>Unrated</span>`;

  result.innerHTML = `
    <div class="pr-poster" style="--rating-color:${color};">${posterEl}</div>
    <div class="pr-body">
      <div class="pr-id">Entry · #${String(pick.id).padStart(4, "0")}</div>
      <h3 class="pr-title">${escapeHtml(pick.title)}</h3>
      <div class="pr-meta">
        ${ratingLine}
        ${pick.platformNorm ? `<span>${escapeHtml(pick.platformNorm)}</span>` : ""}
        ${pick.year ? `<span>${escapeHtml(pick.year)}</span>` : ""}
        ${pick.seasons_watched ? `<span>${escapeHtml(pick.seasons_watched)}</span>` : ""}
        <span>${pickStatusLabel}</span>
      </div>
      <p class="pr-overview">${escapeHtml(pick.overview || "No description available.")}</p>
      <div class="pr-actions">
        <button class="link-btn" id="p-more" data-id="${pick.id}">View details →</button>
        <button class="link-btn" id="p-reroll">Roll again</button>
      </div>
    </div>
  `;
  document.getElementById("p-more").addEventListener("click", () => openModal(pick.id));
  document.getElementById("p-reroll").addEventListener("click", rollRandom);
}

/* ============================================================
   WATCHED / UNWATCHED LIST PAGES
   ============================================================ */

// per-page state
const listState = {
  watched: { search: "", sort: "rating-desc", platform: "all", page: 1 },
  unwatched: { search: "", sort: "recent", platform: "all", page: 1 },
};

const PAGE_SIZE = 48;

function renderList(type) {
  const st = listState[type];
  // New model: 'watched' tab includes 'watched' + 'partial' statuses
  //            'unwatched' tab includes 'unwatched' + 'partial' statuses
  const baseList = state.movies.filter(m => {
    const status = m.status || (m.watched ? "watched" : "unwatched");
    if (type === "watched")   return status === "watched" || status === "partial";
    if (type === "unwatched") return status === "unwatched" || status === "partial";
    return false;
  });

  // platform list
  const platforms = new Map();
  for (const m of baseList) {
    if (!m.platformNorm) continue;
    platforms.set(m.platformNorm, (platforms.get(m.platformNorm) || 0) + 1);
  }
  const platformOpts = [...platforms.entries()].sort((a,b) => b[1] - a[1]);

  const isWatched = type === "watched";
  const title = isWatched ? "Watched" : "The Watchlist";
  const subtitle = isWatched
    ? "Everything I've seen, rated on a scale of ruthless honesty. Includes in-progress shows."
    : "Queued up, unrated, waiting their turn. Includes shows I've started but have more to watch.";
  const seqNum = isWatched ? "02" : "03";

  app.innerHTML = `
    <section class="page-head">
      <div class="wrap">
        <div class="section-head">
          <div class="title-block">
            <span class="sec-num">${seqNum} · The Archive</span>
            <h2>${title}</h2>
            <p class="sec-sub">${subtitle}</p>
          </div>
        </div>

        <div class="controls">
          <div class="control-group">
            <label for="l-search">Search</label>
            <div class="search-wrap">
              <svg class="search-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              <input type="search" id="l-search" class="search-input" placeholder="Search titles…" value="${escapeHtml(st.search)}" autocomplete="off" />
            </div>
          </div>
          <div class="control-group">
            <label for="l-sort">Sort by</label>
            <select id="l-sort" class="sel">
              ${isWatched
                ? `
                  <option value="rating-desc" ${st.sort === "rating-desc" ? "selected" : ""}>Highest rated</option>
                  <option value="rating-asc" ${st.sort === "rating-asc" ? "selected" : ""}>Lowest rated</option>
                  <option value="recent" ${st.sort === "recent" ? "selected" : ""}>Most recent first</option>
                  <option value="oldest" ${st.sort === "oldest" ? "selected" : ""}>Oldest first</option>
                  <option value="title" ${st.sort === "title" ? "selected" : ""}>Title A–Z</option>
                `
                : `
                  <option value="recent" ${st.sort === "recent" ? "selected" : ""}>Most recent first</option>
                  <option value="oldest" ${st.sort === "oldest" ? "selected" : ""}>Oldest first</option>
                  <option value="title" ${st.sort === "title" ? "selected" : ""}>Title A–Z</option>
                `
              }
            </select>
          </div>
          <div class="control-group">
            <label for="l-platform">Platform</label>
            <select id="l-platform" class="sel">
              <option value="all">All platforms</option>
              ${platformOpts.map(([n, c]) => `<option value="${escapeHtml(n)}" ${st.platform === n ? "selected" : ""}>${escapeHtml(n)} (${c})</option>`).join("")}
            </select>
          </div>
          <div class="control-group" style="justify-content:flex-end;">
            <button id="l-reset" class="link-btn" style="text-align:left;">Reset filters</button>
          </div>
        </div>

        <div class="result-meta">
          <span id="l-count">—</span>
        </div>

        <div id="l-grid" class="poster-grid"></div>
        <div id="l-empty" class="empty" hidden><p>No titles match.</p></div>
        <div id="l-more-wrap" style="text-align:center;"></div>
      </div>
    </section>
  `;

  // events
  const doFilter = () => applyListFilter(type, baseList);
  document.getElementById("l-search").addEventListener("input", debounce(e => {
    st.search = e.target.value.trim().toLowerCase();
    st.page = 1;
    doFilter();
  }, 120));
  document.getElementById("l-sort").addEventListener("change", e => {
    st.sort = e.target.value; st.page = 1; doFilter();
  });
  document.getElementById("l-platform").addEventListener("change", e => {
    st.platform = e.target.value; st.page = 1; doFilter();
  });
  document.getElementById("l-reset").addEventListener("click", () => {
    st.search = ""; st.sort = isWatched ? "rating-desc" : "recent"; st.platform = "all"; st.page = 1;
    renderList(type);
  });

  doFilter();
}

function applyListFilter(type, baseList) {
  const st = listState[type];
  let list = baseList.filter(m => {
    if (st.platform !== "all" && m.platformNorm !== st.platform) return false;
    if (st.search) {
      const hay = `${m.title} ${m.platform || ""} ${m.matched_title || ""}`.toLowerCase();
      if (!hay.includes(st.search)) return false;
    }
    return true;
  });

  switch (st.sort) {
    case "rating-desc":
      list.sort((a,b) => ((b.rating ?? -1) - (a.rating ?? -1)) || a.title.localeCompare(b.title));
      break;
    case "rating-asc":
      list.sort((a,b) => ((a.rating ?? 99) - (b.rating ?? 99)) || a.title.localeCompare(b.title));
      break;
    case "recent": list.sort((a,b) => b.id - a.id); break;
    case "oldest": list.sort((a,b) => a.id - b.id); break;
    case "title":  list.sort((a,b) => a.title.localeCompare(b.title)); break;
  }

  const total = list.length;
  const shown = Math.min(st.page * PAGE_SIZE, total);
  const visible = list.slice(0, shown);

  document.getElementById("l-count").textContent = `Showing ${shown} of ${total}`;
  const grid = document.getElementById("l-grid");
  const empty = document.getElementById("l-empty");
  const moreWrap = document.getElementById("l-more-wrap");

  if (total === 0) {
    grid.innerHTML = "";
    empty.hidden = false;
    moreWrap.innerHTML = "";
    return;
  }
  empty.hidden = true;

  grid.innerHTML = visible.map(posterCard).join("");

  if (shown < total) {
    moreWrap.innerHTML = `<button class="load-more" id="l-more">Load more (${total - shown})</button>`;
    document.getElementById("l-more").addEventListener("click", () => {
      st.page++;
      applyListFilter(type, baseList);
    });
  } else {
    moreWrap.innerHTML = "";
  }

  grid.querySelectorAll("[data-id]").forEach(el => {
    el.addEventListener("click", () => openModal(Number(el.dataset.id)));
  });
}

/* ============================================================
   POSTER CARD (shared)
   ============================================================ */

function posterCard(m) {
  const color = ratingColor(m.rating);
  const status = m.status || (m.watched ? "watched" : "unwatched");

  const rating = m.rating != null
    ? `<div class="rating-badge" style="--rating-color:${color};color:${color};">${m.rating}<span class="slash">/10</span></div>`
    : `<div class="rating-badge unrated">Unrated</div>`;

  const poster = m.poster
    ? `<img src="${escapeHtml(m.poster)}" alt="${escapeHtml(m.title)}" loading="lazy" />`
    : `<div class="no-poster">
         <div class="np-title">${escapeHtml(m.title)}</div>
         <div class="np-platform">${escapeHtml(m.platformNorm || "—")}</div>
       </div>`;

  // Status ribbon: partial shows as "In progress", unwatched as "Watchlist"
  let ribbon = "";
  if (status === "unwatched") {
    ribbon = `<div class="status-ribbon">Watchlist</div>`;
  } else if (status === "partial") {
    ribbon = `<div class="status-ribbon partial">In progress</div>`;
  }

  // Season tag — shown on poster if present
  const seasonTag = m.seasons_watched
    ? `<div class="season-tag">${escapeHtml(m.seasons_watched)}</div>`
    : "";

  const sub = [m.platformNorm, m.year].filter(Boolean).join(" · ");

  return `
    <article class="poster-card" data-id="${m.id}">
      <div class="poster-box">
        ${poster}
        ${rating}
        ${ribbon}
        ${seasonTag}
      </div>
      <div class="poster-info">
        <div class="title">${escapeHtml(m.title)}</div>
        <div class="sub">${escapeHtml(sub || "—")}</div>
      </div>
    </article>
  `;
}

/* ============================================================
   STATS PAGE
   ============================================================ */

function renderStats() {
  const { movies } = state;
  const total = movies.length;
  const watched = movies.filter(m => {
    const s = m.status || (m.watched ? "watched" : "unwatched");
    return s === "watched" || s === "partial";
  }).length;
  const rated = movies.filter(m => m.rating != null);
  const avg = rated.length ? (rated.reduce((s,m) => s + m.rating, 0) / rated.length).toFixed(2) : "—";
  const perfect = movies.filter(m => m.rating === 10).length;

  // rating histogram
  const bins = new Array(10).fill(0);
  let binMax = 0;
  for (const m of movies) {
    if (m.rating == null) continue;
    const idx = Math.min(9, Math.floor(m.rating));
    bins[idx]++;
    if (bins[idx] > binMax) binMax = bins[idx];
  }

  // platforms
  const pMap = new Map();
  for (const m of movies) {
    if (!m.platformNorm) continue;
    pMap.set(m.platformNorm, (pMap.get(m.platformNorm) || 0) + 1);
  }
  const platforms = [...pMap.entries()].sort((a,b) => b[1] - a[1]).slice(0, 10);
  const pMax = platforms[0]?.[1] || 1;

  // halls — include both fully watched and partially watched
  const ratedWatched = movies.filter(m => {
    const s = m.status || (m.watched ? "watched" : "unwatched");
    return m.rating != null && (s === "watched" || s === "partial");
  });
  const fame = [...ratedWatched].filter(m => m.rating >= 9).sort((a,b) => b.rating - a.rating || a.title.localeCompare(b.title)).slice(0, 50);
  const shame = [...ratedWatched].filter(m => m.rating <= 2).sort((a,b) => a.rating - b.rating || a.title.localeCompare(b.title)).slice(0, 50);

  // recent additions
  const recent = [...movies].sort((a,b) => b.id - a.id).slice(0, 6);

  app.innerHTML = `
    <section class="stats-page">
      <div class="wrap">
        <div class="section-head">
          <div class="title-block">
            <span class="sec-num">04 · By the Numbers</span>
            <h2>Stats & insights</h2>
            <p class="sec-sub">A breakdown of taste, tendencies, and trends.</p>
          </div>
        </div>

        <div class="stats-hero">
          <div class="sh-item"><div class="n">${total}</div><div class="l">Total logged</div></div>
          <div class="sh-item"><div class="n">${watched}</div><div class="l">Watched</div></div>
          <div class="sh-item"><div class="n">${avg}</div><div class="l">Average rating</div></div>
          <div class="sh-item"><div class="n">${perfect}</div><div class="l">Perfect 10s</div></div>
        </div>

        <div class="stats-grid">
          <div class="stat-card st-histo">
            <h3>Rating distribution</h3>
            <div class="histogram">
              ${bins.map((n, i) => {
                const h = binMax ? (n / binMax * 100) : 0;
                const color = ratingColor(i + 0.5);
                const label = i === 9 ? "9–10" : `${i}`;
                return `
                  <div class="bar-col">
                    <span class="bar-count">${n}</span>
                    <div class="bar" style="height:${h}%;background:${color};"></div>
                    <span class="bar-label">${label}</span>
                  </div>
                `;
              }).join("")}
            </div>
          </div>

          <div class="stat-card st-platforms">
            <h3>Top platforms</h3>
            <div class="bars">
              ${platforms.map(([n, c]) => `
                <div class="pbar">
                  <div class="name">${escapeHtml(n)}</div>
                  <div class="track"><div class="fill" style="width:${(c/pMax*100).toFixed(1)}%;"></div></div>
                  <div class="count">${c}</div>
                </div>
              `).join("")}
            </div>
          </div>

          <div class="stat-card st-hof">
            <h3>Hall of fame · 9+</h3>
            <ol class="hall">
              ${fame.length ? fame.map(m => `
                <li>
                  <span class="h-title" title="${escapeHtml(m.title)}">${escapeHtml(m.title)}</span>
                  <span class="h-rating">${m.rating}</span>
                </li>
              `).join("") : `<li style="grid-template-columns:1fr;"><span class="h-title" style="color:var(--ink-mute);font-style:italic;">No 9+ ratings yet.</span></li>`}
            </ol>
          </div>

          <div class="stat-card st-hos">
            <h3>Hall of shame · 2 or lower</h3>
            <ol class="hall">
              ${shame.length ? shame.map(m => `
                <li>
                  <span class="h-title" title="${escapeHtml(m.title)}">${escapeHtml(m.title)}</span>
                  <span class="h-rating">${m.rating}</span>
                </li>
              `).join("") : `<li style="grid-template-columns:1fr;"><span class="h-title" style="color:var(--ink-mute);font-style:italic;">None yet.</span></li>`}
            </ol>
          </div>

          <div class="stat-card st-recent">
            <h3>Recently added</h3>
            <div class="recent-strip">
              ${recent.map(posterCard).join("")}
            </div>
          </div>
        </div>

      </div>
    </section>
  `;

  // hook cards in recent strip
  app.querySelectorAll("[data-id]").forEach(el => {
    el.addEventListener("click", () => openModal(Number(el.dataset.id)));
  });
}

/* ============================================================
   MODAL
   ============================================================ */

function openModal(id) {
  const m = state.movies.find(x => x.id === id);
  if (!m) return;

  const color = ratingColor(m.rating);
  const status = m.status || (m.watched ? "watched" : "unwatched");

  const statusLabel = {
    "watched": "Watched",
    "partial": "In progress",
    "unwatched": "Queued"
  }[status];

  const posterEl = m.poster
    ? `<img src="${escapeHtml(m.poster)}" alt="${escapeHtml(m.title)}" />`
    : `<div class="no-poster">No poster found</div>`;

  const heroBg = m.poster
    ? `<div class="modal-hero-bg" style="background-image:url('${escapeHtml(m.poster)}');"></div>`
    : `<div class="modal-hero-bg" style="background:linear-gradient(135deg, var(--panel-2), var(--panel));"></div>`;

  const matchedLine = m.matched_title && m.matched_title.toLowerCase() !== m.title.toLowerCase()
    ? `<div class="mi-matched">Matched as: ${escapeHtml(m.matched_title)}${m.year ? ` (${m.year})` : ""}</div>`
    : m.year ? `<div class="mi-matched">${escapeHtml(m.year)}</div>` : "";

  document.getElementById("modal-body").innerHTML = `
    <div class="modal-hero">${heroBg}</div>
    <div class="modal-body">
      <div class="modal-poster">${posterEl}</div>
      <div class="modal-info" style="--rating-color:${color};">
        <div class="mi-id">Entry · #${String(m.id).padStart(4, "0")}</div>
        <h2 class="mi-title">${escapeHtml(m.title)}</h2>
        ${matchedLine}
        <div class="mi-stats">
          <div class="mi-stat rating">
            <span class="k">Rating</span>
            <span class="v">${m.rating != null ? `${m.rating}/10` : "Unrated"}</span>
          </div>
          <div class="mi-stat">
            <span class="k">Status</span>
            <span class="v">${statusLabel}</span>
          </div>
          ${m.seasons_watched ? `
            <div class="mi-stat">
              <span class="k">Seen</span>
              <span class="v">${escapeHtml(m.seasons_watched)}</span>
            </div>
          ` : ""}
          <div class="mi-stat">
            <span class="k">Platform</span>
            <span class="v">${escapeHtml(m.platformNorm || "—")}</span>
          </div>
          ${m.year ? `<div class="mi-stat"><span class="k">Year</span><span class="v">${escapeHtml(m.year)}</span></div>` : ""}
        </div>
        <p class="modal-overview">${escapeHtml(m.overview || "No description available.")}</p>
        <p class="modal-verdict">${verdict(m.rating, status)}</p>
      </div>
    </div>
  `;

  const modal = document.getElementById("modal");
  modal.hidden = false;
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const modal = document.getElementById("modal");
  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.querySelectorAll("[data-close]").forEach(el => el.addEventListener("click", closeModal));
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

/* ---------- Footer year ---------- */
document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- Go ---------- */
load();
