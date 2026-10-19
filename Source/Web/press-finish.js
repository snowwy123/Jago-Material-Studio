// SPDX-License-Identifier: MIT
// Artistic print-finishing renderer. Existing treatments retain their original model.
const PressFinish=(()=>{
 const E=MaterialEngine,W=MaterialWorkshop,C=E.clamp;
 const defaults={finishModel:1,depth:.45,wear:.025,bevel:.55,foilGloss:.7,foilWrinkle:.25,pressSmooth:.65,lightAngle:135};
 const previous=W.process;
 W.process=async function(c,e,seed,channel='colour',...rest){
  if(e.kind!=='imprint'||e.params?.finishModel!==1||e.operation==='ink')return previous(c,e,seed,channel,...rest);
  const n=c.width,p={...defaults,...e.params},amount=C(e.amount??1),kind=e.operation||'foil';
  const input=e.imprintSource||e.markSource||{kind:'text',text:'MADE\nBY HAND',font:'serif',light:'#ffffff',dark:'#000000',textSize:.15};
  const guide=await MaterialRefinement.artworkMask(input,n,{mode:e.coverage||'alpha',threshold:.5,softness:.1});
  const mask=E.canvas(n),mc=mask.getContext('2d');mc.translate(n*(.5+(p.markX||0)),n*(.5+(p.markY||0)));mc.rotate((p.markRotate||0)*Math.PI/180);mc.scale(p.markScale||1,p.markScale||1);mc.drawImage(guide,-n/2,-n/2);
  const blur=E.canvas(n),bc=blur.getContext('2d');bc.filter='blur('+Math.max(.65,n*(.0015+p.bevel*.006))+'px)';bc.drawImage(mask,0,0);
  const raw=mc.getImageData(0,0,n,n).data,soft=bc.getImageData(0,0,n,n).data;
  const out=E.canvas(n),ctx=out.getContext('2d');ctx.drawImage(c,0,0);const data=ctx.getImageData(0,0,n,n),source=new Uint8ClampedArray(data.data),d=data.data;
  const pressed=E.canvas(n),pc=pressed.getContext('2d');pc.filter='blur('+Math.max(.65,n*.0025)+'px)';pc.drawImage(c,0,0);const smooth=pc.getImageData(0,0,n,n).data;
  const tint=[1,3,5].map(i=>parseInt((e.colour||'#c7a65d').slice(i,i+2),16)),s=E.seed(seed+'press-finish'),angle=p.lightAngle*Math.PI/180,lx=Math.cos(angle),ly=Math.sin(angle),radius=Math.max(1,Math.round(n*.003));
  const at=(x,y)=>soft[(Math.max(0,Math.min(n-1,y))*n+Math.max(0,Math.min(n-1,x)))*4+3]/255;
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){
   const i=(y*n+x)*4;if(!source[i+3])continue;const u=x/n,v=y/n,a=raw[i+3]/255;
   const grain=E.noise(u,v,96,s),worn=C((.45-grain)*6)*p.wear,coverage=a*(1-worn),weight=coverage*amount;
   const gx=(at(x-radius,y)-at(x+radius,y)),gy=(at(x,y-radius)-at(x,y+radius));
   const edge=(gx*lx+gy*ly),rim=C(Math.hypot(gx,gy)*2),direction=kind==='emboss'?1:-1;
   let band=0,broad=0;if(channel==='colour'&&kind==='foil'){const macro=E.noise(u,v,5,s+4),fold=E.noise(u,v,36,s+8)-.5,position=(u*lx+v*ly)*Math.PI*2+macro*p.foilWrinkle*2+fold*p.foilWrinkle*.8;band=Math.pow(Math.max(0,Math.cos(position-.8)),6);broad=.5+.5*Math.sin(position+1.7);}
   for(let k=0;k<3;k++){
    if(channel==='colour'){
     const base=source[i+k],flattened=base*(1-p.pressSmooth*.75)+smooth[i+k]*p.pressSmooth*.75;
     let colour;
     if(kind==='foil'){
      const dark=.3+broad*.5+(grain-.5)*p.foilWrinkle*.14;
      const metal=tint[k]*dark,highlight=tint[k]*.3+255*.7;
      colour=metal*(1-band*p.foilGloss*.9)+highlight*band*p.foilGloss*.9;
      colour+=edge*p.depth*(38+p.foilGloss*40)+(grain-.5)*6*p.foilWrinkle;
     }else{
      // Pressed interiors retain their colour while compressed grain and edge normals reveal depth.
      colour=flattened*(kind==='deboss'?1-p.depth*.25:1+p.depth*.045);
      colour+=edge*direction*p.depth*88+rim*p.pressSmooth*6;
     }
     // Side-wall lighting may extend a little outside the mark, without changing the object alpha.
     const side=kind==='foil'?-edge*p.depth*amount*20:edge*direction*p.depth*amount*26;
     d[i+k]=base*(1-weight)+colour*weight+side*(1-a);
    }else if(channel==='height'){
     const compressed=source[i+k]*(1-weight*p.pressSmooth)+smooth[i+k]*weight*p.pressSmooth;
     const relief=(kind==='foil'?.012-p.depth*.09:direction*p.depth*.16)*at(x,y)*amount;
     d[i+k]=C(compressed/255+relief)*255;
    }else if(channel==='roughness'){
     const target=kind==='foil'?18+(1-p.foilGloss)*90+p.foilWrinkle*grain*38:source[i+k]*(1-p.pressSmooth*.45);
     d[i+k]=source[i+k]*(1-weight)+target*weight;
    }else if(channel==='metallic'&&kind==='foil')d[i+k]=source[i+k]*(1-weight)+255*weight;
   }
  }
  ctx.putImageData(data,0,0);return out;
 };
 function effect(operation='foil',text='FIELD NOTES\nNo. 01'){
  return {id:uid(),kind:'imprint',operation,enabled:true,amount:1,colour:'#d5aa4f',params:{...defaults},imprintSource:{kind:'text',text,font:'Georgia',light:'#ffffff',dark:'#000000',textSize:.11}};
 }
 function study(kind){
  const leather=kind!=='paper',l=MaterialObjects.objectLayer({shape:'label',material:leather?'leather':'paper',finish:leather?'cut':'torn',text:'',mark:'foil'});
  l.source.seed='press-study-'+kind;l.name={foil:'Hot foil on saddle leather',blind:'Blind-pressed leather',raised:'Raised leather seal',paper:'Foiled cotton stock'}[kind];
  if(leather){l.source.dark='#3c2118';l.source.light='#a66e43';l.source.details={...l.source.details,pores:42,creases:.32,grain:.65};}
  const e=effect(kind==='blind'?'deboss':kind==='raised'?'emboss':'foil',kind==='raised'?'JAGO\nLEATHERWORK':'FIELD NOTES\nNo. 01');e.params.markScale=.8;e.imprintSource.textSize=.095;if(kind==='foil'){e.params.foilGloss=.88;e.params.foilWrinkle=.45;}
  if(kind==='blind')e.params.depth=.7;if(kind==='paper'){e.params.foilWrinkle=.4;l.source.dark='#c7bfa9';l.source.light='#f0ead7';}
  l.effects=[e];return l;
 }
 function open(){
  const selectedLayer=current();if(!selectedLayer)return status('Select a surface layer first.');
  const owner=project.id,target=selectedLayer.id,before=clone(selectedLayer),candidates=before.effects.filter(e=>['imprint','surfacework'].includes(e.kind));
  dialog('Foil & leather impressions','<p class="hint">Compare the current surface with a more detailed foil or impression. Apply changes only this mark on the selected layer; the outline and material remain editable.</p><label>Mark<select id="pressMark">'+candidates.map(e=>'<option value="'+e.id+'">'+esc(EFFECTS[e.kind])+' · '+esc(e.operation||'foil')+'</option>').join('')+'<option value="new">Add new lettering</option></select></label><label>Process<select id="pressOperation"><option value="foil">Hot foil</option><option value="deboss">Blind-pressed / recessed</option><option value="emboss">Raised impression</option></select></label><label id="pressWordsLabel">Lettering<textarea id="pressWords" maxlength="240">FIELD NOTES\nNo. 01</textarea></label><div class="press-controls"><label data-foil>Metal<select id="pressMetal"><option value="#d5aa4f">Gold</option><option value="#c4cbd1">Silver</option><option value="#c78556">Copper</option><option value="#d49b8a">Rose gold</option><option value="#d5d3c8">Platinum</option><option value="">Custom colour</option></select></label><label data-foil>Foil colour<input id="pressColour" type="color" value="#d5aa4f"></label><label>Mark scale<input id="pressScale" type="range" min=".25" max="2" step=".01"></label><label>Depth<input id="pressDepth" type="range" min="0" max="1" step=".01"></label><label>Edge softness<input id="pressBevel" type="range" min="0" max="1" step=".01"></label><label>Grain compression<input id="pressSmooth" type="range" min="0" max="1" step=".01"></label><label>Light direction<input id="pressLight" type="range" min="0" max="360" step="1"></label><label data-foil>Foil gloss<input id="pressGloss" type="range" min="0" max="1" step=".01"></label><label data-foil>Foil folds<input id="pressWrinkle" type="range" min="0" max="1" step=".01"></label><label>Wear<input id="pressWear" type="range" min="0" max="1" step=".01"></label></div><div class="press-proof"><figure><canvas id="pressBefore" width="256" height="256"></canvas><figcaption>Current</figcaption></figure><figure><canvas id="pressAfter" width="256" height="256"></canvas><figcaption>Proposed finish</figcaption></figure></div><p id="pressStatus" role="status"></p><button id="pressApply" class="primary">Apply finish</button><p class="hint">Colour includes artistic highlight lighting. Height, roughness and metallic exports remain separate material data; this is not a 3D lighting simulation.</p>');
  $('dialog').classList.add('press-dialog');$('dialog').addEventListener('close',()=>$('dialog').classList.remove('press-dialog'),{once:true});const layout=document.createElement('div');layout.className='press-layout';const controls=document.querySelector('.press-controls'),proof=document.querySelector('.press-proof');controls.before(layout);layout.append(controls,proof);
  let draftEffect,ticket=0;
  const fields={pressScale:'markScale',pressDepth:'depth',pressBevel:'bevel',pressSmooth:'pressSmooth',pressLight:'lightAngle',pressGloss:'foilGloss',pressWrinkle:'foilWrinkle',pressWear:'wear'};
  const load=()=>{const original=candidates.find(e=>e.id===$('pressMark').value);draftEffect=original?clone(original):effect();draftEffect.kind='imprint';draftEffect.operation=original?.kind==='surfacework'?(original.operation==='raise'?'emboss':'deboss'):original?.operation||'foil';if(!['foil','deboss','emboss'].includes(draftEffect.operation))draftEffect.operation='foil';draftEffect.imprintSource||=draftEffect.markSource||effect().imprintSource;draftEffect.params={...defaults,...draftEffect.params,finishModel:1};$('pressOperation').value=draftEffect.operation;$('pressColour').value=draftEffect.colour||'#d5aa4f';$('pressMetal').value=[...$('pressMetal').options].some(o=>o.value===$('pressColour').value)?$('pressColour').value:'';for(const[id,key]of Object.entries(fields))$(id).value=draftEffect.params[key]??(key==='markScale'?1:defaults[key]);$('pressWordsLabel').hidden=draftEffect.imprintSource.kind!=='text';$('pressWords').value=draftEffect.imprintSource.text||'';preview();};
  const read=()=>{const e=clone(draftEffect);e.operation=$('pressOperation').value;e.colour=$('pressColour').value;for(const[id,key]of Object.entries(fields))e.params[key]=Number($(id).value);if(e.imprintSource.kind==='text')e.imprintSource.text=$('pressWords').value;return e;};
  const changedLayer=e=>{const l=clone(before),i=l.effects.findIndex(x=>x.id===e.id);if(i<0)l.effects.push(e);else l.effects[i]=e;return l;};
  async function preview(){const serial=++ticket;try{const e=read();document.querySelectorAll('[data-foil]').forEach(el=>el.hidden=e.operation!=='foil');$('pressStatus').textContent='Preparing comparison…';const [a,b]=await Promise.all([MaterialNext.layerCanvas(before,256),MaterialNext.layerCanvas(changedLayer(e),256)]);if(serial!==ticket||!$('pressAfter'))return;for(const[id,c]of [['pressBefore',a],['pressAfter',b]]){const ctx=$(id).getContext('2d');ctx.clearRect(0,0,256,256);ctx.drawImage(c,0,0);} $('pressStatus').textContent='Preview only. Your project has not changed.';}catch(error){if(serial===ticket&&$('pressStatus'))$('pressStatus').textContent=error.message;}}
  $('pressMetal').onchange=()=>{if($('pressMetal').value)$('pressColour').value=$('pressMetal').value;preview();};
  $('pressMark').onchange=load;for(const id of [...Object.keys(fields),'pressOperation','pressColour','pressWords'])$(id).oninput=()=>preview();
  $('pressApply').onclick=()=>{if(project.id!==owner||!project.layers.some(l=>l.id===target))return $('pressStatus').textContent='The project changed. Reopen this comparison.';const live=project.layers.find(l=>l.id===target);if(JSON.stringify(live)!==JSON.stringify(before))return $('pressStatus').textContent='This layer changed while previewing. Reopen the finish to preserve those edits.';const next=changedLayer(read());if(next.effects.length>16)return $('pressStatus').textContent='Keep up to sixteen treatments on a layer.';validate({...clone(project),layers:project.layers.map(l=>l.id===target?next:l)});change(()=>Object.assign(live,next));ticket++;closeDialog();craftTab='treatments';renderUI();schedule();status('Finish applied. Undo restores the previous mark.');};load();
 }
 // Generic treatment sliders remain useful after applying the comparison.
 const validateBefore=validate;validate=function(value){const p=validateBefore(value);for(const l of p.layers)for(const e of l.effects)if(e.params?.finishModel!==undefined){if(e.params.finishModel!==1)throw Error('Unknown print finish model');for(const [key,min,max]of [['bevel',0,1],['foilGloss',0,1],['foilWrinkle',0,1],['pressSmooth',0,1],['lightAngle',0,360]])if(e.params[key]!==undefined)checkNumber(e.params[key],min,max,key);}return p;};
 for(const[k,name,family]of [['foil','Hot foil on saddle leather','Leather'],['blind','Blind-pressed leather','Leather'],['raised','Raised leather seal','Leather'],['paper','Foiled cotton stock','Paper']])CRAFT_RECIPES.push({name,family,note:'Editable mark, surface, edge and separate material channels.',build:()=>study(k)});
 const previousObject=MaterialObjects.objectLayer;MaterialObjects.objectLayer=function(options){const layer=previousObject(options);for(const e of layer.effects)if(e.kind==='imprint'&&e.operation!=='ink')e.params={...defaults,...e.params,finishModel:1};return layer;};
 const launch=document.createElement('button');launch.id='pressFinishButton';launch.textContent='Foil & impressions…';launch.onclick=open;document.querySelector('.viewbar .row').append(launch);
 const css=document.createElement('style');css.textContent='.press-dialog{width:min(1060px,94vw)!important}.press-layout{display:grid;grid-template-columns:minmax(280px,.85fr) minmax(300px,1.15fr);gap:20px;align-items:start}.press-layout .press-proof{position:sticky;top:0}@media(max-width:850px){.press-layout{grid-template-columns:1fr}.press-layout .press-proof{position:static}}.press-controls{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 18px}.press-proof{display:grid;grid-template-columns:1fr 1fr;gap:12px}.press-proof figure{margin:0}.press-proof canvas{width:100%;height:auto;background:repeating-conic-gradient(#9993 0 25%,transparent 0 50%) 0/16px 16px}.press-proof figcaption{font-size:12px;text-align:center;padding:6px}';document.head.append(css);
 return {defaults,effect,study,open};
})();
renderUI();schedule();
