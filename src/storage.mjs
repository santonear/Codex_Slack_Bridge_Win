import fs from 'node:fs/promises';import path from 'node:path';import crypto from 'node:crypto';import {execFile} from 'node:child_process';import {promisify} from 'node:util';import {validateConfig,validateSecrets} from './config.mjs';
const run=promisify(execFile);
const aclScript=new URL('../scripts/protect-data.ps1',import.meta.url);
export async function secureWindowsDirectory(dir){
 if(process.platform!=='win32')throw Error('WINDOWS_REQUIRED');
 const {stdout}=await run('whoami.exe',['/user','/fo','csv','/nh'],{windowsHide:true});
 const sid=stdout.match(/S-1-5-\d+(?:-\d+)+/)?.[0];if(!sid)throw Error('ACL_IDENTITY');
 const {fileURLToPath}=await import('node:url');
 await run('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File',fileURLToPath(aclScript),'-DataDirectory',dir,'-UserSid',sid],{windowsHide:true,timeout:30000,env:{...process.env,PSModulePath:path.join(process.env.SystemRoot||process.env.SYSTEMROOT,'System32','WindowsPowerShell','v1.0','Modules')}});
}
export async function createStore({dataDir,secureDirectory=secureWindowsDirectory}){
 const root=path.resolve(dataDir);await fs.mkdir(root,{recursive:true});for(let entry=root;;entry=path.dirname(entry)){if((await fs.lstat(entry)).isSymbolicLink())throw Error('DATA_REPARSE');if(path.dirname(entry)===entry)break;}
 await secureDirectory(root);const deliveries=path.join(root,'deliveries');await fs.mkdir(deliveries,{recursive:true});
 if((await fs.lstat(deliveries)).isSymbolicLink())throw Error('DATA_REPARSE');
 const atomic=async(file,data)=>{const tmp=file+'.tmp-'+crypto.randomUUID();const f=await fs.open(tmp,'wx',0o600);try{await f.writeFile(JSON.stringify(data));await f.sync();}finally{await f.close();}try{await fs.rename(tmp,file);}catch(e){await fs.rm(tmp,{force:true});throw e;}};
 const read=async file=>{try{return JSON.parse((await fs.readFile(file,'utf8')).replace(/^\uFEFF/,''));}catch(e){if(e.code==='ENOENT')return null;throw Error('STATE_UNREADABLE');}};
 const deliveryPath=id=>{if(!/^[a-f0-9]{24}$/.test(id))throw Error('DELIVERY_ID');return path.join(deliveries,id+'.json');};
 let saving=false;
 return {
 async readConfig(){const pointer=await read(path.join(root,'current.json'));if(!pointer)return null;if(!/^[a-f0-9]{32}$/.test(pointer.generation))throw Error('CONFIG_POINTER');const c=await read(path.join(root,'config-'+pointer.generation+'.json')),s=await read(path.join(root,'secrets-'+pointer.generation+'.json'));return {config:validateConfig(c),secrets:validateSecrets(s)};},
 async saveConfig(config,secrets){if(saving)throw Error('CONFIG_BUSY');saving=true;try{const c=validateConfig(config),s=validateSecrets(secrets);await secureDirectory(root);const generation=crypto.randomBytes(16).toString('hex');await atomic(path.join(root,'config-'+generation+'.json'),c);await atomic(path.join(root,'secrets-'+generation+'.json'),s);await atomic(path.join(root,'current.json'),{generation});}finally{saving=false;}},
 async readDelivery(id){return read(deliveryPath(id));},
 async claimDelivery(record){const f=await fs.open(deliveryPath(record.id),'wx',0o600);try{await f.writeFile(JSON.stringify(record));await f.sync();}finally{await f.close();}},
 async saveDelivery(record){await atomic(deliveryPath(record.id),record);},
 async listDeliveries(){const entries=(await fs.readdir(deliveries)).filter(f=>/^[a-f0-9]{24}\.json$/.test(f));return Promise.all(entries.map(f=>read(path.join(deliveries,f))));}
 };
}
