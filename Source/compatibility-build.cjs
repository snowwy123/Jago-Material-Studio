// SPDX-License-Identifier: MIT
// Change only the four verified Windows assembly versions. Preserve each prior file.
const fs=require('fs');const home='C:/Jago Studio Dev';
const backup=home+'/Archive/Material/Companion-assembly-backups';fs.mkdirSync(backup,{recursive:true});
for(const [folder,oldVersion,nextVersion]of [['Wobble','1.3.1.0','1.3.2.0'],['Dither','1.1.1.0','1.1.2.0'],['Repeat','1.7.1.0','1.7.2.0'],['Worldbuilding','0.17.0.0','0.17.1.0']]){const p=home+'/Studios/'+folder+'/Source/Windows/'+(folder==='Wobble'?'Program.cs':'App.cs');let s=fs.readFileSync(p,'utf8');if(s.includes(nextVersion))continue;if(!s.includes(oldVersion))throw Error('Unexpected assembly version in '+p);const copy=backup+'/'+folder+'-'+oldVersion+'.cs';if(!fs.existsSync(copy))fs.copyFileSync(p,copy);s=s.replaceAll(oldVersion,nextVersion);fs.writeFileSync(p,s)}
console.log('Companion studio compatibility versions prepared.');
