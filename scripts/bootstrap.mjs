import fs from 'node:fs/promises';import path from 'node:path';import {spawn} from 'node:child_process';import {fileURLToPath} from 'node:url';import readline from 'node:readline/promises';
import {checkNodeVersion} from '../src/version.mjs';
export {checkNodeVersion};
const installDefault=root=>new Promise((resolve,reject)=>{const command=process.platform==='win32'?'cmd.exe':'npm',args=process.platform==='win32'?['/d','/s','/c','npm.cmd ci --omit=dev --ignore-scripts']:['ci','--omit=dev','--ignore-scripts'];const child=spawn(command,args,{cwd:root,stdio:'inherit',windowsHide:true});child.on('error',()=>reject(Error('DEPENDENCY_INSTALL_FAILED')));child.on('exit',code=>code===0?resolve():reject(Error('DEPENDENCY_INSTALL_FAILED')));});
export async function ensureDependencies({root,confirm,install=installDefault}){
 try{await fs.access(path.join(root,'node_modules','@slack','bolt','package.json'));return;}catch{}
 if(!await confirm())throw Error('SETUP_CANCELLED');await install(root);
 await fs.access(path.join(root,'node_modules','@slack','bolt','package.json'));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
 try{if(!checkNodeVersion(process.versions.node))throw Error('NODE_22_16_REQUIRED');
 await ensureDependencies({root,confirm:async()=>{const terminal=readline.createInterface({input:process.stdin,output:process.stdout});try{return /^y(es)?$/i.test((await terminal.question('Install locked dependencies? / 安装锁定依赖？ [y/N] ')).trim());}finally{terminal.close();}}});const {startApplication}=await import('../src/main.mjs');const app=await startApplication();console.log('Local setup / 本地配置: '+app.url);console.log('Keep this window open / 请保持窗口运行');for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{await app.close();process.exit(0);});
 }catch(e){console.error((/^[A-Z_]+$/.test(e.message)?e.message:'START_FAILED')+' · See docs / 请查看手册');process.exitCode=1;}
}
