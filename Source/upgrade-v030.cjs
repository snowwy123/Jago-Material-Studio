// SPDX-License-Identifier: MIT
const fs=require('fs'),path=require('path'),web=path.join(__dirname,'Web');
let p=path.join(web,'material-render.js'),s=fs.readFileSync(p,'utf8');
s=s.replace("async function source(layer,size,channel){const src=layer.source;","async function source(layer,size,channel,time=0){if(typeof MaterialWorkshop!=='undefined'){const custom=await MaterialWorkshop.source(layer,size,channel,time);if(custom)return custom}const src=layer.source;");
s=s.replace("{channel='colour',skipMask=false}={}","{channel='colour',skipMask=false,time=0,seconds=4}={}");
s=s.replace('JSON.stringify([size,channel,skipMask,layer.source,layer.effects,layer.mask])','JSON.stringify([size,channel,skipMask,layer.source,layer.effects,layer.mask,layer.motion,layer.motion?.kind&&layer.motion.kind!==\'none\'||layer.source.frames?time:0,seconds])');
s=s.replace('source(layer,size,channel);','source(layer,size,channel,time);');
s=s.replace("!['smear','marble','stretch'].includes(effect.kind)","!['smear','marble','stretch','burn','carve','typewave','typeshear','slitscan'].includes(effect.kind)");
s=s.replace("let treated=['overprint'","let treated=typeof MaterialWorkshop!=='undefined'&&MaterialWorkshop.effects[effect.kind]?await MaterialWorkshop.process(c,effect,layer.source.seed||'artwork',channel):['overprint'");
s=s.replace('if(!skipMask)c=maskAlpha(c,layer.mask);cache.set(key,c);','if(!skipMask)c=maskAlpha(c,layer.mask);if(typeof MaterialWorkshop!==\'undefined\')c=MaterialWorkshop.animate(c,layer.motion,time,seconds);cache.set(key,c);');
s=s.replace("{channel='colour',normalStrength=2}={}","{channel='colour',normalStrength=2,time=0}={}");
s=s.replace("render(project,size,{channel:'height'})","render(project,size,{channel:'height',time})");s=s.replace('layerCanvas(layer,size,{channel});','layerCanvas(layer,size,{channel,time,seconds:project.motion?.seconds||4});');
fs.writeFileSync(p,s);
p=path.join(web,'material-next.js');s=fs.readFileSync(p,'utf8').replaceAll('parts.length>80','parts.length>400').replaceAll('parts.length>=80','parts.length>=400').replaceAll('parts.length<80','parts.length<400');fs.writeFileSync(p,s);
p=path.join(web,'index.html');s=fs.readFileSync(p,'utf8').replace('/*POLISH*/</script>','/*POLISH*/</script><script>/*CRAFT_ENGINE*/</script><script>/*CRAFT_UI*/</script>').replace('0.2.0','0.3.0');fs.writeFileSync(p,s);
p=path.join(__dirname,'build.cjs');s=fs.readFileSync(p,'utf8').replace("['POLISH','workshop-polish.js']","['POLISH','workshop-polish.js'],['CRAFT_ENGINE','craft-engine.js'],['CRAFT_UI','craft-ui.js']");fs.writeFileSync(p,s);
p=path.join(__dirname,'Windows/App.cs');s=fs.readFileSync(p,'utf8').replaceAll('0.2.0.0','0.3.0.0');fs.writeFileSync(p,s);
console.log('Material-only 0.3 renderer hooks prepared.');
