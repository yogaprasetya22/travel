import{d as e,m as t,o as n,r}from"./app-CguvefX1.js";import{t as i}from"./PageLayout-Ap48WdMA.js";import{t as a}from"./createLucideIcon-CP0e43wW.js";import{t as o}from"./arrow-left-A-bVTz_0.js";import{t as s}from"./arrow-right-DTim3zSQ.js";import{t as c}from"./book-open-BvwAxMKe.js";import{t as l}from"./chevron-right-CA9T2a-W.js";import{t as u}from"./compass-B50BlPvF.js";import{t as d}from"./layers-hjehdKfC.js";import{t as f}from"./search-Dm57ixr7.js";import{t as p}from"./shield-check-DPYWVH6c.js";import{t as m}from"./sparkles-SP1JbPQt.js";import{t as h}from"./users-BI4uM7qM.js";import{Jt as g}from"./DialogTitle-BhphUFlF.js";var _=a(`briefcase`,[[`path`,{d:`M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16`,key:`jecpp`}],[`rect`,{width:`20`,height:`14`,x:`2`,y:`6`,rx:`2`,key:`i6l2r4`}]]),v=t(e(),1),y=r();function b({currentRole:e,currentSlug:t,navigation:r,activeDoc:a}){let[b,x]=(0,v.useState)(``),[S,C]=(0,v.useState)(null),w=(0,v.useMemo)(()=>e===`portal`?[]:r[e]||[],[e,r]),T=(0,v.useMemo)(()=>{let e=w.filter(e=>!b.trim()||e.title.toLowerCase().includes(b.toLowerCase())||e.category.toLowerCase().includes(b.toLowerCase())),t={};return e.forEach(e=>{let n=e.category||`Modul Panduan`;t[n]||(t[n]=[]),t[n].push(e)}),t},[w,b]),{prevDoc:E,nextDoc:D}=(0,v.useMemo)(()=>{let e=w.findIndex(e=>e.slug===t);return e===-1?{prevDoc:null,nextDoc:null}:{prevDoc:e>0?w[e-1]:null,nextDoc:e<w.length-1?w[e+1]:null}},[w,t]);(0,v.useEffect)(()=>{let e=e=>{let t=e.target;if(t&&t.tagName===`IMG`){let n=t;n.src&&(n.src.includes(`/docs/assets/`)||n.src.includes(`screenshots`))&&(e.preventDefault(),C(n.src))}},t=document.getElementById(`docs-body-content`);return t&&t.addEventListener(`click`,e),()=>{t&&t.removeEventListener(`click`,e)}},[a]);let O=a?a.title:`Buku Panduan`,k=e===`owner`?`Owner Travel (Level 1)`:e===`agent`?`Mitra Agen (Level 2/3)`:`Portal Dokumentasi`;return(0,y.jsxs)(i,{title:`${O} - Buku Panduan`,breadcrumbParent:`Buku Panduan`,breadcrumbPage:k,contentClass:`p-4 sm:p-6 md:p-8 space-y-6`,children:[(0,y.jsx)(`style`,{children:`
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
            `}),(0,y.jsxs)(`div`,{className:`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border shadow-xs`,children:[(0,y.jsxs)(`div`,{className:`flex items-center gap-3`,children:[(0,y.jsx)(`div`,{className:`w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-amber-500 flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20`,children:(0,y.jsx)(c,{className:`w-5 h-5`})}),(0,y.jsxs)(`div`,{children:[(0,y.jsx)(`h2`,{className:`text-base font-bold text-foreground`,children:`Pusat Panduan & Dokumentasi`}),(0,y.jsx)(`p`,{className:`text-xs text-muted-foreground`,children:`Petunjuk operasional sistem travel umroh & haji lengkap dengan CRUD matrix`})]})]}),(0,y.jsxs)(`div`,{className:`flex items-center p-1 bg-muted/60 rounded-xl border border-border/60 self-start sm:self-auto overflow-x-auto max-w-full`,children:[(0,y.jsxs)(n,{href:`/docs`,className:`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${e===`portal`?`bg-background text-foreground shadow-xs font-bold`:`text-muted-foreground hover:text-foreground`}`,children:[(0,y.jsx)(u,{className:`w-3.5 h-3.5`}),`Portal Ringkasan`]}),(0,y.jsxs)(n,{href:`/docs/owner`,className:`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${e===`owner`?`bg-background text-foreground shadow-xs font-bold`:`text-muted-foreground hover:text-foreground`}`,children:[(0,y.jsx)(p,{className:`w-3.5 h-3.5 text-amber-500`}),`Owner Travel (Level 1)`]}),(0,y.jsxs)(n,{href:`/docs/agent`,className:`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${e===`agent`?`bg-background text-foreground shadow-xs font-bold`:`text-muted-foreground hover:text-foreground`}`,children:[(0,y.jsx)(h,{className:`w-3.5 h-3.5 text-emerald-500`}),`Mitra Agen (Level 2/3)`]})]})]}),(0,y.jsxs)(`div`,{className:`flex flex-col lg:flex-row gap-6 items-start`,children:[(0,y.jsxs)(`div`,{className:`w-full lg:w-72 shrink-0 bg-card border border-border rounded-2xl p-4 space-y-5 shadow-xs sticky top-4`,children:[(0,y.jsxs)(`div`,{className:`relative`,children:[(0,y.jsx)(f,{className:`absolute left-3 top-2.5 w-4 h-4 text-muted-foreground`}),(0,y.jsx)(`input`,{type:`text`,placeholder:`Cari modul atau topik...`,value:b,onChange:e=>x(e.target.value),className:`w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/60`}),b&&(0,y.jsx)(`button`,{type:`button`,onClick:()=>x(``),className:`absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground text-xs`,children:(0,y.jsx)(g,{className:`w-3.5 h-3.5`})})]}),e===`portal`?(0,y.jsxs)(`div`,{className:`space-y-3`,children:[(0,y.jsx)(`span`,{className:`text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1`,children:`Pilihan Panduan Peran`}),(0,y.jsxs)(`div`,{className:`space-y-1.5`,children:[(0,y.jsxs)(n,{href:`/docs/owner`,className:`flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-xl bg-background hover:bg-muted text-foreground border border-border transition-all group`,children:[(0,y.jsx)(`div`,{className:`w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold`,children:`1`}),(0,y.jsxs)(`div`,{children:[(0,y.jsx)(`div`,{className:`font-bold`,children:`Panduan Owner Travel`}),(0,y.jsx)(`div`,{className:`text-[10px] text-muted-foreground`,children:`12 Modul Operasional & Finansial`})]}),(0,y.jsx)(l,{className:`w-4 h-4 ml-auto text-muted-foreground group-hover:translate-x-0.5 transition-transform`})]}),(0,y.jsxs)(n,{href:`/docs/agent`,className:`flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-xl bg-background hover:bg-muted text-foreground border border-border transition-all group`,children:[(0,y.jsx)(`div`,{className:`w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold`,children:`2`}),(0,y.jsxs)(`div`,{children:[(0,y.jsx)(`div`,{className:`font-bold`,children:`Panduan Mitra Agen`}),(0,y.jsx)(`div`,{className:`text-[10px] text-muted-foreground`,children:`6 Modul Penjualan & Bio Link`})]}),(0,y.jsx)(l,{className:`w-4 h-4 ml-auto text-muted-foreground group-hover:translate-x-0.5 transition-transform`})]})]})]}):(0,y.jsx)(`div`,{className:`space-y-5 max-h-[calc(100vh-16rem)] overflow-y-auto pr-1`,children:Object.entries(T).map(([r,i])=>(0,y.jsxs)(`div`,{className:`space-y-1`,children:[(0,y.jsxs)(`div`,{className:`flex items-center gap-1.5 px-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground`,children:[(0,y.jsx)(d,{className:`w-3 h-3 text-primary`}),(0,y.jsx)(`span`,{children:r})]}),(0,y.jsx)(`div`,{className:`space-y-0.5`,children:i.map(r=>{let i=r.slug===t,a=r.order>0?String(r.order).padStart(2,`0`):`★`;return(0,y.jsxs)(n,{href:`/docs/${e}/${r.slug}`,className:`flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg transition-all group ${i?`bg-primary text-primary-foreground font-bold shadow-xs`:`text-muted-foreground hover:bg-muted hover:text-foreground`}`,children:[(0,y.jsx)(`span`,{className:`w-5 h-5 flex items-center justify-center rounded text-[10px] font-mono shrink-0 ${i?`bg-white/20 text-white font-bold`:`bg-muted text-muted-foreground group-hover:bg-card`}`,children:a}),(0,y.jsx)(`span`,{className:`truncate`,children:r.title})]},r.slug)})})]},r))})]}),(0,y.jsx)(`div`,{className:`flex-1 min-w-0 bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs`,children:a?(0,y.jsxs)(`div`,{className:`space-y-6`,children:[(0,y.jsx)(`article`,{id:`docs-body-content`,className:`docs-rendered-markdown`,dangerouslySetInnerHTML:{__html:a.html}}),(0,y.jsxs)(`div`,{className:`pt-8 mt-10 border-t border-border flex items-center justify-between gap-4`,children:[E?(0,y.jsxs)(n,{href:`/docs/${e}/${E.slug}`,className:`flex flex-col gap-1 p-3.5 rounded-xl border border-border hover:border-primary hover:bg-muted/40 transition-all max-w-[45%]`,children:[(0,y.jsxs)(`span`,{className:`text-[11px] text-muted-foreground flex items-center gap-1`,children:[(0,y.jsx)(o,{className:`w-3 h-3`}),` Sebelumnya`]}),(0,y.jsx)(`span`,{className:`text-xs font-bold text-foreground truncate`,children:E.title})]}):(0,y.jsx)(`div`,{}),D&&(0,y.jsxs)(n,{href:`/docs/${e}/${D.slug}`,className:`flex flex-col items-end gap-1 p-3.5 rounded-xl border border-border hover:border-primary hover:bg-muted/40 transition-all max-w-[45%] text-right`,children:[(0,y.jsxs)(`span`,{className:`text-[11px] text-muted-foreground flex items-center gap-1`,children:[`Selanjutnya `,(0,y.jsx)(s,{className:`w-3 h-3`})]}),(0,y.jsx)(`span`,{className:`text-xs font-bold text-foreground truncate`,children:D.title})]})]})]}):(0,y.jsxs)(`div`,{className:`p-12 text-center space-y-3`,children:[(0,y.jsx)(c,{className:`w-12 h-12 text-muted-foreground mx-auto`}),(0,y.jsx)(`h3`,{className:`font-bold text-base`,children:`Dokumentasi Tidak Ditemukan`}),(0,y.jsx)(`p`,{className:`text-xs text-muted-foreground max-w-md mx-auto`,children:`Halaman panduan yang Anda cari tidak tersedia. Silakan pilih modul dari menu di sebelah kiri.`})]})}),a&&a.headings.length>0&&(0,y.jsxs)(`div`,{className:`hidden 2xl:block w-64 shrink-0 sticky top-4 space-y-4`,children:[(0,y.jsxs)(`div`,{className:`p-4 rounded-2xl bg-card border border-border shadow-xs space-y-3`,children:[(0,y.jsxs)(`span`,{className:`text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5`,children:[(0,y.jsx)(m,{className:`w-3.5 h-3.5 text-primary`}),`Daftar Isi Halaman`]}),(0,y.jsx)(`nav`,{className:`space-y-1 text-xs`,children:a.headings.map((e,t)=>(0,y.jsx)(`a`,{href:`#${e.anchor}`,className:`block py-1 text-muted-foreground hover:text-foreground transition-colors truncate ${e.level===3?`pl-3 text-[11px]`:`font-medium`}`,children:e.title},t))})]}),(0,y.jsxs)(`div`,{className:`p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-amber-500/5 to-transparent border border-primary/20 space-y-2`,children:[(0,y.jsxs)(`div`,{className:`flex items-center gap-2 text-primary font-bold text-xs`,children:[(0,y.jsx)(_,{className:`w-4 h-4`}),(0,y.jsx)(`span`,{children:`Pusat Bantuan`})]}),(0,y.jsx)(`p`,{className:`text-[11px] text-muted-foreground leading-relaxed`,children:`Butuh panduan teknis lebih lanjut? Hubungi administrator atau supervisor travel.`})]})]})]}),S&&(0,y.jsx)(`div`,{className:`fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4`,onClick:()=>C(null),children:(0,y.jsxs)(`div`,{className:`relative max-w-5xl max-h-[90vh] bg-card rounded-2xl overflow-hidden border border-border shadow-2xl p-2`,children:[(0,y.jsx)(`button`,{type:`button`,onClick:()=>C(null),className:`absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors`,children:(0,y.jsx)(g,{className:`w-5 h-5`})}),(0,y.jsx)(`img`,{src:S,alt:`Screenshot Zoom`,className:`max-h-[85vh] w-auto mx-auto object-contain rounded-xl`})]})})]})}export{b as default};