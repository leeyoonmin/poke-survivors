// Poké Survivors - Core Game Engine

class SpriteManager {
  constructor() {
    this.images = new Map();
  }

  get(dex) {
    if (this.images.has(dex)) return this.images.get(dex);
    const img = new Image();
    img.src = `./assets/sprites/${dex}.png`;
    this.images.set(dex, img);
    return img;
  }

  preloadAll() {
    const ids = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 16, 19, 23, 25, 26,
      41, 50, 66, 81, 88, 92, 93, 94, 95, 109, 111, 123,
      125, 126, 130, 143, 145, 149, 150, 248, 373, 376, 447, 448
    ];
    ids.forEach(id => this.get(id));
  }
}

class PokeSurvivorsGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.sprites = new SpriteManager();
    this.sprites.preloadAll();

    // Persistent save data
    this.saveData = this.loadSaveData();
    this.selectedStarterId = this.saveData.lastStarter || 'pikachu';

    this.state = 'LOBBY'; // LOBBY, PLAYING, PAUSED, LEVELUP, CHEST, GAMEOVER
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Input state
    this.keys = {};
    this.joystick = {
      active: false,
      pointerId: null,
      startX: 0,
      startY: 0,
      curX: 0,
      curY: 0,
      dx: 0,
      dy: 0,
      maxDist: 44
    };

    // PWA deferred prompt
    this.deferredPrompt = null;

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.bindEvents();
    this.renderLobby();

    this.lastFrameTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  loadSaveData() {
    try {
      const raw = localStorage.getItem('poke_survivors_save_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          coins: parsed.coins ?? 100,
          upgrades: parsed.upgrades || {},
          bestTime: parsed.bestTime || 0,
          lastStarter: parsed.lastStarter || 'pikachu'
        };
      }
    } catch (e) {
      console.warn('Save load failed', e);
    }
    return { coins: 100, upgrades: {}, bestTime: 0, lastStarter: 'pikachu' };
  }

  saveProgress() {
    try {
      localStorage.setItem('poke_survivors_save_v1', JSON.stringify(this.saveData));
    } catch (e) {
      console.warn('Save write failed', e);
    }
  }

  getUpgradeLevel(id) {
    return this.saveData.upgrades[id] || 0;
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.ctx.imageSmoothingEnabled = false;
  }

  bindEvents() {
    // Keyboard
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'Escape' && (this.state === 'PLAYING' || this.state === 'PAUSED')) {
        this.togglePause();
      }
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Pointer / Touch Joystick on Canvas
    const startJoystick = (clientX, clientY, id) => {
      if (this.state !== 'PLAYING') return;
      window.sound.init();
      this.joystick.active = true;
      this.joystick.pointerId = id;
      this.joystick.startX = clientX;
      this.joystick.startY = clientY;
      this.joystick.curX = clientX;
      this.joystick.curY = clientY;
      this.joystick.dx = 0;
      this.joystick.dy = 0;

      const zone = document.getElementById('joystickZone');
      const base = document.getElementById('joystickBase');
      const knob = document.getElementById('joystickKnob');
      zone.classList.remove('hidden');
      base.style.left = `${clientX}px`;
      base.style.top = `${clientY}px`;
      knob.style.transform = `translate(0px, 0px)`;
    };

    const moveJoystick = (clientX, clientY) => {
      if (!this.joystick.active) return;
      const dx = clientX - this.joystick.startX;
      const dy = clientY - this.joystick.startY;
      const dist = Math.hypot(dx, dy);
      const maxD = this.joystick.maxDist;

      let nx = 0;
      let ny = 0;
      let clampedX = dx;
      let clampedY = dy;

      if (dist > 4) {
        nx = dx / dist;
        ny = dy / dist;
        const factor = Math.min(dist, maxD) / maxD;
        this.joystick.dx = nx * factor;
        this.joystick.dy = ny * factor;
        if (dist > maxD) {
          clampedX = nx * maxD;
          clampedY = ny * maxD;
        }
      } else {
        this.joystick.dx = 0;
        this.joystick.dy = 0;
      }

      const knob = document.getElementById('joystickKnob');
      knob.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
    };

    const endJoystick = () => {
      this.joystick.active = false;
      this.joystick.pointerId = null;
      this.joystick.dx = 0;
      this.joystick.dy = 0;
      document.getElementById('joystickZone').classList.add('hidden');
    };

    this.canvas.addEventListener('pointerdown', (e) => {
      if (this.state !== 'PLAYING') return;
      this.canvas.setPointerCapture(e.pointerId);
      startJoystick(e.clientX, e.clientY, e.pointerId);
    });

    this.canvas.addEventListener('pointermove', (e) => {
      if (!this.joystick.active || e.pointerId !== this.joystick.pointerId) return;
      moveJoystick(e.clientX, e.clientY);
    });

    this.canvas.addEventListener('pointerup', (e) => {
      if (e.pointerId === this.joystick.pointerId) endJoystick();
    });

    this.canvas.addEventListener('pointercancel', (e) => {
      if (e.pointerId === this.joystick.pointerId) endJoystick();
    });

    // UI Buttons
    document.getElementById('btnStartGame').addEventListener('click', () => {
      window.sound.playClick();
      this.startNewGame();
    });

    const updateMuteButtons = () => {
      const icon = window.sound.muted ? '🔇' : '🔊';
      document.getElementById('btnMuteLobby').textContent = icon;
      document.getElementById('btnMuteHud').textContent = icon;
    };
    updateMuteButtons();

    document.getElementById('btnMuteLobby').addEventListener('click', () => {
      window.sound.toggleMute();
      updateMuteButtons();
    });
    document.getElementById('btnMuteHud').addEventListener('click', () => {
      window.sound.toggleMute();
      updateMuteButtons();
    });

    document.getElementById('btnPauseHud').addEventListener('click', () => {
      window.sound.playClick();
      this.togglePause();
    });

    document.getElementById('btnResumeGame').addEventListener('click', () => {
      window.sound.playClick();
      this.togglePause();
    });

    document.getElementById('btnGiveUpGame').addEventListener('click', () => {
      window.sound.playClick();
      document.getElementById('pauseModal').classList.add('hidden');
      this.returnToLobby();
    });

    document.getElementById('btnRetryGame').addEventListener('click', () => {
      window.sound.playClick();
      document.getElementById('gameOverModal').classList.add('hidden');
      this.startNewGame();
    });

    document.getElementById('btnBackToLobby').addEventListener('click', () => {
      window.sound.playClick();
      document.getElementById('gameOverModal').classList.add('hidden');
      this.returnToLobby();
    });

    document.getElementById('btnCloseChest').addEventListener('click', () => {
      window.sound.playClick();
      document.getElementById('chestModal').classList.add('hidden');
      this.state = 'PLAYING';
    });

    // Lab Modal
    document.getElementById('btnOpenLab').addEventListener('click', () => {
      window.sound.playClick();
      this.renderLabModal();
      document.getElementById('labModal').classList.remove('hidden');
    });
    document.getElementById('btnCloseLab').addEventListener('click', () => {
      window.sound.playClick();
      document.getElementById('labModal').classList.add('hidden');
      this.renderLobby();
    });
    document.getElementById('btnResetLab').addEventListener('click', () => {
      window.sound.playClick();
      let refunded = 0;
      for (const upg of window.GAME_DATA.metaUpgrades) {
        const lvl = this.getUpgradeLevel(upg.id);
        for (let i = 0; i < lvl; i++) {
          refunded += Math.floor(upg.baseCost * Math.pow(1.45, i));
        }
      }
      this.saveData.coins += refunded;
      this.saveData.upgrades = {};
      this.saveProgress();
      this.renderLabModal();
    });

    // Guide Modal
    document.getElementById('btnOpenGuide').addEventListener('click', () => {
      window.sound.playClick();
      this.renderGuideModal();
      document.getElementById('guideModal').classList.remove('hidden');
    });
    document.getElementById('btnCloseGuide').addEventListener('click', () => {
      window.sound.playClick();
      document.getElementById('guideModal').classList.add('hidden');
    });

    // PWA Install Button
    const btnPwa = document.getElementById('btnInstallPwa');
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      btnPwa.textContent = '✓ 앱 모드 실행 중';
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      btnPwa.textContent = '📲 앱 즉시 설치';
    });

    btnPwa.addEventListener('click', async () => {
      window.sound.playClick();
      if (this.deferredPrompt) {
        this.deferredPrompt.prompt();
        await this.deferredPrompt.userChoice;
        this.deferredPrompt = null;
      } else {
        document.getElementById('pwaModal').classList.remove('hidden');
      }
    });

    document.getElementById('btnClosePwa').addEventListener('click', () => {
      window.sound.playClick();
      document.getElementById('pwaModal').classList.add('hidden');
    });
  }

  renderLobby() {
    document.getElementById('lobbyCoins').textContent = this.saveData.coins.toLocaleString();
    const grid = document.getElementById('starterGrid');
    grid.innerHTML = '';

    for (const st of window.GAME_DATA.starters) {
      const card = document.createElement('div');
      card.className = `starter-card ${st.id === this.selectedStarterId ? 'selected' : ''}`;
      const startW = window.GAME_DATA.weapons[st.startWeapon];

      const evoImgs = st.evolutions
        .map(ev => `<img src="./assets/sprites/${ev.dex}.png" alt="${ev.name}" title="Lv.${ev.level} ${ev.name} 진화" />`)
        .join('');

      card.innerHTML = `
        <span class="type-pill" style="background:${st.typeColor}">${st.type}</span>
        <div class="starter-sprite-row">
          <img class="starter-sprite" src="./assets/sprites/${st.dex}.png" alt="${st.name}" />
          <div class="evo-mini-sprites">${evoImgs}</div>
        </div>
        <div class="starter-name">${st.name}</div>
        <div class="starter-bonus">${st.bonusText}</div>
        <div class="starter-weapon-tag">${startW.icon} 시작: ${startW.name}</div>
      `;

      card.addEventListener('click', () => {
        window.sound.playClick();
        this.selectedStarterId = st.id;
        this.saveData.lastStarter = st.id;
        this.saveProgress();
        this.renderLobby();
      });

      grid.appendChild(card);
    }

    const sel = window.GAME_DATA.starters.find(s => s.id === this.selectedStarterId) || window.GAME_DATA.starters[0];
    const evoChainText = [sel.name, ...sel.evolutions.map(e => `Lv.${e.level} ${e.name}`)].join(' ➔ ');
    document.getElementById('selectedPartnerSummary').innerHTML = `
      <h3>파트너: ${sel.name} <small style="color:#cbd5e1;font-weight:600">(${evoChainText})</small></h3>
      <p>${sel.desc}</p>
    `;
  }

  renderLabModal() {
    document.getElementById('labCoins').textContent = this.saveData.coins.toLocaleString();
    const grid = document.getElementById('labGrid');
    grid.innerHTML = '';

    for (const upg of window.GAME_DATA.metaUpgrades) {
      const lvl = this.getUpgradeLevel(upg.id);
      const isMax = lvl >= upg.max;
      const cost = Math.floor(upg.baseCost * Math.pow(1.45, lvl));
      const canBuy = !isMax && this.saveData.coins >= cost;

      const item = document.createElement('div');
      item.className = 'lab-item';
      item.innerHTML = `
        <div class="lab-item-head">
          <span>${upg.icon} ${upg.name}</span>
          <span style="color:#fde047">Lv.${lvl}/${upg.max}</span>
        </div>
        <p class="choice-desc">${upg.desc}</p>
        <button class="lab-buy-btn" ${canBuy ? '' : 'disabled'}>
          ${isMax ? '최대 레벨 달성' : `🪙 ${cost} 강화하기`}
        </button>
      `;

      const btn = item.querySelector('button');
      if (canBuy) {
        btn.addEventListener('click', () => {
          window.sound.playLevelUp();
          this.saveData.coins -= cost;
          this.saveData.upgrades[upg.id] = lvl + 1;
          this.saveProgress();
          this.renderLabModal();
        });
      }
      grid.appendChild(item);
    }
  }

  renderGuideModal() {
    const box = document.getElementById('guideContent');
    box.innerHTML = '';
    for (const w of Object.values(window.GAME_DATA.weapons)) {
      if (!w.evolveWith) continue;
      const passive = window.GAME_DATA.passives[w.evolveWith];
      const evolved = window.GAME_DATA.weapons[w.evolveInto];
      const div = document.createElement('div');
      div.className = 'guide-item';
      div.innerHTML = `
        <div style="font-weight:900;color:#fde047;font-size:0.96rem">
          ${w.icon} ${w.name} (Lv.8) + ${passive.icon} ${passive.name}
        </div>
        <div style="font-weight:800;color:#38bdf8;margin-top:2px">
          ➔ ${evolved.icon} ${evolved.name}
        </div>
        <p class="choice-desc">${evolved.desc}</p>
      `;
      box.appendChild(div);
    }
  }

  startNewGame() {
    const starter = window.GAME_DATA.starters.find(s => s.id === this.selectedStarterId) || window.GAME_DATA.starters[0];
    document.getElementById('titleScreen').classList.add('hidden');
    document.getElementById('hudScreen').classList.remove('hidden');
    document.getElementById('bossHud').classList.add('hidden');

    // Apply Meta Upgrades
    const mightMeta = 1 + this.getUpgradeLevel('might') * 0.05;
    const hpMeta = 1 + this.getUpgradeLevel('hp') * 0.08;
    const speedMeta = 1 + this.getUpgradeLevel('speed') * 0.05;
    const magnetMeta = 1 + this.getUpgradeLevel('magnet') * 0.12;
    const greedMeta = 1 + this.getUpgradeLevel('greed') * 0.08;
    const revives = this.getUpgradeLevel('revive');

    const maxHp = Math.round(starter.stats.hp * hpMeta);

    this.player = {
      starter,
      name: starter.name,
      dex: starter.dex,
      evoIndex: -1,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      facing: 1,
      aimAngle: 0,
      hp: maxHp,
      maxHp: maxHp,
      baseSpeed: starter.stats.speed * speedMeta,
      baseMight: starter.stats.might * mightMeta,
      baseArmor: starter.stats.armor,
      baseRegen: starter.stats.regen,
      baseMagnet: starter.stats.magnet * magnetMeta,
      baseCooldown: starter.stats.cooldown,
      baseExpMult: starter.stats.expMult * greedMeta,
      greedMult: greedMeta,
      revivesLeft: revives,
      level: 1,
      exp: 0,
      nextExp: 10,
      invulnTimer: 0,
      walkAnim: 0,
      weapons: {}, // id -> { level, timer, angle }
      passives: {} // id -> level
    };

    this.addWeapon(starter.startWeapon);

    this.elapsedTime = 0;
    this.kills = 0;
    this.runCoins = 0;
    this.spawnTimer = 0;
    this.crateTimer = 4;
    this.spawnedBossTimes = new Set();
    this.activeBoss = null;

    // World Entities
    this.enemies = [];
    this.projectiles = [];
    this.enemyBullets = [];
    this.gems = [];
    this.pickups = []; // potions, magnets, coins, chests, crates
    this.groundZones = []; // burning meteor zones
    this.lightningBolts = [];
    this.particles = [];
    this.floatingTexts = [];
    this.shockwaves = [];

    this.state = 'PLAYING';
    this.updateHud();
    window.sound.startBGM();
  }

  returnToLobby() {
    this.state = 'LOBBY';
    window.sound.stopBGM();
    document.getElementById('hudScreen').classList.add('hidden');
    document.getElementById('titleScreen').classList.remove('hidden');
    this.renderLobby();
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      const st = this.getComputedStats();
      document.getElementById('pauseStatsBox').innerHTML = `
        <div class="stat-line"><span>현재 파트너</span><strong>${this.player.name} (Lv.${this.player.level})</strong></div>
        <div class="stat-line"><span>체력 (HP)</span><strong>${Math.ceil(this.player.hp)} / ${this.player.maxHp}</strong></div>
        <div class="stat-line"><span>공격력 배율</span><strong>${Math.round(st.might * 100)}%</strong></div>
        <div class="stat-line"><span>쿨타임 속도</span><strong>${Math.round((1 / st.cooldown) * 100)}%</strong></div>
        <div class="stat-line"><span>이동속도</span><strong>${Math.round(st.speed)}</strong></div>
        <div class="stat-line"><span>획득 범위</span><strong>${Math.round(st.magnet)}px</strong></div>
      `;
      document.getElementById('pauseModal').classList.remove('hidden');
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      document.getElementById('pauseModal').classList.add('hidden');
    }
  }

  getComputedStats() {
    const p = this.player;
    const mightLv = p.passives.charcoal || 0;
    const areaLv = p.passives.mystic_water || 0;
    const seedLv = p.passives.miracle_seed || 0;
    const hasteLv = p.passives.spell_tag || 0;
    const amountLv = p.passives.expert_belt || 0;
    const speedLv = p.passives.choice_scarf || 0;
    const magnetLv = p.passives.magnet_coil || 0;
    const luckyLv = p.passives.lucky_egg || 0;

    return {
      might: p.baseMight * (1 + mightLv * 0.15),
      area: 1 + areaLv * 0.14,
      regen: p.baseRegen + seedLv * 1.2,
      cooldown: p.baseCooldown * Math.pow(0.92, hasteLv),
      bonusAmount: Math.min(3, Math.ceil(amountLv * 0.6)),
      speed: p.baseSpeed * (1 + speedLv * 0.12),
      magnet: p.baseMagnet * (1 + magnetLv * 0.3),
      expMult: p.baseExpMult * (1 + luckyLv * 0.18),
      armor: p.baseArmor
    };
  }

  addWeapon(id) {
    const wDef = window.GAME_DATA.weapons[id];
    if (!wDef) return;

    if (this.player.weapons[id]) {
      this.player.weapons[id].level = Math.min(wDef.maxLevel, this.player.weapons[id].level + 1);
    } else {
      this.player.weapons[id] = {
        id,
        level: 1,
        timer: 0.1,
        angle: 0
      };
    }
    this.updateHudSlots();
  }

  evolveWeapon(baseId, evolvedId) {
    delete this.player.weapons[baseId];
    this.player.weapons[evolvedId] = {
      id: evolvedId,
      level: 1,
      timer: 0.1,
      angle: 0
    };
    window.sound.playEvolve();
    const evoDef = window.GAME_DATA.weapons[evolvedId];
    this.showToast(`🌟 궁극기 진화! [${evoDef.icon} ${evoDef.name}] 개방!`);
    this.shockwaves.push({ x: this.player.x, y: this.player.y, r: 10, maxR: 260, color: '#facc15', alpha: 1 });
    this.updateHudSlots();
  }

  addPassive(id) {
    const pDef = window.GAME_DATA.passives[id];
    if (!pDef) return;
    const prev = this.player.passives[id] || 0;
    this.player.passives[id] = Math.min(pDef.maxLevel, prev + 1);

    if (id === 'miracle_seed') {
      const bonusHp = Math.round(this.player.starter.stats.hp * 0.15);
      this.player.maxHp += bonusHp;
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + bonusHp);
    }
    this.updateHudSlots();
  }

  showToast(msg) {
    const banner = document.getElementById('toastBanner');
    banner.textContent = msg;
    banner.classList.remove('hidden');
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      banner.classList.add('hidden');
    }, 3400);
  }

  updateHudSlots() {
    const wBox = document.getElementById('weaponSlots');
    const pBox = document.getElementById('passiveSlots');
    wBox.innerHTML = '';
    pBox.innerHTML = '';

    const wIds = Object.keys(this.player.weapons);
    for (let i = 0; i < 6; i++) {
      const div = document.createElement('div');
      const id = wIds[i];
      if (id) {
        const w = this.player.weapons[id];
        const def = window.GAME_DATA.weapons[id];
        div.className = `slot-box ${def.isEvolved ? 'evolved' : ''}`;
        div.innerHTML = `${def.icon}<span class="slot-lvl">${def.isEvolved ? 'MAX' : w.level}</span>`;
      } else {
        div.className = 'slot-box';
      }
      wBox.appendChild(div);
    }

    const pIds = Object.keys(this.player.passives);
    for (let i = 0; i < 6; i++) {
      const div = document.createElement('div');
      const id = pIds[i];
      if (id) {
        const lvl = this.player.passives[id];
        const def = window.GAME_DATA.passives[id];
        div.className = 'slot-box';
        div.innerHTML = `${def.icon}<span class="slot-lvl">${lvl}</span>`;
      } else {
        div.className = 'slot-box';
      }
      pBox.appendChild(div);
    }
  }

  updateHud() {
    if (!this.player) return;
    const pct = Math.min(100, (this.player.exp / this.player.nextExp) * 100);
    document.getElementById('expBarFill').style.width = `${pct}%`;
    document.getElementById('expLevelText').textContent = `Lv. ${this.player.level} · ${this.player.name}`;

    const mins = Math.floor(this.elapsedTime / 60);
    const secs = Math.floor(this.elapsedTime % 60);
    document.getElementById('hudTimer').textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    document.getElementById('hudKills').textContent = this.kills.toLocaleString();
    document.getElementById('hudCoins').textContent = this.runCoins.toLocaleString();

    if (this.activeBoss && this.activeBoss.hp > 0) {
      document.getElementById('bossHud').classList.remove('hidden');
      document.getElementById('bossNameText').textContent = this.activeBoss.name;
      const bossPct = Math.max(0, (this.activeBoss.hp / this.activeBoss.maxHp) * 100);
      document.getElementById('bossHpFill').style.width = `${bossPct}%`;
    } else {
      document.getElementById('bossHud').classList.add('hidden');
    }
  }

  checkPokemonEvolution() {
    const evos = this.player.starter.evolutions;
    for (let i = 0; i < evos.length; i++) {
      if (i > this.player.evoIndex && this.player.level >= evos[i].level) {
        const ev = evos[i];
        const oldName = this.player.name;
        this.player.evoIndex = i;
        this.player.name = ev.name;
        this.player.dex = ev.dex;
        this.player.maxHp += ev.hpBonus;
        this.player.hp = this.player.maxHp;
        this.player.baseMight += ev.mightBonus;
        this.player.baseSpeed += ev.speedBonus;

        window.sound.playEvolve();
        this.showToast(`✨ 오잉?! ${oldName}의 상태가...! [${ev.name}](으)로 진화했다!`);
        this.shockwaves.push({
          x: this.player.x,
          y: this.player.y,
          r: 12,
          maxR: 280,
          color: '#38bdf8',
          alpha: 1
        });
      }
    }
  }

  gainExp(amount) {
    const st = this.getComputedStats();
    this.player.exp += amount * st.expMult;
    if (this.player.exp >= this.player.nextExp) {
      this.player.exp -= this.player.nextExp;
      this.player.level++;
      this.player.nextExp = Math.floor(10 + this.player.level * 8 + Math.pow(this.player.level, 1.38));
      this.checkPokemonEvolution();
      this.triggerLevelUpModal();
    }
    this.updateHud();
  }

  getAvailableUpgrades() {
    const pool = [];
    const wCount = Object.keys(this.player.weapons).length;
    const pCount = Object.keys(this.player.passives).length;

    // 1. Check Weapon Evolutions first!
    for (const [wId, wState] of Object.entries(this.player.weapons)) {
      const wDef = window.GAME_DATA.weapons[wId];
      if (wDef.evolveWith && wState.level >= wDef.maxLevel && (this.player.passives[wDef.evolveWith] || 0) >= 1) {
        const evoDef = window.GAME_DATA.weapons[wDef.evolveInto];
        pool.push({
          type: 'evolve',
          baseId: wId,
          id: evoDef.id,
          name: evoDef.name,
          icon: evoDef.icon,
          tag: '🌟 궁극기 진화',
          tagClass: 'evo',
          desc: evoDef.desc,
          weight: 100
        });
      }
    }

    // 2. Weapons
    for (const wDef of Object.values(window.GAME_DATA.weapons)) {
      if (wDef.isEvolved) continue;
      // Avoid offering base weapon if its evolved version is already owned
      if (wDef.evolveInto && this.player.weapons[wDef.evolveInto]) continue;

      const owned = this.player.weapons[wDef.id];
      if (owned) {
        if (owned.level < wDef.maxLevel) {
          pool.push({
            type: 'weapon',
            id: wDef.id,
            name: wDef.name,
            icon: wDef.icon,
            tag: `Lv.${owned.level} ➔ Lv.${owned.level + 1}`,
            tagClass: '',
            desc: `기술 위력 +20% 및 발사체/범위 강화 (${wDef.desc})`,
            weight: 14
          });
        }
      } else if (wCount < 6) {
        pool.push({
          type: 'weapon',
          id: wDef.id,
          name: wDef.name,
          icon: wDef.icon,
          tag: 'NEW 기술',
          tagClass: 'new',
          desc: wDef.desc,
          weight: 10
        });
      }
    }

    // 3. Passives
    for (const pDef of Object.values(window.GAME_DATA.passives)) {
      const ownedLvl = this.player.passives[pDef.id] || 0;
      if (ownedLvl > 0) {
        if (ownedLvl < pDef.maxLevel) {
          pool.push({
            type: 'passive',
            id: pDef.id,
            name: pDef.name,
            icon: pDef.icon,
            tag: `Lv.${ownedLvl} ➔ Lv.${ownedLvl + 1}`,
            tagClass: '',
            desc: pDef.desc,
            weight: 12
          });
        }
      } else if (pCount < 6) {
        pool.push({
          type: 'passive',
          id: pDef.id,
          name: pDef.name,
          icon: pDef.icon,
          tag: 'NEW 도구',
          tagClass: 'new',
          desc: pDef.desc,
          weight: 9
        });
      }
    }

    // Shuffle and pick up to 3 (always include evolutions if available)
    const evolutions = pool.filter(p => p.type === 'evolve');
    const others = pool.filter(p => p.type !== 'evolve').sort(() => Math.random() - 0.5);
    const selected = [...evolutions, ...others].slice(0, 3);

    if (selected.length === 0) {
      selected.push(
        {
          type: 'heal',
          id: 'potion',
          name: '좋은상처약 회복',
          icon: '🧪',
          tag: '회복',
          tagClass: 'new',
          desc: '최대 체력의 50%를 즉시 회복합니다.'
        },
        {
          type: 'gold',
          id: 'coin_bag',
          name: '포켓코인 주머니',
          icon: '🪙',
          tag: '보너스',
          tagClass: 'evo',
          desc: '포켓코인 +45개를 즉시 획득합니다.'
        }
      );
    }

    return selected;
  }

  triggerLevelUpModal() {
    this.state = 'LEVELUP';
    this.joystick.active = false;
    document.getElementById('joystickZone').classList.add('hidden');
    window.sound.playLevelUp();

    const choices = this.getAvailableUpgrades();
    const listEl = document.getElementById('upgradeChoices');
    listEl.innerHTML = '';

    for (const c of choices) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `choice-item ${c.type === 'evolve' ? 'evolve-choice' : ''}`;
      btn.innerHTML = `
        <div class="choice-icon">${c.icon}</div>
        <div class="choice-body">
          <div class="choice-title-row">
            <strong>${c.name}</strong>
            <span class="choice-tag ${c.tagClass}">${c.tag}</span>
          </div>
          <p class="choice-desc">${c.desc}</p>
        </div>
      `;

      btn.addEventListener('click', () => {
        window.sound.playClick();
        if (c.type === 'evolve') {
          this.evolveWeapon(c.baseId, c.id);
        } else if (c.type === 'weapon') {
          this.addWeapon(c.id);
        } else if (c.type === 'passive') {
          this.addPassive(c.id);
        } else if (c.type === 'heal') {
          this.player.hp = Math.min(this.player.maxHp, this.player.hp + this.player.maxHp * 0.5);
        } else if (c.type === 'gold') {
          this.runCoins += 45;
          this.saveData.coins += 45;
          this.saveProgress();
        }

        document.getElementById('levelUpModal').classList.add('hidden');
        this.state = 'PLAYING';
        // Check if player still has enough exp for another level
        if (this.player.exp >= this.player.nextExp) {
          this.gainExp(0);
        }
      });

      listEl.appendChild(btn);
    }

    document.getElementById('levelUpModal').classList.remove('hidden');
  }

  openTreasureChest() {
    this.state = 'CHEST';
    this.joystick.active = false;
    document.getElementById('joystickZone').classList.add('hidden');
    window.sound.playEvolve();

    const choices = this.getAvailableUpgrades();
    const reward = choices[0];
    let rewardTitle = '';
    let rewardDesc = '';

    if (reward.type === 'evolve') {
      this.evolveWeapon(reward.baseId, reward.id);
      rewardTitle = `${reward.icon} ${reward.name} (궁극기 진화!)`;
      rewardDesc = reward.desc;
    } else if (reward.type === 'weapon') {
      this.addWeapon(reward.id);
      rewardTitle = `${reward.icon} ${reward.name} (${reward.tag})`;
      rewardDesc = reward.desc;
    } else if (reward.type === 'passive') {
      this.addPassive(reward.id);
      rewardTitle = `${reward.icon} ${reward.name} (${reward.tag})`;
      rewardDesc = reward.desc;
    } else {
      rewardTitle = '🧪 풀회복약 & 대량 코인';
      rewardDesc = '모든 기술이 최대 레벨에 도달하여 체력 100% 회복 및 추가 코인을 획득했습니다!';
    }

    const bonusCoins = Math.round((35 + Math.floor(this.elapsedTime * 0.25)) * this.player.greedMult);
    this.runCoins += bonusCoins;
    this.saveData.coins += bonusCoins;
    this.player.hp = Math.min(this.player.maxHp, this.player.hp + this.player.maxHp * 0.35);
    this.saveProgress();

    document.getElementById('chestRewardContent').innerHTML = `
      <div style="text-align:center;font-size:1.15rem;font-weight:900;color:#fde047">${rewardTitle}</div>
      <p style="text-align:center;color:#cbd5e1;font-size:0.86rem">${rewardDesc}</p>
      <div class="stat-line"><span>보너스 포켓코인</span><strong style="color:#fde047">+🪙 ${bonusCoins}</strong></div>
      <div class="stat-line"><span>체력 회복</span><strong style="color:#4ade80">+35% HP 회복</strong></div>
    `;
    document.getElementById('chestModal').classList.remove('hidden');
    this.updateHud();
  }

  loop(now) {
    const dt = Math.min(0.05, (now - this.lastFrameTime) / 1000);
    this.lastFrameTime = now;

    if (this.state === 'PLAYING') {
      this.update(dt);
    }
    if (this.state !== 'LOBBY') {
      this.draw();
    }

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    this.elapsedTime += dt;
    const p = this.player;
    const st = this.getComputedStats();

    // Regen
    if (p.hp < p.maxHp) {
      p.hp = Math.min(p.maxHp, p.hp + st.regen * dt);
    }
    if (p.invulnTimer > 0) p.invulnTimer -= dt;

    // Movement Input (Keyboard + Virtual Joystick)
    let moveX = 0;
    let moveY = 0;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) moveY -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) moveY += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveX -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) moveX += 1;

    if (moveX !== 0 || moveY !== 0) {
      const len = Math.hypot(moveX, moveY);
      moveX /= len;
      moveY /= len;
    } else if (this.joystick.active) {
      moveX = this.joystick.dx;
      moveY = this.joystick.dy;
    }

    p.vx = moveX * st.speed;
    p.vy = moveY * st.speed;
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    if (Math.abs(moveX) > 0.05) {
      p.facing = moveX > 0 ? 1 : -1;
    }
    if (Math.hypot(moveX, moveY) > 0.05) {
      p.aimAngle = Math.atan2(moveY, moveX);
      p.walkAnim += dt * 12;
    }

    // Spawn Waves & Bosses
    this.updateSpawning(dt);

    // Update Weapons
    this.updateWeapons(dt, st);

    // Update Projectiles
    this.updateProjectiles(dt);

    // Update Ground Zones (Draco Meteor burn pools)
    for (let i = this.groundZones.length - 1; i >= 0; i--) {
      const gz = this.groundZones[i];
      gz.duration -= dt;
      gz.tickTimer -= dt;
      if (gz.tickTimer <= 0) {
        gz.tickTimer = 0.35;
        for (const e of this.enemies) {
          if (Math.hypot(e.x - gz.x, e.y - gz.y) <= gz.radius + e.radius) {
            this.damageEnemy(e, gz.damage, '#fb7185');
          }
        }
      }
      if (gz.duration <= 0) this.groundZones.splice(i, 1);
    }

    // Update Enemies
    this.updateEnemies(dt, st);

    // Update Enemy Bullets (Boss attacks)
    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const b = this.enemyBullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      if (Math.hypot(b.x - p.x, b.y - p.y) < b.r + 16) {
        this.damagePlayer(b.damage);
        this.enemyBullets.splice(i, 1);
        continue;
      }
      if (b.life <= 0) this.enemyBullets.splice(i, 1);
    }

    // Update Gems & Pickups
    this.updatePickupsAndGems(dt, st);

    // Update FX
    for (let i = this.lightningBolts.length - 1; i >= 0; i--) {
      this.lightningBolts[i].life -= dt;
      if (this.lightningBolts[i].life <= 0) this.lightningBolts.splice(i, 1);
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.life -= dt;
      if (pt.life <= 0) this.particles.splice(i, 1);
    }
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 28 * dt;
      ft.life -= dt;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.r += (sw.maxR - sw.r) * 8 * dt;
      sw.alpha -= 1.8 * dt;
      if (sw.alpha <= 0) this.shockwaves.splice(i, 1);
    }

    this.updateHud();
  }

  updateSpawning(dt) {
    // Check Boss Spawns
    for (const bossDef of window.GAME_DATA.bosses) {
      if (this.elapsedTime >= bossDef.time && !this.spawnedBossTimes.has(bossDef.time)) {
        this.spawnedBossTimes.add(bossDef.time);
        this.spawnBoss(bossDef);
      }
    }

    // Current Wave
    const wave = window.GAME_DATA.waves.find(w => this.elapsedTime >= w.start && this.elapsedTime < w.end)
      || window.GAME_DATA.waves[window.GAME_DATA.waves.length - 1];

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.enemies.length < wave.maxEnemies) {
      this.spawnTimer = wave.spawnInterval;
      const count = this.elapsedTime > 180 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        const template = wave.pool[Math.floor(Math.random() * wave.pool.length)];
        this.spawnEnemy(template);
      }
    }

    // Spawn Pokéball field crates periodically
    this.crateTimer -= dt;
    if (this.crateTimer <= 0) {
      this.crateTimer = 11;
      if (this.pickups.filter(p => p.type === 'crate').length < 6) {
        const ang = Math.random() * Math.PI * 2;
        const dist = 280 + Math.random() * 240;
        this.pickups.push({
          type: 'crate',
          x: this.player.x + Math.cos(ang) * dist,
          y: this.player.y + Math.sin(ang) * dist,
          hp: 25
        });
      }
    }
  }

  spawnEnemy(template) {
    const margin = 60;
    const halfW = this.width / 2 + margin;
    const halfH = this.height / 2 + margin;
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.hypot(halfW, halfH);

    const timeScale = 1 + (this.elapsedTime / 60) * 0.24;
    const hp = Math.round(template.hp * timeScale);

    this.enemies.push({
      dex: template.dex,
      name: template.name,
      x: this.player.x + Math.cos(angle) * dist,
      y: this.player.y + Math.sin(angle) * dist,
      hp,
      maxHp: hp,
      speed: template.speed,
      damage: template.damage,
      exp: template.exp,
      scale: template.scale || 1,
      radius: 18 * (template.scale || 1),
      flashTimer: 0,
      slowTimer: 0,
      isBoss: false
    });
  }

  spawnBoss(bossDef) {
    window.sound.playBossAlert();
    this.showToast(`⚠️ 경고! 야생의 [${bossDef.name}] 출현!`);
    const angle = Math.random() * Math.PI * 2;
    const dist = 340;
    const boss = {
      dex: bossDef.dex,
      name: bossDef.name,
      x: this.player.x + Math.cos(angle) * dist,
      y: this.player.y + Math.sin(angle) * dist,
      hp: bossDef.hp,
      maxHp: bossDef.hp,
      speed: bossDef.speed,
      damage: bossDef.damage,
      exp: 60,
      scale: bossDef.scale,
      radius: 34,
      flashTimer: 0,
      slowTimer: 0,
      isBoss: true,
      isFinal: !!bossDef.isFinal,
      skillTimer: 4.0
    };
    this.enemies.push(boss);
    this.activeBoss = boss;
  }

  findNearestEnemy(fromX, fromY, maxDist = 9999, excludeSet = null) {
    let best = null;
    let bestD = maxDist;
    for (const e of this.enemies) {
      if (excludeSet && excludeSet.has(e)) continue;
      const d = Math.hypot(e.x - fromX, e.y - fromY);
      if (d < bestD) {
        bestD = d;
        best = e;
      }
    }
    return best;
  }

  updateWeapons(dt, st) {
    const p = this.player;

    for (const w of Object.values(p.weapons)) {
      const def = window.GAME_DATA.weapons[w.id];
      const lvl = w.level;
      const dmgMult = st.might * (1 + (lvl - 1) * 0.22);

      // Orbiting weapon: Aqua Ring / Hydro Cannon
      if (w.id === 'aquaring' || w.id === 'hydrocannon') {
        const rotSpd = def.base.rotSpeed * (1 + (lvl - 1) * 0.08);
        w.angle = (w.angle + rotSpd * dt) % (Math.PI * 2);
        const orbCount = def.base.count + Math.floor(lvl / 3) + st.bonusAmount;
        const radius = def.base.radius * st.area;
        const orbSize = def.base.size * st.area;

        w.timer -= dt;
        if (w.timer <= 0) {
          w.timer = 0.22;
          for (let i = 0; i < orbCount; i++) {
            const ang = w.angle + (Math.PI * 2 * i) / orbCount;
            const ox = p.x + Math.cos(ang) * radius;
            const oy = p.y + Math.sin(ang) * radius;
            for (const e of this.enemies) {
              if (Math.hypot(e.x - ox, e.y - oy) < orbSize + e.radius) {
                this.damageEnemy(e, def.base.damage * dmgMult * 0.55, def.color, 26);
              }
            }
            // Hit field crates
            this.checkCrateHit(ox, oy, orbSize + 15);
          }
        }
        continue;
      }

      // Aura weapon: Giga Drain / Frenzy Plant
      if (w.id === 'gigadrain' || w.id === 'frenzyplant') {
        w.timer -= dt;
        const radius = (def.base.radius + (lvl - 1) * 10) * st.area;
        if (w.timer <= 0) {
          w.timer = def.base.cooldown * st.cooldown;
          let hitAny = false;
          for (const e of this.enemies) {
            if (Math.hypot(e.x - p.x, e.y - p.y) <= radius + e.radius) {
              this.damageEnemy(e, def.base.damage * dmgMult, def.color, 8);
              e.slowTimer = 0.8;
              hitAny = true;
            }
          }
          this.checkCrateHit(p.x, p.y, radius);
          if (hitAny && Math.random() < def.base.healChance) {
            p.hp = Math.min(p.maxHp, p.hp + 1.5);
          }
        }
        continue;
      }

      // Cooldown-based active weapons
      w.timer -= dt;
      if (w.timer > 0) continue;
      w.timer = def.base.cooldown * Math.pow(0.95, lvl - 1) * st.cooldown;

      // 1. Thunderbolt / Volt Tackle (Chain Lightning)
      if (w.id === 'thunderbolt' || w.id === 'volttackle') {
        const count = def.base.count + Math.floor(lvl / 3) + st.bonusAmount;
        const chains = def.base.chains + Math.floor(lvl / 2);
        const dmg = def.base.damage * dmgMult;

        for (let s = 0; s < count; s++) {
          const hitSet = new Set();
          let curX = p.x;
          let curY = p.y;
          for (let c = 0; c < chains; c++) {
            const target = this.findNearestEnemy(curX, curY, def.base.range * st.area, hitSet);
            if (!target) break;
            hitSet.add(target);
            this.damageEnemy(target, dmg * Math.pow(0.85, c), def.color, 18);
            this.lightningBolts.push({
              x1: curX,
              y1: curY,
              x2: target.x,
              y2: target.y,
              color: def.color,
              life: 0.16
            });
            curX = target.x;
            curY = target.y;
          }
        }
      }

      // 2. Flamethrower / Blast Burn
      else if (w.id === 'flamethrower' || w.id === 'blastburn') {
        const count = def.base.count + Math.floor(lvl / 2) + st.bonusAmount;
        const nearest = this.findNearestEnemy(p.x, p.y, 600);
        const baseAngle = nearest ? Math.atan2(nearest.y - p.y, nearest.x - p.x) : p.aimAngle;

        for (let i = 0; i < count; i++) {
          const spread = w.id === 'blastburn'
            ? (Math.PI * 2 * i) / count + this.elapsedTime
            : baseAngle + (i - (count - 1) / 2) * 0.16;

          this.projectiles.push({
            kind: 'fire',
            x: p.x,
            y: p.y,
            vx: Math.cos(spread) * def.base.speed,
            vy: Math.sin(spread) * def.base.speed,
            r: def.base.size * st.area,
            damage: def.base.damage * dmgMult,
            pierce: def.base.pierce + Math.floor(lvl / 2),
            color: def.color,
            life: 1.6,
            hitSet: new Set()
          });
        }
      }

      // 3. Shadow Ball / Dark Void (Bouncing / Vortex)
      else if (w.id === 'shadowball' || w.id === 'darkvoid') {
        const count = def.base.count + Math.floor(lvl / 3) + st.bonusAmount;
        for (let i = 0; i < count; i++) {
          const target = this.enemies[Math.floor(Math.random() * this.enemies.length)] || null;
          const ang = target
            ? Math.atan2(target.y - p.y, target.x - p.x) + (i - (count - 1) / 2) * 0.2
            : p.aimAngle + (i * Math.PI * 2) / count;

          this.projectiles.push({
            kind: w.id === 'darkvoid' ? 'darkvoid' : 'bounce',
            x: p.x,
            y: p.y,
            vx: Math.cos(ang) * def.base.speed,
            vy: Math.sin(ang) * def.base.speed,
            r: def.base.size * st.area,
            damage: def.base.damage * dmgMult,
            bounces: def.base.bounces + Math.floor(lvl / 2),
            color: def.color,
            life: 2.8,
            hitSet: new Set()
          });
        }
      }

      // 4. Aura Sphere / Aura Storm (Boomerang)
      else if (w.id === 'aurasphere' || w.id === 'aurastorm') {
        const count = def.base.count + Math.floor(lvl / 2) + st.bonusAmount;
        const nearest = this.findNearestEnemy(p.x, p.y, 500);
        const baseAng = nearest ? Math.atan2(nearest.y - p.y, nearest.x - p.x) : p.aimAngle;

        for (let i = 0; i < count; i++) {
          const ang = baseAng + (i * Math.PI * 2) / count;
          this.projectiles.push({
            kind: 'boomerang',
            x: p.x,
            y: p.y,
            vx: Math.cos(ang) * def.base.speed,
            vy: Math.sin(ang) * def.base.speed,
            dirX: Math.cos(ang),
            dirY: Math.sin(ang),
            speed: def.base.speed,
            r: def.base.size * st.area,
            damage: def.base.damage * dmgMult,
            color: def.color,
            elapsed: 0,
            life: 2.3,
            hitSet: new Set()
          });
        }
      }

      // 5. Draco Meteor (Meteors + Burn Pools)
      else if (w.id === 'dracometeor') {
        const count = def.base.count + Math.floor(lvl / 2) + st.bonusAmount;
        const radius = (def.base.radius + lvl * 5) * st.area;
        for (let i = 0; i < count; i++) {
          const randEnemy = this.enemies[Math.floor(Math.random() * this.enemies.length)];
          const tx = randEnemy ? randEnemy.x : p.x + (Math.random() - 0.5) * 320;
          const ty = randEnemy ? randEnemy.y : p.y + (Math.random() - 0.5) * 320;

          this.shockwaves.push({ x: tx, y: ty, r: 8, maxR: radius, color: '#fb7185', alpha: 1 });
          for (const e of this.enemies) {
            if (Math.hypot(e.x - tx, e.y - ty) <= radius + e.radius) {
              this.damageEnemy(e, def.base.damage * dmgMult, '#fb7185', 30);
            }
          }
          this.groundZones.push({
            x: tx,
            y: ty,
            radius,
            damage: def.base.damage * dmgMult * 0.35,
            duration: def.base.duration + lvl * 0.2,
            tickTimer: 0.25
          });
        }
      }

      // 6. Psychic Wave (Radial Pulse + Knockback)
      else if (w.id === 'psychicwave') {
        const radius = (def.base.radius + lvl * 14) * st.area;
        this.shockwaves.push({ x: p.x, y: p.y, r: 15, maxR: radius, color: '#f472b6', alpha: 1 });
        for (const e of this.enemies) {
          const d = Math.hypot(e.x - p.x, e.y - p.y);
          if (d <= radius + e.radius) {
            this.damageEnemy(e, def.base.damage * dmgMult, '#f472b6', def.base.knockback);
          }
        }
        this.checkCrateHit(p.x, p.y, radius);
      }

      // 7. Swift (360 Star Burst)
      else if (w.id === 'swift') {
        const count = def.base.count + lvl + st.bonusAmount;
        for (let i = 0; i < count; i++) {
          const ang = (Math.PI * 2 * i) / count + this.elapsedTime * 0.5;
          this.projectiles.push({
            kind: 'star',
            x: p.x,
            y: p.y,
            vx: Math.cos(ang) * def.base.speed,
            vy: Math.sin(ang) * def.base.speed,
            r: def.base.size * st.area,
            damage: def.base.damage * dmgMult,
            pierce: 2,
            color: def.color,
            life: 1.5,
            hitSet: new Set()
          });
        }
      }
    }
  }

  updateProjectiles(dt) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const pr = this.projectiles[i];
      pr.life -= dt;

      if (pr.kind === 'boomerang') {
        pr.elapsed += dt;
        // Reverse velocity smoothly after 0.55s
        const factor = 1 - pr.elapsed * 2.1;
        pr.x += pr.dirX * pr.speed * factor * dt;
        pr.y += pr.dirY * pr.speed * factor * dt;
        if (Math.abs(pr.elapsed - 0.55) < dt) {
          pr.hitSet.clear(); // Can hit enemies again on return trip!
        }
      } else {
        pr.x += pr.vx * dt;
        pr.y += pr.vy * dt;
      }

      // Dark Void pulls nearby enemies in
      if (pr.kind === 'darkvoid') {
        for (const e of this.enemies) {
          const d = Math.hypot(pr.x - e.x, pr.y - e.y);
          if (d < 130 && d > 5) {
            e.x += ((pr.x - e.x) / d) * 90 * dt;
            e.y += ((pr.y - e.y) / d) * 90 * dt;
          }
        }
      }

      this.checkCrateHit(pr.x, pr.y, pr.r + 12);

      // Collision with enemies
      for (const e of this.enemies) {
        if (pr.hitSet.has(e)) continue;
        if (Math.hypot(pr.x - e.x, pr.y - e.y) <= pr.r + e.radius) {
          pr.hitSet.add(e);
          this.damageEnemy(e, pr.damage, pr.color, 20);

          if (pr.kind === 'bounce' || pr.kind === 'darkvoid') {
            if (pr.bounces > 0) {
              pr.bounces--;
              const nextTarget = this.findNearestEnemy(pr.x, pr.y, 320, pr.hitSet);
              if (nextTarget) {
                const spd = Math.hypot(pr.vx, pr.vy);
                const ang = Math.atan2(nextTarget.y - pr.y, nextTarget.x - pr.x);
                pr.vx = Math.cos(ang) * spd;
                pr.vy = Math.sin(ang) * spd;
              } else {
                pr.vx = -pr.vx;
                pr.vy = -pr.vy;
              }
            } else {
              pr.life = 0;
              break;
            }
          } else if (pr.kind !== 'boomerang') {
            pr.pierce--;
            if (pr.pierce <= 0) {
              pr.life = 0;
              break;
            }
          }
        }
      }

      if (pr.life <= 0) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  checkCrateHit(x, y, radius) {
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const pk = this.pickups[i];
      if (pk.type !== 'crate') continue;
      if (Math.hypot(pk.x - x, pk.y - y) <= radius + 16) {
        this.pickups.splice(i, 1);
        window.sound.playHit();
        // Spawn random field item!
        const roll = Math.random();
        let dropType = 'coin';
        if (roll < 0.35) dropType = 'potion';
        else if (roll < 0.55) dropType = 'magnet';
        else if (roll < 0.72) dropType = 'bomb';

        this.pickups.push({ type: dropType, x: pk.x, y: pk.y });
      }
    }
  }

  damageEnemy(e, rawDamage, color = '#fff', knockback = 14) {
    const dmg = Math.max(1, Math.round(rawDamage * (0.92 + Math.random() * 0.16)));
    e.hp -= dmg;
    e.flashTimer = 0.1;
    window.sound.playHit();

    // Knockback away from player
    const dx = e.x - this.player.x;
    const dy = e.y - this.player.y;
    const d = Math.hypot(dx, dy) || 1;
    const kb = e.isBoss ? knockback * 0.15 : knockback;
    e.x += (dx / d) * kb;
    e.y += (dy / d) * kb;

    if (this.floatingTexts.length < 45) {
      this.floatingTexts.push({
        x: e.x + (Math.random() - 0.5) * 16,
        y: e.y - e.radius,
        text: String(dmg),
        color,
        life: 0.55
      });
    }
  }

  damagePlayer(rawDamage) {
    const p = this.player;
    if (p.invulnTimer > 0) return;
    const st = this.getComputedStats();
    const dmg = Math.max(1, rawDamage - st.armor);
    p.hp -= dmg;
    p.invulnTimer = 0.38;
    window.sound.playHit();

    if (p.hp <= 0) {
      if (p.revivesLeft > 0) {
        p.revivesLeft--;
        p.hp = Math.round(p.maxHp * 0.6);
        p.invulnTimer = 2.5;
        window.sound.playEvolve();
        this.showToast('✨ 기력의덩어리 발동! 체력 60%로 부활했습니다!');
        this.shockwaves.push({ x: p.x, y: p.y, r: 10, maxR: 320, color: '#facc15', alpha: 1 });
        for (const e of this.enemies) {
          const d = Math.hypot(e.x - p.x, e.y - p.y) || 1;
          if (d < 280 && !e.isBoss) {
            e.x += ((e.x - p.x) / d) * 180;
            e.y += ((e.y - p.y) / d) * 180;
          }
        }
      } else {
        this.triggerGameOver(false);
      }
    }
  }

  updateEnemies(dt) {
    const p = this.player;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];

      if (e.hp <= 0) {
        this.kills++;
        // Spawn particles
        for (let k = 0; k < 5; k++) {
          const ang = Math.random() * Math.PI * 2;
          const spd = 40 + Math.random() * 80;
          this.particles.push({
            x: e.x,
            y: e.y,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd,
            color: e.isBoss ? '#facc15' : '#94a3b8',
            r: e.isBoss ? 5 : 3,
            life: 0.35
          });
        }

        // Drop Rare Candy (EXP Gem)
        this.gems.push({
          x: e.x,
          y: e.y,
          exp: e.exp,
          magnetized: false
        });

        // Coin chance
        if (Math.random() < 0.08) {
          this.pickups.push({ type: 'coin', x: e.x + 8, y: e.y });
        }

        // Boss Rewards
        if (e.isBoss) {
          this.pickups.push({ type: 'chest', x: e.x, y: e.y });
          if (this.activeBoss === e) this.activeBoss = null;
          if (e.isFinal) {
            this.enemies.splice(i, 1);
            this.triggerGameOver(true);
            return;
          }
        }

        this.enemies.splice(i, 1);
        continue;
      }

      if (e.flashTimer > 0) e.flashTimer -= dt;
      if (e.slowTimer > 0) e.slowTimer -= dt;

      // Move toward player
      const dx = p.x - e.x;
      const dy = p.y - e.y;
      const dist = Math.hypot(dx, dy) || 1;

      // Despawn very distant regular enemies and respawn closer
      if (!e.isBoss && dist > Math.max(this.width, this.height) * 1.15) {
        const ang = Math.random() * Math.PI * 2;
        const r = Math.hypot(this.width / 2, this.height / 2) + 40;
        e.x = p.x + Math.cos(ang) * r;
        e.y = p.y + Math.sin(ang) * r;
        continue;
      }

      const spd = e.speed * (e.slowTimer > 0 ? 0.55 : 1);
      e.x += (dx / dist) * spd * dt;
      e.y += (dy / dist) * spd * dt;

      // Boss radial bullet pattern
      if (e.isBoss) {
        e.skillTimer -= dt;
        if (e.skillTimer <= 0) {
          e.skillTimer = e.isFinal ? 2.8 : 4.2;
          const bulletCount = e.isFinal ? 10 : 6;
          const baseAng = Math.atan2(dy, dx);
          for (let b = 0; b < bulletCount; b++) {
            const ang = baseAng + (Math.PI * 2 * b) / bulletCount;
            this.enemyBullets.push({
              x: e.x,
              y: e.y,
              vx: Math.cos(ang) * 195,
              vy: Math.sin(ang) * 195,
              r: 8,
              damage: Math.round(e.damage * 0.75),
              life: 3.5
            });
          }
        }
      }

      // Soft separation with nearby enemies
      const next = this.enemies[(i + 1) % this.enemies.length];
      if (next && next !== e) {
        const sx = e.x - next.x;
        const sy = e.y - next.y;
        const sd = Math.hypot(sx, sy);
        const minD = (e.radius + next.radius) * 0.75;
        if (sd > 0 && sd < minD) {
          const push = (minD - sd) * 0.35;
          e.x += (sx / sd) * push;
          e.y += (sy / sd) * push;
        }
      }

      // Player collision
      if (dist < e.radius + 15) {
        this.damagePlayer(e.damage);
      }
    }
  }

  updatePickupsAndGems(dt, st) {
    const p = this.player;

    // Update EXP Gems (Rare Candies)
    for (let i = this.gems.length - 1; i >= 0; i--) {
      const g = this.gems[i];
      const d = Math.hypot(p.x - g.x, p.y - g.y);
      if (d <= st.magnet) {
        g.magnetized = true;
      }
      if (g.magnetized) {
        const pullSpeed = 460;
        g.x += ((p.x - g.x) / (d || 1)) * pullSpeed * dt;
        g.y += ((p.y - g.y) / (d || 1)) * pullSpeed * dt;
      }
      if (d < 22) {
        window.sound.playGem();
        this.gainExp(g.exp);
        this.gems.splice(i, 1);
      }
    }

    // Update Pickups
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const pk = this.pickups[i];
      if (pk.type === 'crate') continue;
      const d = Math.hypot(p.x - pk.x, p.y - pk.y);
      if (d < 28) {
        this.pickups.splice(i, 1);
        if (pk.type === 'potion') {
          window.sound.playHeal();
          p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.4);
          this.showToast('🧪 좋은상처약 획득! 체력 40% 회복!');
        } else if (pk.type === 'magnet') {
          window.sound.playHeal();
          for (const g of this.gems) g.magnetized = true;
          this.showToast('🧲 슈퍼 자석 발동! 맵 전체 이상한사탕 흡수!');
        } else if (pk.type === 'bomb') {
          window.sound.playBossAlert();
          this.shockwaves.push({ x: p.x, y: p.y, r: 10, maxR: 480, color: '#ef4444', alpha: 1 });
          for (const e of this.enemies) {
            if (!e.isBoss && Math.hypot(e.x - p.x, e.y - p.y) < 520) {
              this.damageEnemy(e, 999, '#ef4444');
            }
          }
          this.showToast('💥 붐볼 자폭 발동! 주변 야생 포켓몬 초토화!');
        } else if (pk.type === 'coin') {
          window.sound.playGem();
          const c = Math.max(1, Math.round(5 * p.greedMult));
          this.runCoins += c;
          this.saveData.coins += c;
          this.saveProgress();
        } else if (pk.type === 'chest') {
          this.openTreasureChest();
        }
      }
    }
  }

  triggerGameOver(victory) {
    this.state = 'GAMEOVER';
    this.joystick.active = false;
    document.getElementById('joystickZone').classList.add('hidden');
    window.sound.stopBGM();
    if (victory) window.sound.playEvolve();

    const bonusCoins = Math.round((Math.floor(this.elapsedTime * 0.35) + (victory ? 200 : 0)) * this.player.greedMult);
    this.runCoins += bonusCoins;
    this.saveData.coins += bonusCoins;
    if (this.elapsedTime > (this.saveData.bestTime || 0)) {
      this.saveData.bestTime = Math.floor(this.elapsedTime);
    }
    this.saveProgress();

    const badge = document.getElementById('resultBadge');
    const title = document.getElementById('resultTitle');
    if (victory) {
      badge.textContent = 'CHAMPION VICTORY!';
      badge.className = 'levelup-badge gold';
      title.textContent = '🎉 전설의 뮤츠를 물리치고 챔피언이 되었습니다!';
    } else {
      badge.textContent = 'BATTLE ENDED';
      badge.className = 'levelup-badge';
      title.textContent = `${this.player.name}(은)는 쓰러졌다...`;
    }

    const mins = Math.floor(this.elapsedTime / 60);
    const secs = Math.floor(this.elapsedTime % 60);
    document.getElementById('resultSummary').innerHTML = `
      <div class="stat-line"><span>최종 파트너</span><strong>${this.player.name} (Lv.${this.player.level})</strong></div>
      <div class="stat-line"><span>생존 시간</span><strong>${mins}분 ${secs}초</strong></div>
      <div class="stat-line"><span>처치한 야생 포켓몬</span><strong>${this.kills.toLocaleString()}마리</strong></div>
      <div class="stat-line"><span>총 획득 포켓코인</span><strong style="color:#fde047">+🪙 ${this.runCoins.toLocaleString()}</strong></div>
    `;

    document.getElementById('gameOverModal').classList.remove('hidden');
  }

  draw() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const p = this.player;
    const camX = p.x - w / 2;
    const camY = p.y - h / 2;

    // 1. Infinite Pokemon Grassland Tilemap
    ctx.fillStyle = '#1b3626';
    ctx.fillRect(0, 0, w, h);

    const tileSize = 96;
    const startCol = Math.floor(camX / tileSize) - 1;
    const endCol = Math.floor((camX + w) / tileSize) + 1;
    const startRow = Math.floor(camY / tileSize) - 1;
    const endRow = Math.floor((camY + h) / tileSize) + 1;

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const sx = c * tileSize - camX;
        const sy = r * tileSize - camY;
        const hash = Math.abs((c * 73856093) ^ (r * 19349663)) % 100;

        if ((c + r) % 2 === 0) {
          ctx.fillStyle = '#1e3c2a';
          ctx.fillRect(sx, sy, tileSize, tileSize);
        }

        // Grass tufts & flowers
        if (hash < 30) {
          ctx.fillStyle = '#285238';
          ctx.fillRect(sx + 20, sy + 24, 14, 6);
          ctx.fillRect(sx + 24, sy + 18, 6, 12);
        } else if (hash < 42) {
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(sx + 48, sy + 48, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    const st = this.getComputedStats();

    // 2. Ground Zones (Draco Meteor burn zones)
    for (const gz of this.groundZones) {
      const gx = gz.x - camX;
      const gy = gz.y - camY;
      ctx.save();
      ctx.fillStyle = 'rgba(244, 63, 94, 0.25)';
      ctx.strokeStyle = 'rgba(251, 113, 133, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(gx, gy, gz.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 3. Giga Drain / Frenzy Plant Aura around Player
    const auraW = p.weapons.frenzyplant || p.weapons.gigadrain;
    if (auraW) {
      const def = window.GAME_DATA.weapons[auraW.id];
      const radius = (def.base.radius + (auraW.level - 1) * 10) * st.area;
      ctx.save();
      ctx.fillStyle = auraW.id === 'frenzyplant' ? 'rgba(22, 163, 74, 0.22)' : 'rgba(74, 222, 128, 0.15)';
      ctx.strokeStyle = def.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 4. EXP Gems (Rare Candies)
    for (const g of this.gems) {
      const gx = g.x - camX;
      const gy = g.y - camY;
      if (gx < -20 || gx > w + 20 || gy < -20 || gy > h + 20) continue;

      ctx.fillStyle = g.exp >= 10 ? '#facc15' : g.exp >= 5 ? '#4ade80' : '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(gx, gy - 6);
      ctx.lineTo(gx + 5, gy);
      ctx.lineTo(gx, gy + 6);
      ctx.lineTo(gx - 5, gy);
      ctx.closePath();
      ctx.fill();
    }

    // 5. Pickups & Crates
    for (const pk of this.pickups) {
      const px = pk.x - camX;
      const py = pk.y - camY;
      if (px < -40 || px > w + 40 || py < -40 || py > h + 40) continue;

      if (pk.type === 'crate') {
        // Pokeball Crate
        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, 13, Math.PI, 0);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px, py, 13, 0, Math.PI);
        ctx.fillStyle = '#f8fafc';
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(px, py, 13, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.font = '22px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const icon = pk.type === 'potion' ? '🧪' : pk.type === 'magnet' ? '🧲' : pk.type === 'bomb' ? '💣' : pk.type === 'chest' ? '🎁' : '🪙';
        ctx.fillText(icon, px, py);
      }
    }

    // 6. Enemies
    for (const e of this.enemies) {
      const ex = e.x - camX;
      const ey = e.y - camY;
      if (ex < -70 || ex > w + 70 || ey < -70 || ey > h + 70) continue;

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(ex, ey + e.radius * 0.75, e.radius * 0.8, e.radius * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      const img = this.sprites.get(e.dex);
      const drawSize = 54 * e.scale;
      ctx.save();
      ctx.translate(ex, ey);
      if (e.x > p.x) ctx.scale(-1, 1);
      if (e.flashTimer > 0) {
        ctx.filter = 'brightness(3)';
      }
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
      } else {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      if (e.isBoss) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(ex, ey, e.radius + 6, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // 7. Player
    const px = w / 2;
    const py = h / 2;
    const bounce = Math.sin(p.walkAnim) * 3;

    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.ellipse(px, py + 20, 18, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(px, py + bounce);
    if (p.facing < 0) ctx.scale(-1, 1);
    if (p.invulnTimer > 0 && Math.floor(p.invulnTimer * 16) % 2 === 0) {
      ctx.globalAlpha = 0.55;
    }
    const pImg = this.sprites.get(p.dex);
    const pSize = 68;
    if (pImg && pImg.complete && pImg.naturalWidth > 0) {
      ctx.drawImage(pImg, -pSize / 2, -pSize / 2, pSize, pSize);
    }
    ctx.restore();

    // Player HP bar under character
    const hpW = 46;
    const hpH = 6;
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(px - hpW / 2 - 1, py + 26 - 1, hpW + 2, hpH + 2);
    const hpRatio = Math.max(0, p.hp / p.maxHp);
    ctx.fillStyle = hpRatio > 0.5 ? '#4ade80' : hpRatio > 0.25 ? '#facc15' : '#ef4444';
    ctx.fillRect(px - hpW / 2, py + 26, hpW * hpRatio, hpH);

    // 8. Orbiting Aqua Ring / Hydro Cannon Orbs
    const orbitW = p.weapons.hydrocannon || p.weapons.aquaring;
    if (orbitW) {
      const def = window.GAME_DATA.weapons[orbitW.id];
      const orbCount = def.base.count + Math.floor(orbitW.level / 3) + st.bonusAmount;
      const radius = def.base.radius * st.area;
      const orbSize = def.base.size * st.area;

      for (let i = 0; i < orbCount; i++) {
        const ang = orbitW.angle + (Math.PI * 2 * i) / orbCount;
        const ox = px + Math.cos(ang) * radius;
        const oy = py + Math.sin(ang) * radius;

        ctx.save();
        ctx.fillStyle = def.color;
        ctx.shadowColor = def.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(ox, oy, orbSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e0f2fe';
        ctx.beginPath();
        ctx.arc(ox - orbSize * 0.25, oy - orbSize * 0.25, orbSize * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // 9. Projectiles & Enemy Bullets
    for (const pr of this.projectiles) {
      const sx = pr.x - camX;
      const sy = pr.y - camY;
      ctx.save();
      ctx.fillStyle = pr.color;
      ctx.shadowColor = pr.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(sx, sy, pr.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(sx, sy, pr.r * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    for (const b of this.enemyBullets) {
      const sx = b.x - camX;
      const sy = b.y - camY;
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(sx, sy, b.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 10. Lightning Bolts & Shockwaves & Particles
    for (const lb of this.lightningBolts) {
      const x1 = lb.x1 - camX;
      const y1 = lb.y1 - camY;
      const x2 = lb.x2 - camX;
      const y2 = lb.y2 - camY;
      const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * 24;
      const my = (y1 + y2) / 2 + (Math.random() - 0.5) * 24;

      ctx.save();
      ctx.strokeStyle = lb.color;
      ctx.shadowColor = lb.color;
      ctx.shadowBlur = 14;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(mx, my);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.restore();
    }

    for (const sw of this.shockwaves) {
      ctx.save();
      ctx.strokeStyle = sw.color;
      ctx.globalAlpha = Math.max(0, sw.alpha);
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(sw.x - camX, sw.y - camY, sw.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    for (const pt of this.particles) {
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x - camX, pt.y - camY, pt.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 11. Floating Damage Numbers
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    for (const ft of this.floatingTexts) {
      ctx.fillStyle = '#000';
      ctx.fillText(ft.text, ft.x - camX + 1, ft.y - camY + 1);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x - camX, ft.y - camY);
    }
  }
}

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.warn('SW registration skipped:', err);
    });
  });
}

window.addEventListener('DOMContentLoaded', () => {
  window.game = new PokeSurvivorsGame();
});
