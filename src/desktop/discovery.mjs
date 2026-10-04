import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import {execFile} from 'node:child_process';import {promisify} from 'node:util';
const run=promisify(execFile);
export async function discoverDesktop({home=os.homedir(),overrides={}}={}){
 const base=path.join(home,'.codex'),executablePath=overrides.executablePath||path.join(base,'packages','app-server-daemon','current','bin','codex.exe'),socketPath=overrides.socketPath||path.join(base,'app-server-control','app-server-control.sock');
 const checks=[];for(const [name,p] of [['executable',executablePath],['socket',socketPath]]){try{await fs.access(p);checks.push({name,status:'pass'});}catch{checks.push({name,status:'fail',code:'DESKTOP_'+name.toUpperCase()+'_MISSING'});}}
 return {executablePath,socketPath,checks};
}
export async function probeSchema(executablePath){
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'bridge-schema-'));
 try{await run(executablePath,['app-server','generate-json-schema','--experimental','--out',dir],{windowsHide:true,timeout:15000,maxBuffer:1000000});let content='';
 async function walk(d){for(const e of await fs.readdir(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())await walk(p);else if(e.name.endsWith('.json'))content+=await fs.readFile(p,'utf8');}}await walk(dir);
 return ['thread/list','thread/read','thread/queue/list','thread/queue/add'].every(m=>content.includes('"'+m+'"'))?'pass':'fail';
 }catch{return 'unknown';}finally{const checked=path.resolve(dir);if(checked.startsWith(path.resolve(os.tmpdir())+path.sep)&&path.basename(checked).startsWith('bridge-schema-'))await fs.rm(checked,{recursive:true,force:true});}
}
