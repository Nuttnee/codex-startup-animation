(() => {
  'use strict';
  const nodes=new Map();
  const $ = selector => { if(!nodes.has(selector))nodes.set(selector,document.querySelector(selector));return nodes.get(selector); };
  const duration = 12000;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const native = !window.AEMEATH_EXTERNAL && Boolean(window.webkit?.messageHandlers?.launcher);
  const embedded = window.parent!==window && (window.AEMEATH_EXTERNAL || new URLSearchParams(location.search).has('embedded'));
  const assets=window.AEMEATH_ASSETS||{artwork:'assets/artwork.jpg',avatar:'assets/avatar.jpg'};
  if(embedded)document.body.classList.add('embedded');
  const root = $('.window'), art = $('.artwork'), scene = $('.scene');
  const hud = $('.hud'), intro = $('.intro'), sweep = $('.light-sweep');
  const slider = $('#timeline'), pause = $('#pause'), subtitle = $('.subtitle');
  slider.max=String(duration/1000);
  let playing = false, elapsed = 0, origin = 0, frame = 0, lastUI = -Infinity;
  let completed = false, hiddenPause = false, mode = 'preview', loaded = false, revealed = false;
  const clamp = n => Math.max(0, Math.min(1, n));
  const smooth = n => { const t = clamp(n); return t*t*(3-2*t); };
  const send = (action, details={}) => {
    if(native)window.webkit.messageHandlers.launcher.postMessage(action);
    if(embedded){const data={type:'aemeath-boot',action,...details};if(window.AEMEATH_EXTERNAL)window.AEMEATH_SEND(data);else window.parent.postMessage(data,'*');}
  };
  const particles = Array.from({length: reduced ? 0 : 14}, (_, i) => {
    const node = document.createElement('i'); node.className = 'particle';
    const size = i % 4 === 0 ? 3 : 1.5;
    Object.assign(node.style, {width:`${size}px`,height:`${size}px`,left:`${(i*37+7)%100}%`,top:`${(i*23+17)%100}%`});
    $('.particles').appendChild(node); return node;
  });
  const milestones = [[0,0],[.12,.06],[.35,.41],[.56,.76],[.66,.924],[.72,.97],[.77,1],[1,1]];
  function progress(t) {
    const p = t / duration;
    for (let i=1;i<milestones.length;i++) {
      if (p <= milestones[i][0]) {
        const [a,x] = milestones[i-1], [b,y] = milestones[i];
        return x+(y-x)*smooth((p-a)/(b-a));
      }
    }
    return 1;
  }
  // Build the selected image contours once; playback only composites layers.
  const canvas = $('.line-art'), ctx = canvas.getContext('2d');
  function preparePaths(raw) { return raw.map(points => {
    let total=0;
    for(let i=1;i<points.length;i++)total+=Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]);
    const full=new Path2D();points.forEach((point,i)=>i?full.lineTo(...point):full.moveTo(...point));
    return {points,total,full};
  }); }
  let paths=preparePaths(window.CONTOUR_PATHS || []),lastTrace=-1;
  // Rasterize contours once per selected image, before playback starts.
  function trace(){
    if(lastTrace===1)return;
    ctx.clearRect(0,0,1536,1024);
    ctx.strokeStyle='#b7e8f8';ctx.lineWidth=1.25;ctx.lineCap='round';ctx.lineJoin='round';
    ctx.globalAlpha=1;
    const combined=new Path2D();for(const path of paths)combined.addPath(path.full);
    ctx.stroke(combined);lastTrace=1;
  }
  for(let i=0;i<60;i++){
    const tick=document.createElementNS('http://www.w3.org/2000/svg','line');
    const angle=i*Math.PI/30,inner=i%5===0?181:184;
    tick.setAttribute('x1',200+Math.sin(angle)*inner);tick.setAttribute('y1',200-Math.cos(angle)*inner);
    tick.setAttribute('x2',200+Math.sin(angle)*(i%5===0?199:192));tick.setAttribute('y2',200-Math.cos(angle)*(i%5===0?199:192));
    tick.style.opacity=i%5===0?'.9':'.55';$('.ticks').appendChild(tick);
  }
  function render(t) {
    const s=t/1000, p=progress(t), color=smooth((s-5.1)/2.3), pinch=smooth((s-11.65)/.35);

    const closing=s>=11;
    root.classList.toggle('closing',closing);document.body.classList.toggle('closing',closing);
    scene.style.opacity=String(1-smooth((s-10.6)/1.4));
    scene.style.transform='none';
    scene.style.filter='none';
    $('.transition-flash').style.opacity='0';
    const line=$('.shutter-line');
    line.style.opacity='0';
    line.style.transform=`scaleX(${1-pinch})`;
    if(closing&&!revealed){revealed=true;send('reveal');}

    intro.style.opacity=String(1-smooth((s-3.8)/1.5));
    $('.identity').style.opacity=String(smooth((s-1.05)/.65));
    $('.identity').style.transform=`translate(-50%,-43%) scale(${.94+.06*smooth((s-1.05)/.65)})`;
    const beat=reduced?0:Math.pow((1-Math.cos(Math.max(0,s-1.05)*Math.PI*2/1.08))/2,2);
    $('.avatar-frame').style.transform=`translateY(${-4*beat}px) scale(${1+.025*beat})`;
    $('.pulse').style.opacity=String(1-smooth((s-1.15)/.5));
    document.querySelectorAll('.pulse i').forEach((ring,i)=>{
      const phase=(s*.75+i*.5)%1;
      ring.style.transform=`scale(${.25+phase*.9})`;ring.style.opacity=String((1-phase)*.8);
    });
    $('.dashed').style.transformOrigin='200px 200px';$('.dashed').style.transform=`rotate(${reduced?0:s*16}deg)`;
    $('.boot-title').style.opacity=String(smooth((s-1.75)/.85));
    $('.boot-caption').style.opacity=String(smooth((s-2.5)/.35)*.5);
    $('.wave').style.transform=`scaleY(${reduced?1:.6+Math.sin(s*6)*.4})`;
    $('.boot-grid').style.opacity=String(smooth((s-.8)/.6)*(1-color));
    $('.boot-corners').style.opacity=String(smooth((s-.8)/.6)*(1-color));
    $('.boot-logs').style.opacity=String((1-color)*.55);
    document.querySelectorAll('.boot-logs div').forEach((line,i)=>line.style.opacity=String(smooth((s-.15-i*.38)/.3)));
    canvas.style.opacity=String(reduced?0:smooth((s-4.1)/1.2)*(1-color)*.48);
    canvas.style.transform=reduced?'none':`scale(${1.025-.025*smooth((s-4.1)/3.3)})`;
    art.style.opacity=String(color);
    // The art stays registered to the contours until the color transition finishes.
    art.style.transform=reduced?'none':`scale(${1+.012*smooth((s-7.42)/3.58)})`;
    $('.shade').style.opacity=String(color);
    hud.style.opacity=String(smooth((s-7.24)/.45));
    $('.sync-fill').style.transform=`scaleX(${p})`;
    sweep.style.opacity=reduced?'0':String(Math.sin(clamp((s-7.18)/.8)*Math.PI)*.1);
    sweep.style.transform=`translateX(${(-60+clamp((s-7.18)/.8)*120)}%)`;
    particles.forEach((node,i)=>{
      node.style.opacity=String(color*(.12+.28*(.5+.5*Math.sin(s*.9+i))));
      node.style.transform=`translate(${Math.sin(s*.4+i)*8}px,${-s*(2+i%3)}px)`;
    });
    subtitle.style.opacity=String(smooth((s-7.6)/.4)*(1-smooth((s-10.65)/.25)));
    if(Math.abs(t-lastUI)>60 || t===0 || t>=duration) {
      lastUI=t;
      $('#ratio').textContent=`${(p*100).toFixed(2).padStart(5,'0')}%`;
      $('.sync-phase').textContent=s<6.5?'ĐANG KHỞI TẠO':p<1?'ĐANG ĐỒNG BỘ':'ĐỒNG BỘ XONG';
      $('#timecode').textContent=`00:${String(Math.floor(s)).padStart(2,'0')}:${String(Math.floor(s%1*30)).padStart(2,'0')}`;
      slider.value=String(s);
      $('#elapsed').innerHTML=`${s.toFixed(1).padStart(4,'0')} <span>/ 12.0s</span>`;
      root.dataset.elapsed=s.toFixed(2);
      root.dataset.stage=s>=11?'shutter':s<1.15?'pulse':s<4.18?'identity':s<4.74?'dispersing':s<5.08?'scattered':s<7.18?'drawing':s<7.43?'colorize':'portrait';
    }
  }
  function updateButton() { pause.textContent=playing?'Tạm dừng':'Tiếp tục'; root.dataset.playing=String(playing); }
  function stop() { playing=false; cancelAnimationFrame(frame); frame=0; updateButton(); }
  function finish(skipped=false) {
    stop(); elapsed=duration; render(elapsed); completed=true;
    root.classList.add('finished'); root.dataset.completed='true';
    pause.textContent='Đã kết thúc'; pause.disabled=true;
    $('.end-description').textContent=mode==='launch'?'Đang mở giao diện Codex…':skipped?'Đã bỏ qua hiệu ứng mở đầu':'Đã xem xong hiệu ứng';
    send('complete');
  }
  function tick(now) {
    if(!playing)return;
    elapsed=Math.min(duration,now-origin); render(elapsed);
    if(elapsed>=duration){finish();return;}
    frame=requestAnimationFrame(tick);
  }
  function prepareContourLayer(){trace();}
  function play() {
    if(!loaded)return;
    if(elapsed>=duration)elapsed=0;
    prepareContourLayer();
    completed=false; root.classList.remove('finished'); root.dataset.completed='false';
    pause.disabled=false; origin=performance.now()-elapsed; playing=true;updateButton();
    cancelAnimationFrame(frame);frame=requestAnimationFrame(tick);
  }
  function replay(){revealed=false;hiddenPause=false;stop();elapsed=0;lastUI=-Infinity;render(0);play();}
  $('#replay').addEventListener('click',replay);$('.replay-end').addEventListener('click',replay);
  pause.addEventListener('click',()=>{hiddenPause=false;if(playing){elapsed=Math.min(duration,performance.now()-origin);stop();render(elapsed);}else play();});
  $('.skip').addEventListener('click',()=>finish(true));
  slider.addEventListener('input',()=>{hiddenPause=false;stop();elapsed=Number(slider.value)*1000;prepareContourLayer();if(elapsed>=duration){finish();return;}lastUI=-Infinity;completed=false;root.classList.remove('finished');root.dataset.completed='false';pause.disabled=false;render(elapsed);});
  window.addEventListener('keydown',event=>{
    if((event.metaKey||event.ctrlKey)&&event.altKey&&event.code==='KeyB'){
      event.preventDefault();if(!$('#settings-dialog').open)openSettings();return;
    }
    if($('#settings-dialog').open)return;
    if(event.key==='Escape'){event.preventDefault();finish(true);}
    if(event.code==='Space'&&event.target.tagName!=='INPUT'&&event.target.tagName!=='BUTTON'){event.preventDefault();pause.click();}
  });
  document.addEventListener('visibilitychange',()=>{
    if(native)return;
    if(document.hidden&&playing){elapsed=Math.min(duration,performance.now()-origin);hiddenPause=true;stop();}
    else if(!document.hidden&&hiddenPause&&!completed){hiddenPause=false;play();}
  });
  // Narrow native bridge: the host may select launch mode or report its own launch error.
  window.launcherUI={
    openSettings,
    beginLaunch(){mode='launch';document.body.classList.add('launch-mode');replay();},
    error(message){stop();scene.style.opacity='0';root.classList.add('finished');$('.end-description').textContent=message;$('.eyebrow').textContent='KHÔNG THỂ KHỞI ĐỘNG';$('.end-screen h1').textContent='Chưa thể mở Codex';},
    waiting(){ $('.end-description').textContent='Đang chờ Codex mở…'; }
  };
  if(native){
    document.body.classList.add('native');
  }
  function ready(){if(loaded)return;loaded=true;render(0);send('ready');if(window.AEMEATH_OPEN_SETTINGS||new URLSearchParams(location.search).has('settings'))openSettings();else play();}
  function failed(){stop();$('#asset-error').hidden=false;send('assetError');}
  let savedImages={},pendingImages={},busy=false;
  const settings=$('#settings-dialog'),status=$('#settings-status');
  const textFields=[
    {key:'introTitle',input:'#intro-title',target:'.boot-title',fallback:'HỐ ĐEN',limit:16},
    {key:'introCaption',input:'#intro-caption',target:'.boot-caption',fallback:'CODEX / CHÂN TRỜI SỰ KIỆN',limit:48},
    {key:'artworkSubtitle',input:'#artwork-subtitle',target:'#subtitle',fallback:'Khám phá phía bên kia chân trời sự kiện',limit:60}
  ];
  const textValue=(images,field)=>typeof images[field.key]==='string'?images[field.key].slice(0,field.limit):field.fallback;
  function thumbnails(){
    $('#avatar-preview').src=pendingImages.avatar||assets.avatar;
    $('#artwork-preview').src=pendingImages.artwork||assets.artwork;
    $('#wallpaper-strength').value=String(pendingImages.wallpaperStrength??55);
    $('#wallpaper-value').textContent=$('#wallpaper-strength').value+'%';
    for(const field of textFields)$(field.input).value=textValue(pendingImages,field);
  }
  function openSettings(){
    if(mode==='launch'||settings.open)return;
    hiddenPause=false;stop();pendingImages={...savedImages};thumbnails();
    status.textContent='Ảnh và chữ chỉ lưu trên máy. Nhấn “Lưu và xem lại” để áp dụng; đóng để hủy thay đổi.';
    settings.returnValue='';settings.showModal();send('settings-open');
  }
  function setBusy(value){
    busy=value;
    settings.querySelectorAll('input,button').forEach(node=>node.disabled=value);
  }
  async function applyImages(images){

    art.src=images.artwork||assets.artwork;$('.avatar').src=images.avatar||assets.avatar;
    await Promise.all([art,$('.avatar')].map(img=>img.decode()));
    paths=preparePaths(images.contours||window.CONTOUR_PATHS||[]);lastTrace=-1;
    if(!paths.length)throw new Error('Thiếu dữ liệu nét vẽ của ảnh');
    for(const field of textFields)$(field.target).textContent=textValue(images,field);
    $('.boot-title').classList.toggle('long-title',Array.from(textValue(images,textFields[0])).length>6);
    send('background',{image:art.src,strength:images.wallpaperStrength??55});
  }
  for(const field of textFields)$(field.input).addEventListener('input',event=>{
    pendingImages[field.key]=event.target.value.slice(0,field.limit);
  });
  $('#wallpaper-strength').addEventListener('input',event=>{
    pendingImages.wallpaperStrength=Number(event.target.value);
    $('#wallpaper-value').textContent=event.target.value+'%';
  });
  $('#image-settings').addEventListener('click',openSettings);
  if(window.AEMEATH_EXTERNAL){$('#restore-appearance').hidden=false;$('#restore-appearance').addEventListener('click',()=>send('restore'));}
  settings.addEventListener('cancel',event=>{if(busy)event.preventDefault();});
  settings.addEventListener('close',()=>{
    if(!loaded)return;
    if(settings.returnValue==='preview'){send('settings-close');replay();}
    else finish(true);
  });
  for(const kind of ['avatar','artwork'])$('#'+kind+'-file').addEventListener('change',async event=>{
    const file=event.target.files[0];if(!file)return;
    setBusy(true);status.textContent=kind==='artwork'?'Đang tạo nét vẽ cho ảnh nền mới…':'Đang chuẩn bị ảnh đại diện…';
    // Let the progress text paint before the one-time contour computation.
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    try{
      pendingImages={...pendingImages,...await window.imageSettings.importImage(file,kind)};thumbnails();
      status.textContent='Ảnh đã sẵn sàng. Nhấn “Lưu và xem lại” để áp dụng.';
    }catch(error){status.textContent=error.message;}
    finally{setBusy(false);event.target.value='';}
  });
  $('#reset-images').addEventListener('click',()=>{pendingImages={};thumbnails();status.textContent='Đã chọn ảnh, chữ và độ đậm mặc định. Nhấn “Lưu và xem lại” để áp dụng.';});
  $('#preview-images').addEventListener('click',async()=>{
    setBusy(true);status.textContent='Đang lưu…';
    try{
      await applyImages(pendingImages);await window.imageSettings.save(pendingImages);savedImages={...pendingImages};settings.close('preview');
    }catch(error){await applyImages(savedImages);status.textContent='Không lưu được; đã giữ cài đặt cũ: '+error.message;}
    finally{setBusy(false);}
  });
  window.imageSettings.load().catch(()=>({})).then(async images=>{
    // Apply this theme once, preserving subsequent user customizations.
    if(images.theme!=='black-hole-v1'){
      images={...images,theme:'black-hole-v1',avatar:undefined,artwork:undefined,contours:undefined,introTitle:undefined,introCaption:undefined,artworkSubtitle:undefined,wallpaperStrength:55};
      await window.imageSettings.save(images).catch(()=>{});
    }
    if(images.logoTheme!=='ice-orbit-v1'){
      images={...images,logoTheme:'ice-orbit-v1',avatar:undefined};
      await window.imageSettings.save(images).catch(()=>{});
    }
    savedImages=images;
    try{await applyImages(images);}catch{savedImages={};await applyImages({});}
    ready();
  }).catch(failed);
})();


