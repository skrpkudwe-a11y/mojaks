/* MOJAKS.CO - logika bersama. Data disimpan di server lewat api.php */
let D={};
const $=(s,e=document)=>e.querySelector(s),
L=(k,d)=>D[k]??d,
rp=n=>'Rp '+(+n).toLocaleString('id-ID'),
nid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,5),
esc=s=>String(s??'').replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';'),
fd=e=>(e.preventDefault(),Object.fromEntries(new FormData(e.target))),
ip='w-full px-4 py-2 bg-gray-50 border rounded-lg outline-none focus:border-black transition text-sm',
lb='block text-[10px] uppercase font-bold text-gray-400 mb-1',
btn='bg-black text-white py-3 px-6 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-red-600 transition',
nb='flex items-center space-x-3 p-3 rounded-lg transition ',
fld=(l,n,v='',t='text',o)=>`<div><label class="${lb}">${l}</label><input name="${n}" type="${t}" value="${v}" ${t=='number'?'min="0"':''} ${o?'':'required'} class="${ip}"></div>`,
BC={Unpaid:'bg-gray-100 text-gray-600',Verifying:'bg-yellow-100 text-yellow-700',Paid:'bg-green-100 text-green-700',Shipped:'bg-purple-100 text-purple-700',Delivered:'bg-blue-100 text-blue-700',Cancelled:'bg-red-100 text-red-700'},
badge=s=>`<span class="px-2 py-1 text-[10px] font-bold rounded uppercase ${BC[s]}">${s}</span>`,
st=(l,v,s)=>`<div class="bg-white p-6 rounded-xl border shadow-sm"><p class="text-gray-400 text-xs font-bold uppercase mb-2">${l}</p><h3 class="text-2xl font-black tracking-tight">${v}</h3><p class="text-gray-500 text-xs mt-2 font-bold">${s}</p></div>`,
tbl=(h,r)=>`<div class="bg-white rounded-xl border shadow-sm overflow-x-auto"><table class="w-full text-left"><thead class="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400"><tr>${h.map(x=>`<th class="px-6 py-4">${x}</th>`).join('')}</tr></thead><tbody class="text-sm divide-y">${r.map(a=>`<tr>${a.map(c=>`<td class="px-6 py-4">${c}</td>`).join('')}</tr>`).join('')||`<tr><td colspan="9" class="px-6 py-10 text-center text-gray-400">Belum ada data</td></tr>`}</tbody></table></div>`,
toast=m=>{const t=document.createElement('div');t.className='fixed bottom-6 right-6 bg-black text-white text-sm font-bold px-5 py-3 rounded-lg z-[99]';t.textContent=m;document.body.append(t);setTimeout(()=>t.remove(),2600)},
api=async(a,b,f)=>{try{const r=await(await fetch('api.php?a='+a,{method:'POST',headers:{'X-R':1},body:f||JSON.stringify(b||{})})).json();if(r.err)toast(r.err);else if(r.d)D=r.d;return r}catch(e){toast('Server tidak merespons');return{err:1}}},
S=(k,v)=>{D[k]=v;return api('put',{k,v})},
boot=async f=>{try{D=(await(await fetch('api.php?a=get')).json()).d}catch(e){D={products:[],cfg:{fee:0,free:0},pay:[],orders:[],users:[],me:null};toast('api.php tidak aktif (butuh hosting PHP)')}f()},
U=()=>L('users',[]),me=()=>D.me,
logout=async()=>{await api('logout');location='index.html'},
up=async(file,t)=>{const u=new FormData();u.append('f',file);u.append('t',t||'');return api('up',0,u)},
pwForm=`<form onsubmit="pwSave(event)" class="bg-white rounded-xl border shadow-sm p-6 space-y-4"><h2 class="font-black uppercase italic">Change Password</h2>${fld('Current Password','old','','password')}${fld('New Password','nw','','password')}<button class="${btn}">Update Password</button></form>`,
pwSave=async e=>{const t=e.target,r=await api('pw',fd(e));if(!r.err){t.reset();toast('Password diperbarui')}};

/* ---- Excel (ExcelJS dimuat saat dibutuhkan) ---- */
const XL=()=>window.ExcelJS?0:new Promise(r=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js';s.onload=r;document.head.append(s)}),
BK={type:'pattern',pattern:'solid',fgColor:{argb:'FF000000'}},WH={bold:true,color:{argb:'FFFFFFFF'}},RD='FFDC2626',RPF='"Rp "#,##0',
cl=(w,a,v,s={})=>{const c=w.getCell(a);c.value=v;Object.assign(c,s);return c},
dl=async(wb,n)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([await wb.xlsx.writeBuffer()]));a.download=n;a.click()},
fl=a=>({type:'pattern',pattern:'solid',fgColor:{argb:a}}),
RDF=fl('FFDC2626'),
SC={Unpaid:'FF6B7280',Verifying:'FFD97706',Paid:'FF16A34A',Shipped:'FF7C3AED',Delivered:'FF2563EB',Cancelled:'FFDC2626'},
LN={style:'thin',color:{argb:'FFE5E7EB'}},
brand=z=>({richText:[{text:'MOJAKS',font:{name:'Arial',size:z,bold:true,italic:true,color:{argb:'FFFFFFFF'}}},{text:'.CO',font:{name:'Arial',size:z,bold:true,italic:true,color:{argb:'FFEF4444'}}}]}),
hdr=(w,t,s)=>{
 [2,3,4].forEach(r=>{w.getRow(r).height=20;'BCDEF'.split('').forEach(k=>w.getCell(k+r).fill=BK)});
 'BCDEF'.split('').forEach(k=>w.getCell(k+5).fill=RDF);w.getRow(5).height=5;
 w.mergeCells('B2:D4');cl(w,'B2',brand(30),{alignment:{vertical:'middle',indent:1}});
 w.mergeCells('E2:F3');cl(w,'E2',t,{font:{name:'Arial',size:22,bold:true,color:{argb:'FFFFFFFF'}},alignment:{horizontal:'right',vertical:'middle',indent:1}});
 w.mergeCells('E4:F4');cl(w,'E4',s,{font:{name:'Arial',size:9,color:{argb:'FF9CA3AF'}},alignment:{horizontal:'right',indent:1}});
},
sheet=(wb,n,h,r,money=[])=>{const w=wb.addWorksheet(n,{properties:{tabColor:{argb:'FFDC2626'}},views:[{state:'frozen',ySplit:1,showGridLines:false}]});w.columns=h.map((x,i)=>({header:x,width:Math.max(14,x.length+6),style:money.includes(i)?{numFmt:RPF}:{}}));r.forEach((a,i)=>{const t=w.addRow(a);if(i%2)t.eachCell({includeEmpty:true},c=>c.fill=fl('FFF9FAFB'))});const b=w.getRow(1);b.height=26;b.eachCell(c=>{c.fill=BK;c.font={name:'Arial',bold:true,size:10,color:{argb:'FFFFFFFF'}};c.alignment={vertical:'middle',indent:1}});w.autoFilter={from:{row:1,column:1},to:{row:1,column:h.length}};return w};
async function invoice(id){
 const o=L('orders',[]).find(o=>o.id==id),pm=L('pay',[]).find(p=>p.name==o.pay),pend=['Unpaid','Verifying'].includes(o.status);await XL();
 const wb=new ExcelJS.Workbook(),w=wb.addWorksheet('Invoice',{properties:{tabColor:{argb:'FFDC2626'}},views:[{showGridLines:false}],pageSetup:{paperSize:9,orientation:'portrait',fitToPage:true,fitToWidth:1,fitToHeight:0,horizontalCentered:true,margins:{left:.4,right:.4,top:.5,bottom:.5,header:.3,footer:.3}}}),
 P=(a,v,f,x)=>cl(w,a,v,{font:{name:'Arial',size:10,color:{argb:'FF111827'},...f},alignment:{vertical:'middle'},...x}),
 AL=['center','left','center','right','right'],GY={color:{argb:'FF9CA3AF'}};
 wb.creator='MOJAKS.CO';w.columns=[3,7,46,8,18,20,3].map(width=>({width}));
 hdr(w,'INVOICE','No. '+o.id);
 P('B7','TAGIHAN KEPADA',{size:8,bold:true,...GY},{alignment:{indent:1}});
 P('B8',o.name,{size:13,bold:true},{alignment:{vertical:'middle',indent:1}});
 w.mergeCells('B9:D10');P('B9',o.addr,{color:{argb:'FF6B7280'}},{alignment:{wrapText:true,vertical:'top',indent:1}});
 [['Tanggal',o.date],['Pembayaran',o.pay]].forEach((t,i)=>{P('E'+(7+i),t[0],{size:9,...GY},{alignment:{horizontal:'right'}});P('F'+(7+i),t[1],{bold:true},{alignment:{horizontal:'right',indent:1}})});
 P('E9','Status',{size:9,...GY},{alignment:{horizontal:'right'}});P('F9',o.status.toUpperCase(),{size:9,bold:true,color:{argb:'FFFFFFFF'}},{fill:fl(SC[o.status]),alignment:{horizontal:'center',vertical:'middle'}});w.getRow(9).height=20;
 ['NO','DESKRIPSI','QTY','HARGA','JUMLAH'].forEach((h,i)=>P('BCDEF'[i]+12,h,{size:9,bold:true,color:{argb:'FFFFFFFF'}},{fill:BK,alignment:{horizontal:AL[i],vertical:'middle',indent:i==1||i>2?1:0}}));w.getRow(12).height=26;
 o.items.forEach((x,i)=>{const r=13+i;w.getRow(r).height=26;[i+1,x.name,x.q,x.price,x.price*x.q].forEach((v,j)=>P('BCDEF'[j]+r,v,{bold:j==4},{numFmt:j>2?RPF:'General',border:{bottom:LN},...(i%2?{fill:fl('FFF9FAFB')}:{}),alignment:{horizontal:AL[j],vertical:'middle',indent:j==1||j>2?1:0}}))});
 let r=14+o.items.length;
 [['Subtotal',o.sub],['Ongkir',o.ship]].forEach((t,i)=>{P('E'+(r+i),t[0],{color:{argb:'FF6B7280'}},{alignment:{horizontal:'right'}});P('F'+(r+i),t[1],{bold:true},{numFmt:'"Rp "#,##0;-"Rp "#,##0;"GRATIS"',alignment:{horizontal:'right',indent:1}})});
 r+=2;w.getRow(r).height=32;
 P('E'+r,'TOTAL',{size:11,bold:true,color:{argb:'FFFFFFFF'}},{fill:BK,alignment:{horizontal:'right',vertical:'middle',indent:1}});
 P('F'+r,o.total,{size:14,bold:true,color:{argb:'FFFFFFFF'}},{fill:RDF,numFmt:RPF,alignment:{horizontal:'right',vertical:'middle',indent:1}});
 r+=2;P('B'+r,'DETAIL PEMBAYARAN',{size:8,bold:true,...GY},{alignment:{indent:1}});
 w.mergeCells(`B${r+1}:F${r+2}`);
 P('B'+(r+1),o.status=='Cancelled'?'Pesanan dibatalkan.':pend?(pm?`Transfer ke ${pm.name}: ${pm.no} a.n. ${pm.holder}. ${pm.note||''}`:`Menunggu pembayaran via ${o.pay}.`):'Pembayaran telah diverifikasi. Terima kasih!',{color:{argb:'FF374151'}},{alignment:{wrapText:true,vertical:'top',indent:1}});
 r+=4;'BCDEF'.split('').forEach(k=>w.getCell(k+r).border={top:LN});
 [['Terima kasih telah berbelanja di MOJAKS.CO',{size:11,bold:true}],['Invoice ini dibuat otomatis oleh sistem dan sah tanpa tanda tangan.',{size:8,...GY}]].forEach((t,i)=>{w.mergeCells(`B${r+1+i}:F${r+1+i}`);P('B'+(r+1+i),t[0],t[1],{alignment:{horizontal:'center',vertical:'middle'}})});
 'BCDEF'.split('').forEach(k=>w.getCell(k+(r+3)).fill=RDF);w.getRow(r+3).height=5;
 w.pageSetup.printArea=`A1:G${r+3}`;
 dl(wb,'Invoice-'+o.id+'.xlsx');
}

/* ---- Kerangka dashboard (admin & user) ---- */
function shell(role,menu,views){
 const u=me();if(!u||u.role!=role){location='login.html';return}
 document.body.innerHTML=`<aside class="w-64 bg-black text-white min-h-screen sticky top-0 hidden md:block p-6"><a href="index.html" class="block text-2xl font-black tracking-tighter mb-10">MOJAKS<span class="text-red-600">.CO</span></a><nav class="space-y-1">${menu.map(m=>`<a href="#${m[0]}" data-m="${m[0]}"><i class="fa-solid ${m[1]} w-5"></i><span>${m[2]}</span></a>`).join('')}<div class="pt-10"><p class="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4">System</p><a href="index.html" class="${nb} text-gray-400 hover:text-white hover:bg-gray-900"><i class="fa-solid fa-store w-5"></i><span>Visit Shop</span></a><button onclick="logout()" class="${nb} w-full text-gray-400 hover:text-red-500 hover:bg-red-600/20"><i class="fa-solid fa-arrow-right-from-bracket w-5"></i><span>Logout</span></button></div></nav></aside><main class="flex-1 min-w-0 p-4 md:p-10"><nav class="md:hidden flex gap-2 overflow-x-auto mb-6 text-sm font-bold">${menu.map(m=>`<a href="#${m[0]}" class="px-3 py-2 bg-white border rounded-lg whitespace-nowrap">${m[2]}</a>`).join('')}<button onclick="logout()" class="px-3 py-2 text-red-600">Logout</button></nav><header class="flex justify-between items-center mb-10"><div><h1 id="t" class="text-2xl font-black uppercase italic tracking-tighter"></h1><p class="text-gray-500 text-sm italic">Welcome back, ${esc(u.name)}!</p></div><div class="flex items-center space-x-4">${role=='admin'?`<a href="#orders" onclick="F='Verifying';render()" title="Payments to verify" class="relative p-2 bg-white rounded-full border shadow-sm"><i class="fa-regular fa-bell"></i><span id="bell" class="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-red-600 text-white text-[9px] font-bold rounded-full text-center leading-4"></span></a>`:''}<img src="https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=000&color=fff" class="w-10 h-10 rounded-full"></div></header><div id="v"></div></main>`;
 const go=()=>{
  const h=location.hash.slice(1),k=views[h]?h:menu[0][0];
  document.querySelectorAll('[data-m]').forEach(x=>x.className=nb+(x.dataset.m==k?'bg-red-600 text-white font-bold':'text-gray-400 hover:text-white hover:bg-gray-900'));
  $('#t').textContent=menu.find(m=>m[0]==k)[2];$('#v').innerHTML=views[k]();
  const b=$('#bell');if(b){const n=L('orders',[]).filter(o=>o.status=='Verifying').length;b.textContent=n;b.hidden=!n}
  if(typeof post=='function')post(k);
 };
 window.render=go;addEventListener('hashchange',go);go();
}

/* ---- Toko (index.html & category.html): ticker, navbar, kategori, produk, akun, checkout ---- */
const tickHTML=l=>{
 const one=l.map(a=>{const s=esc(a.text),ok=a.link&&!/^\s*javascript:/i.test(a.link);return`<span class="inline-flex items-center gap-8 mx-4">${ok?`<a href="${esc(a.link)}" class="hover:underline">${s}</a>`:s}<i class="not-italic text-red-500">&#9679;</i></span>`}).join(''),
 est=l.reduce((n,a)=>n+a.text.length*9+90,0),k=Math.max(1,Math.ceil(2000/est));
 return`<div class="inline-block" style="animation:tick ${Math.max(12,est*k/70)}s linear infinite" onmouseover="this.style.animationPlayState='paused'" onmouseout="this.style.animationPlayState='running'">${one.repeat(k*2)}</div>`;
};
document.head.insertAdjacentHTML('beforeend','<style>@keyframes tick{to{transform:translateX(-50%)}}</style>');
if($('#product-grid'))boot(()=>{
 const ct=L('cats',[]),pg=!!$('#cat-title'),cp=pg?(new URLSearchParams(location.search).get('c')||'all'):null,cur=ct.find(c=>c.id==cp),
 bad=pg&&!cur&&cp!='all'&&cp!='sale',FL={c:cur?cur.name:'',sale:cp=='sale',q:''},
 nv=[...ct.map(c=>[c.name,c.id]),['Collections','all'],['Sale','sale']],
 draw=()=>{
  const l=bad?[]:L('products',[]).filter(p=>(!FL.c||p.cat==FL.c)&&(!FL.sale||p.old>p.price)&&p.name.toLowerCase().includes(FL.q)),ds=p=>p.old>p.price;
  $('#product-grid').innerHTML=l.map(p=>`<div class="group product-card" data-id="${p.id}" data-name="${esc(p.name)}" data-price="${p.price}"><div class="relative overflow-hidden mb-4 aspect-[3/4] bg-gray-200"><img src="${esc(p.img)}" class="w-full h-full object-cover group-hover:scale-110 transition duration-500">${ds(p)?`<span class="absolute top-4 right-4 bg-black text-white text-[10px] font-bold px-2 py-1 uppercase italic">-${Math.round((1-p.price/p.old)*100)}%</span>`:''}${p.stock>0?'<button class="add-to-cart-btn absolute bottom-0 left-0 right-0 bg-black text-white py-3 translate-y-full group-hover:translate-y-0 transition font-bold text-sm uppercase">Add to Cart</button>':'<span class="absolute inset-x-0 bottom-0 bg-white/90 py-3 text-center text-sm font-bold uppercase">Sold Out</span>'}</div><h4 class="font-semibold text-sm">${esc(p.name)}</h4>${ds(p)?`<p class="text-gray-400 line-through text-xs inline">${rp(p.old)}</p>`:''}<p class="text-red-600 font-bold ${ds(p)?'inline ml-2':'mt-1'}">${rp(p.price)}</p></div>`).join('')||'<p class="col-span-full text-center text-gray-400 py-10">Produk tidak ditemukan.</p>';
 };
 /* navbar & tile kategori dibuat dari data kategori (diatur admin) */
 $('#desk-menu').innerHTML=nv.map(([n,c])=>`<a href="category.html?c=${c}" class="${c=='sale'||c==cp?'text-red-600':'hover:text-red-600 transition'}">${esc(n)}</a>`).join('');
 $('#mob-menu').innerHTML=nv.map(([n,c])=>`<a href="category.html?c=${c}" class="${c=='sale'?'text-red-600':'hover:text-red-600'}${c=='all'?' border-t pt-6':''}">${esc(n)}</a>`).join('');
 const cg=$('#cat-grid');
 if(cg&&ct.length)cg.innerHTML=ct.map(c=>`<a href="category.html?c=${c.id}" class="relative group overflow-hidden aspect-[3/4] bg-black block">${c.img?`<img src="${esc(c.img)}" class="w-full h-full object-cover group-hover:scale-105 transition duration-700">`:''}<div class="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition"></div><div class="absolute bottom-10 left-10 text-white"><h3 class="text-3xl font-black uppercase italic">${esc(c.name)}</h3><p class="text-sm border-b-2 border-white inline-block mt-2">Explore</p></div></a>`).join('');
 if(pg){
  const t=cur?cur.name:cp=='sale'?'Sale':cp=='all'?'Collections':'Not Found';
  document.title=t+' | MOJAKS.CO';$('#cat-title').textContent=t;
  $('#cat-desc').textContent=cur?cur.desc:cp=='sale'?'Diskon spesial, selagi stok tersedia.':cp=='all'?'Semua produk MOJAKS.CO.':'Kategori tidak ditemukan atau sedang dinonaktifkan.';
  if(cur&&cur.img){$('#cat-img').src=cur.img;$('#cat-img').classList.remove('hidden')}
  $('#cat-chips').innerHTML=[['All','all'],...nv.slice(0,-2),['Sale','sale']].map(([n,c])=>`<a href="category.html?c=${c}" class="px-4 py-2 border text-xs font-bold uppercase tracking-wider transition ${c==cp?'bg-black text-white border-black':'bg-white hover:border-black'}">${esc(n)}</a>`).join('');
 }
 document.querySelectorAll('a[href="#"]').forEach(a=>{const t=a.textContent.trim().toLowerCase();if(t=='shop now'||t=='view all')a.href='category.html?c=all'});
 /* ticker pengumuman (diatur admin) */
 const tk=$('#ticker'),an=L('ann',[]);
 if(tk){if(an.length)tk.innerHTML=tickHTML(an);else tk.textContent='FREE SHIPPING FOR ORDERS OVER '+rp(L('cfg',{free:0}).free)}
 $('nav').insertAdjacentHTML('beforeend','<div id="sbar" class="hidden border-t border-gray-100 px-4 py-3"><input id="sq" placeholder="Cari produk MOJAKS.CO..." class="container mx-auto block bg-gray-50 border rounded-lg px-4 py-2 text-sm outline-none focus:border-black"></div>');
 $('#search-btn').onclick=()=>{$('#sbar').classList.toggle('hidden');$('#sq').focus()};
 $('#sq').oninput=e=>{FL.q=e.target.value.toLowerCase();draw()};
 const u=me(),a=$('#user-link');
 if(u){a.href=u.role=='admin'?'dashboard.html':'user.html';a.title=u.name}
 $('#checkout-btn').onclick=()=>{
  if(!JSON.parse(localStorage.cart||'[]').length)return toast('Keranjang masih kosong');
  if(!u)return location='login.html?next=user.html%23cart';
  if(u.role=='admin')return toast('Admin tidak bisa checkout, gunakan akun user');
  location='user.html#cart';
 };
 draw();
});
