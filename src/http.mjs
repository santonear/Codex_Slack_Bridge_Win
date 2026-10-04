import {checkNodeVersion} from './version.mjs';
import http from 'node:http';import fs from 'node:fs/promises';import path from 'node:path';import crypto from 'node:crypto';import {fileURLToPath} from 'node:url';import {validateConfig,validateSecrets} from './config.mjs';import {createSlackAdapter} from './slack.mjs';import {discoverDesktop} from './desktop/discovery.mjs';import {connectDesktop,chatTitle} from './desktop/client.mjs';import {buildDiagnostics} from './diagnostics.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
function error(code,status=400){return Object.assign(Error(code),{status});}
async function body(req){if(!req.headers['content-type']?.startsWith('application/json'))throw error('JSON_REQUIRED',415);const chunks=[];let size=0;for await(const part of req){size+=part.length;if(size>65536)throw error('BODY_TOO_LARGE',413);chunks.push(part);}try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw error('JSON_INVALID');}}
function equal(a,b){if(typeof a!=='string')return false;const candidate=Buffer.from(a),expected=Buffer.from(b);return candidate.length===expected.length&&crypto.timingSafeEqual(candidate,expected);}
export async function startWizardServer({store,runtime,desktopFactory,slackFactory,port=0}){
 const session=crypto.randomBytes(32).toString('hex');let origin,checks=[],mutation=Promise.resolve();
 const mutate=operation=>{const next=mutation.catch(()=>{}).then(operation);mutation=next;return next;};
 const getDesktop=async overrides=>{const paths=await discoverDesktop({overrides});if(desktopFactory)return desktopFactory(overrides);if(paths.checks.some(c=>c.status==='fail'))throw error('DESKTOP_NOT_FOUND');return connectDesktop({paths,setup:true});};
 const validateOverrides=overrides=>{for(const key of ['executablePath','socketPath'])if(overrides?.[key]&&(!path.isAbsolute(overrides[key])||/[\0\r\n]/.test(overrides[key])))throw error('PATH_INVALID');return overrides||{};};
 const getSlack=opts=>slackFactory?slackFactory(opts):createSlackAdapter(opts);
 const credentials=async(input)=>{const old=await store.readConfig();return validateSecrets({botToken:input?.botToken||old?.secrets.botToken,appToken:input?.appToken||old?.secrets.appToken});};
 const desktopCheck=async(overrides,routes=[])=>{let c;try{c=await getDesktop(validateOverrides(overrides));const probe=await c.probe();if(probe.login!=='pass')throw error('CODEX_LOGIN_REQUIRED');if(probe.queueSchema!=='pass')throw error('DESKTOP_INCOMPATIBLE');for(const r of routes){const chat=await c.readChat(r.threadId);if(chat.id!==r.threadId||chatTitle(chat)!==r.title)throw error('DESKTOP_IDENTITY');await c.listQueue(r.threadId);}const list=await c.listChats();return {checks:[{name:'desktop',status:'pass'},{name:'login',status:'pass'},{name:'queue',status:'pass'}],...list};}finally{c?.close();}};
 const slackCheck=async(config,secrets)=>{const slack=config?.slack;if(!slack||!/^T[A-Z0-9]{8,}$/.test(slack.teamId)||!/^[CG][A-Z0-9]{8,}$/.test(slack.channelId)||!Array.isArray(slack.allowedUserIds)||!slack.allowedUserIds.length||!slack.allowedUserIds.every(x=>/^[UW][A-Z0-9]{8,}$/.test(x)))throw error('CONFIG_INVALID');const a=await getSlack({config,secrets,onRequest:async()=>{}});try{return await a.verifyIdentity();}finally{await a.stop().catch(()=>{});}};
 const json=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
 const server=http.createServer(async(req,res)=>{
 res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'none'; form-action 'none'; base-uri 'none'");
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
 try{if(req.headers.host!==new URL(origin).host)throw error('HOST_DENIED',403);if(req.headers.origin&&req.headers.origin!==origin)throw error('ORIGIN_DENIED',403);
 const url=new URL(req.url,origin),p=url.pathname;
 const staticFiles={'/':['public/index.html','text/html'],'/app.js':['public/app.js','text/javascript'],'/i18n.js':['public/i18n.js','text/javascript'],'/styles.css':['public/styles.css','text/css']};
 if(req.method==='GET'&&staticFiles[p]){const [f,type]=staticFiles[p];res.writeHead(200,{'Content-Type':type+'; charset=utf-8','Cache-Control':'no-store'});res.end(await fs.readFile(path.join(root,f)));return;}
 if(!equal(req.headers['x-bridge-session'],session))throw error('SESSION_REQUIRED',403);
 if(req.method==='GET'&&p==='/manifest'){res.writeHead(200,{'Content-Type':'application/json','Content-Disposition':'attachment; filename="slack-app-manifest.json"'});res.end(await fs.readFile(path.join(root,'slack-app-manifest.json')));return;}
 if(req.method==='GET'&&p==='/api/state'){const old=await store.readConfig();json(res,200,{config:old?.config||null,secretsAvailable:!!old, runtime:runtime.status(),checks});return;}
 if(req.method==='GET'&&p==='/api/diagnostics'){const old=await store.readConfig();json(res,200,buildDiagnostics({checks,config:old?.config,deliveries:await store.listDeliveries()}));return;}
 if(req.method==='GET'&&p==='/api/test'){json(res,200,await runtime.refreshTest(url.searchParams.get('nonce')));return;}
 if(req.method!=='POST')throw error('NOT_FOUND',404);const data=await body(req);
 if(p==='/api/check/env'){json(res,200,{checks:[{name:'windows',status:process.platform==='win32'?'pass':'fail',code:process.platform==='win32'?undefined:'WINDOWS_REQUIRED'},{name:'node',status:checkNodeVersion(process.versions.node)?'pass':'fail'},{name:'storage',status:'pass'}]});return;}
 if(p==='/api/check/desktop'){const r=await desktopCheck(data.desktop);checks=r.checks;json(res,200,r);return;}
 if(p==='/api/check/slack'){const r=await slackCheck(data.config,await credentials(data.secrets));checks=[...checks.filter(c=>c.name!=='slack'),{name:'slack',status:'pass'}];json(res,200,r);return;}
 if(p==='/api/config'){await mutate(async()=>{if(runtime.status().running||runtime.status().starting)throw error('STOP_BEFORE_CONFIG',409);const config=validateConfig(data.config),secrets=await credentials(data.secrets);await slackCheck(config,secrets);await desktopCheck(config.desktop,config.routes);await store.saveConfig(config,secrets);});json(res,200,{saved:true});return;}
 if(p==='/api/start'){json(res,200,await mutate(()=>runtime.start()));return;}if(p==='/api/stop'){json(res,200,await mutate(()=>runtime.stop()));return;}
 if(p==='/api/test'){json(res,200,runtime.armTest(data.alias));return;}
 if(p==='/api/feedback'){json(res,200,{status:(await runtime.retryFeedback(data.id)).status});return;}
 throw error('NOT_FOUND',404);
 }catch(e){if(!res.headersSent)json(res,e.status||400,{code:/^[A-Z_]+$/.test(e.message)?e.message:'REQUEST_FAILED'});else res.end();}
 });
 server.requestTimeout=20000;server.headersTimeout=10000;
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',()=>{origin='http://127.0.0.1:'+server.address().port;resolve();});});
 return {url:origin+'/#'+session,async close(){server.closeAllConnections();await new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve()));}};
}
