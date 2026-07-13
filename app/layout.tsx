import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import ShellLayout from "@/components/layout/ShellLayout";
import SplashHide from "@/components/SplashHide";

export const metadata: Metadata = {
  title: "הבית של המאפרים | Natalie Artzi",
  description: "פלטפורמת המאסטרקלאס המובילה לאמני איפור מקצועיים",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#080608",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://player.vimeo.com" />
        <link rel="preconnect" href="https://i.vimeocdn.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://f.vimeocdn.com" crossOrigin="anonymous" />
        <link rel="preload" as="image" href="/logo-habait.png" />
        <link
          href="https://fonts.googleapis.com/css2?family=Heebo:wght@200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{ __html: `
          #__splash {
            position: fixed; inset: 0; z-index: 9999;
            background: #080608;
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            animation: __splashBgOut 0.15s ease 2.05s forwards;
          }
          #__splash::before {
            content: '';
            position: absolute; width: 360px; height: 360px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(196,133,122,0.07) 0%, transparent 65%);
          }
          #__splash-logo {
            width: clamp(80px, 28vw, 130px);
            aspect-ratio: 483/276;
            background-image: url('/logo-habait.png');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            position: relative;
            animation: __splashIn 0.9s cubic-bezier(0.22,1,0.36,1) both,
                       __splashPulse 1.1s ease-in-out 1s infinite,
                       __splashLogoOut 0.5s ease 1.55s forwards;
          }
          #__splash-bar-wrap {
            margin-top: 20px; width: 50px; height: 1px;
            background: rgba(196,133,122,0.12);
            border-radius: 1px; overflow: hidden; position: relative;
            animation: __splashLogoOut 0.5s ease 1.55s forwards;
          }
          #__splash-bar-wrap::after {
            content: '';
            position: absolute; inset: 0;
            background: linear-gradient(to right, transparent, #C4857A 50%, transparent);
            animation: __splashBar 1.6s ease-in-out 0.5s both;
          }
          #__splash-byline {
            margin-top: 14px;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 0.5rem;
            font-weight: 500;
            letter-spacing: 0.4em;
            color: rgba(196,133,122,0.5);
            text-transform: uppercase;
            animation: __splashIn 0.9s cubic-bezier(0.22,1,0.36,1) 0.3s both,
                       __splashLogoOut 0.5s ease 1.55s forwards;
          }
          @keyframes __splashIn {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes __splashPulse {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0.3; }
          }
          @keyframes __splashLogoOut {
            to { opacity: 0; }
          }
          @keyframes __splashBar {
            from { transform: translateX(-200%); }
            to   { transform: translateX(200%); }
          }
          @keyframes __splashBgOut {
            to { opacity: 0; pointer-events: none; }
          }
        ` }} />
      </head>
      <body suppressHydrationWarning style={{ background: "#080608" }}>
        <a href="#main-content" className="skip-link">דלג לתוכן הראשי</a>
        <div id="__splash">
          <div id="__splash-logo" />
          <div id="__splash-bar-wrap" />
          <div id="__splash-byline">BY NATALIE ARTSI</div>
        </div>
        {/* Vanilla JS — removes splash at 2.6s without waiting for React hydration */}
        <script dangerouslySetInnerHTML={{ __html: `setTimeout(function(){var e=document.getElementById('__splash');if(e)e.remove()},2600)` }} />
        <SplashHide />
        <Providers>
          <ShellLayout>
            {children}
          </ShellLayout>
        </Providers>
        {/* Vanilla JS accessibility widget — zero React bundle impact */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){
var KEY='habait-a11y-v1';
var MAP={highlightLinks:'a11y-highlight-links',highContrast:'a11y-high-contrast',textSpacing:'a11y-text-spacing',largeText:'a11y-large-text',hideImages:'a11y-hide-images',noAnimations:'a11y-no-animations',largeCursor:'a11y-large-cursor',dyslexia:'a11y-dyslexia',lineHeight:'a11y-line-height',tooltips:'a11y-tooltips',grayscale:'a11y-grayscale',textAlign:'a11y-text-align'};
var DFLT={highlightLinks:false,highContrast:false,textSpacing:false,largeText:false,hideImages:false,noAnimations:false,largeCursor:false,dyslexia:false,lineHeight:false,tooltips:false,grayscale:false,textAlign:false};
var OPTS=[
  {k:'highlightLinks',l:'\\u05D4\\u05D3\\u05D2\\u05E9\\u05EA \\u05E7\\u05D9\\u05E9\\u05D5\\u05E8\\u05D9\\u05DD',s:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>'},
  {k:'highContrast',l:'\\u05E0\\u05D9\\u05D2\\u05D5\\u05D3\\u05D9\\u05D5\\u05EA \\u05D1\\u05D4\\u05D9\\u05E8\\u05D4',s:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>'},
  {k:'textSpacing',l:'\\u05E8\\u05D9\\u05D5\\u05D5\\u05D7 \\u05D8\\u05E7\\u05E1\\u05D8',s:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 10H3M21 6H3M21 14H3M21 18H3"/></svg>'},
  {k:'largeText',l:'\\u05D8\\u05E7\\u05E1\\u05D8 \\u05D2\\u05D3\\u05D5\\u05DC',s:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>'},
  {k:'hideImages',l:'\\u05D4\\u05E1\\u05EA\\u05E8\\u05EA \\u05EA\\u05DE\\u05D5\\u05E0\\u05D5\\u05EA',s:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="2" x2="22" y2="22"/><path d="M10.41 10.41a2 2 0 1 1-2.83-2.83"/><path d="M21.17 21.17A2 2 0 0 1 20 22H4a2 2 0 0 1-2-2V6c0-.53.21-1.01.55-1.36"/></svg>'},
  {k:'noAnimations',l:'\\u05D1\\u05D9\\u05D8\\u05D5\\u05DC \\u05D4\\u05E0\\u05E4\\u05E9\\u05D5\\u05EA',s:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="10" y1="15" x2="10" y2="9"/><line x1="14" y1="15" x2="14" y2="9"/></svg>'},
  {k:'largeCursor',l:'\\u05E1\\u05DE\\u05DF',s:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m4 4 7.07 17 2.51-7.39L21 11.07z"/></svg>'},
  {k:'dyslexia',l:'\\u05EA\\u05DE\\u05D9\\u05DB\\u05D4 \\u05D1\\u05D3\\u05D9\\u05E1\\u05DC\\u05E7\\u05E1\\u05D9\\u05D4',s:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>'},
  {k:'lineHeight',l:'\\u05D2\\u05D5\\u05D1\\u05D4 \\u05E9\\u05D5\\u05E8\\u05D4',s:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="9" y2="18"/></svg>'},
  {k:'tooltips',l:'\\u05EA\\u05D0\\u05D5\\u05E8\\u05D9\\u05DD',s:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'},
  {k:'grayscale',l:'\\u05E8\\u05D5\\u05D5\\u05D9',s:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>'},
  {k:'textAlign',l:'\\u05D9\\u05D9\\u05E9\\u05D5\\u05E8 \\u05D8\\u05E7\\u05E1\\u05D8',s:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/></svg>'}
];
var st=Object.assign({},DFLT);
try{var _r=localStorage.getItem(KEY);if(_r){var _p=JSON.parse(_r);Object.keys(_p).forEach(function(k){if(k in st)st[k]=!!_p[k];});}}catch(_e){}
function applyAll(){var h=document.documentElement;Object.keys(MAP).forEach(function(k){h.classList[st[k]?'add':'remove'](MAP[k]);});}
applyAll();
function persist(){try{localStorage.setItem(KEY,JSON.stringify(st));}catch(_e){}}
function anyOn(){return Object.keys(st).some(function(k){return st[k];});}
function buildWidget(){
  var isOpen=false;
  var isLarge=false;
  var cur=document.createElement('div');
  cur.setAttribute('aria-hidden','true');
  cur.style.cssText='display:none;position:fixed;border-radius:50%;border:2.5px solid #1a3a5c;background:rgba(26,58,92,0.12);pointer-events:none;z-index:99999;width:36px;height:36px;transform:translate(-50%,-50%);transition:left .04s linear,top .04s linear';
  document.body.appendChild(cur);
  if(st.largeCursor)cur.style.display='block';
  window.addEventListener('mousemove',function(e){if(st.largeCursor){cur.style.left=e.clientX+'px';cur.style.top=e.clientY+'px';}});
  var active=anyOn();
  var btn=document.createElement('button');
  btn.id='a11y-trigger';
  btn.type='button';
  btn.setAttribute('aria-label','\\u05E4\\u05EA\\u05D7 \\u05EA\\u05E4\\u05E8\\u05D9\\u05D8 \\u05E0\\u05D2\\u05D9\\u05E9\\u05D5\\u05EA (CTRL+U)');
  btn.setAttribute('aria-expanded','false');
  btn.setAttribute('aria-haspopup','dialog');
  btn.style.cssText='position:fixed;bottom:24px;left:24px;width:50px;height:50px;border-radius:50%;background:#0f0b0e;border:2px solid '+(active?'#C4857A':'rgba(196,133,122,0.35)')+';color:#C4857A;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:9990;box-shadow:'+(active?'0 4px 20px rgba(196,133,122,0.3)':'0 4px 16px rgba(0,0,0,0.5)')+';transition:border-color .2s,box-shadow .2s;padding:0;flex-shrink:0';
  var dot=document.createElement('span');
  dot.id='a11y-dot';
  dot.setAttribute('aria-hidden','true');
  dot.style.cssText='position:absolute;top:6px;right:6px;width:8px;height:8px;border-radius:50%;background:#C4857A;border:2px solid #0f0b0e;display:'+(active?'block':'none');
  btn.innerHTML='<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="4.2" r="2.4"/><path d="M12 7L12 14.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" fill="none"/><path d="M3 9.5L21 9.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" fill="none"/><path d="M12 14.5L7.5 21.5" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" fill="none"/><path d="M12 14.5L16.5 21.5" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" fill="none"/></svg>';
  btn.appendChild(dot);
  document.body.appendChild(btn);
  function refreshBtn(){
    var a=anyOn();
    btn.style.border='2px solid '+(a?'#C4857A':'rgba(196,133,122,0.35)');
    btn.style.boxShadow=a?'0 4px 20px rgba(196,133,122,0.3)':'0 4px 16px rgba(0,0,0,0.5)';
    dot.style.display=a?'block':'none';
  }
  var panel=document.createElement('div');
  panel.id='a11y-panel';
  panel.setAttribute('role','dialog');
  panel.setAttribute('aria-label','\\u05EA\\u05E4\\u05E8\\u05D9\\u05D8 \\u05E0\\u05D2\\u05D9\\u05E9\\u05D5\\u05EA');
  panel.setAttribute('aria-modal','false');
  panel.setAttribute('dir','rtl');
  panel.style.cssText='display:none;position:fixed;bottom:86px;left:24px;width:310px;max-height:82vh;overflow-y:auto;background:#fff;border-radius:18px;box-shadow:0 12px 48px rgba(0,0,0,0.35),0 2px 8px rgba(0,0,0,0.2);z-index:9991;font-family:Heebo,system-ui,sans-serif;transition:width .2s ease';
  var hdr=document.createElement('div');
  hdr.style.cssText='display:flex;align-items:center;justify-content:space-between;padding:13px 16px;background:#1a3a5c;border-radius:18px 18px 0 0;color:#fff;position:sticky;top:0;z-index:2';
  var hdrTitle=document.createElement('span');
  hdrTitle.style.cssText='font-weight:700;font-size:0.88rem;letter-spacing:0.01em';
  hdrTitle.textContent='\\u05EA\\u05E4\\u05E8\\u05D9\\u05D8 \\u05E0\\u05D2\\u05D9\\u05E9\\u05D5\\u05EA (CTRL+U)';
  var closeBtn=document.createElement('button');
  closeBtn.setAttribute('aria-label','\\u05E1\\u05D2\\u05D5\\u05E8 \\u05EA\\u05E4\\u05E8\\u05D9\\u05D8 \\u05E0\\u05D2\\u05D9\\u05E9\\u05D5\\u05EA');
  closeBtn.style.cssText='background:rgba(255,255,255,0.15);border:1.5px solid rgba(255,255,255,0.4);border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;color:#fff;cursor:pointer;flex-shrink:0;padding:0';
  closeBtn.innerHTML='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  hdr.appendChild(hdrTitle);
  hdr.appendChild(closeBtn);
  panel.appendChild(hdr);
  var body=document.createElement('div');
  body.style.cssText='padding:12px 14px 16px';
  var lgRow=document.createElement('div');
  lgRow.style.cssText='display:flex;align-items:center;justify-content:flex-end;gap:10px;margin-bottom:12px';
  var lgLabel=document.createElement('span');
  lgLabel.style.cssText='font-size:0.8rem;color:#333;font-weight:600';
  lgLabel.textContent='\\u05D9\\u05D9\\u05E9\\u05D5\\u05DE\\u05D5\\u05DF \\u05D2\\u05D3\\u05D5\\u05DC';
  var lgToggle=document.createElement('button');
  lgToggle.setAttribute('aria-pressed','false');
  lgToggle.setAttribute('aria-label','\\u05DE\\u05E6\\u05D1 \\u05D9\\u05D9\\u05E9\\u05D5\\u05DE\\u05D5\\u05DF \\u05D2\\u05D3\\u05D5\\u05DC');
  lgToggle.style.cssText='width:44px;height:24px;border-radius:12px;background:#d1d5db;border:none;cursor:pointer;position:relative;transition:background .2s;flex-shrink:0';
  var lgThumb=document.createElement('span');
  lgThumb.style.cssText='position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.2);transition:left .2s';
  lgToggle.appendChild(lgThumb);
  lgRow.appendChild(lgLabel);
  lgRow.appendChild(lgToggle);
  body.appendChild(lgRow);
  var grid=document.createElement('div');
  grid.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:8px';
  OPTS.forEach(function(opt){
    var a=st[opt.k];
    var ob=document.createElement('button');
    ob.className='a11y-opt';
    ob.dataset.k=opt.k;
    ob.setAttribute('aria-pressed',a?'true':'false');
    ob.setAttribute('aria-label',opt.l);
    ob.style.cssText='position:relative;height:82px;border-radius:12px;border:2px solid '+(a?'#1a3a5c':'#e5e7eb')+';background:'+(a?'rgba(26,58,92,0.06)':'#f9fafb')+';cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;color:'+(a?'#1a3a5c':'#555')+';transition:border-color .18s,background .18s,color .18s;padding:6px 4px;font-family:inherit';
    var chk=document.createElement('span');
    chk.className='a11y-chk';
    chk.setAttribute('aria-hidden','true');
    chk.style.cssText='position:absolute;top:5px;right:7px;width:17px;height:17px;border-radius:50%;background:#1a3a5c;color:#fff;display:'+(a?'flex':'none')+';align-items:center;justify-content:center;font-size:10px;font-weight:800;line-height:1';
    chk.textContent='\\u2713';
    var icn=document.createElement('span');
    icn.className='a11y-icn';
    icn.innerHTML=opt.s;
    var lbl=document.createElement('span');
    lbl.style.cssText='font-size:0.64rem;font-weight:600;text-align:center;line-height:1.25;color:inherit';
    lbl.textContent=opt.l;
    ob.appendChild(chk);
    ob.appendChild(icn);
    ob.appendChild(lbl);
    grid.appendChild(ob);
  });
  body.appendChild(grid);
  var resetBtn=document.createElement('button');
  resetBtn.style.cssText='margin-top:12px;width:100%;padding:11px 12px;border-radius:10px;background:#1a3a5c;color:#fff;border:none;cursor:pointer;font-weight:700;font-size:0.82rem;display:flex;align-items:center;justify-content:center;gap:8px;font-family:inherit;letter-spacing:0.01em';
  resetBtn.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg> \\u05D0\\u05E4\\u05E1 \\u05D0\\u05EA \\u05DB\\u05DC \\u05D4\\u05D2\\u05D3\\u05E8\\u05D5\\u05EA \\u05D4\\u05E0\\u05D2\\u05D9\\u05E9\\u05D5\\u05EA';
  body.appendChild(resetBtn);
  panel.appendChild(body);
  document.body.appendChild(panel);
  function refreshOpt(ob,k){
    var a=st[k];
    ob.style.border='2px solid '+(a?'#1a3a5c':'#e5e7eb');
    ob.style.background=a?'rgba(26,58,92,0.06)':'#f9fafb';
    ob.style.color=a?'#1a3a5c':'#555';
    ob.setAttribute('aria-pressed',a?'true':'false');
    var chk=ob.querySelector('.a11y-chk');
    if(chk)chk.style.display=a?'flex':'none';
  }
  function openPanel(){isOpen=true;panel.style.display='block';btn.setAttribute('aria-expanded','true');}
  function closePanel(){isOpen=false;panel.style.display='none';btn.setAttribute('aria-expanded','false');}
  btn.addEventListener('click',function(){isOpen?closePanel():openPanel();});
  closeBtn.addEventListener('click',closePanel);
  document.addEventListener('mousedown',function(e){
    if(!isOpen)return;
    if(!panel.contains(e.target)&&!btn.contains(e.target))closePanel();
  });
  lgToggle.addEventListener('click',function(){
    isLarge=!isLarge;
    lgToggle.setAttribute('aria-pressed',isLarge?'true':'false');
    lgToggle.style.background=isLarge?'#1a3a5c':'#d1d5db';
    lgThumb.style.left=isLarge?'calc(100% - 21px)':'3px';
    panel.style.width=isLarge?'380px':'310px';
    panel.querySelectorAll('.a11y-opt').forEach(function(el){el.style.height=isLarge?'96px':'82px';});
    panel.querySelectorAll('.a11y-icn svg').forEach(function(el){el.setAttribute('width',isLarge?'30':'24');el.setAttribute('height',isLarge?'30':'24');});
  });
  grid.addEventListener('click',function(e){
    var ob=e.target.closest('.a11y-opt');
    if(!ob)return;
    var k=ob.dataset.k;
    if(!k||!(k in st))return;
    st[k]=!st[k];
    applyAll();
    persist();
    refreshOpt(ob,k);
    refreshBtn();
    if(k==='largeCursor'){cur.style.display=st.largeCursor?'block':'none';}
  });
  resetBtn.addEventListener('click',function(){
    Object.keys(DFLT).forEach(function(k){st[k]=false;});
    applyAll();
    persist();
    refreshBtn();
    cur.style.display='none';
    panel.querySelectorAll('.a11y-opt').forEach(function(ob){refreshOpt(ob,ob.dataset.k);});
  });
  document.addEventListener('keydown',function(e){
    if(e.ctrlKey&&e.key==='u'){e.preventDefault();isOpen?closePanel():openPanel();}
  });
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',buildWidget);}
else{buildWidget();}
})();` }} />
      </body>
    </html>
  );
}
