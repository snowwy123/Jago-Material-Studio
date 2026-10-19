(async()=>{const checks=[],check=(name,value)=>{if(!value)throw Error(name);checks.push(name);};try{
 for(let i=0;i<100&&!window.appReady;i++)await new Promise(r=>setTimeout(r,100));
 const l=PressFinish.study('blind'),doc={...fresh(),layers:[l]},bare=clone(l);bare.effects=[];
 validate(doc);const [base,pressed]=await Promise.all([MaterialNext.layerCanvas(bare,192,{channel:'height'}),MaterialNext.layerCanvas(l,192,{channel:'height'})]);
 const a=base.getContext('2d').getImageData(0,0,192,192).data,b=pressed.getContext('2d').getImageData(0,0,192,192).data;let delta=0;for(let i=0;i<a.length;i+=4)delta+=b[i]-a[i];check('Pressed leather lowers generated height',delta<0);
 const colour=await MaterialNext.render(doc,256);check('Leather impression produces visible artwork',colour.getContext('2d').getImageData(0,0,256,256).data.some((v,i)=>i%4===3&&v>0));
 project=doc;selected=l.id;const before=JSON.stringify(project);PressFinish.open();for(let i=0;i<100&&!document.getElementById('pressStatus')?.textContent.includes('Preview only');i++)await new Promise(r=>setTimeout(r,50));check('Native comparison leaves project untouched',JSON.stringify(project)===before);$('pressApply').click();undo();check('Finish apply is undoable',JSON.stringify(project)===before);
 const gold=MetalLettering.layer(),silver=MetalLettering.layer({metal:'silver'});validate({...fresh(),layers:[gold,silver]});const [gc,sc]=await Promise.all([MaterialNext.layerCanvas(gold,256),MaterialNext.layerCanvas(silver,256)]);check('Gold and silver render differently',gc.toDataURL()!==sc.toDataURL());
 const saved=JSON.parse(JSON.stringify(gold));check('Raised lettering preserves editable words',saved.source.kind==='text'&&saved.source.text==='JAGO');
 const m=await MaterialNext.render({...fresh(),layers:[gold]},128,{channel:'metallic'});check('Raised lettering generates metallic coverage',m.getContext('2d').getImageData(0,0,128,128).data.some((v,i)=>i%4===0&&v>240));
 const font=JagoSuiteFonts.svgFontCSS('Cinzel').match(/base64,([^)]*)/)[1],bytes=Uint8Array.from(atob(font),c=>c.charCodeAt(0)),hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).slice(0,8).map(b=>b.toString(16).padStart(2,'0')).join(''),embedded={family:'JagoFace-'+hash,data:font};
 const custom=MetalLettering.layer({font:embedded.family,embeddedFont:embedded}),cg=await MaterialNext.layerCanvas(custom,192);check('Embedded custom font loads in Windows host',document.fonts.check('20px "'+embedded.family+'"')&&cg.width===192);
 window.suiteTestResult={ok:true,checks};
}catch(e){window.suiteTestResult={ok:false,error:e.stack,checks};}})();
