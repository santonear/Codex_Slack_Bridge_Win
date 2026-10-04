export function redact(value,secrets=[]){
 const mask=s=>{let out=s;for(const secret of [...secrets].filter(s=>typeof s==='string'&&s.length).sort((a,b)=>b.length-a.length))out=out.split(secret).join('[REDACTED]');
 return out.replace(/\b(?:xox[baprs]|xapp)-[A-Za-z0-9-]+/g,'[REDACTED_TOKEN]').replace(/\b[TCGUWAB][A-Z0-9]{8,}\b/g,'[REDACTED_SLACK_ID]').replace(/\b[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}\b/gi,'[REDACTED_CHAT_ID]').replace(/[A-Za-z]:[\\/][^\s"'<>]*/g,'[REDACTED_PATH]').replace(/(?:\/Users\/|\/home\/)[^\s"'<>]*/g,'[REDACTED_PATH]');};
 if(typeof value==='string')return mask(value);
 if(Array.isArray(value))return value.map(v=>redact(v,secrets));
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[mask(k),/token|secret|password/i.test(k)?'[REDACTED]':redact(v,secrets)]));
 return value;
}
