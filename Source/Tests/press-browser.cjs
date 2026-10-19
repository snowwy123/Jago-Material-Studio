const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const repo=path.resolve(__dirname,'../..'),out=process.env.MATERIAL_TEST_OUTPUT||path.join(require('os').tmpdir(),'jago-material-press');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await browser.newPage({viewport:{width:1450,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.stack));await p.goto('file:///'+path.join(repo,'index.html').replaceAll('\\','/'));await p.waitForFunction(()=>window.appReady&&typeof PressFinish!=='undefined');
 const checks=await p.evaluate(async()=>{
  const n=128,base=MaterialEngine.canvas(n),ctx=base.getContext('2d');ctx.fillStyle='#808080';ctx.fillRect(0,0,n,n);ctx.clearRect(0,0,10,10);
  const mark=MaterialEngine.canvas(n),g=mark.getContext('2d');g.fillStyle='#fff';g.fillRect(32,32,64,64);g.clearRect(55,55,18,18);
  const effect=PressFinish.effect();effect.imprintSource={kind:'image',data:mark.toDataURL()};effect.params.wear=0;const before=base.toDataURL(),result={};
  for(const operation of ['foil','deboss','emboss']){
   effect.operation=operation;const outputs={};
   for(const channel of ['colour','height','roughness','metallic']){
    const c=await MaterialWorkshop.process(base,effect,'fixture',channel),d=c.getContext('2d').getImageData(0,0,n,n).data;
    const sample=(x,y)=>Array.from(d.slice((y*n+x)*4,(y*n+x)*4+4));outputs[channel]=sample(45,45);
    if(sample(5,5)[3]!==0||sample(110,110).some((v,i)=>v!==[128,128,128,255][i]))throw Error('Outside artwork or alpha changed');
   }
   result[operation]=outputs;
  }
  const a=await MaterialWorkshop.process(base,effect,'fixture','colour'),b=await MaterialWorkshop.process(base,effect,'fixture','colour');result.deterministic=a.toDataURL()===b.toDataURL();result.unchanged=base.toDataURL()===before;
  return result;
 });
 assert.ok(checks.deterministic&&checks.unchanged);assert.ok(checks.deboss.height[0]<128);assert.ok(checks.emboss.height[0]>128);assert.ok(checks.foil.height[0]<128);assert.equal(checks.foil.metallic[0],255);assert.ok(checks.foil.roughness[0]<checks.deboss.roughness[0]);
 for(const kind of ['foil','blind','raised','paper']){
  const data=await p.evaluate(async kind=>{const l=PressFinish.study(kind),doc={...fresh(),layers:[l]};validate(doc);const c=await MaterialNext.render(doc,512,{time:0});return {png:c.toDataURL(),document:doc};},kind);
  fs.writeFileSync(path.join(out,kind+'.png'),Buffer.from(data.png.split(',')[1],'base64'));fs.writeFileSync(path.join(out,kind+'.jagomaterial'),JSON.stringify(data.document,null,2));
 }
 await p.evaluate(()=>{project={...fresh(),layers:[PressFinish.study('foil')]};selected=project.layers[0].id;delete current().effects[0].params.finishModel;undoStack=[];redoStack=[];renderUI();schedule();});
 const original=await p.evaluate(()=>JSON.stringify(project));await p.locator('#pressFinishButton').click();await p.waitForFunction(()=>document.getElementById('pressStatus')?.textContent.includes('Preview only'));
 await p.locator('#pressGloss').evaluate(e=>e.value='0.9');await p.locator('#pressGloss').dispatchEvent('input');await p.waitForFunction(()=>document.getElementById('pressStatus')?.textContent.includes('Preview only'));assert.equal(await p.evaluate(()=>JSON.stringify(project)),original);
 await p.screenshot({path:path.join(out,'finish-comparison.png')});await p.locator('#pressMetal').selectOption('#c4cbd1');assert.equal(await p.locator('#pressColour').inputValue(),'#c4cbd1');await p.locator('#closeDialog').click();assert.equal(await p.evaluate(()=>JSON.stringify(project)),original);
 await p.locator('#pressFinishButton').click();await p.waitForFunction(()=>document.getElementById('pressStatus')?.textContent.includes('Preview only'));await p.locator('#pressApply').click();assert.equal(await p.evaluate(()=>current().effects[0].params.finishModel),1);await p.evaluate(()=>undo());assert.equal(await p.evaluate(()=>JSON.stringify(project)),original);
 const restored=await p.evaluate(async()=>{const data={...fresh(),layers:[PressFinish.study('blind')]},before=(await MaterialNext.render(data,256)).toDataURL();const p=validate(JSON.parse(JSON.stringify(data)));return before===(await MaterialNext.render(p,256)).toDataURL();});assert.ok(restored);
 await p.setViewportSize({width:760,height:800});await p.locator('#pressFinishButton').click();await p.waitForFunction(()=>document.getElementById('pressStatus')?.textContent.includes('Preview only'));await p.screenshot({path:path.join(out,'narrow.png')});await p.locator('#pressApply').scrollIntoViewIfNeeded();assert.ok(await p.locator('#pressApply').isVisible());await p.locator('#closeDialog').click();
 await p.setViewportSize({width:1450,height:1000});
 for(const metal of ['gold','silver','copper','rose']){
  const result=await p.evaluate(async metal=>{const l=MetalLettering.layer({metal}),doc={...fresh(),layers:[l]};validate(doc);const c=await MaterialNext.render(doc,512),flat=await MaterialNext.source({...l,effects:[]},512,'colour');const count=c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;return d.reduce((a,v,i)=>a+(i%4===3&&v>10?1:0),0);};return{png:c.toDataURL(),doc,extended:count(c)>count(flat)};},metal);
  assert.ok(result.extended,'raised side depth adds visible silhouette');fs.writeFileSync(path.join(out,'raised-'+metal+'.png'),Buffer.from(result.png.split(',')[1],'base64'));fs.writeFileSync(path.join(out,'raised-'+metal+'.jagomaterial'),JSON.stringify(result.doc,null,2));
 }
 const raisedChannels=await p.evaluate(async()=>{
  const l=MetalLettering.layer(),doc={...fresh(),layers:[l]},result={};
  for(const channel of ['height','roughness','metallic','normal']){const c=await MaterialNext.render(doc,128,{channel}),d=c.getContext('2d').getImageData(0,0,128,128).data;result[channel]=Array.from(d).some((v,i)=>i%4===0&&d[i+3]>200&&v>(channel==='metallic'?240:10));}
  const disabled=clone(l);disabled.effects[0].amount=0;const a=await MaterialNext.layerCanvas(disabled,128),b=await MaterialNext.source(disabled,128,'colour');result.zeroAmount=a.toDataURL()===b.toDataURL();return result;
 });assert.deepEqual(raisedChannels,{height:true,roughness:true,metallic:true,normal:true,zeroAmount:true});
 // Import a redistributable bundled font under a unique family, then reopen in a fresh page.
 const font=await p.evaluate(()=>JagoSuiteFonts.svgFontCSS('Cinzel').match(/base64,([^)]*)/)[1]);
 await p.locator('#metalLetteringButton').click();await p.locator('#dialogBody input[type=file]').setInputFiles({name:'Cinzel-test.ttf',mimeType:'font/ttf',buffer:Buffer.from(font,'base64')});
 await p.waitForFunction(()=>document.getElementById('metalFontInfo')?.textContent.includes('Cinzel-test.ttf'));await p.locator('#metalAdd').click();
 const embedded=await p.evaluate(()=>current());assert.ok(embedded.source.embeddedFont?.data);
 const oldPixels=await p.evaluate(async l=>(await MaterialNext.layerCanvas(l,256)).toDataURL(),embedded);
 const q=await browser.newPage();await q.goto('file:///'+path.join(repo,'index.html').replaceAll('\\','/'));await q.waitForFunction(()=>typeof MetalLettering!=='undefined');
 const newPixels=await q.evaluate(async l=>{validate({...fresh(),layers:[l]});return(await MaterialNext.layerCanvas(l,256)).toDataURL();},embedded);assert.equal(newPixels,oldPixels,'embedded custom font survives offline reopening');await q.close();
 await p.locator('#metalLetteringButton').click();await p.locator('#metalDesign').selectOption(embedded.id);await p.waitForFunction(()=>document.getElementById('metalStatus')?.textContent.includes('Preview only'));await p.locator('#metalAdd').click();assert.equal(await p.evaluate(()=>current().source.kind),'image','artwork silhouette can receive the same finish');
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'result.json'),JSON.stringify({ok:true,checks,workflow:['four rendered editable studies','comparison leaves document untouched','cancel preserves legacy effect','apply and Undo','identical pixels after serialization','narrow controls reachable','raised gold silver copper and rose gold silhouettes','imported font embedded and identical after fresh-page reopen','copied artwork silhouette uses raised metal finish'],errors},null,2));console.log('Material print-finishing checks passed.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
