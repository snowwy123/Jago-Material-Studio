// SPDX-License-Identifier: MIT
const fs=require('fs'),path=require('path');
const home='C:/Jago Studio Dev',read=p=>fs.readFileSync(p,'utf8'),write=(p,s)=>fs.writeFileSync(p,s);
const shared=home+'/Suite/shared';
let bridge=read(shared+'/suite-bridge.js');
bridge=bridge.replace("worldbuilding:'Worldbuilding'","worldbuilding:'Worldbuilding',material:'Material'").replace("worldbuilding:'.jagoworld'","worldbuilding:'.jagoworld',material:'.jagomaterial'");
bridge=bridge.replace("name=adapter.id;","name=adapter.id;");
bridge=bridge.replace("type=by('suiteType').value","type=adapter.stillOnly?'still':by('suiteType').value");
bridge=bridge.replace("function open(){","function open(){by('suiteType').querySelector('[value=loop]').disabled=!!adapter.stillOnly;if(adapter.stillOnly)by('suiteType').value='still';");
bridge=bridge.replace('Keep drawing in Wobble','Make and treat surfaces in Material, keep drawing in Wobble').replace('Four studios. More ways to play.','Five studios. More ways to play.').replace('Wobble, Dither, Repeat or Worldbuilding','Wobble, Dither, Repeat, Worldbuilding or Material').replace('the four apps','the five apps').replace('.jagorepeat and .jagoworld originals','.jagorepeat, .jagoworld and .jagomaterial originals');
write(shared+'/suite-bridge.js',bridge);
let host=read(shared+'/JagoSuiteHost.cs');host=host.replace('"repeat","worldbuilding"','"repeat","worldbuilding","material"').replace('var minimum=id=="worldbuilding"?', 'var minimum=id=="material"?new Version(0,2,0):id=="worldbuilding"?');write(shared+'/JagoSuiteHost.cs',host);
for(const folder of ['Studios/Material/Source/Web','Studios/Wobble/Source/Browser','Studios/Dither/Source','Studios/Worldbuilding/Source/Web','Suite/repeat-release/Source/Web','Studios/Repeat-Web-Project/dist'])write(home+'/'+folder+'/suite-bridge.js',bridge);
for(const folder of ['Studios/Material','Studios/Wobble','Studios/Dither','Studios/Worldbuilding','Suite/repeat-release'])write(home+'/'+folder+'/Source/Windows/JagoSuiteHost.cs',host);
const root=home+'/Studios/Material/Source/Windows';let app=read(root+'/App.cs');app=app.replaceAll('0.1.0.0','0.2.0.0').replace('try{if(args.Length==2','try{if(JagoSuiteBootstrap.ForwardExisting("material",args))return;Test=JagoSuiteBootstrap.TestRoot(args);if(args.Length==2').replace('core.Navigate("https://jagomaterial.example/index.html")','new JagoSuiteHost("material",this,core);core.Navigate("https://jagomaterial.example/index.html")');write(root+'/App.cs',app);
let build=read(root+'/Build.ps1');build=build.replace("'/reference:System.Core.dll'","'/reference:System.Core.dll','/reference:System.Web.Extensions.dll','/reference:System.Security.dll'").replace("$argsList+=(Join-Path $PSScriptRoot 'App.cs')","$argsList+=(Join-Path $PSScriptRoot 'App.cs')\n$argsList+=(Join-Path $PSScriptRoot 'JagoSuiteHost.cs')");write(root+'/Build.ps1',build);
console.log('Five-studio bridge and Material Windows host integrated.');
