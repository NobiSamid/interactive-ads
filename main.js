// main.js (core scratch logic)
const canvas = document.getElementById('scratchCanvas');
const ctx = canvas.getContext('2d');
const revealImg = document.getElementById('revealImage');

function fitCanvasToImage() {
  canvas.width = revealImg.naturalWidth || revealImg.width;
  canvas.height = revealImg.naturalHeight || revealImg.height;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
}
revealImg.onload = fitCanvasToImage;
fitCanvasToImage();

// fill top mask
function initMask() {
  ctx.fillStyle = '#bbb'; // or draw textured image
  ctx.fillRect(0,0,canvas.width,canvas.height);
  // optionally draw text "Scratch to Reveal"
  ctx.font = '40px sans-serif';
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillText('Scratch here', 30, 60);
  ctx.globalCompositeOperation = 'destination-out';
}

initMask();

let drawing=false;
function pointerDown(e){ drawing=true; draw(e); }
function pointerUp(){ drawing=false; checkReveal(); }
function draw(e){
  if(!drawing) return;
  const rect = canvas.getBoundingClientRect();
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
  const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
  ctx.beginPath();
  ctx.arc(x * (canvas.width/rect.width), y * (canvas.height/rect.height), 30, 0, Math.PI*2);
  ctx.fill();
}
canvas.addEventListener('pointerdown', pointerDown);
canvas.addEventListener('pointermove', draw);
canvas.addEventListener('pointerup', pointerUp);
canvas.addEventListener('pointerleave', pointerUp);

// check percent scratched
function checkReveal(){
  const imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
  let transparentPixels=0;
  for(let i=3;i<imgData.data.length;i+=4){
    if(imgData.data[i] === 0) transparentPixels++;
  }
  const percent = transparentPixels / (canvas.width*canvas.height) * 100;
  if(percent > 30){ // threshold
    revealComplete();
  }
}

function revealComplete(){
  // animate mask fade out or clear entire canvas
  canvas.style.transition = 'opacity .5s';
  canvas.style.opacity = 0;
  setTimeout(()=> canvas.remove(), 600);
  // fire analytic event (reveal)
  sendEvent('reveal');
}
