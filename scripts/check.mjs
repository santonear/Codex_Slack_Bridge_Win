import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const roots=['src','public','scripts','test','tests'];
async function files(dir){const result=[];for(const entry of await fs.readdir(dir,{withFileTypes:true})){const name=path.join(dir,entry.name);if(entry.isDirectory())result.push(...await files(name));else result.push(name);}return result;}
let count=0;for(const dir of roots)for(const file of await files(dir)){if(/\.(mjs|js)$/.test(file)){execFileSync(process.execPath,['--check',file],{stdio:'pipe'});count++;}}
for(const language of ['en','zh'])for(let n=1;n<=8;n++){const directory=await fs.readdir('docs/'+language);if(!directory.some(file=>file.startsWith(String(n).padStart(2,'0')+'-')))throw Error('MISSING_BILINGUAL_DOCUMENT');}
const documents=['README.md',...await files('docs')];for(const file of documents.filter(f=>f.endsWith('.md'))){const text=await fs.readFile(file,'utf8');if(/截图|screenshot|\b20\d{2}-\d{2}-\d{2}\b|xox[baprs]-[A-Za-z0-9-]{16,}/i.test(text))throw Error('PUBLIC_DOCUMENT_REVIEW: '+file);for(const match of text.matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g)){const target=match[1];if(!/^(?:https?:|mailto:)/.test(target)&&!path.isAbsolute(target)){await fs.access(path.resolve(path.dirname(file),target));}}}
console.log('Syntax checked: '+count+' files; bilingual documents and local links checked.');
