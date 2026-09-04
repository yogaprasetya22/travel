import{a as e,d as t,m as n,n as r,o as i,r as a}from"./app-DdCTUfTk.js";import{t as o}from"./createLucideIcon-ycVISufi.js";import{t as s}from"./arrow-left-BiFicAT9.js";import{t as c}from"./arrow-right-BEY5Tmcr.js";import{t as l}from"./book-open-D6I8J7HN.js";import{t as u}from"./chevron-right-BCV5cKeZ.js";import{t as d}from"./compass-cuHkc8JX.js";import{t as f}from"./house-_fSpSqSp.js";import{t as p}from"./layers-Jh2w0gWj.js";import{n as m,r as h,t as g}from"./sun-DlCl-0AI.js";import{t as _}from"./search-FikeoQoC.js";import{t as v}from"./shield-check-_m_d1cth.js";import{t as y}from"./sparkles-BwPm1Ii1.js";import{t as b}from"./user-check-C5x6azd8.js";import{t as x}from"./users-D1omn0FV.js";import{t as S}from"./x-C09WPSy9.js";var C=o(`briefcase`,[[`path`,{d:`M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16`,key:`jecpp`}],[`rect`,{width:`20`,height:`14`,x:`2`,y:`6`,rx:`2`,key:`i6l2r4`}]]),w=o(`menu`,[[`path`,{d:`M4 5h16`,key:`1tepv9`}],[`path`,{d:`M4 12h16`,key:`1lakjw`}],[`path`,{d:`M4 19h16`,key:`1djgab`}]]),T=n(t(),1),E=a();function D({tenant:t,currentRole:n,currentSlug:a,navigation:o,activeDoc:D,isAuthenticated:O}){let[k,A]=(0,T.useState)(``),[j,M]=(0,T.useState)(!1),[N,P]=(0,T.useState)(null),F=(0,T.useMemo)(()=>n===`portal`?[]:o[n]||[],[n,o]),I=(0,T.useMemo)(()=>{let e=F.filter(e=>!k.trim()||e.title.toLowerCase().includes(k.toLowerCase())||e.category.toLowerCase().includes(k.toLowerCase())),t={};return e.forEach(e=>{let n=e.category||`Modul Panduan`;t[n]||(t[n]=[]),t[n].push(e)}),t},[F,k]),{prevDoc:L,nextDoc:R}=(0,T.useMemo)(()=>{let e=F.findIndex(e=>e.slug===a);return e===-1?{prevDoc:null,nextDoc:null}:{prevDoc:e>0?F[e-1]:null,nextDoc:e<F.length-1?F[e+1]:null}},[F,a]);(0,T.useEffect)(()=>{let e=e=>{let t=e.target;if(t&&t.tagName===`IMG`){let n=t;n.src&&(n.src.includes(`/docs/assets/`)||n.src.includes(`screenshots`))&&(e.preventDefault(),P(n.src))}},t=document.getElementById(`docs-body-content`);return t&&t.addEventListener(`click`,e),()=>{t&&t.removeEventListener(`click`,e)}},[D]);let z=t?.nama_travel||`Hajj & Umroh Travel`,{theme:B,setTheme:V}=r();return(0,E.jsxs)(`div`,{className:`min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-primary/20 selection:text-primary`,children:[(0,E.jsx)(e,{title:`${D?.title||`Buku Panduan`} - ${z} Docs`}),(0,E.jsx)(`style`,{children:`
                .docs-rendered-markdown h1 {
                    font-size: 1.75rem;
                    font-weight: 800;
                    letter-spacing: -0.025em;
                    color: var(--foreground);
                    padding-bottom: 0.75rem;
                    margin-bottom: 1.5rem;
                    border-bottom: 1px solid var(--border);
                }
                .docs-rendered-markdown h2 {
                    font-size: 1.35rem;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                    color: var(--foreground);
                    margin-top: 2.25rem;
                    margin-bottom: 0.85rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .docs-rendered-markdown h3 {
                    font-size: 1.05rem;
                    font-weight: 600;
                    color: var(--foreground);
                    margin-top: 1.5rem;
                    margin-bottom: 0.6rem;
                }
                .docs-rendered-markdown p {
                    font-size: 0.875rem;
                    line-height: 1.75;
                    color: var(--muted-foreground);
                    margin-bottom: 1rem;
                }
                .docs-rendered-markdown blockquote {
                    border-left: 4px solid var(--primary);
                    background: rgba(var(--primary-rgb, 111, 78, 55), 0.08);
                    border-radius: 0 0.75rem 0.75rem 0;
                    padding: 0.85rem 1.25rem;
                    margin: 1.25rem 0;
                    color: var(--foreground);
                    font-size: 0.85rem;
                }
                .docs-rendered-markdown blockquote p {
                    margin-bottom: 0.35rem;
                    color: var(--foreground);
                }
                .docs-rendered-markdown blockquote p:last-child {
                    margin-bottom: 0;
                }
                .docs-rendered-markdown ul {
                    list-style-type: disc;
                    padding-left: 1.4rem;
                    margin: 0.85rem 0;
                    font-size: 0.875rem;
                    color: var(--muted-foreground);
                }
                .docs-rendered-markdown ol {
                    list-style-type: decimal;
                    padding-left: 1.4rem;
                    margin: 0.85rem 0;
                    font-size: 0.875rem;
                    color: var(--muted-foreground);
                }
                .docs-rendered-markdown li {
                    margin-bottom: 0.4rem;
                    line-height: 1.6;
                }
                .docs-rendered-markdown code {
                    background: var(--muted);
                    color: var(--foreground);
                    padding: 0.15rem 0.4rem;
                    border-radius: 0.375rem;
                    font-size: 0.8rem;
                    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                    border: 1px solid var(--border);
                }
                .docs-rendered-markdown pre {
                    background: var(--muted);
                    padding: 1rem;
                    border-radius: 0.75rem;
                    overflow-x: auto;
                    margin: 1.25rem 0;
                    border: 1px solid var(--border);
                }
                .docs-rendered-markdown table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 1.5rem 0;
                    font-size: 0.8rem;
                    border-radius: 0.75rem;
                    overflow: hidden;
                    border: 1px solid var(--border);
                }
                .docs-rendered-markdown th {
                    background: var(--muted);
                    font-weight: 700;
                    text-align: left;
                    padding: 0.75rem 1rem;
                    border: 1px solid var(--border);
                    color: var(--foreground);
                }
                .docs-rendered-markdown td {
                    padding: 0.75rem 1rem;
                    border: 1px solid var(--border);
                    color: var(--muted-foreground);
                }
                .docs-rendered-markdown tr:hover td {
                    background: rgba(var(--primary-rgb, 111, 78, 55), 0.03);
                }
                .docs-rendered-markdown img {
                    border-radius: 1rem;
                    border: 1px solid var(--border);
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
                    margin: 1.5rem 0;
                    max-width: 100%;
                    cursor: zoom-in;
                    transition: transform 0.2s ease;
                }
                .docs-rendered-markdown img:hover {
                    transform: scale(1.005);
                }
                .docs-rendered-markdown hr {
                    border: 0;
                    border-top: 1px solid var(--border);
                    margin: 2rem 0;
                }
                .docs-rendered-markdown a {
                    color: var(--primary);
                    font-weight: 600;
                    text-decoration: underline;
                    text-underline-offset: 3px;
                }
                .docs-rendered-markdown a:hover {
                    opacity: 0.85;
                }
            `}),(0,E.jsxs)(`header`,{className:`sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md`,children:[(0,E.jsxs)(`div`,{className:`max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4`,children:[(0,E.jsxs)(`div`,{className:`flex items-center gap-3`,children:[(0,E.jsx)(`button`,{type:`button`,onClick:()=>M(!j),className:`lg:hidden p-2 rounded-xl border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-colors`,"aria-label":`Toggle Menu`,children:j?(0,E.jsx)(S,{className:`w-5 h-5`}):(0,E.jsx)(w,{className:`w-5 h-5`})}),(0,E.jsxs)(i,{href:`/docs`,className:`flex items-center gap-2.5 group`,children:[(0,E.jsx)(`div`,{className:`w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-amber-500 flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20 group-hover:scale-105 transition-transform`,children:(0,E.jsx)(l,{className:`w-5 h-5`})}),(0,E.jsxs)(`div`,{className:`flex flex-col`,children:[(0,E.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,E.jsx)(`span`,{className:`font-bold text-sm sm:text-base tracking-tight text-foreground`,children:z}),(0,E.jsx)(`span`,{className:`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20`,children:`Docs`})]}),(0,E.jsx)(`span`,{className:`text-[11px] text-muted-foreground hidden sm:inline-block`,children:`Buku Panduan & Dokumentasi Resmi`})]})]})]}),(0,E.jsxs)(`div`,{className:`hidden md:flex items-center p-1 bg-muted/60 rounded-xl border border-border/60`,children:[(0,E.jsxs)(i,{href:`/docs`,className:`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${n===`portal`?`bg-background text-foreground shadow-sm font-bold`:`text-muted-foreground hover:text-foreground`}`,children:[(0,E.jsx)(d,{className:`w-3.5 h-3.5`}),`Portal Ringkasan`]}),(0,E.jsxs)(i,{href:`/docs/owner`,className:`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${n===`owner`?`bg-background text-foreground shadow-sm font-bold`:`text-muted-foreground hover:text-foreground`}`,children:[(0,E.jsx)(v,{className:`w-3.5 h-3.5 text-amber-500`}),`Owner Travel (Level 1)`]}),(0,E.jsxs)(i,{href:`/docs/agent`,className:`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${n===`agent`?`bg-background text-foreground shadow-sm font-bold`:`text-muted-foreground hover:text-foreground`}`,children:[(0,E.jsx)(x,{className:`w-3.5 h-3.5 text-emerald-500`}),`Mitra Agen (Level 2/3)`]})]}),(0,E.jsxs)(`div`,{className:`flex items-center gap-2.5`,children:[(0,E.jsx)(`button`,{type:`button`,onClick:()=>V(B===`luxury`||B===`dark`?`caramellatte`:`luxury`),className:`p-2 rounded-xl border border-border bg-card hover:bg-accent text-foreground transition-colors`,title:`Ganti Tema Warna`,children:B===`caramellatte`||B===`light`?(0,E.jsx)(m,{className:`w-4 h-4 text-amber-500`}):(0,E.jsx)(g,{className:`w-4 h-4 text-amber-400`})}),O?(0,E.jsxs)(i,{href:`/dashboard`,className:`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all`,children:[(0,E.jsx)(h,{className:`w-3.5 h-3.5`}),(0,E.jsx)(`span`,{className:`hidden sm:inline`,children:`Masuk ke`}),` Dashboard`]}):(0,E.jsxs)(i,{href:`/login`,className:`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all`,children:[(0,E.jsx)(b,{className:`w-3.5 h-3.5`}),`Login Sistem`]})]})]}),(0,E.jsxs)(`div`,{className:`flex md:hidden border-t border-border px-4 py-2 bg-muted/30 overflow-x-auto gap-2`,children:[(0,E.jsx)(i,{href:`/docs`,className:`px-3 py-1 text-xs whitespace-nowrap rounded-lg border font-medium ${n===`portal`?`bg-primary text-primary-foreground border-primary font-bold`:`bg-card text-muted-foreground border-border`}`,children:`Portal`}),(0,E.jsx)(i,{href:`/docs/owner`,className:`px-3 py-1 text-xs whitespace-nowrap rounded-lg border font-medium ${n===`owner`?`bg-primary text-primary-foreground border-primary font-bold`:`bg-card text-muted-foreground border-border`}`,children:`🏢 Panduan Owner`}),(0,E.jsx)(i,{href:`/docs/agent`,className:`px-3 py-1 text-xs whitespace-nowrap rounded-lg border font-medium ${n===`agent`?`bg-primary text-primary-foreground border-primary font-bold`:`bg-card text-muted-foreground border-border`}`,children:`🤝 Panduan Agen`})]})]}),(0,E.jsxs)(`div`,{className:`flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 flex gap-8 py-6`,children:[(0,E.jsxs)(`aside`,{className:`
                        fixed inset-y-0 left-0 z-50 w-72 bg-background border-r border-border p-5
                        transform transition-transform duration-300 ease-in-out
                        lg:static lg:translate-x-0 lg:z-auto lg:p-0 lg:border-r-0 lg:bg-transparent lg:shrink-0
                        ${j?`translate-x-0 shadow-2xl`:`-translate-x-full lg:translate-x-0`}
                    `,children:[(0,E.jsxs)(`div`,{className:`flex items-center justify-between pb-4 lg:hidden border-b border-border mb-4`,children:[(0,E.jsx)(`span`,{className:`font-bold text-sm`,children:`Daftar Modul Panduan`}),(0,E.jsx)(`button`,{type:`button`,onClick:()=>M(!1),className:`p-1.5 rounded-lg hover:bg-accent text-muted-foreground`,children:(0,E.jsx)(S,{className:`w-5 h-5`})})]}),(0,E.jsxs)(`div`,{className:`sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-3 space-y-6`,children:[(0,E.jsxs)(`div`,{className:`relative`,children:[(0,E.jsx)(_,{className:`absolute left-3 top-2.5 w-4 h-4 text-muted-foreground`}),(0,E.jsx)(`input`,{type:`text`,placeholder:`Cari topik atau fitur...`,value:k,onChange:e=>A(e.target.value),className:`w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/60`}),k&&(0,E.jsx)(`button`,{type:`button`,onClick:()=>A(``),className:`absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground text-xs`,children:(0,E.jsx)(S,{className:`w-3.5 h-3.5`})})]}),n===`portal`?(0,E.jsxs)(`div`,{className:`space-y-3`,children:[(0,E.jsx)(`span`,{className:`text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2`,children:`Pilihan Panduan Peran`}),(0,E.jsxs)(`div`,{className:`space-y-1.5`,children:[(0,E.jsxs)(i,{href:`/docs/owner`,className:`flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-xl bg-card hover:bg-accent text-foreground border border-border transition-all group`,children:[(0,E.jsx)(`div`,{className:`w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold`,children:`1`}),(0,E.jsxs)(`div`,{children:[(0,E.jsx)(`div`,{className:`font-bold`,children:`Panduan Owner Travel`}),(0,E.jsx)(`div`,{className:`text-[10px] text-muted-foreground`,children:`12 Modul Operasional & Finansial`})]}),(0,E.jsx)(u,{className:`w-4 h-4 ml-auto text-muted-foreground group-hover:translate-x-0.5 transition-transform`})]}),(0,E.jsxs)(i,{href:`/docs/agent`,className:`flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-xl bg-card hover:bg-accent text-foreground border border-border transition-all group`,children:[(0,E.jsx)(`div`,{className:`w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold`,children:`2`}),(0,E.jsxs)(`div`,{children:[(0,E.jsx)(`div`,{className:`font-bold`,children:`Panduan Mitra Agen`}),(0,E.jsx)(`div`,{className:`text-[10px] text-muted-foreground`,children:`6 Modul Penjualan & Bio Link`})]}),(0,E.jsx)(u,{className:`w-4 h-4 ml-auto text-muted-foreground group-hover:translate-x-0.5 transition-transform`})]})]})]}):(0,E.jsx)(`div`,{className:`space-y-5`,children:Object.entries(I).map(([e,t])=>(0,E.jsxs)(`div`,{className:`space-y-1`,children:[(0,E.jsxs)(`div`,{className:`flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80`,children:[(0,E.jsx)(p,{className:`w-3 h-3 text-primary`}),(0,E.jsx)(`span`,{children:e})]}),(0,E.jsx)(`div`,{className:`space-y-0.5`,children:t.map(e=>{let t=e.slug===a,r=e.order>0?String(e.order).padStart(2,`0`):`★`;return(0,E.jsxs)(i,{href:`/docs/${n}/${e.slug}`,onClick:()=>M(!1),className:`flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg transition-all group ${t?`bg-primary text-primary-foreground font-bold shadow-xs`:`text-muted-foreground hover:bg-muted hover:text-foreground`}`,children:[(0,E.jsx)(`span`,{className:`w-5 h-5 flex items-center justify-center rounded text-[10px] font-mono shrink-0 ${t?`bg-white/20 text-white font-bold`:`bg-muted text-muted-foreground group-hover:bg-card`}`,children:r}),(0,E.jsx)(`span`,{className:`truncate`,children:e.title})]},e.slug)})})]},e))})]})]}),j&&(0,E.jsx)(`div`,{className:`fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-xs`,onClick:()=>M(!1)}),(0,E.jsxs)(`main`,{className:`flex-1 min-w-0 max-w-4xl`,children:[(0,E.jsxs)(`div`,{className:`flex items-center gap-1.5 text-xs text-muted-foreground mb-6 pb-2 border-b border-border/60`,children:[(0,E.jsxs)(i,{href:`/docs`,className:`hover:text-foreground flex items-center gap-1`,children:[(0,E.jsx)(f,{className:`w-3 h-3`}),` Docs`]}),(0,E.jsx)(u,{className:`w-3 h-3 text-muted-foreground/60`}),(0,E.jsx)(i,{href:`/docs/${n}`,className:`hover:text-foreground capitalize font-medium`,children:n===`owner`?`Owner Travel`:n===`agent`?`Mitra Agen`:`Portal`}),D&&D.slug!==`overview`&&(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)(u,{className:`w-3 h-3 text-muted-foreground/60`}),(0,E.jsx)(`span`,{className:`text-foreground font-semibold truncate max-w-[240px] sm:max-w-none`,children:D.title})]})]}),D?(0,E.jsxs)(`div`,{className:`space-y-6`,children:[(0,E.jsx)(`article`,{id:`docs-body-content`,className:`docs-rendered-markdown`,dangerouslySetInnerHTML:{__html:D.html}}),(0,E.jsxs)(`div`,{className:`pt-8 mt-10 border-t border-border flex items-center justify-between gap-4`,children:[L?(0,E.jsxs)(i,{href:`/docs/${n}/${L.slug}`,className:`flex flex-col gap-1 p-3.5 rounded-xl border border-border hover:border-primary hover:bg-card transition-all max-w-[45%]`,children:[(0,E.jsxs)(`span`,{className:`text-[11px] text-muted-foreground flex items-center gap-1`,children:[(0,E.jsx)(s,{className:`w-3 h-3`}),` Sebelumnya`]}),(0,E.jsx)(`span`,{className:`text-xs font-bold text-foreground truncate`,children:L.title})]}):(0,E.jsx)(`div`,{}),R&&(0,E.jsxs)(i,{href:`/docs/${n}/${R.slug}`,className:`flex flex-col items-end gap-1 p-3.5 rounded-xl border border-border hover:border-primary hover:bg-card transition-all max-w-[45%] text-right`,children:[(0,E.jsxs)(`span`,{className:`text-[11px] text-muted-foreground flex items-center gap-1`,children:[`Selanjutnya `,(0,E.jsx)(c,{className:`w-3 h-3`})]}),(0,E.jsx)(`span`,{className:`text-xs font-bold text-foreground truncate`,children:R.title})]})]})]}):(0,E.jsxs)(`div`,{className:`p-12 text-center border rounded-2xl bg-card border-border space-y-3`,children:[(0,E.jsx)(l,{className:`w-12 h-12 text-muted-foreground mx-auto`}),(0,E.jsx)(`h3`,{className:`font-bold text-base`,children:`Dokumentasi Tidak Ditemukan`}),(0,E.jsx)(`p`,{className:`text-xs text-muted-foreground max-w-md mx-auto`,children:`Halaman panduan yang Anda cari tidak tersedia. Silakan pilih modul dari menu di sebelah kiri.`})]})]}),D&&D.headings.length>0&&(0,E.jsx)(`aside`,{className:`hidden xl:block w-64 shrink-0`,children:(0,E.jsxs)(`div`,{className:`sticky top-24 space-y-4`,children:[(0,E.jsxs)(`div`,{className:`p-4 rounded-2xl bg-card border border-border shadow-xs space-y-3`,children:[(0,E.jsxs)(`span`,{className:`text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5`,children:[(0,E.jsx)(y,{className:`w-3.5 h-3.5 text-primary`}),`Daftar Isi Halaman`]}),(0,E.jsx)(`nav`,{className:`space-y-1 text-xs`,children:D.headings.map((e,t)=>(0,E.jsx)(`a`,{href:`#${e.anchor}`,className:`block py-1 text-muted-foreground hover:text-foreground transition-colors truncate ${e.level===3?`pl-3 text-[11px]`:`font-medium`}`,children:e.title},t))})]}),(0,E.jsxs)(`div`,{className:`p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-amber-500/5 to-transparent border border-primary/20 space-y-2`,children:[(0,E.jsxs)(`div`,{className:`flex items-center gap-2 text-primary font-bold text-xs`,children:[(0,E.jsx)(C,{className:`w-4 h-4`}),(0,E.jsx)(`span`,{children:`Butuh Bantuan?`})]}),(0,E.jsx)(`p`,{className:`text-[11px] text-muted-foreground leading-relaxed`,children:`Hubungi tim teknis atau administrator travel jika ada modul yang belum dipahami.`})]})]})})]}),N&&(0,E.jsx)(`div`,{className:`fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4`,onClick:()=>P(null),children:(0,E.jsxs)(`div`,{className:`relative max-w-5xl max-h-[90vh] bg-card rounded-2xl overflow-hidden border border-border shadow-2xl p-2`,children:[(0,E.jsx)(`button`,{type:`button`,onClick:()=>P(null),className:`absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors`,children:(0,E.jsx)(S,{className:`w-5 h-5`})}),(0,E.jsx)(`img`,{src:N,alt:`Screenshot Zoom`,className:`max-h-[85vh] w-auto mx-auto object-contain rounded-xl`})]})})]})}export{D as default};