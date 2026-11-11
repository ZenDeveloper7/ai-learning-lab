import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {CodexTutor} from './tutor.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const course=JSON.parse(await fs.readFile(path.join(root,'app/course.json'),'utf8'));
const learning=JSON.parse(await fs.readFile(path.join(root,'app/learning.json'),'utf8'));
const tutor=new CodexTutor();
let inflight=false;
const port=Number(process.env.AI_LEARNING_PORT||4318),origin=`http://127.0.0.1:${port}`;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.woff2':'font/woff2'};
function json(res,status,value){res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(value))}
const server=http.createServer(async(req,res)=>{
 try{
  if(req.headers.host!==`127.0.0.1:${port}`){json(res,403,{error:'Use the local address shown by the launcher.'});return}
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('X-Frame-Options','DENY');
  const url=new URL(req.url,origin);
  if(url.pathname==='/api/tutor/status'&&req.method==='GET'){try{await tutor.start();json(res,200,{connected:true,mode:'codex-subscription'})}catch(e){json(res,200,{connected:false,error:e.message})}return}
  if(url.pathname==='/api/tutor'&&req.method==='POST'){
   if((req.headers.origin&&req.headers.origin!==origin)||req.headers['sec-fetch-site']==='cross-site'||!req.headers['content-type']?.startsWith('application/json')){json(res,403,{error:'Only this local studio can send tutor requests.'});return}
   let data='';for await(const chunk of req){data+=chunk;if(data.length>50000){json(res,413,{error:'Question history is too long.'});return}}
   let body;try{body=JSON.parse(data)}catch{json(res,400,{error:'Invalid question.'});return}
   const {lessonId,messages}=body;const mod=course.find(m=>m.lessons.some(l=>l.id===lessonId));
   if(!mod||!Array.isArray(messages)||!messages.length||messages.length>12||messages.some(m=>!['user','assistant'].includes(m.role)||typeof m.text!=='string'||m.text.length>10000)||messages.at(-1).role!=='user'){json(res,400,{error:'Choose a lesson and enter a valid question.'});return}
   if(inflight||tutor.current){json(res,409,{error:'A response is already running. Please wait.'});return}
   inflight=true;try{await tutor.start()}catch(e){inflight=false;json(res,503,{error:e.message});return}
   const lesson=mod.lessons.find(l=>l.id===lessonId),context=JSON.stringify({module:mod.title,lesson:lesson.title,scope:lesson.scope,primer:learning.primers[mod.id-1][(lessonId-1)%4],coreIdea:mod.anchor,exercise:mod.lab,checkpoint:mod.checkpoint});
   res.writeHead(200,{'Content-Type':'application/x-ndjson','Cache-Control':'no-store','X-Accel-Buffering':'no'});res.flushHeaders();const ac=new AbortController();res.on('close',()=>ac.abort());
   try{await tutor.answer({context,messages,signal:ac.signal,emit:event=>{if(!res.destroyed)res.write(JSON.stringify(event)+'\n')}});if(!res.destroyed)res.write(JSON.stringify({done:true})+'\n')}catch(e){if(!res.destroyed)res.write(JSON.stringify({error:e.message})+'\n')}finally{inflight=false;res.end()}return;
  }
  if(req.method!=='GET'){json(res,405,{error:'Method not allowed'});return}
  if(url.pathname.startsWith('/api/')){json(res,404,{error:'Not found'});return}
  const name=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname),file=path.resolve(root,'public','.'+name);
  if(!file.startsWith(path.join(root,'public')+path.sep)){json(res,403,{error:'Not allowed'});return}
  try{const bytes=await fs.readFile(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(bytes)}catch{json(res,404,{error:'Page not found'})}
 }catch(e){if(!res.headersSent)json(res,500,{error:'The studio encountered an error. Please retry.'});else res.end()}
});
server.listen(port,'127.0.0.1',()=>console.log(`Zen, AI Learning Lab is ready at ${origin}`));
server.on('error',e=>{console.error(e.message);process.exitCode=1;tutor.close()});
for(const sig of ['SIGINT','SIGTERM'])process.on(sig,()=>{tutor.close();server.close(()=>process.exit(0))});
