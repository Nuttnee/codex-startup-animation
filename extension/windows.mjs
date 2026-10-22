import {execFile,spawn} from 'node:child_process';
import {promisify} from 'node:util';
import {createServer} from 'node:net';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {setTimeout as delay} from 'node:timers/promises';
import {buildInjection} from './payload.mjs';
import {connect,pageTarget,localSocket} from './cdp.mjs';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const exec=promisify(execFile);
export async function platform(action,args=[]) {
  const shell=join(process.env.SystemRoot||'C:\\Windows','System32/WindowsPowerShell/v1.0/powershell.exe');
  const {stdout}=await exec(shell,['-NoLogo','-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',join(root,'windows/platform.ps1'),'-Action',action,...args],{windowsHide:true,timeout:20000,maxBuffer:1024*1024});
  return JSON.parse(stdout.replace(/^\uFEFF/,''));
}
export function freePort(){
  return new Promise((accept,reject)=>{
    const server=createServer();server.on('error',reject);
    server.listen(0,'127.0.0.1',()=>{const {port}=server.address();server.close(error=>error?reject(error):accept(port));});
  });
}
export async function inject(port,{verify,timeout=45000,onConnected}={}) {
  const source=await buildInjection(root),deadline=Date.now()+timeout;
  let lastError='Đang chờ cửa sổ chính';
  while(Date.now()<deadline) {
    let client,callbackStarted=false;
    try {
      if(verify)await verify();
      const response=await fetch(`http://127.0.0.1:${port}/json/list`,{signal:AbortSignal.timeout(1500),redirect:'error'});
      if(!response.ok)throw new Error('Cổng gỡ lỗi chưa sẵn sàng');
      const targets=await response.json();
      if(!Array.isArray(targets))throw new Error('Danh sách cửa sổ gỡ lỗi không hợp lệ');
      const target=targets.find(pageTarget);
      if(!target)throw new Error('Không tìm thấy cửa sổ Codex tương thích');
      client=await connect(localSocket(target.webSocketDebuggerUrl,port));
      const result=await client.call('Runtime.evaluate',{expression:source,returnByValue:true,awaitPromise:true});
      if(result.exceptionDetails||result.result?.value?.installed!==true)throw new Error('Không gắn được hiệu ứng vào Codex');
      for(let attempt=0;attempt<100;attempt++) {
        const answer=await client.call('Runtime.evaluate',{expression:'globalThis.__aemeathExtension?.status()',returnByValue:true});
        const state=answer.result?.value;
        if(state?.phase==='failed'||state?.phase==='timeout')throw new Error('Không tải được tài nguyên hiệu ứng');
        if(state?.ready) { if(onConnected){callbackStarted=true;await onConnected(client,state);} return state; }
        await delay(100);
      }
      throw new Error('Hết thời gian chờ hiệu ứng sẵn sàng');
    } catch(error) { if(callbackStarted)throw error;lastError=error.message; }
    finally { client?.close(); }
    await delay(300);
  }
  throw new Error(`${lastError}. Thoát Codex rồi mở bằng biểu tượng chính thức để kết thúc chế độ gỡ lỗi.`);
}
export async function launch(executable,{profile,onConnected}={}) {
  if(process.platform!=='win32')throw new Error('Bộ khởi chạy này chỉ dành cho Windows');
  const info=await platform('Discover',executable?['-Executable',executable]:[]);
  if(info.running.length&&!profile)throw new Error('Codex đang chạy. Hãy lưu công việc, thoát hẳn Codex (kể cả khay hệ thống), rồi chạy lại Launch-Windows.cmd. Phiên hiện tại chưa bị khởi động lại.');
  const port=await freePort();
  const args=['--remote-debugging-address=127.0.0.1',`--remote-debugging-port=${port}`];
  if(profile)args.push(`--user-data-dir=${resolve(profile)}`,'--no-first-run','--no-default-browser-check');
  const child=spawn(info.executable,args,{detached:true,stdio:'ignore',windowsHide:false});
  await new Promise((accept,reject)=>{child.once('spawn',accept);child.once('error',reject);});
  child.unref();
  console.log(`Đã mở Codex (PID ${child.pid}). Đang chờ hiệu ứng…`);
  const verify=()=>platform('Verify',['-Executable',info.executable,'-Port',String(port),'-ExpectedProcessId',String(child.pid)]);
  const state=await inject(port,{verify,onConnected});
  console.log('Hiệu ứng đã bắt đầu. Nhấn Ctrl+Alt+B để mở cài đặt ảnh. Bộ khởi chạy đang đóng.');
  return {pid:child.pid,port,state};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const index=process.argv.indexOf('--executable');
  launch(index<0?undefined:process.argv[index+1]).catch(error=>{console.error(error.message);process.exitCode=1;});
}
