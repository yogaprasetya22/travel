import{a as e,d as t,m as n,n as r,o as i,r as a}from"./app-aosPWsra.js";import{C as o,E as ee,S as te,_ as s,a as c,b as l,d as ne,f as u,g as re,h as d,i as f,m as p,n as ie,o as ae,p as m,r as h,t as oe,u as se,v as g,w as _,x as v,y}from"./PageLayout-CT3HjPS4.js";import{t as b}from"./createLucideIcon-BRTMeyMM.js";import{t as x}from"./arrow-left-B_o4FEbP.js";import{t as S}from"./arrow-right-CPN8jeT4.js";import{n as C}from"./sparkles-fqELEU8v.js";import{t as w}from"./chevron-right-DxvWhQr1.js";import{n as T,t as E}from"./log-in-rpIuPXtq.js";import{t as D}from"./layers-QP-pL5rd.js";import{t as O}from"./search-DLve48g0.js";import{t as k}from"./shield-check-B2Y_09ab.js";import{t as A}from"./users-Butk-TIg.js";import{Jt as j}from"./DialogTitle-D1Zsnb1x.js";var M=b(`briefcase`,[[`path`,{d:`M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16`,key:`jecpp`}],[`rect`,{width:`20`,height:`14`,x:`2`,y:`6`,rx:`2`,key:`i6l2r4`}]]),N=b(`list-tree`,[[`path`,{d:`M8 5h13`,key:`1pao27`}],[`path`,{d:`M13 12h8`,key:`h98zly`}],[`path`,{d:`M13 19h8`,key:`c3s6r1`}],[`path`,{d:`M3 10a2 2 0 0 0 2 2h3`,key:`1npucw`}],[`path`,{d:`M3 5v12a2 2 0 0 0 2 2h3`,key:`x1gjn2`}]]),P=n(t(),1),F=a();function I({headings:e}){let[t,n]=(0,P.useState)(``),r=(0,P.useMemo)(()=>{let t=[],n=null;return e.forEach(e=>{e.level===2?(n={h2:e,children:[]},t.push(n)):e.level===3&&(n?n.children.push(e):t.push({h2:e,children:[]}))}),t},[e]);(0,P.useEffect)(()=>{if(!e.length)return;let t=new IntersectionObserver(e=>{e.forEach(e=>{e.isIntersecting&&n(e.target.id)})},{rootMargin:`-80px 0px -60% 0px`,threshold:.1});return e.forEach(e=>{let n=document.getElementById(e.anchor);n&&t.observe(n)}),()=>t.disconnect()},[e]);let i=e=>{let t=document.getElementById(e);t&&(t.scrollIntoView({behavior:`smooth`,block:`start`}),n(e),history.replaceState(null,``,`#${e}`))};return e.length?(0,F.jsxs)(`div`,{className:`space-y-4`,children:[(0,F.jsxs)(`div`,{className:`p-4 rounded-2xl bg-card border border-border shadow-xs space-y-3`,children:[(0,F.jsxs)(`div`,{className:`flex items-center justify-between`,children:[(0,F.jsxs)(`span`,{className:`text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2`,children:[(0,F.jsx)(N,{className:`w-4 h-4 text-primary`}),`Daftar Isi Halaman`]}),(0,F.jsxs)(`span`,{className:`text-[10px] px-2 py-0.5 rounded-full font-bold bg-primary/10 text-primary border border-primary/20`,children:[r.length,` Bagian`]})]}),(0,F.jsx)(`div`,{className:`space-y-2 pt-1`,children:r.map((e,n)=>{let r=t===e.h2.anchor,a=e.children.some(e=>e.anchor===t);return(0,F.jsxs)(`div`,{className:`rounded-xl border transition-all p-2.5 space-y-1.5 ${r||a?`bg-primary/5 border-primary/30 shadow-xs`:`bg-muted/30 border-transparent hover:bg-muted/60 hover:border-border`}`,children:[(0,F.jsxs)(`button`,{type:`button`,onClick:()=>i(e.h2.anchor),className:`w-full text-left flex items-start gap-2 text-xs font-semibold transition-colors ${r?`text-primary font-bold`:`text-foreground hover:text-primary`}`,children:[(0,F.jsx)(`span`,{className:`flex items-center justify-center size-4 rounded text-[9px] font-mono shrink-0 mt-0.5 ${r?`bg-primary text-primary-foreground font-bold`:`bg-muted text-muted-foreground`}`,children:n+1}),(0,F.jsx)(`span`,{className:`line-clamp-2 leading-tight`,children:e.h2.title})]}),e.children.length>0&&(0,F.jsx)(`div`,{className:`pl-6 space-y-1 pt-1 border-l border-border/80 ml-2`,children:e.children.map(e=>{let n=t===e.anchor;return(0,F.jsxs)(`button`,{type:`button`,onClick:()=>i(e.anchor),className:`w-full text-left block text-[11px] py-0.5 truncate transition-all ${n?`text-primary font-bold translate-x-1`:`text-muted-foreground hover:text-foreground hover:translate-x-0.5`}`,children:[`• `,e.title]},e.anchor)})})]},e.h2.anchor||n)})})]}),(0,F.jsxs)(`div`,{className:`p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-amber-500/5 to-transparent border border-primary/20 space-y-2`,children:[(0,F.jsxs)(`div`,{className:`flex items-center gap-2 text-primary font-bold text-xs`,children:[(0,F.jsx)(M,{className:`w-4 h-4`}),(0,F.jsx)(`span`,{children:`Pusat Bantuan Travel`})]}),(0,F.jsx)(`p`,{className:`text-[11px] text-muted-foreground leading-relaxed`,children:`Butuh panduan teknis operasional lebih lanjut? Hubungi administrator atau supervisor travel Anda.`})]})]}):null}function L({tenant:t,currentRole:n,currentSlug:a,navigation:b,activeDoc:M,isAuthenticated:N}){let[L,R]=(0,P.useState)(``),[z,B]=(0,P.useState)(null),{theme:ce,setTheme:V,currentThemeDef:H}=r(),U=()=>{H?.type===`dark`?V(`caramellatte`):V(`luxury`)},W=(0,P.useMemo)(()=>n===`portal`?[]:b[n]||[],[n,b]),G=(0,P.useMemo)(()=>{let e=W.filter(e=>!L.trim()||e.title.toLowerCase().includes(L.toLowerCase())||e.category.toLowerCase().includes(L.toLowerCase())),t={};return e.forEach(e=>{let n=e.category||`Modul Panduan`;t[n]||(t[n]=[]),t[n].push(e)}),t},[W,L]),{prevDoc:K,nextDoc:q}=(0,P.useMemo)(()=>{let e=W.findIndex(e=>e.slug===a);return e===-1?{prevDoc:null,nextDoc:null}:{prevDoc:e>0?W[e-1]:null,nextDoc:e<W.length-1?W[e+1]:null}},[W,a]);(0,P.useEffect)(()=>{let e=e=>{let t=e.target;if(t&&t.tagName===`IMG`){let n=t;n.src&&(n.src.includes(`/docs/assets/`)||n.src.includes(`screenshots`))&&(e.preventDefault(),B(n.src))}},t=document.getElementById(`docs-body-content`);return t&&t.addEventListener(`click`,e),()=>{t&&t.removeEventListener(`click`,e)}},[M]);let J=t?.nama_travel||`Hajj & Umroh Travel`,Y=M?M.title:`Buku Panduan`,X=n===`owner`?`Owner Travel (Level 1)`:n===`agent`?`Mitra Agen (Level 2/3)`:`Portal Dokumentasi`,Z=(0,F.jsx)(`style`,{children:`
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
        `}),Q=z&&(0,F.jsx)(`div`,{className:`fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4`,onClick:()=>B(null),children:(0,F.jsxs)(`div`,{className:`relative max-w-5xl max-h-[90vh] bg-card rounded-2xl overflow-hidden border border-border shadow-2xl p-2`,children:[(0,F.jsx)(`button`,{type:`button`,onClick:()=>B(null),className:`absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors`,children:(0,F.jsx)(j,{className:`w-5 h-5`})}),(0,F.jsx)(`img`,{src:z,alt:`Screenshot Zoom`,className:`max-h-[85vh] w-auto mx-auto object-contain rounded-xl`})]})}),$=(0,F.jsxs)(`div`,{className:`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border shadow-xs`,children:[(0,F.jsxs)(`div`,{className:`flex items-center gap-3`,children:[(0,F.jsx)(`div`,{className:`w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-amber-500 flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20`,children:(0,F.jsx)(C,{className:`w-5 h-5`})}),(0,F.jsxs)(`div`,{children:[(0,F.jsx)(`h2`,{className:`text-base font-bold text-foreground`,children:`Pusat Panduan & Dokumentasi`}),(0,F.jsx)(`p`,{className:`text-xs text-muted-foreground`,children:`Petunjuk operasional sistem travel umroh & haji lengkap dengan CRUD matrix`})]})]}),(0,F.jsxs)(`div`,{className:`flex items-center p-1 bg-muted/60 rounded-xl border border-border/60 self-start sm:self-auto overflow-x-auto max-w-full`,children:[(0,F.jsxs)(i,{href:`/docs`,className:`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${n===`portal`?`bg-background text-foreground shadow-xs font-bold`:`text-muted-foreground hover:text-foreground`}`,children:[(0,F.jsx)(T,{className:`w-3.5 h-3.5`}),`Portal Ringkasan`]}),(0,F.jsxs)(i,{href:`/docs/owner`,className:`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${n===`owner`?`bg-background text-foreground shadow-xs font-bold`:`text-muted-foreground hover:text-foreground`}`,children:[(0,F.jsx)(k,{className:`w-3.5 h-3.5 text-amber-500`}),`Owner Travel (Level 1)`]}),(0,F.jsxs)(i,{href:`/docs/agent`,className:`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${n===`agent`?`bg-background text-foreground shadow-xs font-bold`:`text-muted-foreground hover:text-foreground`}`,children:[(0,F.jsx)(A,{className:`w-3.5 h-3.5 text-emerald-500`}),`Mitra Agen (Level 2/3)`]})]})]});return N?(0,F.jsxs)(oe,{title:`${Y} - Buku Panduan`,breadcrumbParent:`Buku Panduan`,breadcrumbPage:X,contentClass:`p-4 sm:p-6 md:p-8 space-y-6`,children:[Z,$,(0,F.jsxs)(`div`,{className:`flex flex-col lg:flex-row gap-6 items-start`,children:[(0,F.jsxs)(`div`,{className:`w-full lg:w-72 shrink-0 bg-card border border-border rounded-2xl p-4 space-y-5 shadow-xs sticky top-4`,children:[(0,F.jsxs)(`div`,{className:`relative`,children:[(0,F.jsx)(O,{className:`absolute left-3 top-2.5 w-4 h-4 text-muted-foreground`}),(0,F.jsx)(`input`,{type:`text`,placeholder:`Cari modul atau topik...`,value:L,onChange:e=>R(e.target.value),className:`w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/60`}),L&&(0,F.jsx)(`button`,{type:`button`,onClick:()=>R(``),className:`absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground text-xs`,children:(0,F.jsx)(j,{className:`w-3.5 h-3.5`})})]}),n===`portal`?(0,F.jsxs)(`div`,{className:`space-y-3`,children:[(0,F.jsx)(`span`,{className:`text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1`,children:`Pilihan Panduan Peran`}),(0,F.jsxs)(`div`,{className:`space-y-1.5`,children:[(0,F.jsxs)(i,{href:`/docs/owner`,className:`flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-xl bg-background hover:bg-muted text-foreground border border-border transition-all group`,children:[(0,F.jsx)(`div`,{className:`w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold`,children:`1`}),(0,F.jsxs)(`div`,{children:[(0,F.jsx)(`div`,{className:`font-bold`,children:`Panduan Owner Travel`}),(0,F.jsx)(`div`,{className:`text-[10px] text-muted-foreground`,children:`12 Modul Operasional & Finansial`})]}),(0,F.jsx)(w,{className:`w-4 h-4 ml-auto text-muted-foreground group-hover:translate-x-0.5 transition-transform`})]}),(0,F.jsxs)(i,{href:`/docs/agent`,className:`flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-xl bg-background hover:bg-muted text-foreground border border-border transition-all group`,children:[(0,F.jsx)(`div`,{className:`w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold`,children:`2`}),(0,F.jsxs)(`div`,{children:[(0,F.jsx)(`div`,{className:`font-bold`,children:`Panduan Mitra Agen`}),(0,F.jsx)(`div`,{className:`text-[10px] text-muted-foreground`,children:`6 Modul Penjualan & Bio Link`})]}),(0,F.jsx)(w,{className:`w-4 h-4 ml-auto text-muted-foreground group-hover:translate-x-0.5 transition-transform`})]})]})]}):(0,F.jsx)(`div`,{className:`space-y-5 max-h-[calc(100vh-20rem)] overflow-y-auto pr-1 no-scrollbar`,children:Object.entries(G).map(([e,t])=>(0,F.jsxs)(`div`,{className:`space-y-1`,children:[(0,F.jsxs)(`div`,{className:`flex items-center gap-1.5 px-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground`,children:[(0,F.jsx)(D,{className:`w-3 h-3 text-primary`}),(0,F.jsx)(`span`,{children:e})]}),(0,F.jsx)(`div`,{className:`space-y-0.5`,children:t.map(e=>{let t=e.slug===a,r=e.order>0?String(e.order).padStart(2,`0`):`★`;return(0,F.jsx)(i,{href:`/docs/${n}/${e.slug}`,className:`flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg transition-all group ${t?`bg-primary text-primary-foreground font-bold shadow-xs`:`text-muted-foreground hover:bg-muted hover:text-foreground`}`,children:(0,F.jsx)(`span`,{className:`w-4 h-4 flex items-center justify-center rounded text-[12px] font-mono shrink-0 ${t?`bg-primary text-primary-foreground font-bold`:`bg-muted text-muted-foreground`}`,children:r})},e.slug)})})]},e))})]}),(0,F.jsx)(`div`,{className:`flex-1 min-w-0 bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs`,children:M?(0,F.jsxs)(`div`,{className:`space-y-6`,children:[(0,F.jsx)(`article`,{id:`docs-body-content`,className:`docs-rendered-markdown`,dangerouslySetInnerHTML:{__html:M.html}}),(0,F.jsxs)(`div`,{className:`pt-8 mt-10 border-t border-border flex items-center justify-between gap-4`,children:[K?(0,F.jsxs)(i,{href:`/docs/${n}/${K.slug}`,className:`flex flex-col gap-1 p-3.5 rounded-xl border border-border hover:border-primary hover:bg-muted/40 transition-all max-w-[45%]`,children:[(0,F.jsxs)(`span`,{className:`text-[11px] text-muted-foreground flex items-center gap-1`,children:[(0,F.jsx)(x,{className:`w-3 h-3`}),` Sebelumnya`]}),(0,F.jsx)(`span`,{className:`text-xs font-bold text-foreground truncate`,children:K.title})]}):(0,F.jsx)(`div`,{}),q&&(0,F.jsxs)(i,{href:`/docs/${n}/${q.slug}`,className:`flex flex-col items-end gap-1 p-3.5 rounded-xl border border-border hover:border-primary hover:bg-muted/40 transition-all max-w-[45%] text-right`,children:[(0,F.jsxs)(`span`,{className:`text-[11px] text-muted-foreground flex items-center gap-1`,children:[`Selanjutnya `,(0,F.jsx)(S,{className:`w-3 h-3`})]}),(0,F.jsx)(`span`,{className:`text-xs font-bold text-foreground truncate`,children:q.title})]})]})]}):(0,F.jsxs)(`div`,{className:`p-12 text-center space-y-3`,children:[(0,F.jsx)(C,{className:`w-12 h-12 text-muted-foreground mx-auto`}),(0,F.jsx)(`h3`,{className:`font-bold text-base`,children:`Dokumentasi Tidak Ditemukan`}),(0,F.jsx)(`p`,{className:`text-xs text-muted-foreground max-w-md mx-auto`,children:`Halaman panduan yang Anda cari tidak tersedia. Silakan pilih modul dari menu di sebelah kiri.`})]})}),M&&M.headings.length>0&&(0,F.jsx)(`div`,{className:`hidden 2xl:block w-72 shrink-0 sticky top-4`,children:(0,F.jsx)(I,{headings:M.headings})})]}),Q]}):(0,F.jsxs)(l,{children:[(0,F.jsx)(e,{title:`${Y} - ${J} Docs`}),Z,(0,F.jsxs)(se,{collapsible:`icon`,children:[(0,F.jsx)(d,{className:`border-b border-sidebar-border px-4 py-3`,children:(0,F.jsxs)(i,{href:`/docs`,className:`flex items-center gap-2.5`,children:[(0,F.jsx)(`div`,{className:`flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground`,children:(0,F.jsx)(C,{className:`size-4`})}),(0,F.jsxs)(`div`,{className:`grid flex-1 text-left text-sm leading-tight`,children:[(0,F.jsx)(`span`,{className:`truncate font-semibold`,children:J}),(0,F.jsx)(`span`,{className:`truncate text-xs text-muted-foreground`,children:`Portal Panduan Resmi`})]})]})}),(0,F.jsxs)(ne,{className:`px-2 py-3 space-y-4`,children:[(0,F.jsxs)(`div`,{className:`relative px-2`,children:[(0,F.jsx)(O,{className:`absolute left-4 top-2.5 w-3.5 h-3.5 text-muted-foreground`}),(0,F.jsx)(`input`,{type:`text`,placeholder:`Cari modul...`,value:L,onChange:e=>R(e.target.value),className:`w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg bg-sidebar-accent/50 border border-sidebar-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/60`})]}),n===`portal`?(0,F.jsxs)(m,{children:[(0,F.jsx)(p,{children:`Pilih Peran Panduan`}),(0,F.jsxs)(s,{children:[(0,F.jsx)(y,{children:(0,F.jsx)(g,{render:(0,F.jsxs)(i,{href:`/docs/owner`,className:`flex items-center gap-2`,children:[(0,F.jsx)(k,{className:`size-4 text-amber-500`}),(0,F.jsx)(`span`,{children:`Panduan Owner (Level 1)`})]})})}),(0,F.jsx)(y,{children:(0,F.jsx)(g,{render:(0,F.jsxs)(i,{href:`/docs/agent`,className:`flex items-center gap-2`,children:[(0,F.jsx)(A,{className:`size-4 text-emerald-500`}),(0,F.jsx)(`span`,{children:`Panduan Agen (Level 2/3)`})]})})})]})]}):Object.entries(G).map(([e,t])=>(0,F.jsxs)(m,{className:`p-0`,children:[(0,F.jsx)(p,{className:`text-[10px] font-bold uppercase tracking-wider`,children:e}),(0,F.jsx)(s,{children:t.map(e=>{let t=e.slug===a,r=e.order>0?String(e.order).padStart(2,`0`):`★`;return(0,F.jsx)(y,{children:(0,F.jsx)(g,{isActive:t,tooltip:e.title,render:(0,F.jsx)(i,{href:`/docs/${n}/${e.slug}`,className:`flex items-center gap-2`,children:(0,F.jsx)(`span`,{className:`w-4 h-4 flex items-center justify-center rounded text-[12px] font-mono shrink-0 ${t?`bg-primary text-primary-foreground font-bold`:`bg-muted text-muted-foreground`}`,children:r})})})},e.slug)})})]},e))]}),(0,F.jsx)(u,{className:`border-t border-sidebar-border p-3`,children:(0,F.jsxs)(i,{href:`/login`,className:`flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 shadow-sm transition-all`,children:[(0,F.jsx)(E,{className:`w-4 h-4`}),(0,F.jsx)(`span`,{children:`Login ke Sistem`})]})}),(0,F.jsx)(v,{})]}),(0,F.jsxs)(re,{children:[(0,F.jsxs)(`header`,{className:`flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear`,children:[(0,F.jsxs)(`div`,{className:`flex items-center gap-2 min-w-0`,children:[(0,F.jsx)(te,{className:`-ml-1`}),(0,F.jsx)(o,{orientation:`vertical`,className:`mr-1 data-[orientation=vertical]:h-4`}),(0,F.jsx)(ie,{className:`min-w-0`,children:(0,F.jsxs)(f,{className:`flex-nowrap`,children:[(0,F.jsx)(h,{className:`hidden sm:inline-flex`,children:(0,F.jsx)(i,{href:`/docs`,className:`text-muted-foreground hover:text-foreground`,children:`Buku Panduan`})}),(0,F.jsx)(ae,{className:`hidden sm:inline-flex`}),(0,F.jsx)(h,{className:`min-w-0`,children:(0,F.jsx)(c,{className:`truncate max-w-[130px] xs:max-w-[180px] sm:max-w-none`,children:X})})]})})]}),(0,F.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,F.jsx)(`button`,{type:`button`,onClick:U,className:`p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer`,title:`Ganti Tema`,children:H?.type===`dark`?(0,F.jsx)(_,{className:`w-4 h-4 text-amber-400`}):(0,F.jsx)(ee,{className:`w-4 h-4 text-amber-500`})}),(0,F.jsxs)(i,{href:`/login`,className:`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all`,children:[(0,F.jsx)(E,{className:`w-3.5 h-3.5`}),(0,F.jsx)(`span`,{children:`Login`})]})]})]}),(0,F.jsxs)(`div`,{className:`p-4 sm:p-6 md:p-8 space-y-6 mx-auto w-full`,children:[$,(0,F.jsxs)(`div`,{className:`flex flex-col lg:flex-row gap-6 items-start`,children:[(0,F.jsx)(`div`,{className:`flex-1 min-w-0 bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs`,children:M?(0,F.jsxs)(`div`,{className:`space-y-6`,children:[(0,F.jsx)(`article`,{id:`docs-body-content`,className:`docs-rendered-markdown`,dangerouslySetInnerHTML:{__html:M.html}}),(0,F.jsxs)(`div`,{className:`pt-8 mt-10 border-t border-border flex items-center justify-between gap-4`,children:[K?(0,F.jsxs)(i,{href:`/docs/${n}/${K.slug}`,className:`flex flex-col gap-1 p-3.5 rounded-xl border border-border hover:border-primary hover:bg-muted/40 transition-all max-w-[45%]`,children:[(0,F.jsxs)(`span`,{className:`text-[11px] text-muted-foreground flex items-center gap-1`,children:[(0,F.jsx)(x,{className:`w-3 h-3`}),` Sebelumnya`]}),(0,F.jsx)(`span`,{className:`text-xs font-bold text-foreground truncate`,children:K.title})]}):(0,F.jsx)(`div`,{}),q&&(0,F.jsxs)(i,{href:`/docs/${n}/${q.slug}`,className:`flex flex-col items-end gap-1 p-3.5 rounded-xl border border-border hover:border-primary hover:bg-muted/40 transition-all max-w-[45%] text-right`,children:[(0,F.jsxs)(`span`,{className:`text-[11px] text-muted-foreground flex items-center gap-1`,children:[`Selanjutnya `,(0,F.jsx)(S,{className:`w-3 h-3`})]}),(0,F.jsx)(`span`,{className:`text-xs font-bold text-foreground truncate`,children:q.title})]})]})]}):(0,F.jsxs)(`div`,{className:`p-12 text-center space-y-3`,children:[(0,F.jsx)(C,{className:`w-12 h-12 text-muted-foreground mx-auto`}),(0,F.jsx)(`h3`,{className:`font-bold text-base`,children:`Dokumentasi Tidak Ditemukan`}),(0,F.jsx)(`p`,{className:`text-xs text-muted-foreground max-w-md mx-auto`,children:`Halaman panduan yang Anda cari tidak tersedia.`})]})}),M&&M.headings.length>0&&(0,F.jsx)(`div`,{className:`hidden xl:block w-72 shrink-0 sticky top-4`,children:(0,F.jsx)(I,{headings:M.headings})})]})]})]}),Q]})}export{L as default};