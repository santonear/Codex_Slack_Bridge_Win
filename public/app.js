import {messages} from './i18n.js';
const $=s=>document.querySelector(s),session=location.hash.slice(1)||sessionStorage.getItem('bridge-session');if(location.hash){sessionStorage.setItem('bridge-session',session);history.replaceState(null,'',location.pathname);}
let lang=localStorage.getItem('bridge-language')||'en',step=0,checks=[],chats=[],nonce=null,command='',test=null,report=null,busy=false,testAlias='AGENT1';
let config={version:1,language:lang,slack:{teamId:'',channelId:'',allowedUserIds:[]},routes:[{alias:'AGENT1',threadId:'',title:''}],desktop:{},limits:{dailyLimit:30,turnTimeoutMs:90000}},secrets={},runtime={running:false};
const t=k=>messages[lang][k]||k,esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function api(p,data){const r=await fetch(p,{method:data===undefined?'GET':'POST',headers:{'X-Bridge-Session':session||'','Content-Type':'application/json'},body:data===undefined?undefined:JSON.stringify(data)});const v=await r.json();if(!r.ok)throw Error(v.code||'REQUEST_FAILED');return v;}
function field(id,label,value='',type='text',wide=false){return '<label class="'+(wide?'wide':'')+'">'+esc(label)+'<input id="'+id+'" type="'+type+'" value="'+esc(value)+'" autocomplete="off"></label>';}
const button=(action,label,secondary=false)=>'<button data-action="'+action+'" class="'+(secondary?'secondary':'')+'">'+esc(t(label))+'</button>';
function renderChecks(){return '<div class="checks" data-testid="checks">'+(checks.length?checks.map(c=>'<div class="check"><span>'+esc(t(c.name))+'</span><b>'+esc(t(c.status==='pass'?'pass':c.status==='fail'?'fail':'unknown'))+'</b></div>').join(''):'<p>'+esc(t('checkfirst'))+'</p>')+'</div>';}
function routes(){return config.routes.map((r,i)=>'<div class="route"><label>'+esc(r.alias+' '+t('chat'))+'<select data-route="'+i+'"><option value="">'+esc(t('choose'))+'</option>'+chats.map(c=>'<option value="'+esc(c.threadId)+'" '+(c.threadId===r.threadId?'selected':'')+'>'+esc(c.title+' · '+c.threadId.slice(-8))+'</option>').join('')+'</select></label><details><summary>'+esc(t('manual'))+'</summary>'+field('thread-'+i,t('threadid'),r.threadId)+field('title-'+i,t('chattitle'),r.title)+'</details>'+(i?'<button class="secondary" data-remove="'+i+'">'+esc(t('remove'))+'</button>':'')+'</div>').join('');}
function testResult(){if(!nonce)return '';const lines=['received','enqueued','answer','tools','feedback'].map(k=>'<div class="check"><span>'+esc(t(k))+'</span><b>'+esc(t(test?.[k]?'pass':'unknown'))+'</b></div>').join('');return '<div data-testid="test-result" class="checks"><p class="'+(test?.passed?'success':'testnote')+'">'+esc(t(test?.passed?'testpass':'testwait'))+'</p>'+lines+(test?.status&&!test.passed?'<p>'+esc(t('pending'))+'</p>':'')+'</div>';}
function paintRuntime(){const badge=$('#runtime');badge.textContent=runtime.lastError?t('connectionlost')+' — '+t('reconnect'):t(runtime.running?'running':'stopped');}
function render(){
 document.documentElement.lang=lang;$('#language').value=lang;$('#title').textContent=t('title');$('#subtitle').textContent=t('subtitle');paintRuntime();$('#back').textContent=t('back');$('#next').textContent=t('next');$('#back').hidden=step===0;$('#next').hidden=step===6;$('#step-count').textContent=(step+1)+' / 7';
 $('#steps').innerHTML=Array.from({length:7},(_,i)=>'<button data-step="'+i+'" class="'+(i===step?'current':'')+'" '+(i===step?'aria-current="step"':'')+'><span class="number">'+(i+1)+'</span><span>'+esc(t('s'+(i+1)))+'</span></button>').join('');
 let html='<h2>'+esc(t('h'+(step+1)))+'</h2><p>'+esc(t('intro'+(step+1)))+'</p>';
 if(step===0)html+='<p><a target="_blank" rel="noreferrer" href="https://nodejs.org/en/download">Node.js</a> · <a target="_blank" rel="noreferrer" href="https://chatgpt.com/codex">Codex</a></p>'+button('env','checkenv')+renderChecks();
 if(step===1)html+=button('desktop','checkdesktop')+renderChecks()+'<details><summary>'+esc(t('advanced'))+'</summary><div class="fields">'+field('exe',t('exe'),config.desktop.executablePath,'text',true)+field('socket',t('socket'),config.desktop.socketPath,'text',true)+'</div></details>';
 if(step===2)html+='<div class="row">'+button('manifest','download')+'<a target="_blank" rel="noreferrer" href="https://api.slack.com/apps">'+esc(t('createapp'))+'</a></div><p>'+esc(t('appsteps'))+'</p><p>'+esc(t('apptokens'))+'</p><p><a target="_blank" rel="noreferrer" href="https://docs.slack.dev/tools/bolt-js/concepts/socket-mode/">Socket Mode</a> · <a target="_blank" rel="noreferrer" href="https://docs.slack.dev/app-manifests/">App Manifest</a></p>';
 if(step===3)html+='<div class="fields">'+field('team',t('team'),config.slack.teamId)+field('channel',t('channel'),config.slack.channelId)+field('users',t('users'),config.slack.allowedUserIds.join(','),'text',true)+field('bot','Bot token',secrets.botToken,'password')+field('app','App token',secrets.appToken,'password')+'</div><p class="hint">'+esc(t('usershelp'))+'</p>'+button('slack','verify')+renderChecks()+'<p class="hint">'+esc(t('channelnote'))+'</p>';
 if(step===4)html+=routes()+button('add','add',true)+(chats.length===500?'<p>'+esc(t('truncated'))+'</p>':'');
 if(step===5)html+='<div class="row">'+button('save','save')+button(runtime.running?'stop':'start',runtime.running?'stop':'start',true)+'</div><p class="hint">'+esc(t('keepopen'))+'</p>'+button('diagnostics','diagnostics',true)+(report?'<pre>'+esc(JSON.stringify(report,null,2))+'</pre>'+button('export','export',true):'');
 if(step===6)html+='<div class="row"><select id="test-agent" aria-label="Agent">'+config.routes.map(r=>'<option '+(r.alias===testAlias?'selected':'')+'>'+esc(r.alias)+'</option>').join('')+'</select>'+button('test','prepare')+'</div>'+(command?'<pre id="command">'+esc(command)+'</pre><div class="row">'+button('copy','copy',true)+button('refresh','refresh',true)+'</div>':'')+testResult()+'<p class="hint">'+esc(t('keepopen'))+'</p>';
 $('#panel').innerHTML=html;
 document.querySelectorAll('button').forEach(b=>b.disabled=busy);
}
function capture(){config.language=lang;if(step===1){config.desktop={executablePath:$('#exe')?.value.trim()||undefined,socketPath:$('#socket')?.value.trim()||undefined};}if(step===3){config.slack={teamId:$('#team').value.trim(),channelId:$('#channel').value.trim(),allowedUserIds:$('#users').value.split(',').map(x=>x.trim()).filter(Boolean)};secrets={botToken:$('#bot').value.trim(),appToken:$('#app').value.trim()};}if(step===4)config.routes=config.routes.map((r,i)=>({...r,threadId:$('#thread-'+i).value.trim(),title:$('#title-'+i).value.trim()}));}
function notice(text){$('#notice').textContent=text;$('#alert').hidden=true;}
function failure(e){$('#alert').textContent=t(e.message in messages[lang]?e.message:'REQUEST_FAILED');$('#alert').hidden=false;}
async function act(action){capture();busy=true;render();try{
 if(action==='env'){const r=await api('/api/check/env',{});checks=r.checks;}
 if(action==='desktop'){const r=await api('/api/check/desktop',{desktop:config.desktop});checks=r.checks;chats=r.chats;}
 if(action==='slack'){await api('/api/check/slack',{config,secrets});checks=[{name:'slack',status:'pass'}];}
 if(action==='add'){if(config.routes.length<20)config.routes.push({alias:'AGENT'+(config.routes.length+1),threadId:'',title:''});}
 if(action==='save'){await api('/api/config',{config,secrets});secrets={};notice(t('saved'));}
 if(action==='start')runtime=await api('/api/start',{});
 if(action==='stop')runtime=await api('/api/stop',{});
 if(action==='test'){const r=await api('/api/test',{alias:testAlias});nonce=r.nonce;command=r.command;test=null;}
 if(action==='refresh')test=await api('/api/test?nonce='+encodeURIComponent(nonce));
 if(action==='copy'){await navigator.clipboard.writeText(command);notice(t('copied'));}
 if(action==='manifest'){const r=await fetch('/manifest',{headers:{'X-Bridge-Session':session}});if(!r.ok)throw Error('REQUEST_FAILED');download(await r.blob(),'slack-app-manifest.json');}
 if(action==='diagnostics')report=await api('/api/diagnostics');
 if(action==='export')download(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}),'bridge-diagnostics.json');
 }catch(e){failure(e);}finally{busy=false;render();}}
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||busy)return;if(b.dataset.step!==undefined){capture();step=Number(b.dataset.step);checks=[];render();return;}if(b.dataset.remove!==undefined){capture();config.routes.splice(Number(b.dataset.remove),1);config.routes.forEach((r,i)=>r.alias='AGENT'+(i+1));render();return;}if(b.dataset.action)act(b.dataset.action);});
$('#language').addEventListener('change',e=>{capture();lang=e.target.value;localStorage.setItem('bridge-language',lang);render();});
$('#back').addEventListener('click',()=>{capture();step--;checks=[];render();});$('#next').addEventListener('click',()=>{capture();step++;checks=[];render();});
document.addEventListener('change',e=>{if(e.target.id==='test-agent')testAlias=e.target.value;if(e.target.dataset.route!==undefined){capture();const i=Number(e.target.dataset.route),chat=chats.find(c=>c.threadId===e.target.value);config.routes[i]={...config.routes[i],threadId:chat?.threadId||'',title:chat?.title||''};render();}});
render();if(!session){failure(Error('SESSION_REQUIRED'));}else{try{const s=await api('/api/state');if(s.config){config=s.config;lang=localStorage.getItem('bridge-language')||config.language;chats=config.routes.map(r=>({threadId:r.threadId,title:r.title}));step=s.runtime.running?6:5;}runtime=s.runtime;render();}catch(e){failure(e);}}
setInterval(async()=>{if(!nonce||busy||test?.passed)return;try{test=await api('/api/test?nonce='+encodeURIComponent(nonce));if(step===6)render();}catch{/* Leave the previous result visible when the local service closes. */}},1500);

setInterval(async()=>{if(busy||!session)return;try{const state=await api("/api/state");runtime=state.runtime;paintRuntime();}catch{runtime.lastError="LOCAL_SERVICE_CLOSED";paintRuntime();}},5000);
