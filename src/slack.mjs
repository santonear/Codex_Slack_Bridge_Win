import bolt from '@slack/bolt';import {redact} from './redact.mjs';
const {App}=bolt;
export async function sendReplyParts({sendMessage,channelId,threadTs,text,secrets=[],sentChunks=0,onProgress=async()=>{}}){
 const safe=redact(text,secrets),parts=safe.match(/[\s\S]{1,3000}/g)||[''];let result={ok:true};
 for(let index=sentChunks;index<parts.length;index++){
  try{result=await sendMessage({channel:channelId,thread_ts:threadTs,text:parts[index],mrkdwn:false,unfurl_links:false,unfurl_media:false});if(!result.ok)throw Object.assign(Error('SLACK_POST'),{uncertain:false});}
  catch(e){if(e.uncertain===undefined)e.uncertain=!(e.data?.ok===false||e.code==='slack_webapi_platform_error'||e.code==='slack_webapi_rate_limited_error');throw e;}
  await onProgress(index+1);
 }
 return result;
}
export function parseCommand(text,botId){
 if(typeof text!=='string'||!/^[UW][A-Z0-9]+$/.test(botId))return null;
 const prefix='<@'+botId+'>';if(!text.trim().startsWith(prefix))return null;const body=text.trim().slice(prefix.length).trim();if(['ping','help','帮助'].includes(body.toLowerCase()))return {kind:body.toLowerCase()==='ping'?'ping':'help'};
 const m=body.match(/^(AGENT[1-9]\d*)\s*[:：]\s*([\s\S]+)$/i);if(!m)return null;
 if(/(?:^|\n)\s*AGENT[1-9]\d*\s*[:：]/i.test(m[2])||m[2].includes(prefix))throw Error('MIXED_ROLES');
 const command=m[2].trim().toLowerCase();return {kind:['状态','status'].includes(command)?'status':['补发回复','retry feedback'].includes(command)?'feedback':'task',alias:m[1].toUpperCase(),text:m[2].trim()};
}
export async function verifySlackIdentity({authTest},config){
 const a=await authTest();if(!a?.ok||!a.user_id)throw Error('SLACK_AUTH');if(a.team_id!==config.slack.teamId)throw Error('SLACK_WORKSPACE');
 return {identity:'pass',channel:'untested',botId:a.user_id};
}
const quiet={getLevel:()=> 'error',setLevel(){},setName(){},debug(){},info(){},warn(){},error(){}};
export function createSlackAdapter({config,secrets,onRequest,onError=()=>{}}){
 const app=new App({token:secrets.botToken,appToken:secrets.appToken,socketMode:true,developerMode:false,logger:quiet,clientOptions:{retryConfig:{retries:0}}});let botId;
 app.error(async()=>{onError('SLACK_DISCONNECTED');});
 app.event('app_mention',async({event,body})=>{if(body.team_id!==config.slack.teamId||event.channel!==config.slack.channelId||!config.slack.allowedUserIds.includes(event.user)||event.bot_id)return;
 let cmd;try{cmd=parseCommand(event.text,botId);}catch{cmd={kind:'invalid'};}if(!cmd)return;
 const r={eventId:body.event_id,teamId:body.team_id,channelId:event.channel,userId:event.user,messageTs:event.ts,threadTs:event.thread_ts||event.ts,...cmd};
 try{await onRequest(r);}catch{onError('REQUEST_FAILED');}
 });
 return {
 async verifyIdentity(){const r=await verifySlackIdentity({authTest:()=>app.client.auth.test()},config);botId=r.botId;return r;},
 async start(){if(!botId)await this.verifyIdentity();await app.start();},
 async postReply(input){return sendReplyParts({...input,secrets:[secrets.botToken,secrets.appToken],sendMessage:r=>app.client.chat.postMessage(r)});},
 async stop(){await app.stop();}
 };
}
