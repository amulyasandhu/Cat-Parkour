const canvas = document.getElementById('worldCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const words = ["VOID", "GHOST", "NULL", "QRYIVIQ", "PROTO", "9999"];
const moonColor = "#ffffff";
let scrollOffset = 0;
const startTime = Date.now();

// 1. Particle Systems
const stars = Array.from({length: 250}, () => ({
    x: Math.random() * canvas.width, y: Math.random() * canvas.height,
    size: Math.random() * 1.5, twinkle: Math.random() * 0.005 + 0.002
}));

const clouds = Array.from({length: 10}, () => ({
    x: Math.random() * canvas.width, y: Math.random() * (canvas.height / 3),
    speed: Math.random() * 0.4 + 0.1, size: Math.random() * 120 + 160
}));

const raindrops = Array.from({length: 150}, () => ({
    x: Math.random() * canvas.width, y: Math.random() * canvas.height,
    speed: Math.random() * 12 + 18, len: Math.random() * 25 + 10
}));

const fireflies = Array.from({length: 25}, () => ({
    x: Math.random() * canvas.width, y: Math.random() * canvas.height,
    sX: Math.random() * 2 - 1, sY: Math.random() * 2 - 1
}));

class VerticalBuilding {
    constructor(x) {
        this.x = x; this.width = Math.random() * 60 + 50;
        this.baseHeight = Math.random() * 200 + 150; 
        this.phase = Math.random() * Math.PI * 2;
        this.columns = Math.max(2, Math.floor(this.width / 18));
    }
    draw(offset) {
        let breath = Math.sin(Date.now() * 0.001 + this.phase) * 40;
        let currentHeight = this.baseHeight + breath;
        let drawX = (this.x - offset) % (canvas.width + 1500);
        if (drawX < -400) drawX += (canvas.width + 2000);
        ctx.fillStyle = moonColor; ctx.shadowBlur = 20; ctx.shadowColor = moonColor;
        for (let col = 0; col < this.columns; col++) {
            let colX = drawX + (col * 20);
            for (let i = 0; i < currentHeight / 20; i++) {
                ctx.font = `bold 12px Courier New`;
                ctx.fillText(words[(i + col) % words.length], colX, canvas.height - 100 - (i * 20));
            }
        }
    }
}

class WhiteBushTree {
    constructor(x) { this.x = x; this.scale = Math.random() * 0.4 + 1.4; }
    draw(offset) {
        let drawX = (this.x - offset) % (canvas.width + 1500);
        if (drawX < -400) drawX += (canvas.width + 2000);
        ctx.save(); ctx.translate(drawX, canvas.height - 100); ctx.scale(this.scale, this.scale);
        ctx.strokeStyle = "#111"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -40); ctx.stroke();
        ctx.fillStyle = moonColor; ctx.shadowBlur = 30; ctx.shadowColor = moonColor;
        this.drawCloud(0, -55, 25); this.drawCloud(-15, -40, 20); this.drawCloud(15, -40, 20);
        ctx.restore();
    }
    drawCloud(x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
}

function drawWeather() {
    let elapsed = ((Date.now() - startTime) / 1000) % 60; 
    
    // FIREFLIES: Only during clear sky (0-15s)
    if (elapsed < 15) {
        fireflies.forEach(f => {
            f.x += f.sX; f.y += f.sY;
            if (f.x < 0 || f.x > canvas.width) f.sX *= -1;
            if (f.y < 0 || f.y > canvas.height) f.sY *= -1;
            ctx.fillStyle = "#fff"; ctx.shadowBlur = 10; ctx.shadowColor = "#fff";
            ctx.beginPath(); ctx.arc(f.x, f.y, 1.5, 0, Math.PI*2); ctx.fill();
        });
    }

    // CLOUDS: 15s-45s
    if (elapsed >= 15 && elapsed < 45) {
        clouds.forEach(c => {
            c.x -= c.speed; if (c.x < -c.size) c.x = canvas.width + c.size;
            ctx.fillStyle = "rgba(255, 255, 255, 0.06)"; ctx.shadowBlur = 40; ctx.shadowColor = "white";
            ctx.beginPath(); ctx.ellipse(c.x, c.y, c.size, c.size / 3, 0, 0, Math.PI * 2); ctx.fill();
        });
    }

    // RAIN: 30s-60s
    if (elapsed >= 30) {
        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)"; ctx.lineWidth = 1;
        raindrops.forEach(r => {
            r.y += r.speed; if (r.y > canvas.height) { r.y = -20; r.x = Math.random() * canvas.width; }
            ctx.beginPath(); ctx.moveTo(r.x, r.y); ctx.lineTo(r.x, r.y + r.len); ctx.stroke();
        });
        ctx.restore();
    }
}

function drawKineticRoad() {
    ctx.save();
    let roadY = canvas.height - 100;
    for (let i = 0; i < 8; i++) {
        ctx.beginPath(); ctx.lineWidth = 1.5; ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 + (i * 0.04)})`;
        ctx.shadowBlur = 15; ctx.shadowColor = "#ffffff";
        let yOffset = roadY + (i * 10); ctx.moveTo(0, yOffset);
        for (let x = 0; x <= canvas.width; x += 25) {
            let ripple = Math.sin(x * 0.005 + (Date.now() * 0.003) + i) * 8;
            let distToCat = Math.abs(x - 250);
            if (distToCat < 200) ripple *= (1 + (200 - distToCat) / 40);
            ctx.lineTo(x, yOffset + ripple);
        }
        ctx.stroke();
    }
    ctx.restore();
}

function drawMoon() {
    let x = canvas.width - 150, y = 80, radius = 35;
    let phase = (Date.now() * 0.0001) % 2;
    ctx.save(); ctx.shadowBlur = 50; ctx.shadowColor = "#fff";
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#fff"; ctx.fill();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath(); ctx.arc(x + (phase - 1) * (radius * 2.5), y, radius, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

function drawCat() {
    ctx.save(); ctx.translate(250, canvas.height - 100); ctx.fillStyle = "#ffffff";
    ctx.shadowBlur = 20; ctx.shadowColor = "#ffffff";
    let legMove = Math.sin(Date.now() * 0.012) * 15;
    ctx.fillRect(0, -18, 45, 20); ctx.fillRect(40, -28, 15, 15);
    ctx.beginPath();
    ctx.moveTo(42, -28); ctx.lineTo(45, -36); ctx.lineTo(48, -28);
    ctx.moveTo(51, -28); ctx.lineTo(54, -36); ctx.lineTo(57, -28);
    ctx.fill();
    ctx.fillRect(-10, -30 + (legMove/2), 6, 22);
    ctx.fillRect(5, 2, 4, 12 + legMove); ctx.fillRect(15, 2, 4, 12 - legMove);
    ctx.fillRect(30, 2, 4, 12 + legMove); ctx.fillRect(40, 2, 4, 12 - legMove);
    ctx.restore();
}

let elements = [];
for (let i = 0; i < 10; i++) {
    let xPos = i * 600; 
    if (i % 2 === 0) elements.push(new VerticalBuilding(xPos));
    else elements.push(new WhiteBushTree(xPos));
}

function animate() {
    ctx.fillStyle = "black"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
        let x = (s.x - scrollOffset * 0.05) % canvas.width; if (x < 0) x += canvas.width;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(Math.sin(Date.now() * s.twinkle))})`;
        ctx.fillRect(x, s.y, s.size, s.size);
    });
    drawMoon(); drawWeather(); drawKineticRoad();
    scrollOffset += 4; elements.forEach(el => el.draw(scrollOffset));
    drawCat(); requestAnimationFrame(animate);
}
animate();
