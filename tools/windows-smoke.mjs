// Real installed app, isolated profile. Never connects to the user's normal session.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';
import {launch} from '../extension/windows.mjs';

const output=resolve(process.argv[2]||'.build/windows-smoke');
await mkdir(output,{recursive:true});
const report={started:new Date().toISOString(),checks:[]};
try {
  await launch(undefined,{profile:join(output,'profile'),onConnected:async client=>{
    const evaluate=async expression=>{
      const result=await client.call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
      assert.ok(!result.exceptionDetails,JSON.stringify(result.exceptionDetails));return result.result?.value;
    };
    const screenshot=async name=>{
      const shot=await client.call('Page.captureScreenshot',{format:'png'});
      await writeFile(join(output,name),Buffer.from(shot.data,'base64'));
    };
    try {
      await client.call('Page.bringToFront');
      await delay(3500);await screenshot('animation.png');
      for(let i=0;i<100;i++) {
        report.completed=await evaluate('globalThis.__aemeathExtension.status()');
        if(report.completed.completed)break;
        await delay(250);
      }
      assert.equal(report.completed.completed,true);
      assert.equal(report.completed.overlay,false);
      assert.equal(report.completed.wallpaper,true);
      report.checks.push('Animation completed, overlay removed, wallpaper retained');
      await screenshot('completed.png');
      await client.call('Input.dispatchKeyEvent',{type:'keyDown',modifiers:3,key:'b',code:'KeyB',windowsVirtualKeyCode:66});
      await client.call('Input.dispatchKeyEvent',{type:'keyUp',modifiers:0,key:'b',code:'KeyB',windowsVirtualKeyCode:66});
      await delay(1500);
      assert.equal(await evaluate('globalThis.__aemeathExtension.status().phase'),'settings');
      await screenshot('settings.png');report.checks.push('Ctrl+Alt+B opens settings');
      await evaluate('globalThis.__aemeathExtension.dispose()');
      assert.equal(await evaluate('!!globalThis.__aemeathExtension'),false);
      assert.equal(await evaluate('!!document.querySelector("#aemeath-extension-overlay, #aemeath-extension-style")'),false);
      assert.equal(await evaluate('document.documentElement.hasAttribute("data-aemeath-skin")'),false);
      report.checks.push('Restore removes overlay, styles and API');
      report.passed=true;
    } finally {
      await writeFile(join(output,'report.json'),JSON.stringify(report,null,2));
      // Only the separate profile created above is closed.
      await client.call('Browser.close').catch(()=>{});
    }
  }});
  console.log(JSON.stringify(report,null,2));
} catch(error) {
  report.error=error.message;
  await writeFile(join(output,'report.json'),JSON.stringify(report,null,2));
  console.error(error);process.exitCode=1;
}
