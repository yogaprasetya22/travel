import{a as e,d as t,m as n,n as r,o as i,r as a,u as o}from"./app-B0cgEzQC.js";import{C as ee,E as te,S as ne,_ as s,a as c,b as l,d as u,f as d,g as f,h as p,i as re,m,n as ie,o as ae,p as h,r as g,t as oe,u as se,v as _,w as v,x as y,y as b}from"./PageLayout-CTLZ1hAK.js";import{t as x}from"./createLucideIcon-Cv3Isi00.js";import{t as S}from"./arrow-left-Bw2x55z-.js";import{t as C}from"./arrow-right-pcGFhupp.js";import{t as w}from"./book-open-ws7kfjne.js";import{t as T}from"./chevron-right-BhHVIek4.js";import{n as E,t as D}from"./log-in-Dmmznc-Q.js";import{t as ce}from"./external-link-BQd6ZiPN.js";import{t as le}from"./layers-CAzhyg5E.js";import{t as O}from"./search-BrJNM7LN.js";import{t as k}from"./shield-check-x0bewxOS.js";import{t as A}from"./users-CWD4V8hj.js";import{Xt as j}from"./useScrollLock-BWMMIi2g.js";var M=x(`briefcase`,[[`path`,{d:`M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16`,key:`jecpp`}],[`rect`,{width:`20`,height:`14`,x:`2`,y:`6`,rx:`2`,key:`i6l2r4`}]]),N=x(`list-tree`,[[`path`,{d:`M8 5h13`,key:`1pao27`}],[`path`,{d:`M13 12h8`,key:`h98zly`}],[`path`,{d:`M13 19h8`,key:`c3s6r1`}],[`path`,{d:`M3 10a2 2 0 0 0 2 2h3`,key:`1npucw`}],[`path`,{d:`M3 5v12a2 2 0 0 0 2 2h3`,key:`x1gjn2`}]]),P=n(t(),1),F=n(o(),1),I=a();function L({headings:e}){let[t,n]=(0,P.useState)(``),r=(0,P.useMemo)(()=>{let t=[],n=null;return e.forEach(e=>{e.level===2?(n={h2:e,children:[]},t.push(n)):e.level===3&&(n?n.children.push(e):t.push({h2:e,children:[]}))}),t},[e]);(0,P.useEffect)(()=>{if(!e.length)return;let t=new IntersectionObserver(e=>{e.forEach(e=>{e.isIntersecting&&n(e.target.id)})},{rootMargin:`-80px 0px -60% 0px`,threshold:.1});return e.forEach(e=>{let n=document.getElementById(e.anchor);n&&t.observe(n)}),()=>t.disconnect()},[e]);let i=e=>{let t=document.getElementById(e);t&&(t.scrollIntoView({behavior:`smooth`,block:`start`}),n(e),history.replaceState(null,``,`#${e}`))};return e.length?(0,I.jsxs)(`div`,{className:`space-y-4`,children:[(0,I.jsxs)(`div`,{className:`p-4 rounded-2xl bg-card border border-border shadow-xs space-y-3`,children:[(0,I.jsxs)(`div`,{className:`flex items-center justify-between`,children:[(0,I.jsxs)(`span`,{className:`text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2`,children:[(0,I.jsx)(N,{className:`w-4 h-4 text-primary`}),`Daftar Isi Halaman`]}),(0,I.jsxs)(`span`,{className:`text-[10px] px-2 py-0.5 rounded-full font-bold bg-primary/10 text-primary border border-primary/20`,children:[r.length,` Bagian`]})]}),(0,I.jsx)(`div`,{className:`space-y-2 pt-1`,children:r.map((e,n)=>{let r=t===e.h2.anchor,a=e.children.some(e=>e.anchor===t);return(0,I.jsxs)(`div`,{className:`rounded-xl border transition-all p-2.5 space-y-1.5 ${r||a?`bg-primary/5 border-primary/30 shadow-xs`:`bg-muted/30 border-transparent hover:bg-muted/60 hover:border-border`}`,children:[(0,I.jsxs)(`button`,{type:`button`,onClick:()=>i(e.h2.anchor),className:`w-full text-left flex items-start gap-2 text-xs font-semibold transition-colors ${r?`text-primary font-bold`:`text-foreground hover:text-primary`}`,children:[(0,I.jsx)(`span`,{className:`flex items-center justify-center size-4 rounded text-[9px] font-mono shrink-0 mt-0.5 ${r?`bg-primary text-primary-foreground font-bold`:`bg-muted text-muted-foreground`}`,children:n+1}),(0,I.jsx)(`span`,{className:`line-clamp-2 leading-tight`,children:e.h2.title})]}),e.children.length>0&&(0,I.jsx)(`div`,{className:`pl-6 space-y-1 pt-1 border-l border-border/80 ml-2`,children:e.children.map(e=>{let n=t===e.anchor;return(0,I.jsxs)(`button`,{type:`button`,onClick:()=>i(e.anchor),className:`w-full text-left block text-[11px] py-0.5 truncate transition-all ${n?`text-primary font-bold translate-x-1`:`text-muted-foreground hover:text-foreground hover:translate-x-0.5`}`,children:[`• `,e.title]},e.anchor)})})]},e.h2.anchor||n)})})]}),(0,I.jsxs)(`div`,{className:`p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-amber-500/5 to-transparent border border-primary/20 space-y-2`,children:[(0,I.jsxs)(`div`,{className:`flex items-center gap-2 text-primary font-bold text-xs`,children:[(0,I.jsx)(M,{className:`w-4 h-4`}),(0,I.jsx)(`span`,{children:`Pusat Bantuan Travel`})]}),(0,I.jsx)(`p`,{className:`text-[11px] text-muted-foreground leading-relaxed`,children:`Butuh panduan teknis operasional lebih lanjut? Hubungi administrator atau supervisor travel Anda.`})]})]}):null}function R({tenant:t,currentRole:n,currentSlug:a,navigation:o,activeDoc:x,isAuthenticated:M}){let[N,R]=(0,P.useState)(``),[z,B]=(0,P.useState)(null),{theme:ue,setTheme:V,currentThemeDef:H}=r(),U=()=>{H?.type===`dark`?V(`caramellatte`):V(`luxury`)},W=(0,P.useMemo)(()=>n===`portal`?[]:o[n]||[],[n,o]),G=(0,P.useMemo)(()=>{let e=W.filter(e=>!N.trim()||e.title.toLowerCase().includes(N.toLowerCase())||e.category.toLowerCase().includes(N.toLowerCase())),t={};return e.forEach(e=>{let n=e.category||`Modul Panduan`;t[n]||(t[n]=[]),t[n].push(e)}),t},[W,N]),{prevDoc:K,nextDoc:q}=(0,P.useMemo)(()=>{let e=W.findIndex(e=>e.slug===a);return e===-1?{prevDoc:null,nextDoc:null}:{prevDoc:e>0?W[e-1]:null,nextDoc:e<W.length-1?W[e+1]:null}},[W,a]);(0,P.useEffect)(()=>{let e=e=>{let t=e.target;if(t&&t.tagName===`IMG`){let n=t;n.src&&(n.src.includes(`/docs/assets/`)||n.src.includes(`screenshots`))&&(e.preventDefault(),B(n.src))}},t=document.getElementById(`docs-body-content`);return t&&t.addEventListener(`click`,e),()=>{t&&t.removeEventListener(`click`,e)}},[x]);let J=t?.nama_travel||`Hajj & Umroh Travel`,Y=x?x.title:`Buku Panduan`,X=n===`owner`?`Owner Travel (Level 1)`:n===`agent`?`Mitra Agen (Level 2/3)`:`Portal Dokumentasi`,Z=(0,I.jsx)(`style`,{children:`
            .docs-rendered-markdown h1 {
                font-size: 1.65rem;
                font-weight: 800;
                letter-spacing: -0.025em;
                color: var(--foreground);
                padding-bottom: 0.75rem;
                margin-bottom: 1.25rem;
                border-bottom: 1px solid var(--border);
            }
            .docs-rendered-markdown h2 {
                font-size: 1.25rem;
                font-weight: 700;
                letter-spacing: -0.02em;
                color: var(--foreground);
                margin-top: 2rem;
                margin-bottom: 0.75rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            .docs-rendered-markdown h3 {
                font-size: 1rem;
                font-weight: 600;
                color: var(--foreground);
                margin-top: 1.25rem;
                margin-bottom: 0.5rem;
            }
            .docs-rendered-markdown p {
                font-size: 0.875rem;
                line-height: 1.7;
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
            .docs-rendered-markdown img[src*="/light/"],
            .docs-rendered-markdown img[src*="_light.webp"],
            .docs-rendered-markdown img[src*="#gh-light-mode-only"] {
                display: block;
            }
            .dark .docs-rendered-markdown img[src*="/light/"],
            .dark .docs-rendered-markdown img[src*="_light.webp"],
            .dark .docs-rendered-markdown img[src*="#gh-light-mode-only"] {
                display: none !important;
            }

            .docs-rendered-markdown img[src*="/dark/"],
            .docs-rendered-markdown img[src*="_dark.webp"],
            .docs-rendered-markdown img[src*="#gh-dark-mode-only"] {
                display: none !important;
            }
            .dark .docs-rendered-markdown img[src*="/dark/"],
            .dark .docs-rendered-markdown img[src*="_dark.webp"],
            .dark .docs-rendered-markdown img[src*="#gh-dark-mode-only"] {
                display: block !important;
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
        `});(0,P.useEffect)(()=>{let e=e=>{e.key===`Escape`&&B(null)};return z&&window.addEventListener(`keydown`,e),()=>window.removeEventListener(`keydown`,e)},[z]);let Q=z&&typeof document<`u`?(0,F.createPortal)((0,I.jsxs)(`div`,{className:`fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-between p-4 sm:p-6 select-none animate-in fade-in duration-200`,onClick:()=>B(null),children:[(0,I.jsxs)(`div`,{className:`w-full flex items-center justify-between z-10 max-w-7xl px-2 py-1`,onClick:e=>e.stopPropagation(),children:[(0,I.jsxs)(`div`,{className:`text-xs text-neutral-400 font-medium flex items-center gap-2`,children:[(0,I.jsx)(`span`,{className:`inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse`}),(0,I.jsx)(`span`,{children:`Pratinjau Gambar Dokumentasi`})]}),(0,I.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,I.jsxs)(`a`,{href:z,target:`_blank`,rel:`noreferrer`,className:`px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition flex items-center gap-1.5`,children:[(0,I.jsx)(ce,{className:`w-3.5 h-3.5`}),(0,I.jsx)(`span`,{children:`Buka Resolusi Penuh`})]}),(0,I.jsx)(`button`,{type:`button`,onClick:()=>B(null),className:`p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white hover:text-rose-400 transition`,title:`Tutup (Esc)`,children:(0,I.jsx)(j,{className:`w-5 h-5`})})]})]}),(0,I.jsx)(`div`,{className:`flex-1 w-full flex items-center justify-center p-2 min-h-0`,onClick:e=>e.stopPropagation(),children:(0,I.jsx)(`img`,{src:z,alt:`Screenshot Zoom`,className:`max-h-[85vh] max-w-[95vw] w-auto h-auto object-contain rounded-xl shadow-2xl border border-white/10`})}),(0,I.jsxs)(`div`,{className:`text-[11px] text-neutral-400/80 tracking-wide`,children:[`Klik area luar atau tekan `,(0,I.jsx)(`kbd`,{className:`px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]`,children:`Esc`}),` untuk menutup`]})]}),document.body):null,$=(0,I.jsxs)(`div`,{className:`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border shadow-xs`,children:[(0,I.jsxs)(`div`,{className:`flex items-center gap-3`,children:[(0,I.jsx)(`div`,{className:`w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-amber-500 flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20`,children:(0,I.jsx)(w,{className:`w-5 h-5`})}),(0,I.jsxs)(`div`,{children:[(0,I.jsx)(`h2`,{className:`text-base font-bold text-foreground`,children:`Pusat Panduan & Dokumentasi`}),(0,I.jsx)(`p`,{className:`text-xs text-muted-foreground`,children:`Petunjuk operasional sistem travel umroh & haji lengkap dengan CRUD matrix`})]})]}),(0,I.jsxs)(`div`,{className:`flex items-center p-1 bg-muted/60 rounded-xl border border-border/60 self-start sm:self-auto overflow-x-auto max-w-full`,children:[(0,I.jsxs)(i,{href:`/docs`,className:`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${n===`portal`?`bg-background text-foreground shadow-xs font-bold`:`text-muted-foreground hover:text-foreground`}`,children:[(0,I.jsx)(E,{className:`w-3.5 h-3.5`}),`Portal Ringkasan`]}),(0,I.jsxs)(i,{href:`/docs/owner`,className:`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${n===`owner`?`bg-background text-foreground shadow-xs font-bold`:`text-muted-foreground hover:text-foreground`}`,children:[(0,I.jsx)(k,{className:`w-3.5 h-3.5 text-amber-500`}),`Owner Travel (Level 1)`]}),(0,I.jsxs)(i,{href:`/docs/agent`,className:`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${n===`agent`?`bg-background text-foreground shadow-xs font-bold`:`text-muted-foreground hover:text-foreground`}`,children:[(0,I.jsx)(A,{className:`w-3.5 h-3.5 text-emerald-500`}),`Mitra Agen (Level 2/3)`]})]})]});return M?(0,I.jsxs)(oe,{title:`${Y} - Buku Panduan`,breadcrumbParent:`Buku Panduan`,breadcrumbPage:X,contentClass:`p-4 sm:p-6 md:p-8 space-y-6`,children:[Z,$,(0,I.jsxs)(`div`,{className:`flex flex-col lg:flex-row gap-6 items-start`,children:[(0,I.jsxs)(`div`,{className:`w-full lg:w-72 shrink-0 bg-card border border-border rounded-2xl p-4 space-y-5 shadow-xs sticky top-4`,children:[(0,I.jsxs)(`div`,{className:`relative`,children:[(0,I.jsx)(O,{className:`absolute left-3 top-2.5 w-4 h-4 text-muted-foreground`}),(0,I.jsx)(`input`,{type:`text`,placeholder:`Cari modul atau topik...`,value:N,onChange:e=>R(e.target.value),className:`w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/60`}),N&&(0,I.jsx)(`button`,{type:`button`,onClick:()=>R(``),className:`absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground text-xs`,children:(0,I.jsx)(j,{className:`w-3.5 h-3.5`})})]}),n===`portal`?(0,I.jsxs)(`div`,{className:`space-y-3`,children:[(0,I.jsx)(`span`,{className:`text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1`,children:`Pilihan Panduan Peran`}),(0,I.jsxs)(`div`,{className:`space-y-1.5`,children:[(0,I.jsxs)(i,{href:`/docs/owner`,className:`flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-xl bg-background hover:bg-muted text-foreground border border-border transition-all group`,children:[(0,I.jsx)(`div`,{className:`w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold`,children:`1`}),(0,I.jsxs)(`div`,{children:[(0,I.jsx)(`div`,{className:`font-bold`,children:`Panduan Owner Travel`}),(0,I.jsx)(`div`,{className:`text-[10px] text-muted-foreground`,children:`12 Modul Operasional & Finansial`})]}),(0,I.jsx)(T,{className:`w-4 h-4 ml-auto text-muted-foreground group-hover:translate-x-0.5 transition-transform`})]}),(0,I.jsxs)(i,{href:`/docs/agent`,className:`flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-xl bg-background hover:bg-muted text-foreground border border-border transition-all group`,children:[(0,I.jsx)(`div`,{className:`w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold`,children:`2`}),(0,I.jsxs)(`div`,{children:[(0,I.jsx)(`div`,{className:`font-bold`,children:`Panduan Mitra Agen`}),(0,I.jsx)(`div`,{className:`text-[10px] text-muted-foreground`,children:`6 Modul Penjualan & Bio Link`})]}),(0,I.jsx)(T,{className:`w-4 h-4 ml-auto text-muted-foreground group-hover:translate-x-0.5 transition-transform`})]})]})]}):(0,I.jsx)(`div`,{className:`space-y-5 max-h-[calc(100vh-20rem)] overflow-y-auto pr-1 no-scrollbar`,children:Object.entries(G).map(([e,t])=>(0,I.jsxs)(`div`,{className:`space-y-1`,children:[(0,I.jsxs)(`div`,{className:`flex items-center gap-1.5 px-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground`,children:[(0,I.jsx)(le,{className:`w-3 h-3 text-primary`}),(0,I.jsx)(`span`,{children:e})]}),(0,I.jsx)(`div`,{className:`space-y-0.5`,children:t.map(e=>{let t=e.slug===a,r=e.order>0?String(e.order).padStart(2,`0`):`★`;return(0,I.jsx)(i,{href:`/docs/${n}/${e.slug}`,className:`flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg transition-all group ${t?`bg-primary text-primary-foreground font-bold shadow-xs`:`text-muted-foreground hover:bg-muted hover:text-foreground`}`,children:(0,I.jsx)(`span`,{className:`w-4 h-4 flex items-center justify-center rounded text-[12px] font-mono shrink-0 ${t?`bg-primary text-primary-foreground font-bold`:`bg-muted text-muted-foreground`}`,children:r})},e.slug)})})]},e))})]}),(0,I.jsx)(`div`,{className:`flex-1 min-w-0 bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs`,children:x?(0,I.jsxs)(`div`,{className:`space-y-6`,children:[(0,I.jsx)(`article`,{id:`docs-body-content`,className:`docs-rendered-markdown`,dangerouslySetInnerHTML:{__html:x.html}}),(0,I.jsxs)(`div`,{className:`pt-8 mt-10 border-t border-border flex items-center justify-between gap-4`,children:[K?(0,I.jsxs)(i,{href:`/docs/${n}/${K.slug}`,className:`flex flex-col gap-1 p-3.5 rounded-xl border border-border hover:border-primary hover:bg-muted/40 transition-all max-w-[45%]`,children:[(0,I.jsxs)(`span`,{className:`text-[11px] text-muted-foreground flex items-center gap-1`,children:[(0,I.jsx)(S,{className:`w-3 h-3`}),` Sebelumnya`]}),(0,I.jsx)(`span`,{className:`text-xs font-bold text-foreground truncate`,children:K.title})]}):(0,I.jsx)(`div`,{}),q&&(0,I.jsxs)(i,{href:`/docs/${n}/${q.slug}`,className:`flex flex-col items-end gap-1 p-3.5 rounded-xl border border-border hover:border-primary hover:bg-muted/40 transition-all max-w-[45%] text-right`,children:[(0,I.jsxs)(`span`,{className:`text-[11px] text-muted-foreground flex items-center gap-1`,children:[`Selanjutnya `,(0,I.jsx)(C,{className:`w-3 h-3`})]}),(0,I.jsx)(`span`,{className:`text-xs font-bold text-foreground truncate`,children:q.title})]})]})]}):(0,I.jsxs)(`div`,{className:`p-12 text-center space-y-3`,children:[(0,I.jsx)(w,{className:`w-12 h-12 text-muted-foreground mx-auto`}),(0,I.jsx)(`h3`,{className:`font-bold text-base`,children:`Dokumentasi Tidak Ditemukan`}),(0,I.jsx)(`p`,{className:`text-xs text-muted-foreground max-w-md mx-auto`,children:`Halaman panduan yang Anda cari tidak tersedia. Silakan pilih modul dari menu di sebelah kiri.`})]})}),x&&x.headings.length>0&&(0,I.jsx)(`div`,{className:`hidden 2xl:block w-72 shrink-0 sticky top-4`,children:(0,I.jsx)(L,{headings:x.headings})})]}),Q]}):(0,I.jsxs)(l,{children:[(0,I.jsx)(e,{title:`${Y} - ${J} Docs`}),Z,(0,I.jsxs)(se,{collapsible:`icon`,children:[(0,I.jsx)(p,{className:`border-b border-sidebar-border px-4 py-3`,children:(0,I.jsxs)(i,{href:`/docs`,className:`flex items-center gap-2.5`,children:[(0,I.jsx)(`div`,{className:`flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground`,children:(0,I.jsx)(w,{className:`size-4`})}),(0,I.jsxs)(`div`,{className:`grid flex-1 text-left text-sm leading-tight`,children:[(0,I.jsx)(`span`,{className:`truncate font-semibold`,children:J}),(0,I.jsx)(`span`,{className:`truncate text-xs text-muted-foreground`,children:`Portal Panduan Resmi`})]})]})}),(0,I.jsxs)(u,{className:`px-2 py-3 space-y-4`,children:[(0,I.jsxs)(`div`,{className:`relative px-2`,children:[(0,I.jsx)(O,{className:`absolute left-4 top-2.5 w-3.5 h-3.5 text-muted-foreground`}),(0,I.jsx)(`input`,{type:`text`,placeholder:`Cari modul...`,value:N,onChange:e=>R(e.target.value),className:`w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg bg-sidebar-accent/50 border border-sidebar-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/60`})]}),n===`portal`?(0,I.jsxs)(h,{children:[(0,I.jsx)(m,{children:`Pilih Peran Panduan`}),(0,I.jsxs)(s,{children:[(0,I.jsx)(b,{children:(0,I.jsx)(_,{render:(0,I.jsxs)(i,{href:`/docs/owner`,className:`flex items-center gap-2`,children:[(0,I.jsx)(k,{className:`size-4 text-amber-500`}),(0,I.jsx)(`span`,{children:`Panduan Owner (Level 1)`})]})})}),(0,I.jsx)(b,{children:(0,I.jsx)(_,{render:(0,I.jsxs)(i,{href:`/docs/agent`,className:`flex items-center gap-2`,children:[(0,I.jsx)(A,{className:`size-4 text-emerald-500`}),(0,I.jsx)(`span`,{children:`Panduan Agen (Level 2/3)`})]})})})]})]}):Object.entries(G).map(([e,t])=>(0,I.jsxs)(h,{className:`p-0`,children:[(0,I.jsx)(m,{className:`text-[10px] font-bold uppercase tracking-wider`,children:e}),(0,I.jsx)(s,{children:t.map(e=>{let t=e.slug===a,r=e.order>0?String(e.order).padStart(2,`0`):`★`;return(0,I.jsx)(b,{children:(0,I.jsx)(_,{isActive:t,tooltip:e.title,render:(0,I.jsx)(i,{href:`/docs/${n}/${e.slug}`,className:`flex items-center gap-2`,children:(0,I.jsx)(`span`,{className:`w-4 h-4 flex items-center justify-center rounded text-[12px] font-mono shrink-0 ${t?`bg-primary text-primary-foreground font-bold`:`bg-muted text-muted-foreground`}`,children:r})})})},e.slug)})})]},e))]}),(0,I.jsx)(d,{className:`border-t border-sidebar-border p-3`,children:(0,I.jsxs)(i,{href:`/login`,className:`flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 shadow-sm transition-all`,children:[(0,I.jsx)(D,{className:`w-4 h-4`}),(0,I.jsx)(`span`,{children:`Login ke Sistem`})]})}),(0,I.jsx)(y,{})]}),(0,I.jsxs)(f,{children:[(0,I.jsxs)(`header`,{className:`flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear`,children:[(0,I.jsxs)(`div`,{className:`flex items-center gap-2 min-w-0`,children:[(0,I.jsx)(ne,{className:`-ml-1`}),(0,I.jsx)(ee,{orientation:`vertical`,className:`mr-1 data-[orientation=vertical]:h-4`}),(0,I.jsx)(ie,{className:`min-w-0`,children:(0,I.jsxs)(re,{className:`flex-nowrap`,children:[(0,I.jsx)(g,{className:`hidden sm:inline-flex`,children:(0,I.jsx)(i,{href:`/docs`,className:`text-muted-foreground hover:text-foreground`,children:`Buku Panduan`})}),(0,I.jsx)(ae,{className:`hidden sm:inline-flex`}),(0,I.jsx)(g,{className:`min-w-0`,children:(0,I.jsx)(c,{className:`truncate max-w-[130px] xs:max-w-[180px] sm:max-w-none`,children:X})})]})})]}),(0,I.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,I.jsx)(`button`,{type:`button`,onClick:U,className:`p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer`,title:`Ganti Tema`,children:H?.type===`dark`?(0,I.jsx)(v,{className:`w-4 h-4 text-amber-400`}):(0,I.jsx)(te,{className:`w-4 h-4 text-amber-500`})}),(0,I.jsxs)(i,{href:`/login`,className:`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all`,children:[(0,I.jsx)(D,{className:`w-3.5 h-3.5`}),(0,I.jsx)(`span`,{children:`Login`})]})]})]}),(0,I.jsxs)(`div`,{className:`p-4 sm:p-6 md:p-8 space-y-6 mx-auto w-full`,children:[$,(0,I.jsxs)(`div`,{className:`flex flex-col lg:flex-row gap-6 items-start`,children:[(0,I.jsx)(`div`,{className:`flex-1 min-w-0 bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs`,children:x?(0,I.jsxs)(`div`,{className:`space-y-6`,children:[(0,I.jsx)(`article`,{id:`docs-body-content`,className:`docs-rendered-markdown`,dangerouslySetInnerHTML:{__html:x.html}}),(0,I.jsxs)(`div`,{className:`pt-8 mt-10 border-t border-border flex items-center justify-between gap-4`,children:[K?(0,I.jsxs)(i,{href:`/docs/${n}/${K.slug}`,className:`flex flex-col gap-1 p-3.5 rounded-xl border border-border hover:border-primary hover:bg-muted/40 transition-all max-w-[45%]`,children:[(0,I.jsxs)(`span`,{className:`text-[11px] text-muted-foreground flex items-center gap-1`,children:[(0,I.jsx)(S,{className:`w-3 h-3`}),` Sebelumnya`]}),(0,I.jsx)(`span`,{className:`text-xs font-bold text-foreground truncate`,children:K.title})]}):(0,I.jsx)(`div`,{}),q&&(0,I.jsxs)(i,{href:`/docs/${n}/${q.slug}`,className:`flex flex-col items-end gap-1 p-3.5 rounded-xl border border-border hover:border-primary hover:bg-muted/40 transition-all max-w-[45%] text-right`,children:[(0,I.jsxs)(`span`,{className:`text-[11px] text-muted-foreground flex items-center gap-1`,children:[`Selanjutnya `,(0,I.jsx)(C,{className:`w-3 h-3`})]}),(0,I.jsx)(`span`,{className:`text-xs font-bold text-foreground truncate`,children:q.title})]})]})]}):(0,I.jsxs)(`div`,{className:`p-12 text-center space-y-3`,children:[(0,I.jsx)(w,{className:`w-12 h-12 text-muted-foreground mx-auto`}),(0,I.jsx)(`h3`,{className:`font-bold text-base`,children:`Dokumentasi Tidak Ditemukan`}),(0,I.jsx)(`p`,{className:`text-xs text-muted-foreground max-w-md mx-auto`,children:`Halaman panduan yang Anda cari tidak tersedia.`})]})}),x&&x.headings.length>0&&(0,I.jsx)(`div`,{className:`hidden xl:block w-72 shrink-0 sticky top-4`,children:(0,I.jsx)(L,{headings:x.headings})})]})]})]}),Q]})}export{R as default};