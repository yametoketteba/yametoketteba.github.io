import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const read=n=>fs.readFileSync(path.join(root,n),'utf8');
const settings=JSON.parse(read('content/settings.json'));
const pages=['index','portfolio','request-corporate','request-personal','contact'];
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const link=(slug,label,active)=>`<a href="${slug}.html"${active===slug?' aria-current="page"':''}>${label}</a>`;
const formatWork=item=>{const m=item.match(/^(.*)（([^（）]+)）$/);return m?`<span class="work-title">${esc(m[1])}</span><span class="work-credit">${esc(m[2])}</span>`:esc(item);};
fs.rmSync(path.join(root,'dist'),{recursive:true,force:true});
fs.mkdirSync(path.join(root,'dist/assets'),{recursive:true});
for(const name of pages){
 const meta=JSON.parse(read(`content/${name}.json`));
 let content=read(`content/${name}.html`);
 if(name==='portfolio')content=content.replace('{{WORKS}}','<div class="records"><p class="lead">（主なもの）</p>'+JSON.parse(read('content/works.json')).map(group=>`<section class="group"><h3 class="year">${esc(group.year)}</h3><ul>${group.items.map(item=>`<li>${formatWork(item)}</li>`).join('')}</ul></section>`).join('')+'</div>');
 if(name.startsWith('request-')) {
  const prices=JSON.parse(read(`content/prices-${name.slice(8)}.json`));
  content=content.replace(/\{\{PRICE:([^}]+)\}\}/g,(_,service)=>{
   const item=prices.find(item=>item.service===service);
   if(!item)throw Error('料金情報がありません: '+service);
   return `<dl class="service-price"><dt>料金</dt><dd>${esc(item.price)}</dd><dt>納期</dt><dd>${esc(item.delivery)}</dd></dl>`;
  });
 }
 let form='<p class="form-pending">お問い合わせは、下記のメールアドレスへお寄せください。</p>';
 if(settings.googleFormUrl){
  const url=new URL(settings.googleFormUrl);
  if(url.protocol!=='https:'||url.hostname!=='docs.google.com'||!/^\/forms\/d\/e\/[^/]+\/viewform$/.test(url.pathname)) throw Error('回答者向けGoogleフォームURLを指定してください。');
  url.search='';const direct=url.href;url.searchParams.set('embedded','true');
  form=`<div class="gform-embed"><iframe class="gform-frame" src="${esc(url.href)}" style="height:${Number(settings.googleFormHeight)||1600}px" title="お問い合わせフォーム" loading="lazy"></iframe><p><a href="${esc(direct)}" target="_blank" rel="noopener">フォームを別の画面で開く ↗</a></p></div>`;
 }
 content=content.replace('{{CONTACT_FORM}}',form);
 const html=`<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(meta.title)}</title><meta name="description" content="${esc(meta.description)}"><link rel="canonical" href="${settings.origin}/${name==='index'?'':name+'.html'}"><link rel="icon" href="favicon.png"><link rel="apple-touch-icon" href="apple-touch-icon.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;500;700&amp;display=swap" rel="stylesheet"><link rel="stylesheet" href="assets/style.css"><script src="assets/main.js" defer></script></head>
<body><a class="skip-link" href="#main">本文へ移動</a><header class="site-header"><nav class="nav" aria-label="メインメニュー"><a class="site-name" href="index.html">ブブゼラ<span>Vuvuzela</span></a><button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-menu">メニュー</button><ul class="nav-menu" id="nav-menu"><li>${link('index','トップページ',name)}</li><li>${link('portfolio','作品集と実績',name)}</li><li class="has-submenu"><details><summary${name.startsWith('request-')?' data-current="true"':''}>ご依頼の詳細</summary><ul class="submenu"><li>${link('request-personal','個人の方',name)}</li><li>${link('request-corporate','法人の方',name)}</li></ul></details></li><li>${link('contact','お問い合わせ',name)}</li></ul></nav></header><main class="page" id="main">${content}</main>${read('templates/footer.html')}</body></html>`;
 fs.writeFileSync(path.join(root,'dist',name+'.html'),html);
}
for(const file of ['style.css','main.js']) fs.copyFileSync(path.join(root,'assets',file),path.join(root,'dist/assets',file));
for(const file of ['avatar.png','favicon.png','apple-touch-icon.png'])fs.copyFileSync(path.join(root,file),path.join(root,'dist',file));
fs.writeFileSync(path.join(root,'dist/.nojekyll'),'');
fs.writeFileSync(path.join(root,'dist/404.html'),'<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ページが見つかりません | ブブゼラ</title><link rel="stylesheet" href="/assets/style.css"><main class="card"><h1>ページが見つかりません</h1><p><a href="/">トップページへ戻る</a></p></main></html>');
fs.writeFileSync(path.join(root,'dist/robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${settings.origin}/sitemap.xml\n`);
fs.writeFileSync(path.join(root,'dist/sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(p=>`<url><loc>${settings.origin}/${p==='index'?'':p+'.html'}</loc></url>`).join('')}</urlset>`);
console.log('Built 5 pages into dist. Google form: '+(settings.googleFormUrl?'connected':'pending'));
