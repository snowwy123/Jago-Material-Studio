// Original guided surface workflow and bounded file exchange with 3D Workshop.
const SurfacePlayground=(()=>{
 async function pack(input,size=512,{layerId=null}={}){
  if(![256,512,1024].includes(size))throw Error('Choose a surface resolution from 256 to 1024.');
  const p=validate(clone(input)),renderProject=clone(p),maps={};if(layerId){const layer=renderProject.layers.find(l=>l.id===layerId);if(!layer)throw Error('Select a surface layer first.');renderProject.layers=[layer];layer.visible=true;renderProject.background='transparent';}
  for(const channel of ['colour','normal','roughness','metallic']){const c=await MaterialNext.render(renderProject,size,{channel,time:0,normalStrength:1});maps[channel]=c.toDataURL('image/png');if(maps[channel].length>2000000)throw Error('This surface is too detailed. Try a smaller map size.');}
  const result={format:'jago-surface',version:1,name:layerId?renderProject.layers[0].name:p.name,size,maps,source:p,scope:layerId?'selected layer':'composition',notes:'Artistic surface estimates. Colour can contain authored highlights. Workshop lighting is independent; no physical sheet thickness or live editable link.'};if(JSON.stringify(result).length>18000000)throw Error('Use smaller embedded images before sending this surface.');return result;
 }
 function open(){
  dialog('Surface workshop','<p>Make artwork into a finished swatch, then light or stage it.</p><ol class="surface-steps"><li><strong>Choose a surface</strong><div class="row"><button data-surface="paper">Torn paper + gold</button><button data-surface="blind">Blind-stamped leather</button><button data-surface="foil">Foiled leather</button></div><small>Adds one editable layer; your existing work stays.</small></li><li><strong>Place your artwork</strong><p>Choose a surface layer, then open Foil & impressions. Import a PNG or outlined SVG, position it and compare before applying.</p><button id="surfaceFinish">Foil & impressions…</button></li><li><strong>Light and export</strong><p>Lit appearance saves the shaded look. Colour and material maps are separate. Download all includes both and your editable project.</p><button id="surfaceExport">Export / download all…</button></li><li><strong>Shape it in 3D Workshop</strong><p>Export a surface package, then choose From Material in Workshop. It carries four maps and a Material source snapshot. Lighting and sheet shape stay editable in Workshop; the Material recipe can be saved back out.</p><label>Send<select id="surfaceScope"><option value="layer">Selected surface layer</option><option value="all">Whole composition</option></select></label><label>Map resolution<select id="surfaceMapSize"><option>256</option><option selected>512</option><option>1024</option></select></label><button id="surfacePackage">Export for Workshop…</button><button id="surfaceSend" hidden>Open in 3D Workshop</button></li></ol><p id="surfacePackageStatus" role="status"></p>');
  document.querySelectorAll('[data-surface]').forEach(b=>b.onclick=()=>{if(project.layers.length>=24)return $('surfacePackageStatus').textContent='This document has 24 layers. Remove one before adding a surface.';const l=PressFinish.study(b.dataset.surface);addLayer(l);closeDialog();status('Surface added. Select Foil & impressions to replace its lettering with your artwork.');});
  $('surfaceFinish').onclick=()=>{closeDialog();PressFinish.open();};$('surfaceExport').onclick=()=>{closeDialog();exportDialog();};
  if(window.chrome?.webview){
    const send=$('surfaceSend');send.hidden=false;
    send.onclick=async()=>{
      send.disabled=true;
      try{
        const layerId=$('surfaceScope').value==='layer'?current()?.id:null;
        const data=await pack(clone(project),+$('surfaceMapSize').value,{layerId});
        chrome.webview.postMessage({type:'jago-workshop-surface',surface:JSON.stringify(data)});
      }catch(e){$('surfacePackageStatus').textContent=e.message;send.disabled=false;}
    };
    chrome.webview.addEventListener('message',event=>{
      if(event.data?.type!=='jago-workshop-surface-result')return;
      send.disabled=false;$('surfacePackageStatus').textContent=event.data.message;
    });
  }
  $('surfacePackage').onclick=async()=>{const b=$('surfacePackage'),size=+$('surfaceMapSize').value,p=clone(project),layerId=$('surfaceScope').value==='layer'?current()?.id:null;b.disabled=true;$('surfacePackageStatus').textContent='Preparing maps and keeping your source…';try{const data=await pack(p,size,{layerId});download(new Blob([JSON.stringify(data)],{type:'application/json'}),safeName(p.name)+'.jagosurface');if($('surfacePackageStatus'))$('surfacePackageStatus').textContent='Saved. In Workshop choose From Material. Core work stays offline and neither app requires the other.';}catch(e){if($('surfacePackageStatus'))$('surfacePackageStatus').textContent=e.message;}finally{if(b.isConnected)b.disabled=false;}};
 }
 const button=document.createElement('button');button.id='surfaceWorkshop';button.textContent='Surface workshop…';button.onclick=open;($('craftBench')||document.querySelector('header')).append(button);
 const css=document.createElement('style');css.textContent='.surface-steps{padding-left:22px}.surface-steps>li{padding:10px 0;border-bottom:1px solid var(--line)}.surface-steps strong{display:block;margin-bottom:8px}.surface-steps p{margin:6px 0}.surface-steps small{color:var(--muted)}';document.head.append(css);
 return{pack,open};
})();
Object.assign(JagoMaterial,{surfacePlayground:SurfacePlayground});
