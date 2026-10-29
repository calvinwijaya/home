/* =========================================================
   SETTINGS: the only part you normally edit.
   SHEET_ID: the ID from your Google Sheet URL
     https://docs.google.com/spreadsheets/d/<THIS_PART>/edit
   Leave it empty to see sample content.
   ========================================================= */
const CONFIG = {
  SHEET_ID: "1eEYt7IuF3spKOYuDiFUN-BhNFAz6y0a9SRx_KYYn9oQ",
  TABS: { profile: "Profile", research: "Research", projects: "Projects", experience: "Experience" },
  PAGE_SIZE: { research: 8, projects: 6, cv: 4 },   // items per page

  // Badge colours. Any value not listed here gets a colour automatically.
  // Available tones: blue, green, amber, purple, rose, teal, slate
  TONES: {
    "Journal": "blue", "Conference": "green", "Preprint": "amber", "Thesis": "purple",
    "Book chapter": "teal", "Ongoing research": "rose",
    "Web": "blue", "App": "green", "Tool": "amber", "Dataset": "teal", "Game": "rose",
    "In progress": "amber", "Under review": "purple", "Accepted": "green", "Published": "blue"
  }
};

/* ========================================================= */
(() => {
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const truthy = v => /^(true|yes|y|1|x|✓)$/i.test(String(v || "").trim());
  const list = v => String(v || "").split(/[,;]/).map(s => s.trim()).filter(Boolean);
  const store = {
    get(k){ try { return localStorage.getItem(k); } catch { return null; } },
    set(k,v){ try { localStorage.setItem(k,v); } catch {} }
  };

  /* ---------- Colours ---------- */
  const TONE_ORDER = ["blue","green","amber","purple","rose","teal"];
  function tone(label){
    const key = Object.keys(CONFIG.TONES).find(k => k.toLowerCase() === String(label).trim().toLowerCase());
    if (key) return CONFIG.TONES[key];
    let h = 0; for (const ch of String(label)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return TONE_ORDER[h % TONE_ORDER.length];
  }
  const badge = (label, extra="") => label ? `<span class="badge tone-${tone(label)} ${extra}">${esc(label)}</span>` : "";

  /* ---------- Icons ---------- */
  const ICON = {
    email:'<path d="M4 6h16v12H4z"/><path d="m4 7 8 6 8-6"/>',
    github:'<path d="M9 19c-4 1.5-4-2-6-2.5M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
    linkedin:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/>',
    scholar:'<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
    orcid:'<circle cx="12" cy="12" r="9"/><path d="M9 8v.01M9 11v6M13 8h1.5a4.5 4.5 0 0 1 0 9H13z"/>',
    researchgate:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 17V8h2.5a2.2 2.2 0 0 1 0 4.4H8M10.5 12.4 13 17M16.5 10.5a2 2 0 1 0 0 4h1v-2"/>',
    instagram:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5v.01"/>',
    link:'<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
    file:'<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4M9 13h6M9 17h6"/>',
    code:'<path d="m8 8-5 4 5 4M16 8l5 4-5 4"/>',
    copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
    globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    prev:'<path d="m15 6-6 6 6 6"/>', next:'<path d="m9 6 6 6-6 6"/>'
  };
  const icon = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n]||ICON.link}</svg>`;
  const btn = (href, label, ic, cls="") => href ? `<a class="btn ${cls}" href="${esc(href)}" target="_blank" rel="noopener">${icon(ic)}${esc(label)}</a>` : "";

  /* Google Drive share links -> direct image URL */
  function img(url){
    url = String(url || "").trim();
    if (!url) return "";
    const m = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=|thumbnail\?id=)([\w-]+)/);
    return m ? `https://lh3.googleusercontent.com/d/${m[1]}` : url;
  }
  const initialsOf = s => String(s || "?").split(/\s+/).map(w => w[0]).filter(Boolean).slice(0,2).join("").toUpperCase();

  /* ---------- Loading from Google Sheets ---------- */
  function parseCSV(t){
    const rows=[]; let row=[], f="", q=false;
    for (let i=0;i<t.length;i++){
      const c=t[i];
      if (q){ if (c==='"'){ if (t[i+1]==='"'){ f+='"'; i++; } else q=false; } else f+=c; }
      else if (c==='"') q=true;
      else if (c===','){ row.push(f); f=""; }
      else if (c==='\n'){ row.push(f); rows.push(row); row=[]; f=""; }
      else if (c!=='\r') f+=c;
    }
    if (f!=="" || row.length){ row.push(f); rows.push(row); }
    return rows;
  }
  function toObjects(rows){
    if (!rows.length) return [];
    const head = rows[0].map(h => h.trim().toLowerCase().replace(/\s+/g,"_"));
    return rows.slice(1)
      .map(r => Object.fromEntries(head.map((h,i) => [h, (r[i]||"").trim()])))
      .filter(o => Object.values(o).some(v => v) && !truthy(o.hide));
  }
  async function fetchTab(name){
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:csv&headers=1&sheet=${encodeURIComponent(name)}`;
    const r = await fetch(url, {cache:"no-store"});
    if (!r.ok) throw new Error(`${name}: HTTP ${r.status}`);
    const text = await r.text();
    if (/^\s*</.test(text)) throw new Error(`${name}: sheet is not shared publicly`);
    return toObjects(parseCSV(text));
  }
  async function loadSheet(){
    const keys = ["profile","research","projects","experience"];
    const [p, research, projects, experience] = await Promise.all(
      keys.map(k => fetchTab(CONFIG.TABS[k]).catch(e => { console.warn(e); return k === "profile" ? null : []; }))
    );
    if (!p) throw new Error("Profile tab could not be read");
    const profile = {};
    p.forEach(r => { if (r.field) profile[r.field.toLowerCase().replace(/\s+/g,"_")] = r.value; });
    return { profile, research, projects, experience };
  }

  /* ---------- Sample data (shown until SHEET_ID is set) ---------- */
  const SAMPLE = {
    profile:{
      name:"Calvin Wijaya",
      headline:"Researcher and developer building tools that make research easier to use.",
      affiliation:"Universitas Gadjah Mada", location:"Yogyakarta, Indonesia",
      bio:"This is sample text. Everything on this page comes from your Google Sheet.\nAdd a row to the Research or Projects tab and it appears here the next time the page loads.",
      photo:"", email:"calvin.wijaya@ugm.ac.id", cv_link:"#",
      github:"https://github.com/", linkedin:"https://www.linkedin.com/", google_scholar:"https://scholar.google.com/",
      orcid:"https://orcid.org/", researchgate:"https://www.researchgate.net/", instagram:"https://www.instagram.com/", website:""
    },
    research: Array.from({length:11}, (_,i) => {
      const types = ["Journal","Conference","Preprint","Thesis","Ongoing research"];
      const t = types[i % types.length];
      return {
        title:`Sample ${t.toLowerCase()} entry number ${i+1}`, authors: i%2 ? "A. Coauthor, C. Wijaya" : "C. Wijaya, B. Supervisor",
        venue: t==="Ongoing research" ? "In progress" : "Journal or conference name", year:String(2026 - Math.floor(i/3)),
        type:t, status: t==="Ongoing research" ? "In progress" : (i===1 ? "Under review" : ""),
        link:"#", pdf: i%3===0 ? "#" : "", doi: i===0 ? "10.0000/example.2026.001" : "",
        abstract:"Abstracts appear when a visitor opens a paper.", keywords:"keyword one, keyword two"
      };
    }),
    projects: Array.from({length:8}, (_,i) => {
      const kinds = ["Web","App","Tool","Dataset"], tech = ["React, Firebase","Flutter","Python, Streamlit","Python"];
      return { name:`Sample project ${i+1}`, summary:"One-sentence description shown on the card.",
        details:"Longer description shown when the card is opened.", kind:kinds[i%4], tech:tech[i%4],
        image:"", live_link:"#", code_link: i%2 ? "" : "#", year:String(2026 - Math.floor(i/3)) };
    }),
    experience:[
      {section:"Experience", title:"Research assistant", organization:"Sample lab", start:"2025", end:"Present", location:"Yogyakarta", description:"What you did, in a sentence or two."},
      {section:"Experience", title:"Software engineering intern", organization:"Sample company", start:"2024", end:"2024", location:"Jakarta"},
      {section:"Experience", title:"Teaching assistant", organization:"Sample department", start:"2023", end:"2024"},
      {section:"Experience", title:"Freelance developer", organization:"Self-employed", start:"2022", end:"2023"},
      {section:"Experience", title:"Student researcher", organization:"Sample lab", start:"2021", end:"2022"},
      {section:"Education", title:"Master's degree, your field", organization:"Universitas Gadjah Mada", start:"2025", end:"Present"},
      {section:"Education", title:"Bachelor's degree, your field", organization:"Universitas Gadjah Mada", start:"2020", end:"2024"},
      {section:"Awards", title:"Sample award or grant", organization:"Awarding body", start:"2025"}
    ]
  };

  /* ---------- Pagination ---------- */
  function pageList(cur, total){
    if (total <= 7) return Array.from({length:total}, (_,i) => i+1);
    const set = new Set([1, total, cur-1, cur, cur+1]);
    const out = []; let last = 0;
    [...set].filter(n => n>=1 && n<=total).sort((a,b)=>a-b).forEach(n => { if (n-last > 1) out.push("…"); out.push(n); last = n; });
    return out;
  }
  function renderPager(el, totalItems, size, page, key){
    const pages = Math.ceil(totalItems / size);
    if (pages <= 1){ el.innerHTML = ""; return; }
    const from = (page-1)*size + 1, to = Math.min(page*size, totalItems);
    el.innerHTML = `
      <button data-key="${key}" data-page="${page-1}" ${page===1?"disabled":""} aria-label="Previous page">${icon("prev")}</button>
      ${pageList(page, pages).map(n => n==="…" ? `<span class="gap">…</span>` :
        `<button data-key="${key}" data-page="${n}" ${n===page?'aria-current="page"':""} aria-label="Page ${n}">${n}</button>`).join("")}
      <button data-key="${key}" data-page="${page+1}" ${page===pages?"disabled":""} aria-label="Next page">${icon("next")}</button>
      <span class="info">${from}–${to} of ${totalItems}</span>`;
  }
  const slice = (arr, page, size) => arr.slice((page-1)*size, page*size);

  /* ---------- Rendering ---------- */
  let DATA;
  const state = { type:"All", q:"", tech:"All", researchPage:1, projectPage:1, cvPages:{} };

  function renderProfile(p){
    const name = p.name || "Your name";
    document.querySelectorAll('[data-bind="name"]').forEach(el => el.textContent = name);
    document.title = name;
    $('[data-bind="headline"]').textContent = p.headline || "";
    $("#where").textContent = [p.affiliation, p.location].filter(Boolean).join(", ");
    $("#bio").innerHTML = String(p.bio||"").split(/\n+/).filter(Boolean).map(t => `<p>${esc(t)}</p>`).join("");

    // Photo: show only the photo. Initials appear only when there is no photo or it fails to load.
    const port = $("#portrait");
    const src = img(p.photo);
    const showInitials = () => { port.innerHTML = `<span class="initials" aria-hidden="true">${esc(initialsOf(name))}</span>`; };
    if (src){
      const current = port.querySelector("img");
      if (!current || current.dataset.src !== src){
        port.innerHTML = "";
        const i = new Image();
        i.alt = `Portrait of ${name}`; i.dataset.src = src; i.referrerPolicy = "no-referrer";
        i.onload = () => i.classList.add("loaded");
        i.onerror = showInitials;
        i.src = src;
        port.append(i);
      }
    } else showInitials();

    $("#profileLinks").innerHTML = [
      p.email && `<a class="btn solid b-email" href="mailto:${esc(p.email)}">${icon("email")}Email me</a>`,
      btn(p.cv_link, "Download CV", "file", "tint b-cv"),
      btn(p.google_scholar, "Google Scholar", "scholar", "tint b-scholar"),
      btn(p.orcid, "ORCID", "orcid", "tint b-orcid"),
      btn(p.researchgate, "ResearchGate", "researchgate", "tint b-researchgate"),
      btn(p.github, "GitHub", "github", "tint b-github"),
      btn(p.linkedin, "LinkedIn", "linkedin", "tint b-linkedin"),
      btn(p.instagram, "Instagram", "instagram", "tint b-instagram"),
      btn(p.website, "Website", "globe", "tint b-website")
    ].filter(Boolean).join("");
    $("#cvLinks").innerHTML = btn(p.cv_link, "Download full CV", "file", "tint b-cv");
    $("#contactText").textContent = p.contact_text ||
      "Have a question about my work, or an idea for a research collaboration or project we could build together? Don't hesitate to email me. I'm always happy to talk.";
    $("#contactLinks").innerHTML = p.email ? `
      <a class="btn solid b-email" href="mailto:${esc(p.email)}">${icon("email")}Email me</a>
      <span class="addr">${esc(p.email)}</span>
      <button class="copy-btn" id="copyEmail" type="button">Copy address</button>` : "";
    $("#copyright").textContent = `© ${new Date().getFullYear()} ${name}`;
  }

  /* "Last updated": read from the last_updated row of the Profile tab */
  function formatUpdated(v){
    v = String(v || "").trim();
    if (!v) return "";
    const d = new Date(v);
    return isNaN(d) ? v : d.toLocaleDateString("en-GB", {day:"numeric", month:"long", year:"numeric"});
  }

  /* ---------- Cats ---------- */
  const fill = c => `style="fill:${c}"`;
  const whiskers = (x, y, dir) => `<path d="M${x} ${y} l${14*dir} -3 M${x} ${y+2.5} l${14*dir} 1.5" style="stroke:var(--whisker)" stroke-width="1" stroke-linecap="round" fill="none"/>`;

  function walkingCat(c){
    return `<svg class="cat" viewBox="0 0 130 84">
      <g class="tail"><path d="M30 44 C17 41 9 30 13 15 C14 10 21 10 20 16 C18 27 24 34 35 37 Z" ${fill(c.body)}/></g>
      <g class="leg a"><rect x="34" y="50" width="9" height="27" rx="4.5" ${fill(c.dark)}/></g>
      <g class="leg b"><rect x="80" y="50" width="9" height="27" rx="4.5" ${fill(c.dark)}/></g>
      <ellipse cx="60" cy="46" rx="32" ry="16" ${fill(c.body)}/>
      ${c.stripes ? `<path d="M48 32 q4 7 0 14 M60 30.5 q4 8 0 15 M72 32 q4 7 0 13" style="stroke:${c.dark}" stroke-width="4" stroke-linecap="round" fill="none"/>` : ""}
      <g class="leg b"><rect x="42" y="52" width="10" height="26" rx="5" ${fill(c.body)}/></g>
      <g class="leg a"><rect x="86" y="52" width="10" height="26" rx="5" ${fill(c.body)}/></g>
      <g class="head">
        <path d="M89 23 L92 6 L103 18 Z" ${fill(c.body)}/><path d="M104 18 L115 6 L117 25 Z" ${fill(c.body)}/>
        <path d="M92.5 18 L93.8 11 L99 16.5 Z" ${fill("var(--cat-pink)")}/><path d="M107 17 L113 11 L114 20 Z" ${fill("var(--cat-pink)")}/>
        <circle cx="104" cy="31" r="16" ${fill(c.body)}/>
        <g class="eyes"><ellipse cx="110" cy="28" rx="2.4" ry="3.2" ${fill("var(--cat-eye)")}/></g>
        <path d="M118 33 l2.6 -1.6 v3.2 z" ${fill("var(--cat-nose)")}/>
        ${whiskers(113, 36, 1)}
      </g>
    </svg>`;
  }

  function sittingCat(c){
    return `<svg class="cat" viewBox="0 0 90 100">
      <g class="tail"><path d="M60 93 C79 93 86 81 82 66 C81 61 75 62 76 67 C79 78 73 86 60 86 Z" ${fill(c.body)}/></g>
      <path d="M25 94 C19 71 25 51 45 46 C65 51 71 71 65 94 Z" ${fill(c.body)}/>
      <path d="M38 92 C36 76 40 63 45 61 C50 63 54 76 52 92 Z" ${fill(c.belly)}/>
      <ellipse cx="37" cy="94" rx="7.5" ry="4" ${fill(c.body)}/><ellipse cx="53" cy="94" rx="7.5" ry="4" ${fill(c.body)}/>
      <path d="M27 31 L29 9 L43 21 Z" ${fill(c.body)}/><path d="M47 21 L61 9 L63 31 Z" ${fill(c.body)}/>
      <path d="M31 25 L32 15 L39 21 Z" ${fill("var(--cat-pink)")}/><path d="M51 21 L58 15 L59 25 Z" ${fill("var(--cat-pink)")}/>
      <circle cx="45" cy="35" r="19" ${fill(c.body)}/>
      <g class="eyes">
        <ellipse cx="37.5" cy="33" rx="4" ry="4.6" ${fill(c.eye)}/><ellipse cx="52.5" cy="33" rx="4" ry="4.6" ${fill(c.eye)}/>
        <ellipse cx="37.5" cy="33" rx="1.3" ry="3.6" ${fill("#1C1A20")}/><ellipse cx="52.5" cy="33" rx="1.3" ry="3.6" ${fill("#1C1A20")}/>
      </g>
      <path d="M43 40 h4 l-2 2.6 z" ${fill("var(--cat-nose)")}/>
      <path d="M45 42.6 q-2.5 3 -5 1 M45 42.6 q2.5 3 5 1" style="stroke:var(--whisker)" stroke-width="1.3" fill="none" stroke-linecap="round"/>
      ${whiskers(33, 41, -1)}${whiskers(57, 41, 1)}
    </svg>`;
  }

  function sleepingCat(){
    return `<svg class="cat" viewBox="0 0 124 70">
      <defs><clipPath id="napClip"><ellipse cx="56" cy="46" rx="40" ry="20"/></clipPath></defs>
      <g class="breath">
        <ellipse cx="56" cy="46" rx="40" ry="20" ${fill("var(--cat-white)")}/>
        <g clip-path="url(#napClip)">
          <ellipse cx="38" cy="32" rx="18" ry="12" ${fill("var(--cat-orange)")}/>
          <ellipse cx="70" cy="30" rx="12" ry="9" ${fill("var(--cat-black)")}/>
        </g>
        <path d="M20 56 C34 68 70 68 86 59" style="stroke:var(--cat-orange)" stroke-width="8" stroke-linecap="round" fill="none"/>
        <path d="M84 36 L86 20 L96 31 Z" ${fill("var(--cat-black)")}/><path d="M99 31 L109 22 L109 39 Z" ${fill("var(--cat-white)")}/>
        <circle cx="95" cy="47" r="15" ${fill("var(--cat-white)")}/>
        <path d="M88 38 a10 9 0 0 1 9 -6 l-3 12 z" ${fill("var(--cat-black)")}/>
        <path d="M94 47 q4 3 8 0" style="stroke:var(--cat-eye)" stroke-width="1.8" stroke-linecap="round" fill="none"/>
        <path d="M107 51 l2.4 -1.4 v2.8 z" ${fill("var(--cat-nose)")}/>
      </g>
      <text class="zz z1" x="104" y="20">z</text><text class="zz z2" x="104" y="20">z</text><text class="zz z3" x="104" y="20">z</text>
    </svg>`;
  }

  function yarn(){
    return `<svg viewBox="0 0 60 40">
      <path d="M0 37 C12 30 18 40 30 34" style="stroke:var(--yarn)" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <g class="yarn-ball">
        <circle cx="44" cy="24" r="14" ${fill("var(--yarn)")}/>
        <path d="M33 17 q11 6 22 0 M31 25 q13 7 26 0 M36 34 q8 -16 16 -20 M40 11 q-4 14 2 26" style="stroke:var(--yarn-l)" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      </g>
    </svg>`;
  }

  const butterfly = `<svg class="bfly" viewBox="0 0 28 22">
      <g class="wing"><path d="M14 11 C8 0 0 2 2 9 C0 15 7 19 14 12 Z" ${fill("var(--wing-a)")}/></g>
      <g class="wing r"><path d="M14 11 C20 0 28 2 26 9 C28 15 21 19 14 12 Z" ${fill("var(--wing-b)")}/></g>
      <rect x="13" y="6" width="2" height="11" rx="1" ${fill("var(--cat-eye)")}/>
    </svg>`;

  function drawCats(){
    const pg = $("#playground"); if (!pg) return;
    pg.innerHTML = `
      <div class="floor"></div>
      <div class="pg sit"><span class="cat-hit">${sittingCat({body:"var(--cat-black)", belly:"var(--cat-black)", eye:"#E9D45A"})}</span></div>
      <div class="pg nap"><span class="cat-hit">${sleepingCat()}</span></div>
      <div class="pg play">
        <div class="butterfly">${butterfly}</div>
        <span class="cat-hit"><div class="kitten">${walkingCat({body:"var(--cat-cream)", dark:"var(--cat-cream-d)"})}</div></span>
      </div>
      <div class="walker"><span class="cat-hit">${walkingCat({body:"var(--cat-orange)", dark:"var(--cat-orange-d)", stripes:true})}</span></div>
      <div class="walker chase">
        <span class="cat-hit" style="display:inline-block; width:66%">${walkingCat({body:"var(--cat-grey)", dark:"var(--cat-grey-d)"})}</span><span style="display:inline-block; width:31%; margin-left:3%">${yarn()}</span>
      </div>`;
    // the kitten pounces in place, so its legs stay still
    pg.querySelectorAll(".kitten .leg").forEach(l => l.style.animation = "none");

    const sounds = ["Meow!", "Mrrp?", "Purr…", "♥", "Nya~", "Mew!"];
    pg.addEventListener("click", e => {
      const hit = e.target.closest(".cat-hit"); if (!hit) return;
      const svg = hit.querySelector("svg");
      svg.classList.remove("hop"); void svg.offsetWidth; svg.classList.add("hop");
      const r = hit.getBoundingClientRect(), pr = pg.getBoundingClientRect();
      const b = document.createElement("span");
      b.className = "bubble";
      b.textContent = hit.closest(".nap") ? "Zzz…" : sounds[Math.floor(Math.random() * sounds.length)];
      b.style.left = (r.left + r.width / 2 - pr.left) + "px";
      b.style.bottom = (pr.bottom - r.top + 6) + "px";
      pg.append(b);
      setTimeout(() => b.remove(), 1500);
    });
  }

  function renderTally(){
    const pub = DATA.research.filter(r => !/ongoing/i.test(r.type)).length;
    const ong = DATA.research.length - pub;
    const pr = DATA.projects.length;
    const parts = [];
    if (pub) parts.push(`<a href="#research">${pub} publication${pub>1?"s":""}</a>`);
    if (ong) parts.push(`<a href="#research">${ong} ongoing project${ong>1?"s":""}</a>`);
    if (pr) parts.push(`<a href="#projects">${pr>1 ? `${pr} apps and websites` : "1 app"}</a>`);
    $("#tally").innerHTML = parts.length ? `So far: ${parts.join(", ").replace(/, ([^,]*)$/, " and $1")}.` : "";
  }

  function highlightAuthor(authors){
    const name = (DATA.profile.name || "").trim();
    if (!name) return esc(authors);
    const last = name.split(/\s+/).pop().replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
    return esc(authors).replace(new RegExp(`([^,;]*\\b${last}\\b[^,;]*)`, "i"), m => ` <strong>${m.trim()}</strong>`).trim();
  }
  function citationText(r){
    if (r.citation) return r.citation;
    const doi = r.doi ? ` https://doi.org/${r.doi.replace(/^https?:\/\/(dx\.)?doi\.org\//,"")}` : "";
    return `${r.authors} (${r.year}). ${r.title}. ${r.venue}.${doi}`;
  }

  function renderResearchChips(){
    const counts = {};
    DATA.research.forEach(r => { const t = r.type || "Other"; counts[t] = (counts[t]||0) + 1; });
    $("#paperChips").innerHTML = ["All", ...Object.keys(counts)].map(t =>
      `<button class="chip ${t==="All" ? "" : "tone-"+tone(t)}" aria-pressed="${state.type===t}" data-type="${esc(t)}">${t==="All" ? "" : '<span class="dot"></span>'}${esc(t)}<span class="n">${t==="All" ? DATA.research.length : counts[t]}</span></button>`
    ).join("");
  }

  function renderResearch(){
    const q = state.q.toLowerCase();
    const rows = DATA.research
      .map((r,i) => ({...r, _i:i}))
      .filter(r => state.type==="All" || (r.type||"Other")===state.type)
      .filter(r => !q || [r.title,r.authors,r.venue,r.keywords,r.abstract,r.year,r.type].join(" ").toLowerCase().includes(q))
      .sort((a,b) => (parseInt(b.year)||0) - (parseInt(a.year)||0) || a._i - b._i);
    const size = CONFIG.PAGE_SIZE.research;
    state.researchPage = Math.min(state.researchPage, Math.max(1, Math.ceil(rows.length/size)));
    $("#paperCount").textContent = rows.length === DATA.research.length ? `${rows.length} total` : `${rows.length} of ${DATA.research.length} match`;
    renderPager($("#paperPager"), rows.length, size, state.researchPage, "research");

    if (!rows.length){
      $("#paperList").innerHTML = DATA.research.length
        ? `<p class="empty">No papers match "${esc(state.q)}". Try another word or choose All.</p>`
        : `<p class="empty">No papers yet. Add a row to the Research tab of your sheet.</p>`;
      return;
    }
    const groups = new Map();
    slice(rows, state.researchPage, size).forEach(r => { const y = r.year || "Undated"; if (!groups.has(y)) groups.set(y, []); groups.get(y).push(r); });
    $("#paperList").innerHTML = [...groups].map(([y, items]) => `
      <div class="year-group">
        <div class="year">${esc(y)}</div>
        <div>${items.map(r => `
          <article class="paper" data-i="${r._i}">
            <button class="paper-toggle" aria-expanded="false" aria-controls="pb${r._i}">
              <div>
                <h3 class="paper-title">${esc(r.title)}</h3>
                ${r.authors ? `<p class="paper-authors">${highlightAuthor(r.authors)}</p>` : ""}
                <p class="paper-venue"><em>${esc(r.venue)}</em>${badge(r.type)}${badge(r.status, "outline")}</p>
              </div>
              <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div class="paper-body" id="pb${r._i}"><div><div class="inner">
              ${r.abstract ? `<p class="abstract">${esc(r.abstract)}</p>` : ""}
              ${list(r.keywords).length ? `<div class="kw">${list(r.keywords).map(k=>`<span>${esc(k)}</span>`).join("")}</div>` : ""}
              <div class="links">
                ${btn(r.link, "Read online", "link")}
                ${btn(r.pdf, "PDF", "file")}
                ${r.doi ? btn(/^http/.test(r.doi) ? r.doi : `https://doi.org/${r.doi}`, "DOI", "link") : ""}
                ${btn(r.code_link, "Code", "code")}
                <button class="btn" data-cite="${r._i}">${icon("copy")}Copy citation</button>
              </div>
            </div></div></div>
          </article>`).join("")}
        </div>
      </div>`).join("");
  }

  function renderProjectChips(){
    const counts = {};
    DATA.projects.forEach(p => [p.kind, ...list(p.tech)].filter(Boolean).forEach(t => counts[t] = (counts[t]||0) + 1));
    const kinds = new Set(DATA.projects.map(p => p.kind).filter(Boolean));
    const tags = ["All", ...Object.keys(counts).sort((a,b) => (kinds.has(b)-kinds.has(a)) || counts[b]-counts[a]).slice(0,14)];
    $("#projectChips").innerHTML = DATA.projects.length > 1 ? tags.map(t => {
      const dot = kinds.has(t) ? `<span class="dot"></span>` : "";
      return `<button class="chip ${kinds.has(t) ? "tone-"+tone(t) : ""}" aria-pressed="${state.tech===t}" data-tech="${esc(t)}">${dot}${esc(t)}</button>`;
    }).join("") : "";
  }

  function thumb(p){
    const src = img(p.image);
    const mono = esc(initialsOf(p.name));
    return src
      ? `<img src="${esc(src)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.outerHTML='<span class=&quot;mono&quot;>${mono}</span>'">`
      : `<span class="mono">${mono}</span>`;
  }

  function renderProjects(){
    const rows = DATA.projects.map((p,i) => ({...p, _i:i}))
      .filter(p => state.tech==="All" || p.kind===state.tech || list(p.tech).includes(state.tech));
    const size = CONFIG.PAGE_SIZE.projects;
    state.projectPage = Math.min(state.projectPage, Math.max(1, Math.ceil(rows.length/size)));
    $("#projectCount").textContent = DATA.projects.length > 1
      ? (rows.length === DATA.projects.length ? `${rows.length} total` : `${rows.length} of ${DATA.projects.length} match`) : "";
    renderPager($("#projectPager"), rows.length, size, state.projectPage, "projects");
    $("#projectGrid").innerHTML = rows.length ? slice(rows, state.projectPage, size).map(p => `
      <button class="project ${p.kind ? "tone-"+tone(p.kind) : ""}" data-p="${p._i}" aria-haspopup="dialog">
        <div class="thumb">${thumb(p)}</div>
        <div class="meta">
          <h3>${esc(p.name)}</h3>
          <p>${esc(p.summary)}</p>
          <div class="foot">${badge(p.kind)}${list(p.tech).slice(0,4).map(t=>`<span class="tech">${esc(t)}</span>`).join("")}</div>
        </div>
      </button>`).join("")
      : `<p class="empty">No apps or websites yet. Add a row to the Projects tab of your sheet.</p>`;
  }

  function openProject(i){
    const p = DATA.projects[i];
    const src = img(p.image);
    $("#dlgContent").innerHTML = `
      ${src ? `<div class="dlg-img"><img src="${esc(src)}" alt="Screenshot of ${esc(p.name)}" referrerpolicy="no-referrer"></div>` : ""}
      <div class="dlg-body">
        <h3 id="dlgTitle">${esc(p.name)}</h3>
        <p class="sub">${badge(p.kind)}${esc(p.year || "")}</p>
        <p class="desc">${esc(p.details || p.summary)}</p>
        ${list(p.tech).length ? `<div class="kw">${list(p.tech).map(t=>`<span>${esc(t)}</span>`).join("")}</div>` : ""}
        <div class="links">${btn(p.live_link, "Open the app", "globe", "primary")}${btn(p.code_link, "View code", "code", "tint b-github")}</div>
      </div>`;
    $("#projectDialog").showModal();
  }

  function renderCV(){
    const groups = new Map();
    DATA.experience.forEach(e => { const s = e.section || "Experience"; if (!groups.has(s)) groups.set(s, []); groups.get(s).push(e); });
    const size = CONFIG.PAGE_SIZE.cv;
    $("#cvGroups").innerHTML = groups.size ? [...groups].map(([s, items], gi) => {
      const pages = Math.ceil(items.length/size);
      const page = state.cvPages[s] = Math.min(state.cvPages[s] || 1, pages);
      return `
      <div class="cv-group" data-group="${esc(s)}"><h3>${esc(s)}</h3><ol class="timeline">${slice(items, page, size).map(e => `
        <li>
          <span class="when">${esc([e.start, e.end].filter(Boolean).join(" – "))}</span>
          <h4>${esc(e.title)}</h4>
          <p class="org">${esc([e.organization, e.location].filter(Boolean).join(", "))}</p>
          ${e.description ? `<p class="d">${esc(e.description)}</p>` : ""}
        </li>`).join("")}</ol>
        <nav class="pager" id="cvPager${gi}" aria-label="${esc(s)} pages"></nav></div>`;
    }).join("")
      : `<p class="empty">Add rows to the Experience tab to build your CV.</p>`;
    [...groups].forEach(([s, items], gi) => renderPager($("#cvPager"+gi), items.length, size, state.cvPages[s], "cv:"+s));
  }

  function renderAll(){
    renderProfile(DATA.profile);
    renderTally();
    renderResearchChips(); renderResearch();
    renderProjectChips(); renderProjects();
    renderCV();
  }

  function toast(msg){
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 1800);
  }

  /* ---------- Events ---------- */
  $("#paperChips").addEventListener("click", e => {
    const b = e.target.closest("[data-type]"); if (!b) return;
    state.type = b.dataset.type; state.researchPage = 1; renderResearchChips(); renderResearch();
  });
  $("#paperSearch").addEventListener("input", e => { state.q = e.target.value.trim(); state.researchPage = 1; renderResearch(); });
  $("#paperList").addEventListener("click", async e => {
    const c = e.target.closest("[data-cite]");
    if (c){
      try { await navigator.clipboard.writeText(citationText(DATA.research[c.dataset.cite])); toast("Citation copied"); }
      catch { toast("Couldn't copy. Select the text manually."); }
      return;
    }
    const t = e.target.closest(".paper-toggle"); if (!t) return;
    const open = t.closest(".paper").classList.toggle("open");
    t.setAttribute("aria-expanded", open);
  });
  $("#projectChips").addEventListener("click", e => {
    const b = e.target.closest("[data-tech]"); if (!b) return;
    state.tech = b.dataset.tech; state.projectPage = 1; renderProjectChips(); renderProjects();
  });
  $("#projectGrid").addEventListener("click", e => { const b = e.target.closest("[data-p]"); if (b) openProject(+b.dataset.p); });
  $("#dlgClose").addEventListener("click", () => $("#projectDialog").close());
  $("#projectDialog").addEventListener("click", e => { if (e.target.id === "projectDialog") e.target.close(); });

  // All pagers share one handler
  document.addEventListener("click", e => {
    const b = e.target.closest(".pager button[data-page]"); if (!b || b.disabled) return;
    const page = +b.dataset.page, key = b.dataset.key;
    if (key === "research"){ state.researchPage = page; renderResearch(); $("#research").scrollIntoView(); }
    else if (key === "projects"){ state.projectPage = page; renderProjects(); $("#projects").scrollIntoView(); }
    else if (key.startsWith("cv:")){
      const group = key.slice(3); state.cvPages[group] = page; renderCV();
      document.querySelector(`.cv-group[data-group="${CSS.escape(group)}"] .pager button[aria-current]`)?.focus({preventScroll:true});
    }
  });

  // Theme
  const root = document.documentElement;
  const saved = store.get("theme"); if (saved) root.dataset.theme = saved;
  $("#themeBtn").addEventListener("click", () => {
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark"; store.set("theme", root.dataset.theme);
  });

  // Top bar: border on scroll + highlight current section
  const nav = $(".nav");
  addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 8), {passive:true});
  const navLinks = [...document.querySelectorAll(".nav nav a")];
  const spy = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
  }), {rootMargin:"-45% 0px -50% 0px"});
  document.querySelectorAll("#home, section[id], footer[id]").forEach(s => spy.observe(s));
  document.querySelectorAll('a[href="#home"]').forEach(a => a.addEventListener("click", e => {
    e.preventDefault(); scrollTo({top:0}); history.replaceState(null, "", location.pathname);
  }));

  /* ---------- Start ---------- */
  $("#contactLinks").addEventListener("click", async e => {
    if (e.target.id !== "copyEmail") return;
    try { await navigator.clipboard.writeText(DATA.profile.email); toast("Email address copied"); }
    catch { toast("Couldn't copy. Select the address manually."); }
  });

  async function boot(){
    drawCats();
    const status = $("#status");
    const showUpdated = () => {
      const when = formatUpdated(DATA.profile.last_updated);
      status.className = "status";
      status.textContent = when ? `Last updated ${when}` : "";
    };
    if (!CONFIG.SHEET_ID){
      DATA = SAMPLE; renderAll();
      status.className = "status demo";
      status.textContent = "Showing sample content. Add your Google Sheet ID at the top of main.js to load your own.";
      return;
    }
    const cacheKey = "portfolio-data:" + CONFIG.SHEET_ID;
    const cached = store.get(cacheKey);
    if (cached){ try { DATA = JSON.parse(cached); renderAll(); showUpdated(); } catch {} }
    try {
      DATA = await loadSheet(); renderAll();
      store.set(cacheKey, JSON.stringify(DATA));
      showUpdated();
    } catch (err){
      console.error(err);
      if (!DATA){ DATA = SAMPLE; renderAll(); }
      status.className = "status demo";
      status.textContent = "The Google Sheet couldn't be read. In Sheets, choose Share and set General access to \"Anyone with the link\", then reload.";
    }
  }
  boot();
})();
