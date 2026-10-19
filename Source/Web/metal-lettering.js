// SPDX-License-Identifier: MIT
// Extruded 2D silhouettes with an editable metal face; no external renderer required.
const MetalLettering=(()=>{
 const E=MaterialEngine,W=MaterialWorkshop,C=E.clamp;
 const metals={gold:{name:'Gold',colour:'#d5aa4f'},silver:{name:'Silver',colour:'#c4cbd1'},copper:{name:'Copper',colour:'#c78556'},rose:{name:'Rose gold',colour:'#d49b8a'},platinum:{name:'Platinum',colour:'#d5d3c8'}};
 const fontLoads=new Map();
 const previousSource=W.source;
 async function fontsIn(source){if(source?.embeddedFont){const f=source.embeddedFont;if(!fontLoads.has(f.family))fontLoads.set(f.family,JagoSuiteFonts.load([f]).then(families=>{if(!families.includes(f.family))throw Error('The embedded font could not be loaded.');}));await fontLoads.get(f.family);}if(source?.fill?.input)await fontsIn(source.fill.input);}
 W.source=async function(layer,...args){await fontsIn(layer.source);return previousSource(layer,...args);};
 EFFECTS.metaltype=W.effects.metaltype='Raised metal lettering';
 W.effectControls.metaltype=[['extrude','Side depth',0,.08,.025],['angle','Side direction',0,360,45],['bevel','Face bevel',0,1,.55],['gloss','Metal gloss',0,1,.8],['lightAngle','Light direction',0,360,135]];
 const previous=W.process;
 W.process=async function(c,e,seed,channel='colour',...rest){
  if(e.kind!=='metaltype')return previous(c,e,seed,channel,...rest);
  if(e.amount===0)return c;
  const amount=C(e.amount??1);const n=c.width,p=e.params||{},depth=Math.round(n*(p.extrude??.025)*(e.amount??1)),angle=(p.angle??45)*Math.PI/180,l=(p.lightAngle??135)*Math.PI/180,gloss=p.gloss??.8,bevel=p.bevel??.55;
  const tint=[1,3,5].map(i=>parseInt((e.colour||metals.gold.colour).slice(i,i+2),16)),source=c.getContext('2d').getImageData(0,0,n,n),out=E.canvas(n),ctx=out.getContext('2d');
  const mask=E.canvas(n),mc=mask.getContext('2d');mc.drawImage(c,0,0);mc.globalCompositeOperation='source-in';mc.fillStyle='#fff';mc.fillRect(0,0,n,n);
  const soft=E.canvas(n),bc=soft.getContext('2d');bc.filter='blur('+Math.max(.65,n*(.001+bevel*.0035))+'px)';bc.drawImage(mask,0,0);const alpha=bc.getImageData(0,0,n,n).data,at=(x,y)=>alpha[(Math.max(0,Math.min(n-1,y))*n+Math.max(0,Math.min(n-1,x)))*4+3]/255;
  const side=E.canvas(n),sc=side.getContext('2d');
  const steps=Math.min(160,Math.max(1,depth));
  for(let step=steps;step>=1&&depth>0;step--){
   const fraction=step/steps,dx=Math.cos(angle)*depth*fraction,dy=Math.sin(angle)*depth*fraction;
   sc.clearRect(0,0,n,n);sc.globalCompositeOperation='source-over';sc.drawImage(mask,0,0);sc.globalCompositeOperation='source-in';
   let rgb;
   if(channel==='colour'){const shade=.23+(1-fraction)*.2+Math.max(0,Math.cos(angle-l))*.16;rgb=tint.map(v=>Math.round(v*shade));}
   else if(channel==='height')rgb=Array(3).fill(Math.round(90+(1-fraction)*65));
   else if(channel==='metallic')rgb=[255,255,255];else rgb=[85,85,85];
   sc.fillStyle='rgb('+rgb.join(',')+')';sc.fillRect(0,0,n,n);ctx.drawImage(side,dx,dy);
  }
  const face=E.canvas(n),fc=face.getContext('2d'),d=fc.createImageData(n,n),s=E.seed(seed+'raised-metal');
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){
   const i=(y*n+x)*4,a=source.data[i+3];if(!a)continue;const u=x/n,v=y/n,edge=(at(x-1,y)-at(x+1,y))*Math.cos(l)+(at(x,y-1)-at(x,y+1))*Math.sin(l);
   const field=(u*Math.cos(l)+v*Math.sin(l))*Math.PI*3+(E.noise(u,v,8,s)-.5)*.8,band=Math.pow(Math.max(0,Math.cos(field)),8),shade=.38+(.5+.5*Math.sin(field+1.2))*.5;
   for(let k=0;k<3;k++){
    if(channel==='colour')d.data[i+k]=tint[k]*shade*(1-band*gloss)+(230+tint[k]*.08)*band*gloss+edge*bevel*110;
    else if(channel==='height')d.data[i+k]=170+at(x,y)*35;
    else if(channel==='metallic')d.data[i+k]=255;else d.data[i+k]=25+(1-gloss)*100;
   }d.data[i+3]=a;
  }fc.putImageData(d,0,0);ctx.drawImage(face,0,0);if(amount<1){const mixed=E.canvas(n),m=mixed.getContext('2d');m.globalAlpha=1-amount;m.drawImage(c,0,0);m.globalCompositeOperation='lighter';m.globalAlpha=amount;m.drawImage(out,0,0);return mixed;}return out;
 };
 function layer({text='JAGO',font='Georgia',metal='gold',input=null,depth=.025,embeddedFont=null}={}){
  const l=layerFrom(PRESETS[0]);l.name=(metals[metal]?.name||'Gold')+' raised lettering';l.source=input?clone(input):{kind:'text',text,font,textSize:.24,weight:'bold',light:'#ffffff',dark:'#000000',seed:'raised-metal'};
  if(embeddedFont)l.source.embeddedFont=clone(embeddedFont);
  l.effects=[{id:uid(),kind:'metaltype',enabled:true,amount:1,colour:(metals[metal]||metals.gold).colour,params:{extrude:depth,angle:45,bevel:.55,gloss:.8,lightAngle:135}}];return l;
 }
 function open(){
  const target=current()?.id,owner=project,existing=project.layers.filter(l=>l.source.kind==='text'||l.id===target);
  dialog('Raised metal lettering','<p class="hint">Make a new, transparent metal-lettering layer. Text stays editable. Copying selected artwork uses its rendered silhouette; its original remains in your project. Leave room around the design for its side depth.</p><label>Design<select id="metalDesign"><option value="text">New editable text</option>'+existing.map(l=>'<option value="'+l.id+'">Copy silhouette · '+esc(l.name)+'</option>').join('')+'</select></label><label>Words<textarea id="metalWords" maxlength="240">JAGO</textarea></label><label>Font<select id="metalFont">'+['Georgia','Arial','Times New Roman',...JagoSuiteFonts.families].filter((v,i,a)=>a.indexOf(v)===i).map(f=>'<option>'+esc(f)+'</option>').join('')+'</select></label><label>Or use an installed font family<input id="metalFontName" placeholder="Exact font family name"></label><button id="metalImportFont">Add a font file…</button><p id="metalFontInfo" class="hint">A font file added here is embedded in the new layer for offline reopening. Font licences still apply.</p><label>Metal<select id="metalChoice">'+Object.entries(metals).map(([k,v])=>'<option value="'+k+'">'+v.name+'</option>').join('')+'</select></label><label>Side depth<input id="metalDepth" type="range" min="0" max=".08" step=".001" value=".025"></label><canvas id="metalPreview" width="320" height="240" aria-label="Raised metal lettering preview"></canvas><p id="metalStatus" role="status"></p><button id="metalAdd" class="primary">Add metal lettering</button>');
  let embeddedFont=null,ticket=0,pending=null;const inputFile=document.createElement('input');inputFile.type='file';inputFile.accept='.ttf,.otf,.woff,.woff2';inputFile.hidden=true;$('dialogBody').append(inputFile);
  async function build(){let input=null;if($('metalDesign').value!=='text'){const source=owner.layers.find(l=>l.id===$('metalDesign').value);if(!source)throw Error('The artwork is no longer available.');const rendered=await MaterialNext.render({...clone(owner),background:'transparent',layers:[{...clone(source),visible:true}]},512);input={kind:'image',data:rendered.toDataURL()};}
   const font=$('metalFontName').value.trim()||$('metalFont').value;await document.fonts.load('20px "'+font.replaceAll('"','')+'"');return layer({text:$('metalWords').value,font,metal:$('metalChoice').value,input,depth:+$('metalDepth').value,embeddedFont:font===embeddedFont?.family?embeddedFont:null});}
  async function preview(){const serial=++ticket;try{if(!$('metalPreview'))return;$('metalStatus').textContent='Preparing lettering…';pending=await build();const c=await MaterialNext.layerCanvas(pending,320);if(serial!==ticket||!$('metalPreview'))return;const ctx=$('metalPreview').getContext('2d');ctx.clearRect(0,0,320,240);ctx.drawImage(c,0,-40,320,320);$('metalStatus').textContent='Preview only. Fine controls are available in Treatments after adding it.';}catch(e){if(serial===ticket&&$('metalStatus'))$('metalStatus').textContent=e.message;}}
  for(const id of ['metalDesign','metalWords','metalFont','metalFontName','metalChoice','metalDepth'])$(id).oninput=()=>preview();
  $('metalImportFont').onclick=()=>inputFile.click();inputFile.onchange=async()=>{try{const file=inputFile.files[0];if(!file)return;if(file.size>6000000)throw Error('Use a font under 6 MB.');const bytes=await file.arrayBuffer(),hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).slice(0,8).map(b=>b.toString(16).padStart(2,'0')).join('');let binary='';for(const b of new Uint8Array(bytes))binary+=String.fromCharCode(b);const record={family:'JagoFace-'+hash,data:btoa(binary)};const loaded=await JagoSuiteFonts.load([record]);if(!loaded.includes(record.family))throw Error('This font could not be loaded.');embeddedFont=record;let option=[...$('metalFont').options].find(o=>o.value===record.family);if(!option){option=new Option(file.name,record.family);$('metalFont').add(option);}option.textContent=file.name;$('metalFont').value=record.family;$('metalFontName').value='';$('metalFontInfo').textContent=file.name+' · embedded in this layer when added';await preview();}catch(e){if($('metalStatus'))$('metalStatus').textContent=e.message;}finally{inputFile.value='';}};
  $('metalAdd').onclick=async()=>{const b=$('metalAdd');b.disabled=true;try{const next=await build();if(project!==owner)throw Error('The project changed. Reopen lettering.');if(project.layers.length>=24)throw Error('Keep up to 24 layers.');validate({...clone(project),layers:[...project.layers,next]});ticket++;addLayer(next);closeDialog();craftTab='treatments';renderUI();schedule();}catch(e){if($('metalStatus'))$('metalStatus').textContent=e.message;b.disabled=false;}};preview();
 }
 const beforeValidate=validate;validate=function(value){const p=beforeValidate(value);function font(s){if(s?.embeddedFont){const f=s.embeddedFont;if(typeof f.family!=='string'||!/^JagoFace-[0-9a-f]{16}$/.test(f.family)||typeof f.data!=='string'||f.data.length>8100000||!/^[A-Za-z0-9+/=]+$/.test(f.data))throw Error('Invalid embedded typeface.');}if(s?.fill?.input)font(s.fill.input);}for(const l of p.layers){font(l.source);for(const e of l.effects){if(e.imprintSource)font(e.imprintSource);if(e.kind==='metaltype'){if(e.colour&&!/^#[0-9a-f]{6}$/i.test(e.colour))throw Error('Invalid metal colour.');for(const [key,min,max]of [['extrude',0,.08],['angle',0,360],['bevel',0,1],['gloss',0,1],['lightAngle',0,360]])if(e.params?.[key]!==undefined)checkNumber(e.params[key],min,max,key);}}}return p;};
 const previousInspector=renderInspector;renderInspector=function(){previousInspector();for(const e of current()?.effects||[]){if(e.kind!=='metaltype')continue;const row=document.querySelector('[data-treatment-id=\"'+e.id+'\"]');if(!row)continue;const label=document.createElement('label');label.textContent='Face metal';const select=document.createElement('select');for(const [key,m]of Object.entries(metals))select.add(new Option(m.name,key));select.add(new Option('Custom colour','custom'));select.value=Object.keys(metals).find(k=>metals[k].colour===e.colour)||'custom';select.onchange=()=>{if(metals[select.value])change(()=>e.colour=metals[select.value].colour);};label.append(select);const colour=document.createElement('input');colour.type='color';colour.value=e.colour||metals.gold.colour;colour.setAttribute('aria-label','Custom face colour');colour.onchange=()=>change(()=>e.colour=colour.value);label.append(colour);row.append(label);}};
 const button=document.createElement('button');button.id='metalLetteringButton';button.textContent='Raised metal lettering…';button.onclick=open;document.querySelector('.viewbar .row').append(button);
 CRAFT_RECIPES.push({name:'Gold raised lettering',family:'Metal',note:'Editable type with a bevelled face and visible side depth.',build:()=>layer()},{name:'Silver raised lettering',family:'Metal',note:'Silver face, side walls and separate surface channels.',build:()=>layer({metal:'silver',font:'Arial'})});
 CRAFT_RECIPES.push({name:'Silver-foiled leather',family:'Leather',note:'Silver hot foil with adjustable pressure and folds.',build:()=>{const l=PressFinish.study('foil');l.name='Silver-foiled leather';l.effects[0].colour=metals.silver.colour;return l;}},{name:'Rose-gold cotton label',family:'Paper',note:'Rose-gold foil on torn cotton stock.',build:()=>{const l=PressFinish.study('paper');l.name='Rose-gold cotton label';l.effects[0].colour=metals.rose.colour;return l;}});
 const style=document.createElement('style');style.textContent='#metalPreview{display:block;width:100%;max-height:260px;object-fit:contain;background:repeating-conic-gradient(#9993 0 25%,transparent 0 50%) 0/16px 16px}';document.head.append(style);
 return {metals,layer,open,fontsIn};
})();
Object.assign(JagoMaterial,{PressFinish,MetalLettering,validate});renderUI();schedule();
