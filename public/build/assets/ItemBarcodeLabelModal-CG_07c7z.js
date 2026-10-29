import{d as e,m as t,r as n}from"./app-C089cB3w.js";import{t as r}from"./map-pin-B3Vtbhdh.js";import{t as i}from"./printer-CF7iBTdi.js";import{t as a}from"./qr-code-BPgKQpaG.js";import{a as o,n as s,o as c,r as l,t as u}from"./dialog-D1_6tzww.js";import{t as d}from"./CuteQrCode-DQ4tfYwW.js";var f=t(e(),1),p=n();function m({open:e,onOpenChange:t,item:n,tenantName:m=`Travel Umroh & Haji`}){let[h,g]=f.useState(6),[_,v]=f.useState(`multi_stickers`),y=f.useRef(null);if(!n)return null;let b=()=>{if(!y.current)return;let e=document.createElement(`iframe`);e.style.position=`fixed`,e.style.right=`0`,e.style.bottom=`0`,e.style.width=`0`,e.style.height=`0`,e.style.border=`0`,e.title=`Print Item Labels`,document.body.appendChild(e);let t=e.contentWindow?.document;if(!t)return;let r=Array.from(document.querySelectorAll(`link[rel="stylesheet"], style`)).map(e=>e.outerHTML).join(`
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
        `),t.close(),setTimeout(()=>{e.contentWindow?.focus(),e.contentWindow?.print(),setTimeout(()=>{document.body.removeChild(e)},1e3)},300)},x=n.sku||`INV-${n.id}`,S=`/inventaris?search=${encodeURIComponent(x)}`;return(0,p.jsx)(u,{open:e,onOpenChange:t,children:(0,p.jsxs)(s,{className:`sm:max-w-4xl w-[95vw] max-h-[92vh] overflow-y-auto p-0 gap-0 border-border bg-card text-foreground low-scrollbar`,children:[(0,p.jsxs)(o,{className:`p-5 border-b border-border bg-muted/60  flex flex-row items-center justify-between`,children:[(0,p.jsxs)(`div`,{children:[(0,p.jsxs)(c,{className:`text-lg font-bold flex items-center gap-2`,children:[(0,p.jsx)(a,{className:`w-5 h-5 text-primary`}),(0,p.jsx)(`span`,{children:`Cetak Stiker Label Barcode & Rak Gudang`})]}),(0,p.jsx)(l,{className:`text-xs text-muted-foreground mt-0.5`,children:`Format label standar untuk box logistik, koper jamaah, atau penanda rak fisik.`})]}),(0,p.jsx)(`div`,{className:`flex items-center gap-2 mr-10`,children:(0,p.jsxs)(`button`,{onClick:b,className:`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition cursor-pointer shadow-xs`,children:[(0,p.jsx)(i,{className:`w-4 h-4`}),(0,p.jsx)(`span`,{children:`Cetak Label`})]})})]}),(0,p.jsxs)(`div`,{className:`p-4 bg-muted/30 border-b border-border flex flex-wrap items-center justify-between gap-3 text-xs`,children:[(0,p.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,p.jsx)(`span`,{className:`font-semibold text-muted-foreground`,children:`Mode Cetak:`}),(0,p.jsx)(`button`,{onClick:()=>v(`multi_stickers`),className:`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${_===`multi_stickers`?`bg-primary text-primary-foreground`:`bg-muted text-foreground hover:bg-muted/80`}`,children:`Grid Stiker Barang (A4)`}),(0,p.jsx)(`button`,{onClick:()=>v(`single_rack`),className:`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${_===`single_rack`?`bg-primary text-primary-foreground`:`bg-muted text-foreground hover:bg-muted/80`}`,children:`Label Besar Rak Gudang`})]}),_===`multi_stickers`&&(0,p.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,p.jsx)(`span`,{className:`text-muted-foreground font-semibold`,children:`Jumlah Stiker:`}),[2,4,6,8,12].map(e=>(0,p.jsxs)(`button`,{onClick:()=>g(e),className:`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${h===e?`bg-primary text-primary-foreground`:`bg-muted text-muted-foreground hover:bg-muted/80`}`,children:[e,`x`]},e))]})]}),(0,p.jsx)(`div`,{className:`p-6 bg-muted/10 flex justify-center`,children:(0,p.jsx)(`div`,{ref:y,className:_===`multi_stickers`?`grid grid-cols-1 sm:grid-cols-2 gap-4 w-full`:`flex justify-center w-full`,children:_===`single_rack`?(0,p.jsxs)(`div`,{className:`w-full max-w-md bg-white text-slate-900 border-2 border-slate-900 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center`,children:[(0,p.jsxs)(`div`,{className:`text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1`,children:[m,` • RAK PENYIMPANAN`]}),(0,p.jsx)(`div`,{className:`text-xl font-black text-slate-900 leading-tight mb-2`,children:n.nama_barang}),(0,p.jsxs)(`div`,{className:`inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold mb-4`,children:[(0,p.jsx)(r,{className:`w-3.5 h-3.5 text-slate-900`}),(0,p.jsx)(`span`,{children:n.lokasi_rak||`Gudang Utama - Rak A`})]}),(0,p.jsx)(`div`,{className:`p-3 bg-slate-50 rounded-xl border border-slate-200 mb-3`,children:(0,p.jsx)(d,{value:S,size:130,color:`#0f172a`})}),(0,p.jsx)(`div`,{className:`font-mono text-base font-black tracking-wider text-slate-900`,children:x}),(0,p.jsxs)(`div`,{className:`text-[11px] text-slate-500 mt-1`,children:[`Kategori: `,n.kategori||`Perlengkapan`,` • Satuan: `,n.satuan||`Pcs`]})]}):Array.from({length:h}).map((e,t)=>(0,p.jsxs)(`div`,{className:`bg-white text-slate-900 border border-slate-300 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-xs`,children:[(0,p.jsxs)(`div`,{className:`flex-1 min-w-0`,children:[(0,p.jsx)(`div`,{className:`text-[9px] font-bold uppercase tracking-wider text-slate-500 truncate`,children:m}),(0,p.jsx)(`div`,{className:`text-xs font-bold text-slate-900 truncate mt-0.5`,children:n.nama_barang}),(0,p.jsxs)(`div`,{className:`flex items-center gap-2 text-[10px] text-slate-600 mt-1`,children:[(0,p.jsx)(`span`,{className:`font-mono font-bold text-slate-800`,children:x}),(0,p.jsx)(`span`,{children:`•`}),(0,p.jsx)(`span`,{className:`truncate`,children:n.kategori})]}),(0,p.jsxs)(`div`,{className:`flex items-center gap-1 text-[10px] text-slate-500 mt-1`,children:[(0,p.jsx)(r,{className:`w-3 h-3 text-slate-600 shrink-0`}),(0,p.jsx)(`span`,{className:`truncate`,children:n.lokasi_rak||`Gudang`})]})]}),(0,p.jsx)(`div`,{className:`shrink-0 p-1 bg-slate-50 rounded-lg border border-slate-200`,children:(0,p.jsx)(d,{value:S,size:64,color:`#0f172a`})})]},t))})})]})})}export{m as default};