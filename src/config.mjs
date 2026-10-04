import path from 'node:path';
export function validateConfig(value) {
 const c=structuredClone(value);
 const bad=()=>{throw Error('CONFIG_INVALID');};
 if(!c||c.version!==1||!['en','zh'].includes(c.language))bad();
 const id=(s,p)=>typeof s==='string'&&new RegExp('^['+p+'][A-Z0-9]{8,}$').test(s);
 if(!id(c.slack?.teamId,'T')||!id(c.slack?.channelId,'CG')||!Array.isArray(c.slack.allowedUserIds)||!c.slack.allowedUserIds.length||!c.slack.allowedUserIds.every(u=>id(u,'UW')))bad();
 if(!Array.isArray(c.routes)||!c.routes.length||c.routes.length>20)bad();
 const aliases=new Set(),threads=new Set();
 for(const r of c.routes){if(!/^AGENT[1-9]\d*$/.test(r.alias)||aliases.has(r.alias)||threads.has(r.threadId)||!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(r.threadId)||typeof r.title!=='string'||!r.title.trim()||r.title.length>200)bad();aliases.add(r.alias);threads.add(r.threadId);}
 if(!c.desktop||typeof c.desktop!=='object')bad();
 for(const k of ['executablePath','socketPath'])if(c.desktop[k]&&(!path.isAbsolute(c.desktop[k])||/[\r\n\0]/.test(c.desktop[k])))bad();
 if(!Number.isInteger(c.limits?.dailyLimit)||c.limits.dailyLimit<1||c.limits.dailyLimit>1000||!Number.isInteger(c.limits.turnTimeoutMs)||c.limits.turnTimeoutMs<1000||c.limits.turnTimeoutMs>900000)bad();
 return {version:1,language:c.language,slack:{teamId:c.slack.teamId,channelId:c.slack.channelId,allowedUserIds:[...new Set(c.slack.allowedUserIds)]},routes:c.routes.map(r=>({alias:r.alias,threadId:r.threadId,title:r.title})),desktop:{executablePath:c.desktop.executablePath||undefined,socketPath:c.desktop.socketPath||undefined},limits:c.limits};
}
export function validateSecrets(s){if(!s||typeof s.botToken!=='string'||!/^xoxb-[A-Za-z0-9-]+$/.test(s.botToken)||typeof s.appToken!=='string'||!/^xapp-[A-Za-z0-9-]+$/.test(s.appToken))throw Error('TOKEN_FORMAT');return {botToken:s.botToken,appToken:s.appToken};}
