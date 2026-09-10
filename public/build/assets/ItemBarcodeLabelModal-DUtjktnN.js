import{d as e,m as t,r as n}from"./app-DkYepgxo.js";import{t as r}from"./createLucideIcon-BCGqaYAO.js";import{t as i}from"./map-pin-BjDd92n0.js";import{t as a}from"./printer-D4QCMJSS.js";import{a as o,n as s,o as c,r as l,t as u}from"./dialog-bgiWgVFe.js";import{t as d}from"./CuteQrCode-DWVh8nSS.js";var f=r(`qr-code`,[[`rect`,{width:`5`,height:`5`,x:`3`,y:`3`,rx:`1`,key:`1tu5fj`}],[`rect`,{width:`5`,height:`5`,x:`16`,y:`3`,rx:`1`,key:`1v8r4q`}],[`rect`,{width:`5`,height:`5`,x:`3`,y:`16`,rx:`1`,key:`1x03jg`}],[`path`,{d:`M21 16h-3a2 2 0 0 0-2 2v3`,key:`177gqh`}],[`path`,{d:`M21 21v.01`,key:`ents32`}],[`path`,{d:`M12 7v3a2 2 0 0 1-2 2H7`,key:`8crl2c`}],[`path`,{d:`M3 12h.01`,key:`nlz23k`}],[`path`,{d:`M12 3h.01`,key:`n36tog`}],[`path`,{d:`M12 16v.01`,key:`133mhm`}],[`path`,{d:`M16 12h1`,key:`1slzba`}],[`path`,{d:`M21 12v.01`,key:`1lwtk9`}],[`path`,{d:`M12 21v-1`,key:`1880an`}]]),p=t(e(),1),m=n();function h({open:e,onOpenChange:t,item:n,tenantName:r=`Travel Umroh & Haji`}){let[h,g]=p.useState(6),[_,v]=p.useState(`multi_stickers`),y=p.useRef(null);if(!n)return null;let b=()=>{if(!y.current)return;let e=document.createElement(`iframe`);e.style.position=`fixed`,e.style.right=`0`,e.style.bottom=`0`,e.style.width=`0`,e.style.height=`0`,e.style.border=`0`,e.title=`Print Item Labels`,document.body.appendChild(e);let t=e.contentWindow?.document;if(!t)return;let r=Array.from(document.querySelectorAll(`link[rel="stylesheet"], style`)).map(e=>e.outerHTML).join(`
`);t.open(),t.write(`
            <!DOCTYPE html>
            <html lang="id">
            <head>
                <meta charset="utf-8">
                <title>Stiker_Label_${n.sku||n.id}</title>
                ${r}
                <style>
                    @page {
                        size: A4 portrait;
                        margin: 10mm;
                    }
                    body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #ffffff !important;
                        color: #0f172a !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
                    }
                    body, body * {
                        visibility: visible !important;
                    }
                    svg, img {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        display: block !important;
                    }
                    .label-grid-container {
                        display: grid !important;
                        grid-template-columns: repeat(2, 1fr) !important;
                        gap: 12px !important;
                        width: 100% !important;
                    }
                    .single-rack-container {
                        display: flex !important;
                        justify-content: center !important;
                        padding-top: 20px !important;
                    }
                </style>
            </head>
            <body>
                <div class="${_===`multi_stickers`?`label-grid-container`:`single-rack-container`}">
                    ${y.current.innerHTML}
                </div>
            </body>
            </html>
        `),t.close(),setTimeout(()=>{e.contentWindow?.focus(),e.contentWindow?.print(),setTimeout(()=>{document.body.removeChild(e)},1e3)},300)},x=n.sku||`INV-${n.id}`,S=`/inventaris?search=${encodeURIComponent(x)}`;return(0,m.jsx)(u,{open:e,onOpenChange:t,children:(0,m.jsxs)(s,{className:`sm:max-w-4xl w-[95vw] max-h-[92vh] overflow-y-auto p-0 gap-0 border-border bg-card text-foreground low-scrollbar`,children:[(0,m.jsxs)(o,{className:`p-5 border-b border-border bg-muted/60  flex flex-row items-center justify-between`,children:[(0,m.jsxs)(`div`,{children:[(0,m.jsxs)(c,{className:`text-lg font-bold flex items-center gap-2`,children:[(0,m.jsx)(f,{className:`w-5 h-5 text-primary`}),(0,m.jsx)(`span`,{children:`Cetak Stiker Label Barcode & Rak Gudang`})]}),(0,m.jsx)(l,{className:`text-xs text-muted-foreground mt-0.5`,children:`Format label standar untuk box logistik, koper jamaah, atau penanda rak fisik.`})]}),(0,m.jsx)(`div`,{className:`flex items-center gap-2 mr-10`,children:(0,m.jsxs)(`button`,{onClick:b,className:`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition cursor-pointer shadow-xs`,children:[(0,m.jsx)(a,{className:`w-4 h-4`}),(0,m.jsx)(`span`,{children:`Cetak Label`})]})})]}),(0,m.jsxs)(`div`,{className:`p-4 bg-muted/30 border-b border-border flex flex-wrap items-center justify-between gap-3 text-xs`,children:[(0,m.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,m.jsx)(`span`,{className:`font-semibold text-muted-foreground`,children:`Mode Cetak:`}),(0,m.jsx)(`button`,{onClick:()=>v(`multi_stickers`),className:`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${_===`multi_stickers`?`bg-primary text-primary-foreground`:`bg-muted text-foreground hover:bg-muted/80`}`,children:`Grid Stiker Barang (A4)`}),(0,m.jsx)(`button`,{onClick:()=>v(`single_rack`),className:`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${_===`single_rack`?`bg-primary text-primary-foreground`:`bg-muted text-foreground hover:bg-muted/80`}`,children:`Label Besar Rak Gudang`})]}),_===`multi_stickers`&&(0,m.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,m.jsx)(`span`,{className:`text-muted-foreground font-semibold`,children:`Jumlah Stiker:`}),[2,4,6,8,12].map(e=>(0,m.jsxs)(`button`,{onClick:()=>g(e),className:`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${h===e?`bg-primary text-primary-foreground`:`bg-muted text-muted-foreground hover:bg-muted/80`}`,children:[e,`x`]},e))]})]}),(0,m.jsx)(`div`,{className:`p-6 bg-muted/10 flex justify-center`,children:(0,m.jsx)(`div`,{ref:y,className:_===`multi_stickers`?`grid grid-cols-1 sm:grid-cols-2 gap-4 w-full`:`flex justify-center w-full`,children:_===`single_rack`?(0,m.jsxs)(`div`,{className:`w-full max-w-md bg-white text-slate-900 border-2 border-slate-900 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center`,children:[(0,m.jsxs)(`div`,{className:`text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1`,children:[r,` • RAK PENYIMPANAN`]}),(0,m.jsx)(`div`,{className:`text-xl font-black text-slate-900 leading-tight mb-2`,children:n.nama_barang}),(0,m.jsxs)(`div`,{className:`inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold mb-4`,children:[(0,m.jsx)(i,{className:`w-3.5 h-3.5 text-slate-900`}),(0,m.jsx)(`span`,{children:n.lokasi_rak||`Gudang Utama - Rak A`})]}),(0,m.jsx)(`div`,{className:`p-3 bg-slate-50 rounded-xl border border-slate-200 mb-3`,children:(0,m.jsx)(d,{value:S,size:130,color:`#0f172a`})}),(0,m.jsx)(`div`,{className:`font-mono text-base font-black tracking-wider text-slate-900`,children:x}),(0,m.jsxs)(`div`,{className:`text-[11px] text-slate-500 mt-1`,children:[`Kategori: `,n.kategori||`Perlengkapan`,` • Satuan: `,n.satuan||`Pcs`]})]}):Array.from({length:h}).map((e,t)=>(0,m.jsxs)(`div`,{className:`bg-white text-slate-900 border border-slate-300 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-xs`,children:[(0,m.jsxs)(`div`,{className:`flex-1 min-w-0`,children:[(0,m.jsx)(`div`,{className:`text-[9px] font-bold uppercase tracking-wider text-slate-500 truncate`,children:r}),(0,m.jsx)(`div`,{className:`text-xs font-bold text-slate-900 truncate mt-0.5`,children:n.nama_barang}),(0,m.jsxs)(`div`,{className:`flex items-center gap-2 text-[10px] text-slate-600 mt-1`,children:[(0,m.jsx)(`span`,{className:`font-mono font-bold text-slate-800`,children:x}),(0,m.jsx)(`span`,{children:`•`}),(0,m.jsx)(`span`,{className:`truncate`,children:n.kategori})]}),(0,m.jsxs)(`div`,{className:`flex items-center gap-1 text-[10px] text-slate-500 mt-1`,children:[(0,m.jsx)(i,{className:`w-3 h-3 text-slate-600 shrink-0`}),(0,m.jsx)(`span`,{className:`truncate`,children:n.lokasi_rak||`Gudang`})]})]}),(0,m.jsx)(`div`,{className:`shrink-0 p-1 bg-slate-50 rounded-lg border border-slate-200`,children:(0,m.jsx)(d,{value:S,size:64,color:`#0f172a`})})]},t))})})]})})}export{h as default,f as t};