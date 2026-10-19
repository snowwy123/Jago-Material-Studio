// SPDX-License-Identifier: MIT
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),web=path.join(__dirname,'Web');
let html=fs.readFileSync(path.join(web,'index.html'),'utf8');
const worker=['engine.js','surface-core.js','material-worker.js'].map(f=>fs.readFileSync(path.join(web,f),'utf8')).join('\n');new vm.Script(worker);
html=html.replace('/*WORKER*/',()=>('const MATERIAL_WORKER_SOURCE='+JSON.stringify(worker)+';').replace(/<\/script/gi,'<\\/script'));
for(const [slot,file]of [['STUDIO_REFINEMENT','studio-refinement.js'],['SEED_WORKSHOP','seed-workshop.js'],['STUDIO_REFINEMENT_STYLE','studio-refinement.css'],['CRAFT_BENCH','craft-bench.js'],['CRAFT_BENCH_STYLE','craft-bench.css'],['STYLE','style.css'],['CRAFT_STYLE','craft-style.css'],['ENGINE','engine.js'],['CORE','surface-core.js'],['RENDER','material-render.js'],['APP','app.js'],['NEXT','material-next.js'],['POLISH','workshop-polish.js'],['CRAFT_ENGINE','craft-engine.js'],['CRAFT_UI','craft-ui.js'],['CRAFT_MOTION','craft-motion.js'],['CRAFT_DEPTH','craft-depth.js'],['CRAFT_FINISH','craft-finish.js'],['REFINEMENT_ENGINE','refinement-engine.js'],['REFINEMENT_UI','refinement-ui.js'],['REFINEMENT_TOOLS','refinement-tools.js'],['REFINEMENT_STYLE','refinement-style.css'],['OBJECT_ENGINE','object-engine.js'],['OBJECT_UI','object-ui.js'],['OBJECT_STYLE','object-style.css'],['GLASS_REFINEMENT','glass-refinement.js'],['DRAWING_WORKSHOP','drawing-workshop.js'],['WORKSPACE_UI','workspace-ui.js'],['ARTWORK_TOOLS','artwork-tools.js'],['MATERIAL_DEPTH','material-depth.js'],['EDITOR_DEPTH','editor-depth.js'],['MOTION_WORKSHOP','motion-workshop.js'],['PIECE_TREATMENTS','piece-treatments.js'],['WORKSHOP_REFINEMENT','workshop-refinement.js'],['WORKSHOP_REFINEMENT_STYLE','workshop-refinement.css'],['EDITOR_DEPTH_STYLE','editor-depth.css'],['WORKSPACE_STYLE','workspace-style.css'],['CRAFT_CONNECT','craft-connect.js'],['SUITE','suite-bridge.js'],['ADAPTER','suite-adapter.js'],['SUITE_ROUND','suite-round.js'],['SURFACE_WORKBENCH','surface-workbench.js'],['SCANNED_TEXTURE','scanned-texture.js'],['PRESS_FINISH','press-finish.js'],['METAL_LETTERING','metal-lettering.js']]){const code=fs.readFileSync(path.join(web,file),'utf8');if(file.endsWith('.js'))new vm.Script(code);html=html.replace('/*'+slot+'*/',()=>code.replace(/<\/script/gi,'<\\/script'))}
fs.writeFileSync(path.join(root,'index.html'),html);fs.writeFileSync(path.join(root,'Jago-Material-Studio.html'),html);console.log('Material offline edition built.');





