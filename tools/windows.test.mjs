import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:net';
import {platform,freePort,launch} from '../extension/windows.mjs';

test('freePort selects an available IPv4 loopback port',async()=>{
  const port=await freePort();assert.ok(port>0&&port<65536);
  const server=createServer();
  await new Promise((accept,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',accept);});
  await new Promise(accept=>server.close(accept));
});
test('Windows discovery rejects a non-Codex executable',{skip:process.platform!=='win32'},async()=>{
  await assert.rejects(platform('Discover',['-Executable',process.execPath]),/không phải tệp chạy Codex/);
});
test('Windows verification rejects a listener belonging to another PID',{skip:process.platform!=='win32'},async()=>{
  const server=createServer();await new Promise(accept=>server.listen(0,'127.0.0.1',accept));
  try {
    await assert.rejects(platform('Verify',['-Executable',process.execPath,'-Port',String(server.address().port),'-ExpectedProcessId',String(process.pid+100000)]),/tiến trình khác/);
    await assert.rejects(platform('Verify',['-Executable','C:\\wrong\\ChatGPT.exe','-Port',String(server.address().port),'-ExpectedProcessId',String(process.pid)]),/chương trình gỡ lỗi không khớp/);
  } finally { await new Promise(accept=>server.close(accept)); }
});
test('An existing Codex session is not restarted',{skip:!process.env.CODEX_WINDOWS_RUNNING_TEST},async()=>{
  await assert.rejects(launch(),/Codex đang chạy/);
});
