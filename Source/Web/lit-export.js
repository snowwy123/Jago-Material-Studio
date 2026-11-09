// SPDX-License-Identifier: MIT
// Export the same lighting model used by Lit surface; original material maps remain separate.
const MaterialExports=(()=>{
 const channels=['colour','height','normal','roughness','metallic'];
 async function lit(p,size,{time=0,canvases=null}={}){
  const c=canvases||{};
  for(const channel of ['colour','height','roughness','metallic'])if(!c[channel])c[channel]=await MaterialNext.render(p,size,{channel,time});
  return MaterialLighting.shade(c.colour,c.height,c.roughness,c.metallic,p.lighting);
 }
 async function bytes(c){const blob=await new Promise(resolve=>c.toBlob(resolve,'image/png'));if(!blob)throw Error('Could not create PNG.');return new Uint8Array(await blob.arrayBuffer());}
 async function all(input,size,{time=0,normalStrength=2,progress=()=>{}}={}){
  if(![256,512,1024,2048].includes(size))throw Error('Choose an export size between 256 and 2048.');
  const p=validate(clone(input)),c={},files=[];let count=0;
  for(const channel of channels){progress('Rendering '+channel+'…',++count,7);c[channel]=await MaterialNext.render(p,size,{channel,time,normalStrength});files.push({name:channel+'.png',bytes:await bytes(c[channel])});await new Promise(r=>setTimeout(r,0));}
  progress('Rendering lit appearance…',++count,7);c.lit=await lit(p,size,{time,canvases:c});files.push({name:'lit.png',bytes:await bytes(c.lit)});
  progress('Saving coverage…',++count,7);const mask=MaterialEngine.canvas(size),g=mask.getContext('2d'),d=c.colour.getContext('2d').getImageData(0,0,size,size);for(let i=0;i<d.data.length;i+=4){d.data[i]=d.data[i+1]=d.data[i+2]=d.data[i+3];d.data[i+3]=255;}g.putImageData(d,0,0);files.push({name:'coverage.png',bytes:await bytes(mask)});
  const enc=s=>new TextEncoder().encode(s);files.push({name:'original.jagomaterial',bytes:enc(JSON.stringify(p,null,2))},{name:'export-settings.json',bytes:enc(JSON.stringify({format:'jago-material-export',version:1,name:p.name,width:size,height:size,time,normalStrength,normalConvention:'opengl',lighting:{...MaterialLighting.defaults,...p.lighting},channels:{colour:'sRGB',lit:'sRGB / baked artistic preview lighting',height:'linear',normal:'linear',roughness:'linear',metallic:'linear',coverage:'linear / alpha coverage'}},null,2))},{name:'READ-ME.txt',bytes:enc('MATERIAL / ALL OUTPUTS\n\ncolour.png: original colour artwork, including authored treatment highlights.\nlit.png: colour shaded with the same relief, roughness, metallic and light settings as Lit surface. Lighting is baked into this image.\nheight.png, normal.png, roughness.png, metallic.png: separate artistic surface estimates.\ncoverage.png: white is opaque artwork, black is transparent.\noriginal.jagomaterial: editable source snapshot.\nexport-settings.json: resolution, animation time and lighting settings.\n\nPNG transparency follows the composition background setting. For transparent output, choose a transparent canvas background. Lit preview detail can differ when the export resolution changes; use the same size for direct pixel comparison. Selection handles, checkerboard and preview-only treatment bypass are not exported. The repeated 3x3 proof and selected-layer-only variants are separate export choices.\n')});return zipFiles(files);
 }
 return{lit,all};
})();
window.MaterialExports=MaterialExports;
const exportBeforeLit=exportDialog;
exportDialog=function(){exportBeforeLit();const kind=$('outputKind'),confirm=$('confirmExport');kind.add(new Option('Lit appearance · PNG','lit'),kind.options[1]);if(litPreview)kind.value='lit';
 const all=document.createElement('button');all.id='downloadAll';all.textContent='Download all · ZIP';all.className='space';confirm.after(all);
 const help=document.createElement('p');help.className='hint';help.textContent='Download all includes colour, lit appearance, height, normal, roughness, metallic, coverage and your editable project. Lit appearance uses your current Lighting settings; Colour keeps the original material colours.';all.after(help);
 const message=document.createElement('p');message.id='materialExportStatus';message.setAttribute('role','status');help.after(message);
 const original=confirm.onclick;let busy=false;
 async function run(bundle){if(busy)return;busy=true;const p=clone(project),size=+$('outputSize').value,time=materialTime,strength=+$('normalStrength').value;confirm.disabled=all.disabled=kind.disabled=true;try{message.textContent=bundle?'Preparing all outputs…':'Rendering lit appearance…';let result=bundle?await MaterialExports.all(p,size,{time,normalStrength:strength,progress:text=>message.textContent=text}):await MaterialExports.lit(p,size,{time});if(!bundle)result=await new Promise(r=>result.toBlob(r,'image/png'));if(!result)throw Error('Could not create export.');download(result,safeName(p.name)+(bundle?'-all-outputs.zip':'-lit.png'));closeDialog();status(bundle?'All outputs saved in one ZIP.':'Lit appearance saved with current lighting.');}catch(e){message.textContent='Export: '+e.message;status(message.textContent);}finally{busy=false;confirm.disabled=all.disabled=kind.disabled=false;}}
 confirm.onclick=()=>kind.value==='lit'?run(false):original();all.onclick=()=>run(true);
};
Object.assign(JagoMaterial,{exports:MaterialExports});

$('export').onclick=()=>exportDialog();JagoMaterial.exportDialog=exportDialog;
