const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const debug = document.getElementById("debug");
const hpFill = document.getElementById("hpFill");
const hpText = document.getElementById("hpText");
const statusText = document.getElementById("statusText");
const metaText = document.getElementById("meta");

const world = {
  width: 2100,
  height: 1800,
};

const combat = {
  maxHp: 100,
  attackDamage: 20,
  attackInterval: 1.0,
  respawnInvincibleSec: 5.0,
  respawnDelaySec: 5.0,
  regenInterval: 3.0,
  regenAmount: 25,
  impulse: 120,
  hitFlashSec: 0.18,
  screenHitFlashSec: 0.22,
  zombieSlashAnimSec: 0.26,
};

const physics = {
  impulseUnitVelocity: 40,
};

const zombieDeath = {
  fallSec: 0.68,
  fadeSec: 2.0,
};

const explosionConfig = {
  unitSize: 32,
  radiusUnits: 4,
  mineRadiusUnits: 8,
  zombieDamage: 100,
  playerDamage: 80,
  impulseUnits: 50,
  maxPlayerImpulse: 640,
  flashSec: 0.28,
};

const weaponDefs = {
  pistol: {
    slot: 1,
    id: "pistol",
    name: "Pistol",
    damage: 36,
    fireRate: 3.0,
    range: Math.round((world.height * 2) / 3),
    spreadDeg: 0,
    bulletSpeed: 1000,
    impulseUnits: 50,
    magSize: 9999,
    bulletLength: 6,
    bounceCount: 0,
    pelletCount: 1,
    color: "#b8860b",
  },
  uzi: {
    slot: 2,
    id: "uzi",
    name: "UZI",
    damage: 8.333333333333334,
    fireRate: 3000,
    range: 800,
    spreadDeg: 5,
    bulletSpeed: 2000,
    impulseUnits: 15,
    magSize: 500,
    bulletLength: 4,
    bounceCount: 0,
    pelletCount: 1,
    color: "#b8860b",
  },
  shotgun: {
    slot: 3,
    id: "shotgun",
    name: "Shotgun",
    damage: 75,
    fireRate: 2,
    range: 400,
    spreadDeg: 20,
    bulletSpeed: 700,
    impulseUnits: 80,
    magSize: 200,
    bulletLength: 5,
    bounceCount: 0,
    pelletCount: 4,
    color: "#b8860b",
  },
  gatling: {
    slot: 4,
    id: "gatling",
    name: "Gatling",
    damage: 20,
    fireRate: 2000,
    range: 1000,
    spreadDeg: 10,
    bulletSpeed: 1500,
    impulseUnits: 30,
    magSize: 1000,
    bulletLength: 4,
    bounceCount: 0,
    pelletCount: 1,
    color: "#b8860b",
  },
  grenade: {
    slot: 5,
    id: "grenade",
    name: "Grenade",
    damage: 0,
    fireRate: 1.6,
    range: 32 * 15,
    spreadDeg: 0,
    bulletSpeed: 560,
    impulseUnits: 0,
    magSize: 50,
    bulletLength: 0,
    bounceCount: 0,
    pelletCount: 1,
    color: "#222222",
  },
  barrel: {
    slot: 6,
    id: "barrel",
    name: "Oil Barrel",
    damage: 0,
    fireRate: 2.0,
    range: 32 * 1.2,
    spreadDeg: 0,
    bulletSpeed: 0,
    impulseUnits: 0,
    magSize: 40,
    bulletLength: 0,
    bounceCount: 0,
    pelletCount: 1,
    color: "#8b2020",
  },
  mine: {
    slot: 7,
    id: "mine",
    name: "Mine",
    damage: 0,
    fireRate: 2.2,
    range: 32 * 1.0,
    spreadDeg: 0,
    bulletSpeed: 0,
    impulseUnits: 0,
    magSize: 60,
    bulletLength: 0,
    bounceCount: 0,
    pelletCount: 1,
    color: "#3a3a3a",
  },
  rocket: {
    slot: 8,
    id: "rocket",
    name: "Rocket",
    damage: 0,
    fireRate: 3.0,
    range: Math.round((world.height * 2) / 3),
    spreadDeg: 0,
    bulletSpeed: 1000,
    impulseUnits: 50,
    magSize: 30,
    bulletLength: Math.round(6 * 1.75),
    bounceCount: 0,
    pelletCount: 1,
    color: "#f0d24a",
  },
  wall: {
    slot: 9,
    id: "wall",
    name: "Wall",
    damage: 0,
    fireRate: 2.0,
    range: 32 * 1.2,
    spreadDeg: 0,
    bulletSpeed: 0,
    impulseUnits: 0,
    magSize: 50,
    bulletLength: 0,
    bounceCount: 0,
    pelletCount: 1,
    color: "#d8dde2",
  },
};

const player = {
  x: 280,
  y: 260,
  r: 16,
  speed: 240,
  color: "#1f5f85",
  headColor: "#f0d2b4",
  facingX: 1,
  facingY: 0,
  facingCandidateX: 1,
  facingCandidateY: 0,
  facingCandidateSec: 0,
  aimX: 1,
  aimY: 0,
  hp: combat.maxHp,
  dead: false,
  respawnTimer: 0,
  invincibleSec: 0,
  hitFlashSec: 0,
  controlVX: 0,
  controlVY: 0,
  impulseVX: 0,
  impulseVY: 0,
  regenTimer: 0,
  weaponSlot: 1,
  triggerDown: false,
  fireCooldownSec: 0,
  ammo: {
    pistol: weaponDefs.pistol.magSize,
    uzi: weaponDefs.uzi.magSize,
    shotgun: weaponDefs.shotgun.magSize,
    gatling: weaponDefs.gatling.magSize,
    grenade: weaponDefs.grenade.magSize,
    barrel: weaponDefs.barrel.magSize,
    mine: weaponDefs.mine.magSize,
    rocket: weaponDefs.rocket.magSize,
    wall: weaponDefs.wall.magSize,
  },
};

const zombieConfig = {
  speed: player.speed / 5,
};

const devilConfig = {
  speed: player.speed / 3,
  hp: 250,
  fireIntervalSec: 2.0,
  fireRange: Math.round(weaponDefs.pistol.range / 3),
  fireDamage: 30,
  fireImpulseUnits: weaponDefs.pistol.impulseUnits * 0.25,
  fireballRadius: 9,
  fireballSpeed: 260,
};

const reaperConfig = {
  speed: zombieConfig.speed * 0.8,
  hp: 250,
  senseRadius: player.r * 2 * 10,
  attackRadius: player.r * 2 * (5 * 4 / 3),
  attackIntervalSec: 2.0,
  spinDurationSec: 0.5,
  spinVfxFadeSec: 0.35,
  spinDamage: 80,
};

const zombies = [];

const spawner = {
  waveSize: 100,
  devilPerWave: 5,
  reaperPerWave: 5,
  respawnDelaySec: 1.0,
  nextWaveAt: 0,
  wave: 0,
  pendingCount: 0,
  spawnIntervalSec: 0.08,
  nextSpawnAt: 0,
};

function createZombie(x, y) {
  return {
    x,
    y,
    r: 14,
    hp: 100,
    maxHp: 100,
    speed: zombieConfig.speed,
    isBoss: false,
    bossType: null,
    castAnimSec: 0,
    nextFireTs: 0,
    specialTimer: 0,
    spinningSec: 0,
    spinVfxSec: 0,
    spinHitDone: false,
    impulseVX: 0,
    impulseVY: 0,
    moveVX: 0,
    moveVY: 0,
    faceX: 0,
    faceY: 1,
    attackAnimSec: 0,
    slashSide: Math.random() < 0.5 ? -1 : 1,
    stuckSec: 0,
    wanderSec: 0,
    wanderVX: 0,
    wanderVY: 0,
    wanderAngle: Math.random() * Math.PI * 2,
    axisHoldSec: 0,
    axisPreferX: Math.random() < 0.5,
    laneOffset: (Math.random() - 0.5) * 28,
    commitDirX: Math.random() < 0.5 ? -1 : 1,
    commitDirY: 0,
    bossSteerX: 0,
    bossSteerY: 1,
    wallAttackCd: 0,
    reaperPlayerInSense: false,
    lastAttackTs: -999,
    dead: false,
    deathTimer: 0,
    deathTotal: zombieDeath.fallSec + zombieDeath.fadeSec,
    deathDirX: 0,
    deathDirY: 1,
  };
}

function createDevil(x, y) {
  const z = createZombie(x, y);
  z.isBoss = true;
  z.bossType = "devil";
  z.r = 18;
  z.hp = devilConfig.hp;
  z.maxHp = devilConfig.hp;
  z.speed = devilConfig.speed;
  z.nextFireTs = 0;
  return z;
}

function createReaper(x, y) {
  const z = createZombie(x, y);
  z.isBoss = true;
  z.bossType = "reaper";
  z.r = 18;
  z.hp = reaperConfig.hp;
  z.maxHp = reaperConfig.hp;
  z.speed = reaperConfig.speed;
  z.specialTimer = 0;
  z.spinningSec = 0;
  z.spinVfxSec = 0;
  z.spinHitDone = false;
  return z;
}

function getDoorRects() {
  const t = 40;
  const span = player.r * 10;
  const topX = world.width * 0.5 - span * 0.5;
  const leftY = world.height * 0.5 - span * 0.5;
  return {
    top: { side: "top", x: topX, y: 0, w: span, h: t },
    bottom: { side: "bottom", x: topX, y: world.height - t, w: span, h: t },
    left: { side: "left", x: 0, y: leftY, w: t, h: span },
    right: { side: "right", x: world.width - t, y: leftY, w: t, h: span },
  };
}

function spawnZombieFromDoor(doorKey, bossType = null) {
  const doors = getDoorRects();
  const d = doors[doorKey] || doors.top;

  const z = bossType === "devil" ? createDevil(0, 0) : bossType === "reaper" ? createReaper(0, 0) : createZombie(0, 0);
  const margin = z.r + 4;

  if (d.side === "top") {
    const xMin = d.x + margin;
    const xMax = d.x + d.w - margin;
    z.x = xMin + Math.random() * Math.max(1, xMax - xMin);
    z.y = -90;
    z.faceX = 0;
    z.faceY = 1;
  } else if (d.side === "bottom") {
    const xMin = d.x + margin;
    const xMax = d.x + d.w - margin;
    z.x = xMin + Math.random() * Math.max(1, xMax - xMin);
    z.y = world.height + 90;
    z.faceX = 0;
    z.faceY = -1;
  } else if (d.side === "left") {
    const yMin = d.y + margin;
    const yMax = d.y + d.h - margin;
    z.x = -90;
    z.y = yMin + Math.random() * Math.max(1, yMax - yMin);
    z.faceX = 1;
    z.faceY = 0;
  } else {
    const yMin = d.y + margin;
    const yMax = d.y + d.h - margin;
    z.x = world.width + 90;
    z.y = yMin + Math.random() * Math.max(1, yMax - yMin);
    z.faceX = -1;
    z.faceY = 0;
  }

  z.entering = true;
  z.enterSide = d.side;
  return z;
}

function spawnWave(nowSec) {
  // Queue zombies and release them one by one from doors to prevent congestion.
  spawner.pendingCount = spawner.waveSize;
  spawner.nextSpawnAt = nowSec;
  spawner.wave += 1;
  spawner.nextWaveAt = nowSec + spawner.respawnDelaySec;
}

function updateSpawner(nowSec) {
  while (spawner.pendingCount > 0 && nowSec >= spawner.nextSpawnAt) {
    const idx = spawner.waveSize - spawner.pendingCount;
    const bossSlots = spawner.devilPerWave + spawner.reaperPerWave;
    const bossStart = spawner.waveSize - bossSlots;
    let bossType = null;
    if (idx >= bossStart) {
      const b = idx - bossStart;
      bossType = b < spawner.reaperPerWave ? "reaper" : "devil";
    }
    const doorOrder = ["top", "bottom", "left", "right"];
    zombies.push(spawnZombieFromDoor(doorOrder[idx % 4], bossType));
    spawner.pendingCount -= 1;
    spawner.nextSpawnAt += spawner.spawnIntervalSec;
  }
}

const bullets = [];
const grenades = [];
const barrels = [];
const barricades = [];
const mines = [];
const explosions = [];
const bloodMarks = [];
const bloodLayer = {
  canvas: null,
  ctx: null,
  width: 0,
  height: 0,
  markCount: 0,
};

const walls = [
  // Four-door perimeter.
  { x: 0, y: 0, w: world.width * 0.5 - player.r * 5, h: 40 },
  { x: world.width * 0.5 + player.r * 5, y: 0, w: world.width * 0.5 - player.r * 5, h: 40 },
  { x: 0, y: world.height - 40, w: world.width * 0.5 - player.r * 5, h: 40 },
  { x: world.width * 0.5 + player.r * 5, y: world.height - 40, w: world.width * 0.5 - player.r * 5, h: 40 },
  { x: 0, y: 0, w: 40, h: world.height * 0.5 - player.r * 5 },
  { x: 0, y: world.height * 0.5 + player.r * 5, w: 40, h: world.height * 0.5 - player.r * 5 },
  { x: world.width - 40, y: 0, w: 40, h: world.height * 0.5 - player.r * 5 },
  { x: world.width - 40, y: world.height * 0.5 + player.r * 5, w: 40, h: world.height * 0.5 - player.r * 5 },

  // Center "hui" only: two nested squares.
  // Door width = 3 player models = 6r.
  // Outer square: top/bottom center doors.
  { x: world.width * 0.5 - 500, y: world.height * 0.5 - 500, w: 452, h: 42 },
  { x: world.width * 0.5 + 48, y: world.height * 0.5 - 500, w: 452, h: 42 },
  { x: world.width * 0.5 - 500, y: world.height * 0.5 + 458, w: 452, h: 42 },
  { x: world.width * 0.5 + 48, y: world.height * 0.5 + 458, w: 452, h: 42 },
  { x: world.width * 0.5 - 500, y: world.height * 0.5 - 500, w: 42, h: 1000 },
  { x: world.width * 0.5 + 458, y: world.height * 0.5 - 500, w: 42, h: 1000 },

  // Inner square: left/right center doors.
  { x: world.width * 0.5 - 250, y: world.height * 0.5 - 250, w: 500, h: 42 },
  { x: world.width * 0.5 - 250, y: world.height * 0.5 + 208, w: 500, h: 42 },
  { x: world.width * 0.5 - 250, y: world.height * 0.5 - 250, w: 42, h: 202 },
  { x: world.width * 0.5 - 250, y: world.height * 0.5 + 48, w: 42, h: 202 },
  { x: world.width * 0.5 + 208, y: world.height * 0.5 - 250, w: 42, h: 202 },
  { x: world.width * 0.5 + 208, y: world.height * 0.5 + 48, w: 42, h: 202 },
];

const camera = {
  x: 0,
  y: 0,
};

const viewport = {
  scale: 0.62,
  width: 0,
  height: 0,
};

const view = {
  tilt: 0.76,
  wallHeight: 26,
};

const terrainPatches = [
  {
    x: 620,
    y: 330,
    a: 0.15,
    points: [
      [-220, -40],
      [-170, -110],
      [-60, -140],
      [70, -125],
      [170, -70],
      [220, 20],
      [180, 90],
      [60, 130],
      [-90, 120],
      [-190, 60],
    ],
  },
  {
    x: 1490,
    y: 620,
    a: 0.13,
    points: [
      [-240, -30],
      [-170, -95],
      [-40, -120],
      [120, -100],
      [220, -20],
      [250, 55],
      [170, 120],
      [20, 150],
      [-130, 120],
      [-220, 50],
    ],
  },
  {
    x: 1180,
    y: 1510,
    a: 0.14,
    points: [
      [-270, -20],
      [-210, -95],
      [-80, -130],
      [80, -120],
      [230, -60],
      [280, 30],
      [210, 120],
      [70, 170],
      [-110, 155],
      [-240, 85],
    ],
  },
];

const ai = {
  cellSize: 40,
  clearance: 14,
  refreshInterval: 0.2,
  lastRefreshTs: -999,
  cols: 0,
  rows: 0,
  blocked: null,
  dist: null,
};

const keys = new Set();
let lastTs = performance.now();
let gameTimeSec = 0;
let screenHitFlashSec = 0;

window.addEventListener("keydown", (e) => {
  const code = e.code.toLowerCase();
  if (["keyw", "keya", "keys", "keyd"].includes(code)) {
    e.preventDefault();
    keys.add(code);
    return;
  }

  if (code === "digit1") { player.weaponSlot = 1; return; }
  if (code === "digit2") { player.weaponSlot = 2; return; }
  if (code === "digit3") { player.weaponSlot = 3; return; }
  if (code === "digit4") { player.weaponSlot = 4; return; }
  if (code === "digit5") { player.weaponSlot = 5; return; }
  if (code === "digit6") { player.weaponSlot = 6; return; }
  if (code === "digit7") { player.weaponSlot = 7; return; }
  if (code === "digit8") { player.weaponSlot = 8; return; }
  if (code === "digit9") { player.weaponSlot = 9; return; }

  if (code === "space") {
    e.preventDefault();
    player.triggerDown = true;
  }
});

window.addEventListener("keyup", (e) => {
  const code = e.code.toLowerCase();
  keys.delete(code);
  if (code === "space") player.triggerDown = false;
});


function resize() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const targetW = Math.floor(window.innerWidth * viewport.scale);
  const targetH = Math.floor(window.innerHeight * viewport.scale);

  // Never let viewport exceed projected map size, avoids seeing outside walls.
  viewport.width = Math.min(targetW, world.width);
  viewport.height = Math.min(targetH, Math.floor(world.height * view.tilt));

  canvas.width = Math.floor(viewport.width * dpr);
  canvas.height = Math.floor(viewport.height * dpr);
  canvas.style.width = `${viewport.width}px`;
  canvas.style.height = `${viewport.height}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resize);
resize();

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function circleRectCollide(cx, cy, r, rect) {
  const nx = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
  const ny = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
  const dx = cx - nx;
  const dy = cy - ny;
  return dx * dx + dy * dy < r * r;
}

function pointInRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

function explosionRadius(units = explosionConfig.radiusUnits) {
  return explosionConfig.unitSize * units;
}

function barrelRect(b) {
  return { x: b.x - b.r, y: b.y - b.r, w: b.r * 2, h: b.r * 2, __barrel: b };
}

function barricadeRect(w) {
  return { x: w.x - w.r, y: w.y - w.r, w: w.r * 2, h: w.r * 2, __barricade: w };
}

function damageBarrel(b, dmg) {
  if (!b || b.dead) return;
  b.hp -= Math.max(1, dmg || 0);
  if (b.hp <= 0) {
    b.dead = true;
    explodeAt(b.x, b.y, b);
  }
}

function damageBarricade(w, dmg) {
  if (!w || w.dead) return;
  w.hp -= Math.max(1, dmg || 0);
  if (w.hp <= 0) {
    w.dead = true;
  }
}

function getSolidObstacles() {
  const solids = walls.slice();
  for (const b of barrels) {
    if (!b.dead) solids.push(barrelRect(b));
  }
  for (const w of barricades) {
    if (!w.dead) solids.push(barricadeRect(w));
  }
  return solids;
}

function placeBarrelAt(x, y) {
  const r = player.r;
  const b = { x, y, r, hp: 50, maxHp: 50, dead: false, kind: "barrel" };
  const rect = barrelRect(b);
  for (const w of walls) {
    if (circleRectCollide(x, y, r, w)) return false;
  }
  for (const ob of barrels) {
    if (ob.dead) continue;
    if (Math.hypot(ob.x - x, ob.y - y) < ob.r + r + 4) return false;
  }
  for (const bw of barricades) {
    if (bw.dead) continue;
    if (Math.hypot(bw.x - x, bw.y - y) < bw.r + r + 4) return false;
  }
  if (x - r < 44 || y - r < 44 || x + r > world.width - 44 || y + r > world.height - 44) return false;
  if (circleRectCollide(player.x, player.y, player.r, rect)) return false;
  barrels.push(b);
  return true;
}

function placeBarricadeAt(x, y) {
  const r = player.r;
  const w = { x, y, r, hp: 300, maxHp: 300, dead: false, kind: "wall" };
  const rect = barricadeRect(w);

  for (const ww of walls) {
    if (circleRectCollide(x, y, r, ww)) return false;
  }
  for (const b of barrels) {
    if (b.dead) continue;
    if (Math.hypot(b.x - x, b.y - y) < b.r + r + 4) return false;
  }
  for (const bw of barricades) {
    if (bw.dead) continue;
    if (Math.hypot(bw.x - x, bw.y - y) < bw.r + r + 4) return false;
  }
  if (x - r < 44 || y - r < 44 || x + r > world.width - 44 || y + r > world.height - 44) return false;
  if (circleRectCollide(player.x, player.y, player.r, rect)) return false;

  barricades.push(w);
  return true;
}

function placeMineAt(x, y) {
  const r = Math.max(8, Math.floor(player.r * 0.62));
  for (const w of walls) {
    if (circleRectCollide(x, y, r, w)) return false;
  }
  for (const b of barrels) {
    if (b.dead) continue;
    if (Math.hypot(b.x - x, b.y - y) < b.r + r + 2) return false;
  }
  for (const bw of barricades) {
    if (bw.dead) continue;
    if (Math.hypot(bw.x - x, bw.y - y) < bw.r + r + 2) return false;
  }
  for (const m of mines) {
    if (m.dead) continue;
    if (Math.hypot(m.x - x, m.y - y) < m.r * 2) return false;
  }
  mines.push({ x, y, r, dead: false, kind: "mine", armDelay: 5.0 });
  return true;
}

function applyExplosionImpulseToPlayer(cx, cy, impulseUnits) {
  const dx = player.x - cx;
  const dy = player.y - cy;
  const n = Math.hypot(dx, dy) || 1;
  const nx = dx / n;
  const ny = dy / n;
  const impulseVel = physics.impulseUnitVelocity * impulseUnits;
  player.impulseVX += nx * impulseVel;
  player.impulseVY += ny * impulseVel;

  // Clamp impulse velocity to avoid rare extreme launches that look like teleport.
  const im = Math.hypot(player.impulseVX, player.impulseVY);
  const maxI = explosionConfig.maxPlayerImpulse;
  if (im > maxI) {
    const k = maxI / im;
    player.impulseVX *= k;
    player.impulseVY *= k;
  }
}

function explodeAt(x, y, source = null, radiusUnits = explosionConfig.radiusUnits, ignorePlayer = false) {
  const radius = explosionRadius(radiusUnits);
  explosions.push({ x, y, r: radius, t: explosionConfig.flashSec });

  const sourceKind = source && source.kind ? source.kind : null;
  const mineSource = sourceKind === "mine";
  const skipPlayer = ignorePlayer || mineSource;

  const pd = Math.hypot(player.x - x, player.y - y);
  if (!player.dead && !skipPlayer && pd <= radius + player.r) {
    damagePlayer(explosionConfig.playerDamage);
    applyExplosionImpulseToPlayer(x, y, explosionConfig.impulseUnits);
  }

  for (const z of zombies) {
    if (z.dead) continue;
    const d = Math.hypot(z.x - x, z.y - y);
    if (d > radius + z.r) continue;
    z.hp -= explosionConfig.zombieDamage;
    const nx = (z.x - x) / (d || 1);
    const ny = (z.y - y) / (d || 1);
    knockbackZombieWithBlood(z, nx, ny, explosionConfig.impulseUnits);
    if (z.bossType === "devil") {
      z.nextFireTs = gameTimeSec + devilConfig.fireIntervalSec;
    }
    if (z.hp <= 0) {
      z.dead = true;
      z.deathTimer = z.deathTotal;
      z.deathDirX = nx;
      z.deathDirY = ny;
      z.impulseVX = 0;
      z.impulseVY = 0;
      z.moveVX = 0;
      z.moveVY = 0;
    }
  }

  for (const b of barrels) {
    if (b.dead) continue;
    if (source && source === b) continue;
    const d = Math.hypot(b.x - x, b.y - y);
    if (d <= radius + b.r) {
      b.hp -= explosionConfig.zombieDamage;
      if (b.hp <= 0) {
        b.dead = true;
        explodeAt(b.x, b.y, b, explosionConfig.radiusUnits, skipPlayer);
      }
    }
  }

  for (const m of mines) {
    if (m.dead) continue;
    if (source && source === m) continue;
    const d = Math.hypot(m.x - x, m.y - y);
    if (d <= radius + m.r) {
      m.dead = true;
      explodeAt(m.x, m.y, m, explosionConfig.radiusUnits, true);
    }
  }
}

function throwGrenade(x, y, dirX, dirY, range) {
  const n = Math.hypot(dirX, dirY) || 1;
  grenades.push({
    x,
    y,
    vx: (dirX / n) * 620,
    vy: (dirY / n) * 620,
    remainingRange: range,
    bouncesLeft: 2,
    bounceTimer: 0.22,
    r: 3,
    dead: false,
  });
}

function updateGrenadesAndMines(dt) {
  for (const g of grenades) {
    if (g.dead) continue;

    const speed = Math.hypot(g.vx, g.vy);
    const stepDist = Math.min(speed * dt, g.remainingRange);
    if (stepDist > 0) {
      const ux = g.vx / (speed || 1);
      const uy = g.vy / (speed || 1);
      g.x += ux * stepDist;
      g.y += uy * stepDist;
      g.remainingRange -= stepDist;
    }

    g.bounceTimer -= dt;
    if (g.bounceTimer <= 0 && g.bouncesLeft > 0) {
      g.bouncesLeft -= 1;
      g.bounceTimer = 0.22;
      g.vx *= 0.82;
      g.vy *= 0.82;
    }

    if (g.remainingRange <= 0 || Math.hypot(g.vx, g.vy) < 50) {
      g.dead = true;
      explodeAt(g.x, g.y, g);
    }
  }

  for (let i = grenades.length - 1; i >= 0; i--) {
    if (grenades[i].dead) grenades.splice(i, 1);
  }

  for (const m of mines) {
    if (m.dead) continue;

    if ((m.armDelay || 0) > 0) {
      m.armDelay = Math.max(0, m.armDelay - dt);
      continue;
    }

    const triggerR = explosionRadius(explosionConfig.mineRadiusUnits * 0.5);
    let trig = false;
    for (const z of zombies) {
      if (z.dead) continue;
      if (Math.hypot(z.x - m.x, z.y - m.y) <= triggerR + z.r) {
        trig = true;
        break;
      }
    }
    if (trig) {
      m.dead = true;
      explodeAt(m.x, m.y, m, explosionConfig.radiusUnits, true);
    }
  }

  for (let i = mines.length - 1; i >= 0; i--) {
    if (mines[i].dead) mines.splice(i, 1);
  }

  for (let i = explosions.length - 1; i >= 0; i--) {
    explosions[i].t -= dt;
    if (explosions[i].t <= 0) explosions.splice(i, 1);
  }
}

function resolveCircleMove(x, y, r, vx, vy, dt) {
  const dx = vx * dt;
  const dy = vy * dt;

  let resolvedX = x + dx;
  for (const w of getSolidObstacles()) {
    if (circleRectCollide(resolvedX, y, r, w)) {
      resolvedX = x;
      break;
    }
  }

  let resolvedY = y + dy;
  for (const w of getSolidObstacles()) {
    if (circleRectCollide(resolvedX, resolvedY, r, w)) {
      resolvedY = y;
      break;
    }
  }

  return { x: resolvedX, y: resolvedY };
}

function decayImpulse(v, dt) {
  return v * Math.exp(-6 * dt);
}

function isSpawnValid(x, y, r) {
  if (x - r < 45 || y - r < 45 || x + r > world.width - 45 || y + r > world.height - 45) {
    return false;
  }
  for (const w of walls) {
    if (circleRectCollide(x, y, r, w)) return false;
  }
  return true;
}

function randomSpawnPoint(r, avoidX = null, avoidY = null, minDistance = 0) {
  for (let i = 0; i < 400; i++) {
    const x = 80 + Math.random() * (world.width - 160);
    const y = 80 + Math.random() * (world.height - 160);
    if (!isSpawnValid(x, y, r)) continue;
    if (avoidX !== null && avoidY !== null) {
      const d = Math.hypot(x - avoidX, y - avoidY);
      if (d < minDistance) continue;
    }
    return { x, y };
  }
  return { x: 200, y: 200 };
}

// Reserved for co-op mode: respawn near teammate inside a safe radius ring.
function randomSpawnNearPoint(targetX, targetY, minR, maxR, r) {
  for (let i = 0; i < 120; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = minR + Math.random() * (maxR - minR);
    const x = targetX + Math.cos(angle) * dist;
    const y = targetY + Math.sin(angle) * dist;
    if (isSpawnValid(x, y, r)) return { x, y };
  }
  return randomSpawnPoint(r);
}

function startRespawnCountdown() {
  if (player.dead) return;
  player.dead = true;
  player.respawnTimer = combat.respawnDelaySec;
  player.hp = 0;
  player.triggerDown = false;
  player.hitFlashSec = 0;
  player.impulseVX = 0;
  player.impulseVY = 0;
  player.fireCooldownSec = 0;
  screenHitFlashSec = 0;
}

function respawnPlayer() {
  const deathX = player.x;
  const deathY = player.y;
  const p = randomSpawnPoint(player.r, deathX, deathY, 520);
  player.x = p.x;
  player.y = p.y;
  player.hp = combat.maxHp;
  player.dead = false;
  player.respawnTimer = 0;
  player.invincibleSec = combat.respawnInvincibleSec;
  player.hitFlashSec = 0;
  player.impulseVX = 0;
  player.impulseVY = 0;
  player.fireCooldownSec = 0;
  player.ammo.pistol = weaponDefs.pistol.magSize;
  player.ammo.uzi = weaponDefs.uzi.magSize;
  player.ammo.shotgun = weaponDefs.shotgun.magSize;
  player.ammo.gatling = weaponDefs.gatling.magSize;
  player.ammo.grenade = weaponDefs.grenade.magSize;
  player.ammo.barrel = weaponDefs.barrel.magSize;
  player.ammo.mine = weaponDefs.mine.magSize;
  player.ammo.rocket = weaponDefs.rocket.magSize;
  player.ammo.wall = weaponDefs.wall.magSize;
  screenHitFlashSec = 0;
}

function damagePlayer(amount) {
  if (player.dead || player.invincibleSec > 0) return;
  player.hp -= amount;
  player.hitFlashSec = combat.hitFlashSec;
  screenHitFlashSec = combat.screenHitFlashSec;
  player.regenTimer = 0;
  if (player.hp <= 0) {
    startRespawnCountdown();
  }
}

function applyBulletImpactToPlayer(b, nx, ny) {
  const impulseVel = physics.impulseUnitVelocity * b.impulseUnits;
  player.impulseVX += nx * impulseVel;
  player.impulseVY += ny * impulseVel;
}

function addBloodTrail(x0, y0, x1, y1, width, marks = 10) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy);
  if (len < 0.001) return;

  const ux = dx / len;
  const uy = dy / len;
  const step = Math.max(1, len / marks);
  const segLen = step + 1.6;

  for (let t = 0; t < len; t += step) {
    const x = x0 + ux * t;
    const y = y0 + uy * t;

    // Edge splatter points around each segment for a liquid-like look.
    const splats = [];
    const splatCount = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < splatCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = width * (0.30 + Math.random() * 0.45);
      splats.push({
        ox: Math.cos(a) * d,
        oy: Math.sin(a) * d,
        r: 0.9 + Math.random() * 2.2,
        alpha: 0.16 + Math.random() * 0.22,
      });
    }

    const streaks = [];
    const streakCount = 2 + Math.floor(Math.random() * 2);
    for (let j = 0; j < streakCount; j++) {
      streaks.push({
        off: (Math.random() - 0.5) * width * 0.42,
        scale: 0.32 + Math.random() * 0.36,
        alpha: 0.20 + Math.random() * 0.20,
      });
    }

    const bites = [];
    const biteCount = 1 + Math.floor(Math.random() * 3);
    for (let j = 0; j < biteCount; j++) {
      bites.push({
        x: Math.random() * segLen,
        y: (Math.random() < 0.5 ? -1 : 1) * width * (0.28 + Math.random() * 0.22),
        r: 1.2 + Math.random() * 2.2,
        a: 0.30 + Math.random() * 0.25,
      });
    }

    const mark = {
      x,
      y,
      w: segLen,
      h: width,
      angle: Math.atan2(dy, dx),
      flowAlpha: 0.64 + Math.random() * 0.16,
      streaks,
      bites,
      splats,
    };

    drawBloodMarkToLayer(mark);
  }
}

function knockbackZombieWithBlood(z, dirX, dirY, distance) {
  const n = Math.hypot(dirX, dirY) || 1;
  const nx = dirX / n;
  const ny = dirY / n;

  const startX = z.x;
  const startY = z.y;
  let moved = 0;

  while (moved < distance) {
    const step = Math.min(1, distance - moved);
    const tx = z.x + nx * step;
    const ty = z.y + ny * step;
    if (circleTouchesAnyWall(tx, ty, z.r)) break;
    z.x = clamp(tx, 44, world.width - 44);
    z.y = clamp(ty, 44, world.height - 44);
    moved += step;
  }

  if (moved > 0.01) {
    addBloodTrail(startX, startY, z.x, z.y, z.r * 3, 8);
  }
}

function circleTouchesAnyWall(x, y, r) {
  for (const w of getSolidObstacles()) {
    if (circleRectCollide(x, y, r, w)) return true;
  }
  return false;
}

function initBloodLayer() {
  bloodLayer.canvas = document.createElement("canvas");
  bloodLayer.width = world.width;
  bloodLayer.height = Math.ceil(world.height * view.tilt);
  bloodLayer.canvas.width = bloodLayer.width;
  bloodLayer.canvas.height = bloodLayer.height;
  bloodLayer.ctx = bloodLayer.canvas.getContext("2d");
}

function drawBloodMarkToLayer(m) {
  if (!bloodLayer.ctx) return;
  const g = bloodLayer.ctx;

  g.save();
  g.translate(m.x, m.y * view.tilt);
  g.rotate(m.angle);

  const hh = m.h * view.tilt;
  const hy = -hh * 0.5;
  g.fillStyle = `rgba(214, 24, 24, ${(m.flowAlpha || 0.72).toFixed(3)})`;
  g.fillRect(0, hy, m.w, hh);

  if (m.streaks) {
    for (const st of m.streaks) {
      g.fillStyle = `rgba(196, 20, 20, ${st.alpha.toFixed(3)})`;
      const sh = hh * st.scale;
      g.fillRect(0, st.off * view.tilt - sh * 0.5, m.w, sh);
    }
  }

  g.fillStyle = "rgba(205, 22, 22, 0.58)";
  g.beginPath();
  g.ellipse(0, 0, hh * 0.34, hh * 0.46, 0, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.ellipse(m.w, 0, hh * 0.30, hh * 0.42, 0, 0, Math.PI * 2);
  g.fill();

  if (m.bites) {
    for (const b of m.bites) {
      g.fillStyle = `rgba(242, 240, 234, ${b.a.toFixed(3)})`;
      g.beginPath();
      g.ellipse(b.x, b.y * view.tilt, b.r, b.r * 0.72, 0, 0, Math.PI * 2);
      g.fill();
    }
  }

  if (m.splats) {
    for (const d of m.splats) {
      g.fillStyle = `rgba(220, 28, 28, ${d.alpha.toFixed(3)})`;
      g.beginPath();
      g.ellipse(d.ox, d.oy * view.tilt, d.r, d.r * 0.72, 0, 0, Math.PI * 2);
      g.fill();
    }
  }

  g.restore();
  bloodLayer.markCount += 1;
}
function movePlayer(dt) {
  if (player.dead) {
    player.controlVX = 0;
    player.controlVY = 0;
    player.impulseVX = 0;
    player.impulseVY = 0;
    return;
  }

  let dx = 0;
  let dy = 0;

  if (keys.has("keyw")) dy -= 1;
  if (keys.has("keys")) dy += 1;
  if (keys.has("keya")) dx -= 1;
  if (keys.has("keyd")) dx += 1;

  if (dx !== 0 || dy !== 0) {
    const len = Math.hypot(dx, dy);
    dx /= len;
    dy /= len;

    const sameCandidate =
      Math.hypot(dx - player.facingCandidateX, dy - player.facingCandidateY) < 0.08;

    if (sameCandidate) {
      player.facingCandidateSec += dt;
    } else {
      player.facingCandidateX = dx;
      player.facingCandidateY = dy;
      player.facingCandidateSec = 0;
    }

    // Small lock delay avoids key-up order jitter turning diagonal rest into cardinal rest.
    if (player.facingCandidateSec >= 0.075) {
      player.facingX = player.facingCandidateX;
      player.facingY = player.facingCandidateY;
    }
  }

  player.controlVX = dx * player.speed;
  player.controlVY = dy * player.speed;

  const vx = player.controlVX + player.impulseVX;
  const vy = player.controlVY + player.impulseVY;

  const moved = resolveCircleMove(player.x, player.y, player.r, vx, vy, dt);
  player.x = moved.x;
  player.y = moved.y;

  player.impulseVX = decayImpulse(player.impulseVX, dt);
  player.impulseVY = decayImpulse(player.impulseVY, dt);
}


function initFlowField() {
  ai.cols = Math.ceil(world.width / ai.cellSize);
  ai.rows = Math.ceil(world.height / ai.cellSize);
  ai.blocked = new Uint8Array(ai.cols * ai.rows);
  ai.dist = new Int32Array(ai.cols * ai.rows);

  for (let cy = 0; cy < ai.rows; cy++) {
    for (let cx = 0; cx < ai.cols; cx++) {
      const centerX = cx * ai.cellSize + ai.cellSize * 0.5;
      const centerY = cy * ai.cellSize + ai.cellSize * 0.5;
      const idx = cy * ai.cols + cx;

      let blocked = false;
      for (const w of walls) {
        if (circleRectCollide(centerX, centerY, ai.clearance, w)) {
          blocked = true;
          break;
        }
      }
      ai.blocked[idx] = blocked ? 1 : 0;
    }
  }
}

function toCell(x, y) {
  const cx = clamp(Math.floor(x / ai.cellSize), 0, ai.cols - 1);
  const cy = clamp(Math.floor(y / ai.cellSize), 0, ai.rows - 1);
  return { cx, cy, idx: cy * ai.cols + cx };
}

function cellCenter(cx, cy) {
  return {
    x: cx * ai.cellSize + ai.cellSize * 0.5,
    y: cy * ai.cellSize + ai.cellSize * 0.5,
  };
}

function chooseZombieWanderDir(z) {
  for (let i = 0; i < 24; i++) {
    const ang = Math.random() * Math.PI * 2;
    const dirX = Math.cos(ang);
    const dirY = Math.sin(ang);
    const test = resolveCircleMove(z.x, z.y, z.r, dirX * zombieConfig.speed, dirY * zombieConfig.speed, 0.25);
    if (Math.hypot(test.x - z.x, test.y - z.y) > 1.2) {
      return { x: dirX, y: dirY };
    }
  }
  const m = Math.hypot(z.faceX, z.faceY);
  if (m > 0.01) {
    return { x: z.faceX / m, y: z.faceY / m };
  }
  return { x: 0, y: 1 };
}

function findNearestFreeCell(startCx, startCy) {
  const seen = new Uint8Array(ai.cols * ai.rows);
  const qx = [startCx];
  const qy = [startCy];
  seen[startCy * ai.cols + startCx] = 1;

  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  for (let head = 0; head < qx.length; head++) {
    const cx = qx[head];
    const cy = qy[head];
    const idx = cy * ai.cols + cx;
    if (!ai.blocked[idx]) return { cx, cy, idx };

    for (const d of dirs) {
      const nx = cx + d[0];
      const ny = cy + d[1];
      if (nx < 0 || ny < 0 || nx >= ai.cols || ny >= ai.rows) continue;
      const nidx = ny * ai.cols + nx;
      if (seen[nidx]) continue;
      seen[nidx] = 1;
      qx.push(nx);
      qy.push(ny);
    }
  }

  return null;
}

function refreshFlowField(nowSec) {
  if (nowSec - ai.lastRefreshTs < ai.refreshInterval) return;
  ai.lastRefreshTs = nowSec;

  const INF = 1 << 30;
  ai.dist.fill(INF);

  const pCellRaw = toCell(player.x, player.y);
  const pCell = ai.blocked[pCellRaw.idx] ? findNearestFreeCell(pCellRaw.cx, pCellRaw.cy) : pCellRaw;
  if (!pCell) return;

  const qx = [pCell.cx];
  const qy = [pCell.cy];
  ai.dist[pCell.idx] = 0;

  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  for (let head = 0; head < qx.length; head++) {
    const cx = qx[head];
    const cy = qy[head];
    const idx = cy * ai.cols + cx;
    const base = ai.dist[idx];

    for (const d of dirs) {
      const nx = cx + d[0];
      const ny = cy + d[1];
      if (nx < 0 || ny < 0 || nx >= ai.cols || ny >= ai.rows) continue;
      const nidx = ny * ai.cols + nx;
      if (ai.blocked[nidx]) continue;
      if (ai.dist[nidx] <= base + 1) continue;
      ai.dist[nidx] = base + 1;
      qx.push(nx);
      qy.push(ny);
    }
  }
}

function updateZombies(dt, nowSec) {
  refreshFlowField(nowSec);
  const INF = 1 << 30;

  if (!Number.isFinite(dt) || dt <= 0) return;

  for (const z of zombies) {
    if (z.dead) continue;
    const oldX = z.x;
    const oldY = z.y;

    let driveX = 0;
    let driveY = 0;

    if (z.entering) {
      const doors = getDoorRects();
      const side = z.enterSide || "top";
      const d = doors[side] || doors.top;

      if (side === "top" || side === "bottom") {
        const centerX = d.x + d.w * 0.5;
        const clampMinX = d.x + z.r + 2;
        const clampMaxX = d.x + d.w - z.r - 2;
        z.x = clamp(z.x, clampMinX, clampMaxX);

        driveX = clamp((centerX - z.x) / 70, -0.65, 0.65);
        driveY = side === "top" ? 1 : -1;

        if ((side === "top" && z.y >= 64) || (side === "bottom" && z.y <= world.height - 64)) {
          z.entering = false;
        }
      } else {
        const centerY = d.y + d.h * 0.5;
        const clampMinY = d.y + z.r + 2;
        const clampMaxY = d.y + d.h - z.r - 2;
        z.y = clamp(z.y, clampMinY, clampMaxY);

        driveX = side === "left" ? 1 : -1;
        driveY = clamp((centerY - z.y) / 70, -0.65, 0.65);

        if ((side === "left" && z.x >= 64) || (side === "right" && z.x <= world.width - 64)) {
          z.entering = false;
        }
      }
    } else if (z.wanderSec > 0) {
      driveX = Math.cos(z.wanderAngle);
      driveY = Math.sin(z.wanderAngle);
      z.wanderVX = driveX;
      z.wanderVY = driveY;
      z.wanderSec = Math.max(0, z.wanderSec - dt);
    } else {
      const zCell = toCell(z.x, z.y);
      let bestCx = zCell.cx;
      let bestCy = zCell.cy;
      let bestDist = ai.dist[zCell.idx];

      const nbrs = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ];

      for (const n of nbrs) {
        const nx = zCell.cx + n[0];
        const ny = zCell.cy + n[1];
        if (nx < 0 || ny < 0 || nx >= ai.cols || ny >= ai.rows) continue;
        const nidx = ny * ai.cols + nx;
        if (ai.blocked[nidx]) continue;

        const d = ai.dist[nidx];
        if (d < bestDist || (d === bestDist && Math.random() < 0.22)) {
          bestDist = d;
          bestCx = nx;
          bestCy = ny;
        }
      }

      let targetX = player.x;
      let targetY = player.y;
      if (bestDist < INF) {
        const c = cellCenter(bestCx, bestCy);
        targetX = c.x;
        targetY = c.y;
      }

      // Lateral offset spreads horde into multiple lanes instead of one line.
      const pdx = player.x - z.x;
      const pdy = player.y - z.y;
      const plen = Math.hypot(pdx, pdy) || 1;
      const px = -pdy / plen;
      const py = pdx / plen;
      targetX += px * (z.laneOffset || 0);
      targetY += py * (z.laneOffset || 0);

      const dx = targetX - z.x;
      const dy = targetY - z.y;

      // Manhattan-like steering with 1-2s direction lock for less jitter.
      if (!z.isBoss) {
        const ax = Math.abs(dx);
        const ay = Math.abs(dy);

        let desiredX = 0;
        let desiredY = 0;

        // Prefer one axis, but keep a small secondary component to avoid robotic motion.
        if (z.axisPreferX) {
          desiredX = Math.sign(dx);
          desiredY = ay > 60 ? Math.sign(dy) * 0.25 : 0;
        } else {
          desiredY = Math.sign(dy);
          desiredX = ax > 60 ? Math.sign(dx) * 0.25 : 0;
        }

        z.axisHoldSec = Math.max(0, (z.axisHoldSec || 0) - dt);

        // Re-pick direction only every 1-2s, or earlier if clearly stuck.
        if (z.axisHoldSec <= 0 || z.stuckSec > 0.95) {
          const preferMajor = Math.random() < 0.78;
          z.axisPreferX = preferMajor ? ax >= ay : Math.random() < 0.5;

          // Recompute desired after choosing axis preference.
          if (z.axisPreferX) {
            desiredX = Math.sign(dx);
            desiredY = ay > 60 ? Math.sign(dy) * 0.25 : 0;
          } else {
            desiredY = Math.sign(dy);
            desiredX = ax > 60 ? Math.sign(dx) * 0.25 : 0;
          }

          const dm = Math.hypot(desiredX, desiredY) || 1;
          z.commitDirX = desiredX / dm;
          z.commitDirY = desiredY / dm;
          z.axisHoldSec = 1.0 + Math.random() * 1.0;
        }

        driveX = z.commitDirX || 0;
        driveY = z.commitDirY || 0;

        // Close-range fallback keeps them from freezing when almost aligned.
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) {
          const len = Math.hypot(dx, dy);
          if (len > 0.001) {
            driveX = dx / len;
            driveY = dy / len;
          }
        }
      } else {
        const len = Math.hypot(dx, dy);
        if (len > 22) {
          const tx = dx / len;
          const ty = dy / len;

          // Boss steering smoothing removes micro-jitter while preserving tracking.
          const blend = 1 - Math.exp(-dt * 8.0);
          z.bossSteerX = (z.bossSteerX || 0) + (tx - (z.bossSteerX || 0)) * blend;
          z.bossSteerY = (z.bossSteerY || 1) + (ty - (z.bossSteerY || 1)) * blend;

          const sm = Math.hypot(z.bossSteerX, z.bossSteerY) || 1;
          driveX = z.bossSteerX / sm;
          driveY = z.bossSteerY / sm;
        } else {
          // Near target: keep current heading briefly instead of twitching.
          const sm = Math.hypot(z.bossSteerX || 0, z.bossSteerY || 0);
          if (sm > 0.001) {
            driveX = z.bossSteerX / sm;
            driveY = z.bossSteerY / sm;
          }
        }
      }
    }

    const zSpeed = z.speed || zombieConfig.speed;
    const vx = driveX * zSpeed + z.impulseVX;
    const vy = driveY * zSpeed + z.impulseVY;
    const moved = resolveCircleMove(z.x, z.y, z.r, vx, vy, dt);
    z.x = moved.x;
    z.y = moved.y;
    z.moveVX = vx;
    z.moveVY = vy;

    if (Math.hypot(vx, vy) > 2) {
      const vm = Math.hypot(vx, vy);
      z.faceX = vx / vm;
      z.faceY = vy / vm;
    }

    const moveDist = Math.hypot(z.x - oldX, z.y - oldY);
    if (moveDist < 0.8) {
      z.stuckSec += dt;
    } else {
      z.stuckSec = Math.max(0, z.stuckSec - dt * 1.8);
    }

    z.wallAttackCd = Math.max(0, (z.wallAttackCd || 0) - dt);
    if (!z.isBoss && z.wallAttackCd <= 0 && barricades.length > 0) {
      let targetWall = null;
      let bestD2 = 1e18;
      for (const bw of barricades) {
        if (bw.dead) continue;
        const dxw = bw.x - z.x;
        const dyw = bw.y - z.y;
        const d2 = dxw * dxw + dyw * dyw;
        const hitR = (z.r + bw.r + 8);
        if (d2 > hitR * hitR) continue;
        if (d2 < bestD2) {
          bestD2 = d2;
          targetWall = bw;
        }
      }

      if (targetWall) {
        const attackChance = z.stuckSec > 0.65 ? 1 : Math.min(1, dt * 1.6);
        if (Math.random() < attackChance) {
          z.attackAnimSec = combat.zombieSlashAnimSec;
          damageBarricade(targetWall, combat.attackDamage);
          z.wallAttackCd = combat.attackInterval;
        }
      }
    }

    if (z.stuckSec >= 5 && z.wanderSec <= 0) {
      z.wanderAngle = Math.random() * Math.PI * 2;
      z.wanderSec = 2.0;
      z.stuckSec = 0;
    }

    // While wandering, if still blocked, rotate direction to continue escaping.
    if (z.wanderSec > 0 && moveDist < 0.35) {
      z.wanderAngle += (Math.random() * 1.6 + 0.8) * (Math.random() < 0.5 ? -1 : 1);
    }

    if (z.bossType === "devil" && !z.entering && nowSec >= z.nextFireTs) {
      const dxp = player.x - z.x;
      const dyp = player.y - z.y;
      const dlen = Math.hypot(dxp, dyp);
      if (dlen > 0.001) {
        const fx = dxp / dlen;
        const fy = dyp / dlen;
        spawnEnemyFireball(z.x + fx * 14, z.y + fy * 10, fx, fy);
        z.castAnimSec = 0.28;
      }
      z.nextFireTs = nowSec + devilConfig.fireIntervalSec;
    }

    if (z.bossType === "reaper" && !z.entering) {
      if (z.spinningSec > 0) {
        z.spinningSec = Math.max(0, z.spinningSec - dt);
        driveX = 0;
        driveY = 0;
        if (!z.spinHitDone && z.spinningSec <= reaperConfig.spinDurationSec * 0.5) {
          const ddx = player.x - z.x;
          const ddy = player.y - z.y;
          if (Math.hypot(ddx, ddy) <= reaperConfig.attackRadius) {
            damagePlayer(reaperConfig.spinDamage);
            const n = Math.hypot(ddx, ddy) || 1;
            player.impulseVX += (ddx / n) * combat.impulse * 0.9;
            player.impulseVY += (ddy / n) * combat.impulse * 0.9;
          }

          for (const b of barrels) {
            if (b.dead) continue;
            const bd = Math.hypot(b.x - z.x, b.y - z.y);
            if (bd <= reaperConfig.attackRadius + b.r) {
              damageBarrel(b, reaperConfig.spinDamage);
            }
          }

          for (const bw of barricades) {
            if (bw.dead) continue;
            const wd = Math.hypot(bw.x - z.x, bw.y - z.y);
            if (wd <= reaperConfig.attackRadius + bw.r) {
              damageBarricade(bw, reaperConfig.spinDamage);
            }
          }

          z.spinHitDone = true;
        }
      } else {
        const distToPlayer = Math.hypot(player.x - z.x, player.y - z.y);
        if (distToPlayer <= reaperConfig.senseRadius) {
          if (!z.reaperPlayerInSense) {
            // Entering sense range: attack immediately, then start cooldown.
            z.reaperPlayerInSense = true;
            z.specialTimer = 0;
            z.spinningSec = reaperConfig.spinDurationSec;
            z.spinVfxSec = reaperConfig.spinDurationSec + reaperConfig.spinVfxFadeSec;
            z.spinHitDone = false;
          } else {
            z.specialTimer += dt;
            if (z.specialTimer >= reaperConfig.attackIntervalSec) {
              z.specialTimer = 0;
              z.spinningSec = reaperConfig.spinDurationSec;
              z.spinVfxSec = reaperConfig.spinDurationSec + reaperConfig.spinVfxFadeSec;
              z.spinHitDone = false;
            }
          }
        } else {
          z.specialTimer = 0;
          z.reaperPlayerInSense = false;
        }
      }
    }

    z.impulseVX = decayImpulse(z.impulseVX, dt);
    z.impulseVY = decayImpulse(z.impulseVY, dt);

    // Safety clamp for accidental NaN/Infinity to avoid freezing the game loop.
    if (!Number.isFinite(z.x) || !Number.isFinite(z.y)) {
      z.x = oldX;
      z.y = oldY;
      z.wanderSec = 0;
      z.stuckSec = 0;
    }
  }
}

function resolveZombieSeparation() {
  const cellSize = 64;
  const bins = new Map();
  const alive = [];

  for (const z of zombies) {
    if (z.dead) continue;
    alive.push(z);
    const cx = Math.floor(z.x / cellSize);
    const cy = Math.floor(z.y / cellSize);
    const key = `${cx},${cy}`;
    let list = bins.get(key);
    if (!list) {
      list = [];
      bins.set(key, list);
    }
    list.push(z);
  }

  function separatePair(a, b) {
    let dx = a.x - b.x;
    let dy = a.y - b.y;
    let dist = Math.hypot(dx, dy);
    const minDist = a.r + b.r;
    if (dist >= minDist) return;

    if (dist < 0.0001) {
      const ang = Math.random() * Math.PI * 2;
      dx = Math.cos(ang);
      dy = Math.sin(ang);
      dist = 1;
    }

    const nx = dx / dist;
    const ny = dy / dist;
    const push = (minDist - dist) * 0.5 + 0.01;

    const ax = a.x;
    const ay = a.y;
    const bx = b.x;
    const by = b.y;

    a.x += nx * push;
    a.y += ny * push;
    b.x -= nx * push;
    b.y -= ny * push;

    if (circleTouchesAnyWall(a.x, a.y, a.r)) {
      a.x = ax;
      a.y = ay;
    }
    if (circleTouchesAnyWall(b.x, b.y, b.r)) {
      b.x = bx;
      b.y = by;
    }
  }

  const neighborOffsets = [
    [1, 0],
    [0, 1],
    [1, 1],
    [-1, 1],
  ];

  for (const [key, list] of bins) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        separatePair(list[i], list[j]);
      }
    }

    const parts = key.split(",");
    const cx = Number(parts[0]);
    const cy = Number(parts[1]);
    for (const off of neighborOffsets) {
      const other = bins.get(`${cx + off[0]},${cy + off[1]}`);
      if (!other) continue;
      for (const a of list) {
        for (const b of other) {
          separatePair(a, b);
        }
      }
    }
  }

  for (const z of alive) {
    z.x = clamp(z.x, 44, world.width - 44);
    z.y = clamp(z.y, -120, world.height + 120);
  }
}
function handleCombatAndCollisions(nowSec) {
  if (player.dead) return;
  for (const z of zombies) {
    if (z.dead) continue;
    const dx = player.x - z.x;
    const dy = player.y - z.y;
    const dist = Math.hypot(dx, dy);
    const minDist = player.r + z.r;

    if (dist > minDist || dist < 0.0001) continue;

    const nx = dx / dist;
    const ny = dy / dist;

    const overlap = minDist - dist;
    player.x += nx * overlap * 0.55;
    player.y += ny * overlap * 0.55;
    z.x -= nx * overlap * 0.45;
    z.y -= ny * overlap * 0.45;

    const playerSpeed = Math.hypot(player.controlVX, player.controlVY);
    if (playerSpeed > 8) {
      z.impulseVX -= nx * combat.impulse;
      z.impulseVY -= ny * combat.impulse;
    }

    if (z.bossType !== "reaper" && nowSec - z.lastAttackTs >= combat.attackInterval) {
      z.lastAttackTs = nowSec;
      z.attackAnimSec = combat.zombieSlashAnimSec;
      damagePlayer(combat.attackDamage);

      player.impulseVX += nx * combat.impulse;
      player.impulseVY += ny * combat.impulse;
    }
  }

  player.x = clamp(player.x, 44, world.width - 44);
  player.y = clamp(player.y, 44, world.height - 44);
}


function currentWeapon() {
  if (player.weaponSlot === 2) return weaponDefs.uzi;
  if (player.weaponSlot === 3) return weaponDefs.shotgun;
  if (player.weaponSlot === 4) return weaponDefs.gatling;
  if (player.weaponSlot === 5) return weaponDefs.grenade;
  if (player.weaponSlot === 6) return weaponDefs.barrel;
  if (player.weaponSlot === 7) return weaponDefs.mine;
  if (player.weaponSlot === 8) return weaponDefs.rocket;
  if (player.weaponSlot === 9) return weaponDefs.wall;
  return weaponDefs.pistol;
}

function updateAim() {
  player.aimX = player.facingX;
  player.aimY = player.facingY;
}

function getPlayerMuzzleWorld(weaponId = "pistol") {
  const dir = getFacingDir(player.controlVX, player.controlVY, player.facingX, player.facingY);
  const side = dir.includes("left") ? -1 : dir.includes("right") ? 1 : 0;
  const facingUp = dir.startsWith("up");

  const alen = Math.hypot(player.aimX, player.aimY) || 1;
  const ux = player.aimX / alen;
  const uy = player.aimY / alen;

  const gunLenBase = weaponId === "uzi" ? 5 : weaponId === "shotgun" ? 10 : weaponId === "gatling" ? 12 : weaponId === "rocket" ? 11 : weaponId === "wall" ? 7 : 8;

  if (facingUp) {
    return { x: player.x + ux * gunLenBase, y: player.y + uy * (gunLenBase - 2) };
  }

  if (side !== 0) {
    const shoulderX = side > 0 ? 8 : -8;
    const shoulderY = 2;
    const elbowX = shoulderX + side * 6;
    const handX = elbowX;
    const handY = shoulderY - 8;
    const muzzleX = handX + ux * gunLenBase;
    const muzzleY = handY + uy * gunLenBase;
    return { x: player.x + muzzleX, y: player.y + muzzleY };
  }

  const shoulderX = 7;
  const shoulderY = 1;
  const handX = shoulderX + ux * 8;
  const handY = shoulderY + uy * 8;
  const muzzleX = handX + ux * gunLenBase;
  const muzzleY = handY + uy * gunLenBase;
  return { x: player.x + muzzleX, y: player.y + muzzleY };
}

function spawnEnemyFireball(x, y, dirX, dirY) {
  const n = Math.hypot(dirX, dirY) || 1;
  const fx = dirX / n;
  const fy = dirY / n;
  bullets.push({
    owner: "zombie",
    kind: "fireball",
    x,
    y,
    vx: fx * devilConfig.fireballSpeed,
    vy: fy * devilConfig.fireballSpeed,
    radius: devilConfig.fireballRadius,
    length: 0,
    remainingRange: devilConfig.fireRange,
    damage: devilConfig.fireDamage,
    impulseUnits: devilConfig.fireImpulseUnits,
    bouncesLeft: 0,
    color: "#ff6a1a",
    glowColor: "rgba(255, 170, 50, 0.9)",
    dead: false,
  });
}

function spawnBullet(owner, x, y, dirX, dirY, wpn) {
  const spreadRad = (wpn.spreadDeg * Math.PI) / 180;
  const delta = (Math.random() - 0.5) * spreadRad;
  const ca = Math.cos(delta);
  const sa = Math.sin(delta);
  const fx = dirX * ca - dirY * sa;
  const fy = dirX * sa + dirY * ca;

  const rocketMode = wpn.id === "rocket";
  bullets.push({
    owner,
    kind: rocketMode ? "rocket" : "beam",
    radius: rocketMode ? 5 : 0,
    x,
    y,
    vx: fx * wpn.bulletSpeed,
    vy: fy * wpn.bulletSpeed,
    length: wpn.bulletLength,
    remainingRange: wpn.range,
    damage: wpn.damage,
    impulseUnits: wpn.impulseUnits,
    bouncesLeft: wpn.bounceCount,
    color: wpn.color,
    dead: false,
  });
}

function tryFireWeapon(dt) {
  if (player.dead) return;
  const wpn = currentWeapon();
  player.fireCooldownSec = Math.max(0, player.fireCooldownSec - dt);
  if (!player.triggerDown || player.fireCooldownSec > 0) return;

  if (player.ammo[wpn.id] <= 0) return;

  player.fireCooldownSec = 1 / wpn.fireRate;

  // Throwable / placeable explosive slots.
  if (wpn.id === "grenade") {
    player.ammo[wpn.id] -= 1;
    const muzzle = getPlayerMuzzleWorld("pistol");
    throwGrenade(muzzle.x, muzzle.y, player.aimX, player.aimY, wpn.range);
    return;
  }

  if (wpn.id === "barrel") {
    const tx = player.x + player.aimX * wpn.range;
    const ty = player.y + player.aimY * wpn.range;
    if (placeBarrelAt(tx, ty)) {
      player.ammo[wpn.id] -= 1;
    }
    return;
  }

  if (wpn.id === "mine") {
    const tx = player.x + player.aimX * wpn.range;
    const ty = player.y + player.aimY * wpn.range;
    if (placeMineAt(tx, ty)) {
      player.ammo[wpn.id] -= 1;
    }
    return;
  }

  if (wpn.id === "wall") {
    const tx = player.x + player.aimX * wpn.range;
    const ty = player.y + player.aimY * wpn.range;
    if (placeBarricadeAt(tx, ty)) {
      player.ammo[wpn.id] -= 1;
    }
    return;
  }

  player.ammo[wpn.id] -= 1;

  const muzzle = getPlayerMuzzleWorld(wpn.id);
  const pelletCount = Math.max(1, wpn.pelletCount || 1);

  if (pelletCount === 1) {
    spawnBullet("player", muzzle.x, muzzle.y, player.aimX, player.aimY, wpn);
  } else {
    const spreadRad = (wpn.spreadDeg * Math.PI) / 180;
    for (let i = 0; i < pelletCount; i++) {
      const t = pelletCount === 1 ? 0.5 : i / (pelletCount - 1);
      const delta = -spreadRad * 0.5 + t * spreadRad;
      const ca = Math.cos(delta);
      const sa = Math.sin(delta);
      const fx = player.aimX * ca - player.aimY * sa;
      const fy = player.aimX * sa + player.aimY * ca;
      spawnBullet("player", muzzle.x, muzzle.y, fx, fy, { ...wpn, spreadDeg: 0 });
    }
  }
}

function bulletHitsZombie(z, bx, by) {
  // Body hit circle.
  const bdx = z.x - bx;
  const bdy = z.y - by;
  if (bdx * bdx + bdy * bdy <= z.r * z.r) {
    return { hit: true, hx: z.x, hy: z.y };
  }

  // Head hit circle: head is drawn above body in screen space, so offset in world Y.
  const headOffsetY = 18;
  const headX = z.x;
  const headY = z.y - headOffsetY;
  const headR = Math.max(8, z.r * 0.66);
  const hdx = headX - bx;
  const hdy = headY - by;
  if (hdx * hdx + hdy * hdy <= headR * headR) {
    return { hit: true, hx: headX, hy: headY };
  }

  return { hit: false, hx: z.x, hy: z.y };
}

function applyBulletImpactToZombie(z, b, dx, dy) {
  if (z.dead) return;
  z.hp -= b.damage;

  const bn = Math.hypot(b.vx, b.vy) || 1;
  const bx = b.vx / bn;
  const by = b.vy / bn;

  if (z.bossType === "devil" && b.owner === "player") {
    z.nextFireTs = gameTimeSec + devilConfig.fireIntervalSec;
  }

  knockbackZombieWithBlood(z, bx, by, b.impulseUnits);

  if (z.hp <= 0) {
    z.dead = true;
    z.deathTimer = z.deathTotal;
    z.deathDirX = bx;
    z.deathDirY = by;
    z.impulseVX = 0;
    z.impulseVY = 0;
    z.moveVX = 0;
    z.moveVY = 0;
  }
}

function updateBullets(dt) {
  for (const b of bullets) {
    if (b.dead) continue;

    const speed = Math.hypot(b.vx, b.vy);
    if (speed < 0.0001) {
      b.dead = true;
      continue;
    }

    let moveLeft = speed * dt;
    while (moveLeft > 0 && !b.dead) {
      const step = Math.min(moveLeft, 12);
      moveLeft -= step;

      const prevX = b.x;
      const prevY = b.y;
      const ux = b.vx / speed;
      const uy = b.vy / speed;
      const nx = b.x + ux * step;
      const ny = b.y + uy * step;

      let wall = null;
      for (const w of getSolidObstacles()) {
        if ((b.radius > 0 && circleRectCollide(nx, ny, b.radius, w)) || (b.radius <= 0 && pointInRect(nx, ny, w))) {
          wall = w;
          break;
        }
      }

      if (wall) {
        const hitBarrel = !!wall.__barrel;
        const hitBarricade = !!wall.__barricade;

        if (hitBarrel) {
          const bb = wall.__barrel;
          damageBarrel(bb, b.damage || 0);
          if (b.kind === "rocket") {
            explodeAt(nx, ny, b);
          }
          b.dead = true;
          break;
        }

        if (hitBarricade) {
          const bw = wall.__barricade;
          damageBarricade(bw, b.damage || 0);
          if (b.kind === "rocket") {
            explodeAt(nx, ny, b);
          }
          b.dead = true;
          break;
        }

        if (b.kind === "rocket") {
          explodeAt(nx, ny, b);
          b.dead = true;
          break;
        }

        if (b.bouncesLeft <= 0) {
          b.dead = true;
          break;
        }

        const dL = Math.abs(prevX - wall.x);
        const dR = Math.abs(prevX - (wall.x + wall.w));
        const dT = Math.abs(prevY - wall.y);
        const dB = Math.abs(prevY - (wall.y + wall.h));
        const m = Math.min(dL, dR, dT, dB);
        if (m === dL || m === dR) {
          b.vx *= -1;
        } else {
          b.vy *= -1;
        }
        b.bouncesLeft -= 1;
        b.x = prevX;
        b.y = prevY;
        continue;
      }

      b.x = nx;
      b.y = ny;
      b.remainingRange -= step;
      if (b.remainingRange <= 0) {
        if (b.kind === "rocket") explodeAt(b.x, b.y, b);
        b.dead = true;
        break;
      }

      if (b.owner === "player") {
        for (const z of zombies) {
          if (z.dead) continue;
          const hit = bulletHitsZombie(z, b.x, b.y);
          if (hit.hit && (Math.hypot(hit.hx - b.x, hit.hy - b.y) <= Math.max(1, b.radius + z.r))) {
            if (b.kind === "rocket") {
              explodeAt(b.x, b.y, z);
            } else {
              const dx = hit.hx - b.x;
              const dy = hit.hy - b.y;
              applyBulletImpactToZombie(z, b, dx, dy);
            }
            b.dead = true;
            break;
          }
        }
      } else if (b.owner === "zombie") {
        if (player.dead) continue;
        const dx = player.x - b.x;
        const dy = player.y - b.y;
        const hitR = player.r + (b.radius || 0);
        if (dx * dx + dy * dy <= hitR * hitR) {
          const n = Math.hypot(dx, dy) || 1;
          const nx2 = dx / n;
          const ny2 = dy / n;
          damagePlayer(b.damage);
          applyBulletImpactToPlayer(b, nx2, ny2);
          b.dead = true;
        }
      }
    }
  }

  for (let i = bullets.length - 1; i >= 0; i--) {
    if (bullets[i].dead) bullets.splice(i, 1);
  }
}

function updateTimers(dt) {
  for (let i = zombies.length - 1; i >= 0; i--) {
    const z = zombies[i];
    if (z.dead) {
      z.deathTimer = Math.max(0, z.deathTimer - dt);
      if (z.deathTimer <= 0) zombies.splice(i, 1);
    }
  }
  if (player.dead) {
    player.respawnTimer = Math.max(0, player.respawnTimer - dt);
    if (player.respawnTimer <= 0) {
      respawnPlayer();
    }
  }

  if (player.invincibleSec > 0) {
    player.invincibleSec = Math.max(0, player.invincibleSec - dt);
  }
  if (player.hitFlashSec > 0) {
    player.hitFlashSec = Math.max(0, player.hitFlashSec - dt);
  }
  if (screenHitFlashSec > 0) {
    screenHitFlashSec = Math.max(0, screenHitFlashSec - dt);
  }
  for (const z of zombies) {
    if (z.attackAnimSec > 0) {
      z.attackAnimSec = Math.max(0, z.attackAnimSec - dt);
    }
    if (z.castAnimSec > 0) {
      z.castAnimSec = Math.max(0, z.castAnimSec - dt);
    }
    if (z.spinVfxSec > 0) {
      z.spinVfxSec = Math.max(0, z.spinVfxSec - dt);
    }
  }

  // Optimization: reclaim destroyed static props so long sessions don't keep growing arrays.
  for (let i = barrels.length - 1; i >= 0; i--) {
    if (barrels[i].dead) barrels.splice(i, 1);
  }
  for (let i = barricades.length - 1; i >= 0; i--) {
    if (barricades[i].dead) barricades.splice(i, 1);
  }

  // Passive regen: every 3s recover 25 HP (disabled while invincible)
  if (!player.dead && player.invincibleSec <= 0 && player.hp > 0 && player.hp < combat.maxHp) {
    player.regenTimer += dt;
    while (player.regenTimer >= combat.regenInterval) {
      player.regenTimer -= combat.regenInterval;
      player.hp = Math.min(combat.maxHp, player.hp + combat.regenAmount);
    }
  } else {
    player.regenTimer = 0;
  }
}

function updateCamera() {
  const vw = viewport.width;
  const vh = viewport.height;
  const visibleWorldH = vh / view.tilt;

  camera.x = player.x - vw / 2;
  camera.y = player.y - visibleWorldH / 2;

  const maxCamX = Math.max(0, world.width - vw);
  const maxCamY = Math.max(0, world.height - visibleWorldH);
  camera.x = clamp(camera.x, 0, maxCamX);
  camera.y = clamp(camera.y, 0, maxCamY);
}

function sx(x) {
  return x - camera.x;
}

function sy(y) {
  return (y - camera.y) * view.tilt;
}

function drawProjectedRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(sx(x), sy(y), w, h * view.tilt);
}

function drawGround() {
  drawProjectedRect(0, 0, world.width, world.height, "#f2f0ea");

  for (const p of terrainPatches) {
    ctx.save();
    ctx.fillStyle = `rgba(178, 182, 186, ${p.a})`;
    ctx.beginPath();
    const first = p.points[0];
    ctx.moveTo(sx(p.x + first[0]), sy(p.y + first[1]));
    for (let i = 1; i < p.points.length; i++) {
      const pt = p.points[i];
      ctx.lineTo(sx(p.x + pt[0]), sy(p.y + pt[1]));
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  if (bloodLayer.canvas) {
    const srcX = Math.max(0, Math.floor(camera.x));
    const srcY = Math.max(0, Math.floor(camera.y * view.tilt));
    const srcW = Math.min(viewport.width, bloodLayer.width - srcX);
    const srcH = Math.min(viewport.height, bloodLayer.height - srcY);
    if (srcW > 0 && srcH > 0) {
      ctx.drawImage(bloodLayer.canvas, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);
    }
  }

  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.strokeStyle = "#cfd3d8";
  ctx.lineWidth = 1;
  for (let x = 0; x < world.width; x += 80) {
    ctx.beginPath();
    ctx.moveTo(sx(x), sy(0));
    ctx.lineTo(sx(x), sy(world.height));
    ctx.stroke();
  }
  for (let y = 0; y < world.height; y += 80) {
    ctx.beginPath();
    ctx.moveTo(sx(0), sy(y));
    ctx.lineTo(sx(world.width), sy(y));
    ctx.stroke();
  }
  ctx.restore();
}

function drawWalls() {
  const d = getDoorRects();

  // Four door openings with subtle contrast from floor/walls.
  drawProjectedRect(d.top.x, d.top.y, d.top.w, d.top.h, "#c8c6be");
  drawProjectedRect(d.bottom.x, d.bottom.y, d.bottom.w, d.bottom.h, "#c8c6be");
  drawProjectedRect(d.left.x, d.left.y, d.left.w, d.left.h, "#c8c6be");
  drawProjectedRect(d.right.x, d.right.y, d.right.w, d.right.h, "#c8c6be");

  ctx.strokeStyle = "#aaa79e";
  ctx.lineWidth = 2;
  ctx.strokeRect(sx(d.top.x) + 1, sy(d.top.y) + 1, d.top.w - 2, d.top.h * view.tilt - 2);
  ctx.strokeRect(sx(d.bottom.x) + 1, sy(d.bottom.y) + 1, d.bottom.w - 2, d.bottom.h * view.tilt - 2);
  ctx.strokeRect(sx(d.left.x) + 1, sy(d.left.y) + 1, d.left.w - 2, d.left.h * view.tilt - 2);
  ctx.strokeRect(sx(d.right.x) + 1, sy(d.right.y) + 1, d.right.w - 2, d.right.h * view.tilt - 2);

  for (const w of walls) {
    drawProjectedRect(w.x + 8, w.y + 8, w.w, w.h, "rgba(50, 54, 60, 0.08)");

    drawProjectedRect(w.x, w.y, w.w, w.h, "#ffffff");

    ctx.fillStyle = "#e8eaed";
    ctx.beginPath();
    ctx.moveTo(sx(w.x), sy(w.y + w.h));
    ctx.lineTo(sx(w.x + w.w), sy(w.y + w.h));
    ctx.lineTo(sx(w.x + w.w), sy(w.y + w.h + view.wallHeight));
    ctx.lineTo(sx(w.x), sy(w.y + w.h + view.wallHeight));
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#dadde1";
    ctx.lineWidth = 1.4;
    ctx.strokeRect(sx(w.x) + 1, sy(w.y) + 1, w.w - 2, w.h * view.tilt - 2);
  }
}

function getFacingDir(vx, vy, fallbackX = 0, fallbackY = 1) {
  let dx = vx;
  let dy = vy;
  const m = Math.hypot(dx, dy);
  if (m < 0.01) {
    dx = fallbackX;
    dy = fallbackY;
  } else {
    dx /= m;
    dy /= m;
  }

  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  if (ax > ay * 1.25) return dx > 0 ? "right" : "left";
  if (ay > ax * 1.25) return dy > 0 ? "down" : "up";
  if (dx > 0 && dy > 0) return "down-right";
  if (dx < 0 && dy > 0) return "down-left";
  if (dx > 0 && dy < 0) return "up-right";
  return "up-left";
}

function drawBlockCharacter(x, y, style) {
  const dir = getFacingDir(style.vx, style.vy, style.fallbackX, style.fallbackY);
  const speed = Math.hypot(style.vx, style.vy);
  const walkAmp = Math.min(1, speed / (style.walkRefSpeed || 120));
  const walk = Math.sin(gameTimeSec * 10) * 6.4 * walkAmp;
  const side = dir.includes("left") ? -1 : dir.includes("right") ? 1 : 0;
  const facingUp = dir.startsWith("up");

  ctx.save();
  ctx.translate(sx(x), sy(y));

  ctx.fillStyle = style.shadowColor || "rgba(0,0,0,0.24)";
  ctx.beginPath();
  ctx.ellipse(0, style.r + 3, style.r * 1.05, style.r * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  const legBack = -walk;
  const legFront = walk;

  if (side !== 0) {
    // Side-view gait: partially overlapping pendulum-like legs.
    const sideLegSwing = walk * 0.65;
    ctx.fillStyle = style.legBackColor;
    ctx.fillRect(-4 + sideLegSwing * 0.35, 6, 5, 14);
    ctx.fillStyle = style.legColor;
    ctx.fillRect(-1 - sideLegSwing * 0.35, 6, 5, 14);
  } else if (facingUp) {
    ctx.fillStyle = style.legBackColor;
    ctx.fillRect(-8, 6 + legBack * 0.45, 6, 13);
    ctx.fillRect(2, 6 + legFront * 0.45, 6, 13);
  } else {
    ctx.fillStyle = style.legColor;
    ctx.fillRect(-8, 6 + legBack * 0.55, 6, 14);
    ctx.fillRect(2, 6 + legFront * 0.55, 6, 14);
  }

  const bodyW = side === 0 ? 22 : 18;
  const bodyX = -Math.floor(bodyW / 2);
  ctx.fillStyle = style.bodyColor;
  ctx.fillRect(bodyX, -7, bodyW, 16);

  if (side !== 0) {
    ctx.fillStyle = style.bodySideColor;
    if (side > 0) {
      ctx.fillRect(bodyX + bodyW - 4, -7, 4, 16);
    } else {
      ctx.fillRect(bodyX, -7, 4, 16);
    }
  }

  const armOffset = side === 0 ? 11 : 9;
  const armSwing = walk * 0.8;

  const armSkin = style.armSkinColor || style.headColor;
  function drawArm(ax, ay) {
    // Sleeve (upper arm)
    ctx.fillStyle = style.armColor;
    ctx.fillRect(ax, ay, 3, 5);
    // Forearm + hand (front 2/3)
    ctx.fillStyle = armSkin;
    ctx.fillRect(ax, ay + 5, 3, 11);
  }

  const sidePistol = !!style.weapon && side !== 0;
  if (side >= 0) {
    drawArm(-armOffset, -6 + armSwing * 0.45);
    if (!sidePistol || side < 0) {
      drawArm(armOffset - 3, -6 - armSwing * 0.45);
    }
  } else {
    if (!sidePistol || side > 0) {
      drawArm(-armOffset, -6 - armSwing * 0.45);
    }
    drawArm(armOffset - 3, -6 + armSwing * 0.45);
  }

  const headW = side === 0 ? 18 : 16;
  const headX = -Math.floor(headW / 2);
  ctx.fillStyle = style.headColor;
  ctx.fillRect(headX, -21, headW, 14);

  if (style.hairColor) {
    ctx.fillStyle = style.hairColor;
    ctx.fillRect(headX, -21, headW, 4);
    ctx.fillRect(headX + 1, -17, Math.max(4, headW - 2), 1);
  }

  if (side !== 0) {
    ctx.fillStyle = style.headSideColor;
    if (side > 0) {
      ctx.fillRect(headX + headW - 3, -21, 3, 14);
    } else {
      ctx.fillRect(headX, -21, 3, 14);
    }
  }

  if (style.hairColor) {
    ctx.fillStyle = style.hairColor;
    if (side > 0) {
      ctx.fillRect(headX + headW - 3, -21, 3, 8);
      ctx.fillRect(headX + headW - 5, -21, 2, 4); // forehead fringe (side view)
    } else if (side < 0) {
      ctx.fillRect(headX, -21, 3, 8);
      ctx.fillRect(headX + 3, -21, 2, 4); // forehead fringe (side view)
    } else if (!facingUp) {
      ctx.fillRect(headX + 2, -19, Math.max(6, headW - 4), 2);
    }
  }

  ctx.fillStyle = style.faceColor;
  if (facingUp) {
    if (!style.mouthArcUp) ctx.fillRect(-4, -10, 8, 2);
  } else if (side === 0) {
    ctx.fillRect(-5, -16, 3, 3);
    ctx.fillRect(2, -16, 3, 3);
    if (!style.mouthArcUp) ctx.fillRect(-4, -10, 8, 2);
  } else {
    if (side > 0) {
      ctx.fillRect(2, -16, 3, 3);
      if (!style.mouthArcUp) ctx.fillRect(1, -11, 4, 2);
    } else {
      ctx.fillRect(-5, -16, 3, 3);
      if (!style.mouthArcUp) ctx.fillRect(-5, -11, 4, 2);
    }
  }

  if (style.mouthArcUp) {
    if (side === 0) {
      ctx.strokeStyle = style.faceColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-4, -10);
      ctx.quadraticCurveTo(0, -13, 4, -10);
      ctx.stroke();
    } else if (side > 0) {
      ctx.fillRect(1, -11, 4, 2);
    } else {
      ctx.fillRect(-5, -11, 4, 2);
    }
  }

  if (style.weapon) {
    const wx = style.weaponDirX || style.fallbackX;
    const wy = style.weaponDirY || style.fallbackY;
    const wl = Math.hypot(wx, wy) || 1;
    const ux = wx / wl;
    const uy = wy / wl;
    const showWeapon = !facingUp;

    if (showWeapon) {
      const gunType = style.weapon;
      let shoulderX = 7;
      let shoulderY = 1;
      let forearmLen = 8;
      let gunLen = 8;
      let gunWidth = 2.6;
      let gunColor = "#0a0b0d";

      if (gunType === "uzi") {
        gunLen = 5;
        gunWidth = 2.3;
      } else if (gunType === "shotgun") {
        gunLen = 10;
        gunWidth = 3.8;
      } else if (gunType === "gatling") {
        gunLen = 12;
        gunWidth = 5.2;
      } else if (gunType === "rocket") {
        gunLen = 11;
        gunWidth = 4.8;
        gunColor = "#3b3f42";
      } else if (gunType === "grenade") {
        gunLen = 3;
        gunWidth = 3.4;
      } else if (gunType === "barrel") {
        gunLen = 6;
        gunWidth = 4.8;
        gunColor = "#822a2a";
      } else if (gunType === "mine") {
        gunLen = 4;
        gunWidth = 3.8;
        gunColor = "#4a4a4a";
      } else if (gunType === "wall") {
        gunLen = 6;
        gunWidth = 5.2;
        gunColor = "#d4d9de";
      }

      if (side !== 0) {
        shoulderX = side > 0 ? 8 : -8;
        shoulderY = 2;

        const elbowX = shoulderX + side * 6;
        const elbowY = shoulderY;
        const handX = elbowX;
        const handY = shoulderY - 8;

        ctx.strokeStyle = armSkin;
        ctx.lineWidth = 3.2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(shoulderX, shoulderY);
        ctx.lineTo(elbowX, elbowY);
        ctx.lineTo(handX, handY);
        ctx.stroke();

        const muzzleX = handX + ux * gunLen;
        const muzzleY = handY + uy * gunLen;

        ctx.strokeStyle = gunColor;
        ctx.lineWidth = gunWidth;
        ctx.beginPath();
        ctx.moveTo(handX, handY);
        ctx.lineTo(muzzleX, muzzleY);
        ctx.stroke();

        if (gunType === "gatling") {
          ctx.strokeStyle = "#14161a";
          ctx.lineWidth = 2.3;
          ctx.beginPath();
          ctx.moveTo(handX - uy * 1.5, handY + ux * 1.5);
          ctx.lineTo(muzzleX - uy * 1.5, muzzleY + ux * 1.5);
          ctx.stroke();
        } else if (gunType === "rocket") {
          ctx.strokeStyle = "#e0b442";
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.moveTo(muzzleX - ux * 1.8, muzzleY - uy * 1.8);
          ctx.lineTo(muzzleX + ux * 1.2, muzzleY + uy * 1.2);
          ctx.stroke();
        }
      } else {
        const handX = shoulderX + ux * forearmLen;
        const handY = shoulderY + uy * forearmLen;
        const muzzleX = handX + ux * gunLen;
        const muzzleY = handY + uy * gunLen;

        ctx.strokeStyle = armSkin;
        ctx.lineWidth = 3.2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(shoulderX, shoulderY);
        ctx.lineTo(handX, handY);
        ctx.stroke();

        ctx.strokeStyle = gunColor;
        ctx.lineWidth = gunWidth;
        ctx.beginPath();
        ctx.moveTo(handX, handY);
        ctx.lineTo(muzzleX, muzzleY);
        ctx.stroke();

        if (gunType === "shotgun") {
          ctx.strokeStyle = "#16191d";
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(handX - uy * 1.2, handY + ux * 1.2);
          ctx.lineTo(muzzleX - uy * 1.2, muzzleY + ux * 1.2);
          ctx.stroke();
        } else if (gunType === "gatling") {
          ctx.strokeStyle = "#14161a";
          ctx.lineWidth = 2.6;
          ctx.beginPath();
          ctx.moveTo(handX - uy * 1.8, handY + ux * 1.8);
          ctx.lineTo(muzzleX - uy * 1.8, muzzleY + ux * 1.8);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(handX + uy * 1.8, handY - ux * 1.8);
          ctx.lineTo(muzzleX + uy * 1.8, muzzleY - ux * 1.8);
          ctx.stroke();
        } else if (gunType === "rocket") {
          ctx.strokeStyle = "#e0b442";
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.moveTo(muzzleX - ux * 1.8, muzzleY - uy * 1.8);
          ctx.lineTo(muzzleX + ux * 1.2, muzzleY + uy * 1.2);
          ctx.stroke();
        }
      }
    }
  }

  ctx.restore();
}

function drawZombieScratchArm(z) {
  if (z.attackAnimSec <= 0) return;

  const dir = getFacingDir(z.moveVX, z.moveVY, 0, 1);
  const side = dir.includes("left") ? -1 : dir.includes("right") ? 1 : z.slashSide;
  const t = 1 - z.attackAnimSec / combat.zombieSlashAnimSec;
  const swing = (-1.25 + 1.95 * t) * side; // top -> down arc

  ctx.save();
  ctx.translate(sx(z.x), sy(z.y));

  const shoulderX = side > 0 ? 7 : -7;
  const shoulderY = -7;
  const armLen = 13;
  const ex = shoulderX + Math.cos(swing) * armLen;
  const ey = shoulderY + Math.sin(swing) * armLen;

  ctx.strokeStyle = "#8b9398";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(shoulderX, shoulderY);
  ctx.lineTo(ex, ey);
  ctx.stroke();

  ctx.fillStyle = "#c7ced2";
  ctx.fillRect(ex - 2, ey - 2, 4, 4);
  ctx.restore();
}

function drawDevilHorns(x, y) {
  ctx.save();
  ctx.translate(sx(x), sy(y));
  ctx.fillStyle = "#111111";

  ctx.beginPath();
  ctx.moveTo(-9, -21);
  ctx.lineTo(-16, -31);
  ctx.lineTo(-6, -25);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(9, -21);
  ctx.lineTo(16, -31);
  ctx.lineTo(6, -25);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawBossHpBar(z, color = "#e7cf45") {
  const w = 34;
  const h = 5;
  const ratio = Math.max(0, Math.min(1, z.hp / Math.max(1, z.maxHp || z.hp || 1)));
  const px = sx(z.x) - w * 0.5;
  const py = sy(z.y) - 30;

  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(px - 1, py - 1, w + 2, h + 2);
  ctx.fillStyle = "rgba(45,45,45,0.9)";
  ctx.fillRect(px, py, w, h);
  ctx.fillStyle = color;
  ctx.fillRect(px, py, w * ratio, h);
}

function drawDevilCastArm(z) {
  if (z.castAnimSec <= 0) return;
  const t = 1 - z.castAnimSec / 0.28;
  const swing = -1.1 + t * 1.8;
  ctx.save();
  ctx.translate(sx(z.x), sy(z.y));
  const shoulderX = 9;
  const shoulderY = -8;
  const armLen = 16;
  const ex = shoulderX + Math.cos(swing) * armLen;
  const ey = shoulderY + Math.sin(swing) * armLen;
  ctx.strokeStyle = "#6b1010";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(shoulderX, shoulderY);
  ctx.lineTo(ex, ey);
  ctx.stroke();
  ctx.restore();
}

function drawReaperSpinVfx(z) {
  if (z.spinVfxSec <= 0) return;

  const total = reaperConfig.spinDurationSec + reaperConfig.spinVfxFadeSec;
  const elapsed = total - z.spinVfxSec;
  const r = reaperConfig.attackRadius;

  // Sweeping sector (arc-surface): strong near rim, fades quickly toward center.
  const tailSpan = 0.72;
  const sweepStartBase = -Math.PI * 0.5;

  let end = sweepStartBase;
  let alphaMul = 1;

  if (elapsed <= reaperConfig.spinDurationSec) {
    const t = elapsed / reaperConfig.spinDurationSec;
    end = sweepStartBase + t * Math.PI * 2;
  } else {
    end = sweepStartBase + Math.PI * 2;
    const ft = (elapsed - reaperConfig.spinDurationSec) / reaperConfig.spinVfxFadeSec;
    alphaMul = Math.max(0, 1 - ft);
  }

  const start = end - tailSpan;

  ctx.save();
  ctx.translate(sx(z.x), sy(z.y));
  ctx.scale(1, view.tilt);

  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
  g.addColorStop(0.00, `rgba(255, 45, 45, ${(0.00 * alphaMul).toFixed(3)})`);
  g.addColorStop(0.45, `rgba(255, 45, 45, ${(0.03 * alphaMul).toFixed(3)})`);
  g.addColorStop(0.78, `rgba(255, 45, 45, ${(0.10 * alphaMul).toFixed(3)})`);
  g.addColorStop(1.00, `rgba(255, 45, 45, ${(0.22 * alphaMul).toFixed(3)})`);

  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, r, start, end);
  ctx.closePath();
  ctx.fill();

  // Light rim highlight to make the sweep edge readable without blocking vision.
  ctx.strokeStyle = `rgba(255, 55, 55, ${(0.30 * alphaMul).toFixed(3)})`;
  ctx.lineWidth = 2.1;
  ctx.beginPath();
  ctx.arc(0, 0, r, start, end);
  ctx.stroke();

  ctx.restore();
}

function drawReaperAxe(z) {
  const spinning = z.spinningSec > 0;
  const t = spinning ? 1 - z.spinningSec / reaperConfig.spinDurationSec : 0;
  const ang = spinning ? t * Math.PI * 2 : 0.35;
  const reach = 19;

  ctx.save();
  ctx.translate(sx(z.x), sy(z.y));
  ctx.rotate(ang);

  ctx.strokeStyle = "#4b2f1e";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, -2);
  ctx.lineTo(reach, -2);
  ctx.stroke();

  ctx.fillStyle = "#9ea0a6";
  ctx.beginPath();
  ctx.moveTo(reach - 2, -10);
  ctx.lineTo(reach + 11, -2);
  ctx.lineTo(reach - 2, 6);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawZombie(z) {
  if (z.dead) {
    const elapsed = z.deathTotal - z.deathTimer;
    const fallT = clamp(elapsed / zombieDeath.fallSec, 0, 1);
    const fadeT = clamp((elapsed - zombieDeath.fallSec) / zombieDeath.fadeSec, 0, 1);
    const alpha = 1 - fadeT;
    const ox = z.deathDirX * 12 * fallT;
    const oy = z.deathDirY * 8 * fallT;
    const rot = (z.deathDirX >= 0 ? 1 : -1) * 0.85 * fallT;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(sx(z.x + ox), sy(z.y + oy));
    ctx.rotate(rot);

    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(0, 11, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#aab1b6";
    ctx.fillRect(-14, -4, 24, 10);
    ctx.fillStyle = "#d2d8dc";
    ctx.fillRect(8, -5, 8, 8);
    ctx.fillStyle = "#7a7f83";
    ctx.fillRect(-16, 2, 8, 4);

    ctx.restore();
    return;
  }

  if (z.bossType === "devil") {
    drawBlockCharacter(z.x, z.y, {
      r: z.r,
      vx: z.moveVX,
      vy: z.moveVY,
      fallbackX: z.faceX,
      fallbackY: z.faceY,
      walkRefSpeed: z.speed,
      shadowColor: "rgba(0,0,0,0.28)",
      legColor: "#7a1212",
      legBackColor: "#5b0d0d",
      bodyColor: "#b21818",
      bodySideColor: "#8d1313",
      armColor: "#7a1111",
      headColor: "#d44a3a",
      headSideColor: "#b93b2f",
      faceColor: "#1a0a0a",
      mouthArcUp: false,
      pointer: false,
    });
    drawDevilHorns(z.x, z.y);
    drawDevilCastArm(z);
    drawBossHpBar(z, "#e9cf4b");
    return;
  }

  if (z.bossType === "reaper") {
    drawBlockCharacter(z.x, z.y, {
      r: z.r,
      vx: z.moveVX,
      vy: z.moveVY,
      fallbackX: z.faceX,
      fallbackY: z.faceY,
      walkRefSpeed: z.speed,
      shadowColor: "rgba(0,0,0,0.28)",
      legColor: "#55306e",
      legBackColor: "#46265d",
      bodyColor: "#7546a1",
      bodySideColor: "#5f3b82",
      armColor: "#5b357a",
      headColor: "#b392d7",
      headSideColor: "#916fba",
      faceColor: "#1a1027",
      mouthArcUp: false,
      pointer: false,
    });
    drawDevilHorns(z.x, z.y);
    drawReaperAxe(z);
    drawReaperSpinVfx(z);
    drawBossHpBar(z, "#e9cf4b");
    return;
  }

  drawBlockCharacter(z.x, z.y, {
    r: z.r,
    vx: z.moveVX,
    vy: z.moveVY,
    fallbackX: z.faceX,
    fallbackY: z.faceY,
    walkRefSpeed: zombieConfig.speed,
    shadowColor: "rgba(0,0,0,0.22)",
    legColor: "#7a7f83",
    legBackColor: "#6f7478",
    bodyColor: "#aab1b6",
    bodySideColor: "#959ca1",
    armColor: "#889095",
    headColor: "#d2d8dc",
    headSideColor: "#bcc3c8",
    faceColor: "#2a2a2a",
    mouthArcUp: true,
    pointer: false,
  });
  drawZombieScratchArm(z);
}

function drawPlayer() {
  const wpn = currentWeapon();
  drawBlockCharacter(player.x, player.y, {
    r: player.r,
    vx: player.controlVX,
    vy: player.controlVY,
    fallbackX: player.facingX,
    fallbackY: player.facingY,
    walkRefSpeed: player.speed,
    shadowColor: "rgba(0,0,0,0.25)",
    legColor: "#2f3440",
    legBackColor: "#262b36",
    bodyColor: "#171a1f",
    bodySideColor: "#0d0f12",
    armColor: "#21252d",
    armSkinColor: "#d8b08a",
    headColor: "#e4be99",
    headSideColor: "#cfa27f",
    hairColor: "#6f4a2f",
    faceColor: "#1b1b1b",
    weapon: wpn.id,
    weaponDirX: player.aimX,
    weaponDirY: player.aimY,
  });
}
function updateHud(dt) {
  const wpn = currentWeapon();
  const ammo = player.ammo[wpn.id];
  const inInv = player.invincibleSec > 0;
  const dead = player.dead;
  const shownHp = dead ? 0 : inInv ? 9999 : Math.max(0, Math.ceil(player.hp));
  const shownMax = dead ? combat.maxHp : inInv ? 9999 : combat.maxHp;
  const ratio = dead ? 0 : inInv ? 1 : clamp(player.hp / combat.maxHp, 0, 1);

  hpFill.style.width = `${(ratio * 100).toFixed(1)}%`;
  hpText.textContent = `${shownHp} / ${shownMax}`;
  statusText.textContent = dead
    ? `State: Dead | Respawn in ${Math.ceil(player.respawnTimer)}s | Slot${wpn.slot}:${wpn.name} | ${ammo}/${wpn.magSize}`
    : inInv
      ? `State: Invincible ${player.invincibleSec.toFixed(1)}s | Slot${wpn.slot}:${wpn.name} | ${ammo}/${wpn.magSize}`
      : `State: Normal | Slot${wpn.slot}:${wpn.name} | ${ammo}/${wpn.magSize}`;

  metaText.textContent =
    `WASD move | Space use/fire | 1..9 switch | ${wpn.name} Dmg:${wpn.damage} FR:${wpn.fireRate}/s Range:${wpn.range} Spread:${wpn.spreadDeg}deg V:${wpn.bulletSpeed} Knockback:${wpn.impulseUnits}u Mag:${wpn.magSize}`;

  const devilCount = zombies.filter((z) => z.bossType === "devil" && !z.dead).length;
  const reaperCount = zombies.filter((z) => z.bossType === "reaper" && !z.dead).length;
  debug.textContent = `Map:${world.width}x${world.height} VP:${viewport.width}x${viewport.height} | Pos:(${player.x.toFixed(0)},${player.y.toFixed(0)}) | Wave:${spawner.wave} Zombies:${zombies.length} Devil:${devilCount} Reaper:${reaperCount} | FPS:${(1 / Math.max(dt, 0.0001)).toFixed(0)}`;
}

function drawBullets() {
  for (const b of bullets) {
    if (b.kind === "fireball") {
      ctx.fillStyle = b.glowColor || "rgba(255,160,40,0.9)";
      ctx.beginPath();
      ctx.ellipse(sx(b.x), sy(b.y), b.radius + 2, (b.radius + 2) * view.tilt, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = b.color || "#ff6a1a";
      ctx.beginPath();
      ctx.ellipse(sx(b.x), sy(b.y), b.radius, b.radius * view.tilt, 0, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }

    if (b.kind === "rocket") {
      const sp = Math.hypot(b.vx, b.vy) || 1;
      const dx = b.vx / sp;
      const dy = b.vy / sp;
      const tx = b.x - dx * 3.5;
      const ty = b.y - dy * 3.5;
      ctx.strokeStyle = "rgba(255,180,60,0.9)";
      ctx.lineWidth = 3.8;
      ctx.beginPath();
      ctx.moveTo(sx(tx), sy(ty));
      ctx.lineTo(sx(b.x), sy(b.y));
      ctx.stroke();

      ctx.fillStyle = b.color || "#f0d24a";
      ctx.beginPath();
      ctx.ellipse(sx(b.x), sy(b.y), 5, 5 * view.tilt, 0, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }

    const sp = Math.hypot(b.vx, b.vy) || 1;
    const dx = b.vx / sp;
    const dy = b.vy / sp;
    const x1 = b.x - dx * b.length * 0.5;
    const y1 = b.y - dy * b.length * 0.5;
    const x2 = b.x + dx * b.length * 0.5;
    const y2 = b.y + dy * b.length * 0.5;

    ctx.strokeStyle = "rgba(184, 134, 11, 0.95)";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(sx(x1), sy(y1));
    ctx.lineTo(sx(x2), sy(y2));
    ctx.stroke();

    ctx.strokeStyle = b.color;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(sx(x1), sy(y1));
    ctx.lineTo(sx(x2), sy(y2));
    ctx.stroke();
  }
}

function drawExplosiveProps() {
  for (const bw of barricades) {
    if (bw.dead) continue;
    const x = sx(bw.x);
    const y = sy(bw.y);
    const r = bw.r;

    ctx.fillStyle = "rgba(0,0,0,0.24)";
    ctx.beginPath();
    ctx.ellipse(x, y + r * 0.72, r * 1.0, r * 0.34, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#d8dde2";
    ctx.fillRect(x - r * 0.78, y - r * 0.9, r * 1.56, r * 1.7);
    ctx.fillStyle = "#b9c0c7";
    ctx.fillRect(x - r * 0.78, y - r * 0.92, r * 1.56, 3);
    ctx.fillRect(x - r * 0.78, y + r * 0.62, r * 1.56, 3);

    const hpRatio = Math.max(0, Math.min(1, bw.hp / bw.maxHp));
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(x - 14, y - r - 8, 28, 3);
    ctx.fillStyle = "#f0d24a";
    ctx.fillRect(x - 14, y - r - 8, 28 * hpRatio, 3);
  }

  for (const b of barrels) {
    if (b.dead) continue;
    const x = sx(b.x);
    const y = sy(b.y);
    const r = b.r;

    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.ellipse(x, y + r * 0.7, r * 0.95, r * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#858b90";
    ctx.fillRect(x - r * 0.78, y - r * 0.9, r * 1.56, r * 1.7);

    const ringY = y - r * 0.58;
    const ringW = r * 1.48;
    const ringH = 4;
    ctx.fillStyle = "#d84b2a";
    ctx.fillRect(x - ringW * 0.5, ringY - ringH * 0.5, ringW, ringH);
    ctx.fillStyle = "#f28b2c";
    ctx.fillRect(x - ringW * 0.42, ringY - ringH * 0.3, ringW * 0.84, ringH * 0.6);

    ctx.fillStyle = "#bfc4c8";
    ctx.fillRect(x - r * 0.78, y - r * 0.92, r * 1.56, 3);
    ctx.fillRect(x - r * 0.78, y + r * 0.62, r * 1.56, 3);

    const hpRatio = Math.max(0, Math.min(1, b.hp / b.maxHp));
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(x - 11, y - r - 8, 22, 3);
    ctx.fillStyle = "#f0d24a";
    ctx.fillRect(x - 11, y - r - 8, 22 * hpRatio, 3);
  }

  for (const m of mines) {
    if (m.dead) continue;
    const x = sx(m.x);
    const y = sy(m.y);
    const armed = (m.armDelay || 0) <= 0;
    ctx.fillStyle = armed ? "#545454" : "#6e7275";
    ctx.beginPath();
    ctx.ellipse(x, y, m.r, m.r * 0.66, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = armed ? "#cc2a2a" : "#b9b9b9";
    ctx.beginPath();
    ctx.ellipse(x, y, 2, 1.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const g of grenades) {
    if (g.dead) continue;
    ctx.fillStyle = "#1b1b1b";
    ctx.beginPath();
    ctx.ellipse(sx(g.x), sy(g.y), g.r, g.r * view.tilt, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const ex of explosions) {
    const t = Math.max(0, ex.t / explosionConfig.flashSec);
    const x = sx(ex.x);
    const y = sy(ex.y);
    const rr = ex.r;

    const g = ctx.createRadialGradient(x, y, rr * 0.18, x, y, rr);
    g.addColorStop(0, `rgba(255,245,180,${(0.34 * t).toFixed(3)})`);
    g.addColorStop(0.55, `rgba(255,120,40,${(0.28 * t).toFixed(3)})`);
    g.addColorStop(1, `rgba(220,38,38,${(0.16 * t).toFixed(3)})`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, rr, rr * view.tilt, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawRespawnCountdown() {
  if (!player.dead) return;

  const w = viewport.width;
  const h = viewport.height;
  const sec = Math.ceil(player.respawnTimer);

  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "700 64px Arial";
  ctx.fillText(String(sec), w * 0.5, h * 0.48);

  ctx.font = "600 20px Arial";
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillText("Respawning...", w * 0.5, h * 0.58);
}

function drawScreenHitFlash() {
  if (screenHitFlashSec <= 0) return;

  const w = viewport.width;
  const h = viewport.height;
  const t = screenHitFlashSec / combat.screenHitFlashSec;

  const g = ctx.createRadialGradient(w * 0.5, h * 0.5, Math.min(w, h) * 0.18, w * 0.5, h * 0.5, Math.max(w, h) * 0.7);
  g.addColorStop(0, "rgba(255,0,0,0)");
  g.addColorStop(0.62, `rgba(255,0,0,${0.03 * t})`);
  g.addColorStop(0.82, `rgba(255,0,0,${0.12 * t})`);
  g.addColorStop(1, `rgba(255,0,0,${0.24 * t})`);

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function render() {
  ctx.clearRect(0, 0, viewport.width, viewport.height);
  drawGround();
  drawWalls();
  drawExplosiveProps();

  for (const z of zombies) drawZombie(z);
  if (!player.dead) drawPlayer();
  drawBullets();
  drawScreenHitFlash();
  drawRespawnCountdown();
}

function tick(ts) {
  const dt = Math.min(0.033, (ts - lastTs) / 1000);
  lastTs = ts;
  const nowSec = ts / 1000;
  gameTimeSec = nowSec;

  updateAim();
  movePlayer(dt);
  tryFireWeapon(dt);
  updateZombies(dt, nowSec);
  resolveZombieSeparation();
  handleCombatAndCollisions(nowSec);
  updateBullets(dt);
  updateGrenadesAndMines(dt);
  updateTimers(dt);
  updateCamera();

  if (zombies.length === 0 && spawner.pendingCount === 0 && nowSec >= spawner.nextWaveAt) {
    spawnWave(nowSec);
  }
  updateSpawner(nowSec);

  render();
  updateHud(dt);

  requestAnimationFrame(tick);
}

initFlowField();
initBloodLayer();
spawnWave(0);
requestAnimationFrame(tick);



















