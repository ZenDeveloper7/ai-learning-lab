import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('./public/',import.meta.url));
const port=Number(process.env.PORT||4318);
const host=process.env.BIND_ADDRESS||'127.0.0.1';
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json'};
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));}
const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('X-Frame-Options','DENY');
  res.setHeader('Referrer-Policy','same-origin');
  try{
    const url=new URL(req.url,'http://localhost');
    if(url.pathname==='/api/tutor/status'&&req.method==='GET')return json(res,200,{connected:false,mode:'local-required'});
    if(url.pathname==='/api/tutor')return json(res,503,{error:'The Pi serves the course. Live subscription tutoring is available in the local Mac studio; a hosted sign-in integration is not configured.'});
    if(!['GET','HEAD'].includes(req.method))return json(res,405,{error:'Method not allowed'});
    const pathname=decodeURIComponent(url.pathname);
    const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(!file.startsWith(root))return json(res,403,{error:'Not allowed'});
    const data=await fs.readFile(file);
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});
    res.end(req.method==='HEAD'?undefined:data);
  }catch(error){json(res,error.code==='ENOENT'||error.code==='EISDIR'?404:400,{error:'Page unavailable'});}
});
server.listen(port,host,()=>console.log(`Zen, AI Learning Lab course is listening on ${host}:${port}`));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
