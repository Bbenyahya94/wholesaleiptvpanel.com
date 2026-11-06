const http=require('http');
const fs=require('fs');
const path=require('path');
const root=__dirname;
const port=process.env.PORT||3000;
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml; charset=utf-8'};
const headers={'X-Content-Type-Options':'nosniff','X-Frame-Options':'SAMEORIGIN','Referrer-Policy':'strict-origin-when-cross-origin','Permissions-Policy':'camera=(), microphone=(), geolocation=()'};

http.createServer((req,res)=>{
  const host=(req.headers.host||'').split(':')[0].toLowerCase();
  if(host.startsWith('www.')){res.writeHead(301,{Location:`https://${host.slice(4)}${req.url}`});return res.end()}
  let parsed;
  try{parsed=new URL(req.url,'http://localhost')}catch{res.writeHead(400,headers);return res.end('Bad request')}
  let url;
  try{url=decodeURIComponent(parsed.pathname)}catch{res.writeHead(400,headers);return res.end('Bad request')}
  if(url==='/health'){res.writeHead(200,{...headers,'Content-Type':'text/plain; charset=utf-8'});return res.end('ok')}
  if(url==='/index'||url==='/index.html'){res.writeHead(301,{Location:`/${parsed.search}`});return res.end()}
  if(url.endsWith('.html')){res.writeHead(301,{Location:`${url.slice(0,-5)}${parsed.search}`});return res.end()}
  if(url.length>1&&url.endsWith('/')){res.writeHead(301,{Location:`${url.slice(0,-1)}${parsed.search}`});return res.end()}
  if(url==='/'||url==='')url='/index.html';
  let candidate=path.resolve(root,`.${url}`);
  if(!candidate.startsWith(root+path.sep)&&candidate!==root){res.writeHead(403,headers);return res.end('Forbidden')}
  if(!path.extname(candidate))candidate+='.html';
  fs.readFile(candidate,(error,data)=>{
    if(error){return fs.readFile(path.join(root,'404.html'),(notFoundError,notFound)=>{res.writeHead(404,{...headers,'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache','X-Robots-Tag':'noindex'});res.end(notFoundError?'<h1>404</h1>':notFound)})}
    const ext=path.extname(candidate);const cache=ext==='.html'?'no-cache':'public, max-age=604800, immutable';
    res.writeHead(200,{...headers,'Content-Type':types[ext]||'application/octet-stream','Cache-Control':cache});res.end(data)
  });
}).listen(port,()=>console.log(`Wholesale IPTV Panel running on http://localhost:${port}`));
