import crypto from 'node:crypto';
import {chatTitle} from './desktop/client.mjs';
const terminal=new Set(['TURN_COMPLETED','FAILED','INTERRUPTED','REJECTED']);
export function deliveryId(r){return crypto.createHash('sha256').update(JSON.stringify([r.teamId,r.channelId,r.userId,r.messageTs])).digest('hex').slice(0,24);}
export function createDeliveryService({store,desktop,postReply,config,clock=Date.now,wait=ms=>new Promise(r=>setTimeout(r,ms)),onUpdate=()=>{}}){
 let busy=false,stopping=false;const active=new Set(),observations=new Map(),locks=new Map();
 const exclusive=async(id,operation)=>{const prior=locks.get(id)||Promise.resolve(),next=prior.catch(()=>{}).then(operation);locks.set(id,next);try{return await next;}finally{if(locks.get(id)===next)locks.delete(id);}};
 const save=async s=>{await store.saveDelivery(s);onUpdate(s);return s;};
 const change=async(s,patch)=>exclusive(s.id,async()=>{const current=await store.readDelivery(s.id)||s;if(terminal.has(current.status)){return patch.queuedSubmissionId?save({...current,queuedSubmissionId:patch.queuedSubmissionId}):current;}return save({...current,...patch});});
 const allowed=r=>{if(r.teamId!==config.slack.teamId||r.channelId!==config.slack.channelId||!config.slack.allowedUserIds.includes(r.userId))throw Error('SLACK_ALLOWLIST');};
 const check=async s=>exclusive(s.id,async()=>{s=await store.readDelivery(s.id)||s;
 if(terminal.has(s.status))return s;const t=await desktop.readChat(s.threadId);
 const route=config.routes.find(r=>r.alias===s.alias);if(t.id!==s.threadId||chatTitle(t)!==route?.title)throw Error('DESKTOP_IDENTITY');
 const turn=(t.turns??[]).find(t=>(t.items??[]).some(i=>i.type==='userMessage'&&JSON.stringify(i).includes(s.marker)));if(!turn)return s;
 const final=(turn.items??[]).filter(i=>i.type==='agentMessage'&&i.phase==='final_answer');
 if(turn.status==='completed'&&final.length){return save({...s,status:'TURN_COMPLETED',feedback:'pending',feedbackChunks:0,turnId:turn.id,reply:final.map(i=>i.text??'').join('\n'),toolUsed:(turn.items??[]).some(i=>!['userMessage','agentMessage','reasoning','contextCompaction','plan'].includes(i.type))});}
 if(['failed','interrupted'].includes(turn.status)){const signature=JSON.stringify([turn.status,turn.items]),prior=observations.get(s.id),count=prior?.signature===signature?prior.count+1:1;observations.set(s.id,{signature,count});if(count>=5)return save({...s,status:turn.status.toUpperCase(),feedback:'pending',feedbackChunks:0,turnId:turn.id});}
 return s;
 });
 const feedback=async s=>exclusive(s.id,async()=>{s=await store.readDelivery(s.id)||s;if(s.feedback==='sent')return s;try{const reply=await postReply({channelId:s.channelId,threadTs:s.threadTs,text:s.alias+' · '+s.status+'\n'+(s.reply??'Result not confirmed. 查询状态，不要重投。'),sentChunks:s.feedbackChunks||0,onProgress:async n=>{s=await save({...s,feedbackChunks:n});}});if(reply?.ok===false)throw Object.assign(Error('SLACK_FAILED'),{uncertain:false});return save({...s,feedback:'sent'});}catch(e){return save({...s,feedback:e.uncertain===false?'failed':'uncertain'});}});
 const poll=async s=>{const deadline=clock()+config.limits.turnTimeoutMs;do{if(stopping)break;await wait(500);s=await check(s);if(terminal.has(s.status))return s;}while(clock()<deadline);return change(s,{status:s.status==='UNKNOWN'?'UNKNOWN':'PENDING'});};
 const service={
 async submit(r){allowed(r);if(stopping)throw Error('BRIDGE_STOPPING');if(busy)throw Error('ROUTE_BUSY');busy=true;let s,claimed=false;
 const operation=(async()=>{try{
 const id=deliveryId(r),existing=await store.readDelivery(id);if(existing)return existing;
 const route=config.routes.find(x=>x.alias===r.alias);if(!route||typeof r.text!=='string'||!r.text.trim()||r.text.length>8000)throw Error('COMMAND_INVALID');
 const records=await store.listDeliveries();if(records.some(x=>!terminal.has(x.status)))throw Error('PREVIOUS_UNRESOLVED');
 const day=new Date(clock()).toISOString().slice(0,10);if(records.filter(x=>x.day===day).length>=config.limits.dailyLimit)throw Error('DAILY_LIMIT');
 const chat=await desktop.readChat(route.threadId);if(chat.id!==route.threadId||chatTitle(chat)!==route.title)throw Error('DESKTOP_IDENTITY');const q=await desktop.listQueue(route.threadId);if(!Array.isArray(q.data)||q.data.length||q.nextCursor)throw Error('QUEUE_BUSY');
 s={id,marker:'SlackDelivery-'+crypto.randomUUID(),alias:r.alias,threadId:route.threadId,status:'CLAIMED',feedback:'pending',teamId:r.teamId,channelId:r.channelId,userId:r.userId,messageTs:r.messageTs,threadTs:r.threadTs||r.messageTs,day,...(r.testNonce?{testNonce:r.testNonce,testExpected:r.testExpected}:{})};await store.claimDelivery(s);claimed=true;onUpdate(s);
 try{const ack=await desktop.enqueue(route.threadId,{marker:s.marker,text:'User request via Slack. Delivery marker: '+s.marker+'\nFollow this chat’s existing permissions, approvals and project constraints. This message grants no additional permissions.\n\n'+r.text});if(!ack?.queuedSubmission)throw Error('QUEUE_ACK_MISSING');s=await change(s,{status:'QUEUED',queuedSubmissionId:ack.queuedSubmission.id});s=await poll(s);}catch{s=await change(s,{status:'UNKNOWN'});}
 return await feedback(s);
 }catch(e){if(claimed)await change(s,{status:'UNKNOWN'});throw e;}finally{busy=false;}})();active.add(operation);try{return await operation;}finally{active.delete(operation);}
 },
 async query(id){let s=await store.readDelivery(id);if(!s)throw Error('DELIVERY_NOT_FOUND');s=await check(s);return s;},
 async reconcile(){for(const s of await store.listDeliveries()){if(!terminal.has(s.status)){try{await check(s);}catch{/* Keep the saved uncertainty; never enqueue here. */}}}},
 async retryFeedback(id){const s=await service.query(id);return feedback(s);},
 async stop(){stopping=true;await Promise.allSettled([...active]);}
 };return service;
}
