import {checkNodeVersion} from './version.mjs';
import fs from 'node:fs/promises';import path from 'node:path';import os from 'node:os';import crypto from 'node:crypto';import {spawn} from 'node:child_process';import {fileURLToPath} from 'node:url';import {createStore} from './storage.mjs';import {createRuntime} from './runtime.mjs';import {startWizardServer} from './http.mjs';
export async function startApplication({dataDir=path.join(process.env.LOCALAPPDATA||os.homedir(),'CodexSlackBridgeWin'),openBrowser=true,port=0}={}){
 if(!checkNodeVersion(process.versions.node))throw Error('NODE_22_16_REQUIRED');
 if(process.platform!=='win32')throw Error('WINDOWS_REQUIRED');const store=await createStore({dataDir}),lock=path.join(dataDir,'instance.json'),owner=crypto.randomUUID();
 const claim=async()=>{const f=await fs.open(lock,'wx',0o600);try{await f.writeFile(JSON.stringify({pid:process.pid,owner}));await f.sync();}finally{await f.close();}};
 try{await claim();}catch(e){if(e.code!=='EEXIST')throw e;let old;try{old=JSON.parse(await fs.readFile(lock,'utf8'));}catch{throw Error('INSTANCE_UNREADABLE');}if(!Number.isInteger(old.pid)||old.pid<1)throw Error('INSTANCE_UNREADABLE');let alive=true;try{process.kill(old.pid,0);}catch(e){if(e.code==='ESRCH')alive=false;}if(alive)throw Error('ALREADY_RUNNING');throw Error('INSTANCE_STALE');}
 let closed=false,server;const runtime=createRuntime({store});
 const close=async()=>{if(closed)return;closed=true;await runtime.stop();await server?.close();try{const saved=JSON.parse(await fs.readFile(lock,'utf8'));if(saved.owner===owner)await fs.rm(lock);}catch(e){if(e.code!=='ENOENT')throw e;}};
 try{server=await startWizardServer({store,runtime,port});const f=await fs.open(lock,'w',0o600);try{await f.writeFile(JSON.stringify({pid:process.pid,owner,url:server.url}));await f.sync();}finally{await f.close();}
 if(openBrowser){const child=spawn('rundll32.exe',['url.dll,FileProtocolHandler',server.url],{windowsHide:true,detached:true,stdio:'ignore'});child.on('error',()=>console.error('Open the local URL below / 请打开下方本地地址'));child.unref();}
 return {url:server.url,close};
 }catch(e){await close();throw e;}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const app=await startApplication({dataDir:process.env.BRIDGE_DATA_DIR||undefined,openBrowser:!process.argv.includes('--no-open')});console.log('Local setup / 本地配置: '+app.url);console.log('Keep this window open. Press Ctrl+C to stop. / 保持窗口运行，按 Ctrl+C 停止。');for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{await app.close();process.exit(0);});}
 catch(e){console.error(/^[A-Z_]+$/.test(e.message)?e.message:'START_FAILED');process.exitCode=1;}
}
