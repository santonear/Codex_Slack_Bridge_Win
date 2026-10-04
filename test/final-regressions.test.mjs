import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createStore} from '../src/storage.mjs';
import {createDeliveryService} from '../src/delivery.mjs';
import {createRuntime} from '../src/runtime.mjs';
import {startWizardServer} from '../src/http.mjs';
import {startApplication} from '../src/main.mjs';
import {config} from './fixtures/config.mjs';
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};};
function memory(records=[]){const map=new Map(records.map(r=>[r.id,structuredClone(r)]));return {readDelivery:async id=>structuredClone(map.get(id)||null),claimDelivery:async r=>map.set(r.id,structuredClone(r)),saveDelivery:async r=>map.set(r.id,structuredClone(r)),listDeliveries:async()=>[...map.values()].map(r=>structuredClone(r))};}
test('late enqueue acknowledgement and stop preserve a confirmed sent final',async()=>{
 const store=memory(),ack=deferred(),entered=deferred();let marker;const posts=[];
 const desktop={readChat:async()=>({id:config().routes[0].threadId,name:'Example chat',turns:marker?[{id:'turn',status:'completed',items:[{type:'userMessage',content:[{type:'text',text:marker}]},{type:'agentMessage',phase:'final_answer',text:'final'}]}]:[]}),listQueue:async()=>({data:[]}),enqueue:async(_,r)=>{marker=r.marker;entered.resolve();return ack.promise;}};
 const service=createDeliveryService({store,desktop,config:config(),postReply:async r=>{posts.push(r);return {ok:true};},wait:async()=>{}});
 const submission=service.submit({teamId:'T12345678',channelId:'C12345678',userId:'U12345678',messageTs:'1.1',alias:'AGENT1',text:'hello'});
 await entered.promise;const record=(await store.listDeliveries())[0];await service.query(record.id);await service.retryFeedback(record.id);const stopping=service.stop();ack.resolve({queuedSubmission:{id:'late-queue'}});
 const result=await submission;await stopping;assert.equal(result.status,'TURN_COMPLETED');assert.equal(result.feedback,'sent');assert.equal(result.queuedSubmissionId,'late-queue');assert.equal(posts.length,1);
});
test('configuration verification and start cannot save settings under a running instance',async t=>{
 const check=deferred(),entered=deferred();let running=false,savedWhileRunning=false;
 const store={readConfig:async()=>({config:config(),secrets:{botToken:'xoxb-example-secret',appToken:'xapp-example-secret'}}),saveConfig:async()=>{savedWhileRunning=running;},listDeliveries:async()=>[]};
 const runtime={status:()=>({running}),start:async()=>{running=true;return {running};},stop:async()=>{running=false;}};
 const desktopFactory=async()=>({probe:async()=>({login:'pass',queueSchema:'pass'}),readChat:async id=>({id,name:'Example chat'}),listQueue:async()=>({data:[]}),listChats:async()=>({chats:[]}),close(){}});
 const slackFactory=async()=>({verifyIdentity:async()=>{entered.resolve();await check.promise;return {};},stop:async()=>{}});
 const server=await startWizardServer({store,runtime,desktopFactory,slackFactory});t.after(()=>server.close());const url=new URL(server.url),token=url.hash.slice(1);
 const post=(p,data={})=>fetch(url.origin+p,{method:'POST',headers:{'X-Bridge-Session':token,'Content-Type':'application/json'},body:JSON.stringify(data)});
 const save=post('/api/config',{config:config(),secrets:{}});await entered.promise;const start=post('/api/start');await new Promise(r=>setTimeout(r,30));check.resolve();assert.equal((await save).status,200);assert.equal((await start).status,200);assert.equal(savedWhileRunning,false);
});
test('status selects the newest task and always replies to the query thread',async t=>{
 const base={alias:'AGENT1',userId:'U12345678',channelId:'C12345678',threadId:config().routes[0].threadId,feedback:'sent',threadTs:'original'};
 const store=memory([{...base,id:'0'.repeat(24),messageTs:'2.1',status:'TURN_COMPLETED'},{...base,id:'f'.repeat(24),messageTs:'1.1',status:'FAILED'}]);store.readConfig=async()=>({config:config(),secrets:{}});
 let handler;const posts=[];const runtime=createRuntime({store,adapters:{desktop:async()=>({probe:async()=>({login:'pass',queueSchema:'pass'}),close(){}}),slack:async({onRequest})=>{handler=onRequest;return {verifyIdentity:async()=>({botId:'U87654321'}),start:async()=>{},stop:async()=>{},postReply:async r=>{posts.push(r);return {ok:true};}};}}});
 t.after(()=>runtime.stop());await runtime.start();await handler({kind:'status',alias:'AGENT1',userId:base.userId,channelId:base.channelId,threadTs:'query'});assert.equal(posts.length,1);assert.equal(posts[0].threadTs,'query');assert.match(posts[0].text,/TURN_COMPLETED/);
});
test('desktop disconnect is visible in runtime status without replay',async t=>{
 let disconnect;const store={readConfig:async()=>({config:config(),secrets:{}}),listDeliveries:async()=>[]};
 const runtime=createRuntime({store,adapters:{desktop:async(_,options)=>{disconnect=options?.onDisconnect;return {probe:async()=>({login:'pass',queueSchema:'pass'}),close(){}};},slack:async()=>({verifyIdentity:async()=>({}),start:async()=>{},stop:async()=>{}})}});
 t.after(()=>runtime.stop());await runtime.start();assert.equal(typeof disconnect,'function');disconnect('DESKTOP_DISCONNECTED');assert.equal(runtime.status().lastError,'DESKTOP_DISCONNECTED');
});
test('partial Slack feedback retries skip acknowledged parts',async()=>{
 const {sendReplyParts}=await import('../src/slack.mjs');let acknowledged=0,failed=false;const sent=[];
 const input={channelId:'C12345678',threadTs:'1.1',text:'a'.repeat(3000)+'b'.repeat(1000),onProgress:async n=>acknowledged=n};
 const sendMessage=async r=>{if(r.text.startsWith('b')&&!failed){failed=true;throw Object.assign(Error('API_REJECTED'),{uncertain:false});}sent.push(r.text);return {ok:true};};
 await assert.rejects(sendReplyParts({...input,sendMessage}));assert.equal(acknowledged,1);await sendReplyParts({...input,sendMessage,sentChunks:acknowledged});assert.equal(sent.filter(s=>s.startsWith('a')).length,1);assert.equal(sent.filter(s=>s.startsWith('b')).length,1);
});
test('existing explicit broad ACLs on the directory and old secrets are removed',async t=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'bridge acl '));t.after(()=>fs.rm(dir,{recursive:true,force:true}));const secret=path.join(dir,'old-secret.json');await fs.writeFile(secret,'{}');
 for(const target of [dir,secret])execFileSync('icacls.exe',[target,'/grant','*S-1-1-0:RX'],{windowsHide:true,stdio:'pipe'});
 await createStore({dataDir:dir});for(const target of [dir,secret]){const acl=execFileSync('powershell.exe',['-NoProfile','-Command','(Get-Acl -LiteralPath $env:BRIDGE_ACL_TEST).Sddl'],{env:{...process.env,PSModulePath:path.join(process.env.SystemRoot,'System32','WindowsPowerShell','v1.0','Modules'),BRIDGE_ACL_TEST:target},encoding:'utf8',windowsHide:true});assert.doesNotMatch(acl,/\([^)]*;;;WD\)/);}
});
test('stale instance locks fail closed so simultaneous launchers cannot take over',async t=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'bridge stale '));t.after(()=>fs.rm(dir,{recursive:true,force:true}));await createStore({dataDir:dir});await fs.writeFile(path.join(dir,'instance.json'),JSON.stringify({pid:2147483647,owner:'stale'}));
 const results=await Promise.allSettled([startApplication({dataDir:dir,openBrowser:false}),startApplication({dataDir:dir,openBrowser:false})]);for(const r of results){if(r.status==='fulfilled'){await r.value.close();}assert.equal(r.status,'rejected');assert.match(r.reason.message,/INSTANCE_STALE/);}
});
