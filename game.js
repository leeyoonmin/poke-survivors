// Poké Survivors - Core Game Engine (Enhanced VFX, Assets & Swarm Edition)

class AssetManager {
  constructor() {
    this.sprites = new Map();
    this.anims = new Map();
    this.animMeta = {};
    this.arts = new Map();
    this.items = new Map();
    this.env = new Map();
    fetch('./assets/anim/meta.json')
      .then(r => r.json())
      .then(d => { this.animMeta = d; })
      .catch(() => {});
  }

  getAnim(dex) {
    if (this.anims.has(dex)) return this.anims.get(dex);
    const img = new Image();
    img.src = `./assets/anim/${dex}.png`;
    this.anims.set(dex, img);
    return img;
  }

  getSprite(dex) {
    if (this.sprites.has(dex)) return this.sprites.get(dex);
    const img = new Image();
    img.src = `./assets/sprites/${dex}.png`;
    this.sprites.set(dex, img);
    return img;
  }

  getArt(dex) {
    if (this.arts.has(dex)) return this.arts.get(dex);
    const img = new Image();
    img.src = `./assets/art/${dex}.png`;
    this.arts.set(dex, img);
    return img;
  }

  getItem(name) {
    if (this.items.has(name)) return this.items.get(name);
    const img = new Image();
    img.src = `./assets/items/${name}.png`;
    this.items.set(name, img);
    return img;
  }

  getEnv(name) {
    if (this.env.has(name)) return this.env.get(name);
    const img = new Image();
    img.src = `./assets/env/${name}.png`;
    this.env.set(name, img);
    return img;
  }

  preloadAll() {
    const spriteIds = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 16, 19, 23, 25, 26,
      41, 50, 64, 66, 74, 81, 88, 92, 93, 94, 95, 109, 111, 112, 123,
      125, 126, 130, 142, 143, 144, 145, 146, 147, 148, 149, 150,
      212, 229, 246, 248, 371, 373, 375, 376, 383, 384, 444, 445, 447, 448, 493
    ];
    spriteIds.forEach(id => {
      this.getSprite(id);
      this.getAnim(id);
    });

    const artIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 25, 26, 92, 93, 94, 447, 448];
    artIds.forEach(id => this.getArt(id));

    const itemNames = [
      'poke-ball', 'great-ball', 'ultra-ball', 'master-ball', 'rare-candy',
      'potion', 'super-potion', 'hyper-potion', 'full-restore', 'magnet',
      'charcoal', 'mystic-water', 'miracle-seed', 'spell-tag', 'expert-belt',
      'choice-scarf', 'lucky-egg', 'amulet-coin', 'revive', 'max-revive'
    ];
    itemNames.forEach(n => this.getItem(n));

    const envNames = ['grass_1', 'grass_2', 'path_1', 'bush', 'rock', 'flowers'];
    envNames.forEach(n => this.getEnv(n));
  }
}

class PokeSurvivorsGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.assets = new AssetManager();
    this.assets.preloadAll();

    this.saveData = this.loadSaveData();
    this.selectedStarterId = this.saveData.lastStarter || 'pikachu';
    this.selectedStageId = this.saveData.selectedStage || 1;
    this.lobbyStep = 1; // 1 = Stage Select, 2 = Pokemon Select
    this.gameSpeed = 1.0;
    this.endlessMode = false;

    this.state = 'LOBBY';
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

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
      maxDist: 46
    };

    this.deferredPrompt = null;
    this.screenShake = 0;

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
          coins: parsed.coins ?? 120,
          upgrades: parsed.upgrades || {},
          bestTime: parsed.bestTime || 0,
          lastStarter: parsed.lastStarter || 'pikachu',
          clearedStages: Array.isArray(parsed.clearedStages) ? parsed.clearedStages : [],
          selectedStage: parsed.selectedStage || 1
        };
      }
    } catch (e) {
      console.warn('Save load failed', e);
    }
    return { coins: 120, upgrades: {}, bestTime: 0, lastStarter: 'pikachu', clearedStages: [], selectedStage: 1 };
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
    this.zoom = window.innerWidth < 700 ? 0.62 : 0.74;
    this.width = Math.floor(window.innerWidth / this.zoom);
    this.height = Math.floor(window.innerHeight / this.zoom);
    this.canvas.width = Math.floor(window.innerWidth * this.dpr);
    this.canvas.height = Math.floor(window.innerHeight * this.dpr);
    this.ctx.setTransform(this.dpr * this.zoom, 0, 0, this.dpr * this.zoom, 0, 0);
    this.ctx.imageSmoothingEnabled = false;
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'Escape' && (this.state === 'PLAYING' || this.state === 'PAUSED')) {
        this.togglePause();
      }
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

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

    document.getElementById('btnStartGame').addEventListener('click', () => {
      window.sound.playClick();
      this.startNewGame();
    });

    const btnGoStep2 = document.getElementById('btnGoStep2');
    if (btnGoStep2) {
      btnGoStep2.addEventListener('click', () => {
        window.sound.playClick();
        this.lobbyStep = 2;
        this.renderLobby();
      });
    }

    const btnBackStep1 = document.getElementById('btnBackStep1');
    if (btnBackStep1) {
      btnBackStep1.addEventListener('click', () => {
        window.sound.playClick();
        this.lobbyStep = 1;
        this.renderLobby();
      });
    }

    // Carousel Prev/Next Buttons
    const btnStagePrev = document.getElementById('btnStagePrev');
    const btnStageNext = document.getElementById('btnStageNext');
    if (btnStagePrev) {
      btnStagePrev.addEventListener('click', () => this.stepStageCarousel(-1));
    }
    if (btnStageNext) {
      btnStageNext.addEventListener('click', () => this.stepStageCarousel(1));
    }

    const btnPokePrev = document.getElementById('btnPokePrev');
    const btnPokeNext = document.getElementById('btnPokeNext');
    if (btnPokePrev) {
      btnPokePrev.addEventListener('click', () => this.stepPokeCarousel(-1));
    }
    if (btnPokeNext) {
      btnPokeNext.addEventListener('click', () => this.stepPokeCarousel(1));
    }

    // Sync selection when user swipes horizontally on carousel track
    const stageTrack = document.getElementById('stageGrid');
    if (stageTrack) {
      let stTimer = null;
      stageTrack.addEventListener('scroll', () => {
        clearTimeout(stTimer);
        stTimer = setTimeout(() => this.onCarouselScroll(stageTrack, 'stage'), 90);
      }, { passive: true });
    }

    const pokeTrack = document.getElementById('starterGrid');
    if (pokeTrack) {
      let pkTimer = null;
      pokeTrack.addEventListener('scroll', () => {
        clearTimeout(pkTimer);
        pkTimer = setTimeout(() => this.onCarouselScroll(pokeTrack, 'poke'), 90);
      }, { passive: true });
    }

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

    const btnSpeed = document.getElementById('btnSpeedHud');
    if (btnSpeed) {
      btnSpeed.addEventListener('click', () => {
        window.sound.playClick();
        if (this.gameSpeed === 1.0) this.gameSpeed = 1.5;
        else if (this.gameSpeed === 1.5) this.gameSpeed = 2.0;
        else this.gameSpeed = 1.0;
        btnSpeed.textContent = `${this.gameSpeed}x`;
      });
    }

    const btnNextStage = document.getElementById('btnNextStage');
    if (btnNextStage) {
      btnNextStage.addEventListener('click', () => {
        window.sound.playClick();
        document.getElementById('gameOverModal').classList.add('hidden');
        this.selectedStageId = Math.min(window.GAME_DATA.stages.length, this.selectedStageId + 1);
        this.saveData.selectedStage = this.selectedStageId;
        this.saveProgress();
        this.startNewGame();
      });
    }

    const btnEndless = document.getElementById('btnEndlessMode');
    if (btnEndless) {
      btnEndless.addEventListener('click', () => {
        window.sound.playClick();
        document.getElementById('gameOverModal').classList.add('hidden');
        this.endlessMode = true;
        this.state = 'PLAYING';
        window.sound.startBGM();
        this.showToast('♾️ 무한 돌파 모드 돌입! 한계까지 살아남으세요!');
      });
    }

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
          refunded += Math.floor(upg.baseCost * Math.pow(1.52, i));
        }
      }
      const eggs = this.getUpgradeLevel('golden_egg');
      for (let i = 0; i < eggs; i++) {
        refunded += 1500 + i * 250;
      }
      this.saveData.coins += refunded;
      this.saveData.upgrades = {};
      this.saveProgress();
      this.renderLabModal();
    });

    document.getElementById('btnOpenGuide').addEventListener('click', () => {
      window.sound.playClick();
      this.renderGuideModal();
      document.getElementById('guideModal').classList.remove('hidden');
    });
    document.getElementById('btnCloseGuide').addEventListener('click', () => {
      window.sound.playClick();
      document.getElementById('guideModal').classList.add('hidden');
    });

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

  stepStageCarousel(dir) {
    const stages = window.GAME_DATA.stages || [];
    if (!stages.length) return;
    let idx = stages.findIndex(s => s.id === this.selectedStageId);
    idx = (idx + dir + stages.length) % stages.length;
    window.sound.playClick();
    this.selectedStageId = stages[idx].id;
    this.saveData.selectedStage = this.selectedStageId;
    this.saveProgress();
    this.updateLobbySummaries();
    this.scrollToActiveCard('stageGrid', idx);
  }

  stepPokeCarousel(dir) {
    const starters = window.GAME_DATA.starters || [];
    if (!starters.length) return;
    let idx = starters.findIndex(s => s.id === this.selectedStarterId);
    idx = (idx + dir + starters.length) % starters.length;
    window.sound.playClick();
    this.selectedStarterId = starters[idx].id;
    this.saveData.lastStarter = this.selectedStarterId;
    this.saveProgress();
    this.updateLobbySummaries();
    this.scrollToActiveCard('starterGrid', idx);
  }

  scrollToActiveCard(trackId, index, instant = false) {
    const track = document.getElementById(trackId);
    if (!track || !track.children[index]) return;
    const card = track.children[index];
    const targetLeft = card.offsetLeft - (track.clientWidth - card.clientWidth) / 2;
    track.scrollTo({ left: targetLeft, behavior: instant ? 'auto' : 'smooth' });
  }

  onCarouselScroll(track, kind) {
    const center = track.scrollLeft + track.clientWidth / 2;
    let bestIdx = 0;
    let bestDist = Infinity;
    Array.from(track.children).forEach((child, idx) => {
      const cCenter = child.offsetLeft + child.clientWidth / 2;
      const d = Math.abs(cCenter - center);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = idx;
      }
    });

    if (kind === 'stage') {
      const stg = (window.GAME_DATA.stages || [])[bestIdx];
      if (stg && stg.id !== this.selectedStageId) {
        this.selectedStageId = stg.id;
        this.saveData.selectedStage = stg.id;
        this.saveProgress();
        this.updateLobbySummaries();
      }
    } else {
      const st = (window.GAME_DATA.starters || [])[bestIdx];
      if (st && st.id !== this.selectedStarterId) {
        this.selectedStarterId = st.id;
        this.saveData.lastStarter = st.id;
        this.saveProgress();
        this.updateLobbySummaries();
      }
    }
  }

  updateLobbySummaries() {
    const stages = window.GAME_DATA.stages || [];
    const starters = window.GAME_DATA.starters || [];
    const curStage = stages.find(s => s.id === this.selectedStageId) || stages[0];
    const sel = starters.find(s => s.id === this.selectedStarterId) || starters[0];
    const stgIdx = Math.max(0, stages.findIndex(s => s.id === this.selectedStageId));
    const pkIdx = Math.max(0, starters.findIndex(s => s.id === this.selectedStarterId));

    const stageTrack = document.getElementById('stageGrid');
    if (stageTrack) {
      Array.from(stageTrack.children).forEach((el, i) => el.classList.toggle('selected', i === stgIdx));
    }
    const stageDots = document.getElementById('stageDots');
    if (stageDots) {
      Array.from(stageDots.children).forEach((el, i) => el.classList.toggle('active', i === stgIdx));
    }

    const pokeTrack = document.getElementById('starterGrid');
    if (pokeTrack) {
      Array.from(pokeTrack.children).forEach((el, i) => el.classList.toggle('selected', i === pkIdx));
    }
    const pokeDots = document.getElementById('pokeDots');
    if (pokeDots) {
      Array.from(pokeDots.children).forEach((el, i) => el.classList.toggle('active', i === pkIdx));
    }

    const pokeIdxBadge = document.getElementById('pokeIndexBadge');
    if (pokeIdxBadge) pokeIdxBadge.textContent = `${pkIdx + 1} / ${starters.length}`;

    const stageSum = document.getElementById('selectedStageSummary');
    if (stageSum && curStage) {
      stageSum.innerHTML = `
        <h3 style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${curStage.icon} ${curStage.name} <small style="color:#fef08a">(코인 x${curStage.coinMult}배)</small></h3>
      `;
    }

    const step2Label = document.getElementById('step2StageLabel');
    if (step2Label && curStage) {
      step2Label.textContent = `STEP 2. 파트너 선택 (${curStage.icon} STAGE ${curStage.id})`;
    }

    const startBtn = document.getElementById('btnStartGame');
    if (startBtn && curStage) {
      startBtn.innerHTML = `<span style="white-space:nowrap">⚔️ STAGE ${curStage.id} 출격하기!</span>`;
    }

    const startW = window.GAME_DATA.weapons[sel.startWeapon];
    const cleanW = String(startW.name || '').replace(/\s*\[.*?\]/g, '');
    const cleanT = String(sel.traitName || '').replace(/\s*\(.*?\)/g, '');
    const partnerSum = document.getElementById('selectedPartnerSummary');
    if (partnerSum) {
      partnerSum.innerHTML = `
        <h3 style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">파트너: ${sel.name} <small style="color:#fef08a">(${startW.icon}${cleanW} · ${cleanT})</small></h3>
      `;
    }
  }

  renderLobby() {
    document.getElementById('lobbyCoins').textContent = this.saveData.coins.toLocaleString();

    const step1El = document.getElementById('lobbyStepStage');
    const step2El = document.getElementById('lobbyStepPokemon');
    if (step1El && step2El) {
      step1El.classList.toggle('hidden', this.lobbyStep !== 1);
      step2El.classList.toggle('hidden', this.lobbyStep !== 2);
    }

    const stages = window.GAME_DATA.stages || [];
    const starters = window.GAME_DATA.starters || [];

    // 1. Render Stage Carousel Slides & Dots
    const stageGrid = document.getElementById('stageGrid');
    const stageDots = document.getElementById('stageDots');
    if (stageGrid && stages.length) {
      stageGrid.innerHTML = '';
      if (stageDots) stageDots.innerHTML = '';
      const cleared = new Set(this.saveData.clearedStages || []);
      const maxUnlocked = Math.min(5, Math.max(1, ...Array.from(cleared), 0) + 1);

      stages.forEach((stg, idx) => {
        const isCleared = cleared.has(stg.id);
        const isUnlocked = stg.id <= maxUnlocked || isCleared;
        const card = document.createElement('div');
        card.className = `stage-card carousel-slide-card ${stg.id === this.selectedStageId ? 'selected' : ''} ${!isUnlocked ? 'locked' : ''}`;

        let statusHtml = `<span class="stage-status-pill open">🔥 도전 가능</span>`;
        if (isCleared) statusHtml = `<span class="stage-status-pill cleared">🏆 CLEAR 완료</span>`;
        else if (!isUnlocked) statusHtml = `<span class="stage-status-pill lock">🔒 STAGE ${stg.id - 1} 클리어 필요</span>`;

        const cleanBossName = (raw) => String(raw || '').replace(/^\[.*?\]\s*/, '').split(' ').pop();
        const bossIconsHtml = (stg.bosses || []).map((b, bIdx) => {
          const isFinal = bIdx === stg.bosses.length - 1;
          const timeLbl = bIdx === 0 ? '1분' : bIdx === 1 ? '2분' : '4분 보스';
          return `
            <div class="sc-boss-chip ${isFinal ? 'final' : ''}">
              <img src="./assets/sprites/${b.dex}.png" alt="${b.name}" />
              <div style="text-align:left;min-width:0">
                <div style="font-size:0.62rem;color:${isFinal ? '#dc2626' : '#64748b'};font-weight:900;white-space:nowrap">${timeLbl}</div>
                <span>${cleanBossName(b.name)}</span>
              </div>
            </div>
          `;
        }).join('');

        const finalBoss = stg.bosses[stg.bosses.length - 1];
        card.innerHTML = `
          <div class="sc-header">
            <div class="sc-header-left">
              <span class="sc-stage-num">STAGE 0${stg.id}</span>
              <span class="sc-stage-title">${stg.icon} ${stg.name.replace(/^STAGE \d+\.\s*/, '')}</span>
            </div>
            ${statusHtml}
          </div>
          <div class="sc-body">
            <div class="sc-boss-pedestal">
              <img src="./assets/sprites/${stg.bossImg}.png" alt="${finalBoss.name}" />
              <span>👑 ${cleanBossName(finalBoss.name)}</span>
            </div>
            <div class="sc-info-col">
              <div class="sc-desc">${stg.sub}</div>
              <div class="sc-reward-row">
                <span class="sc-reward-pill">🪙 코인 획득 x${stg.coinMult}배</span>
                <span class="sc-reward-pill">🎁 첫 클리어 +${stg.clearBonus} 코인</span>
              </div>
            </div>
          </div>
          <div class="sc-boss-footer">
            <span class="sc-boss-footer-label">🚨 시간대별 출현 보스 (1분 ➔ 2분 ➔ 4분)</span>
            <div class="sc-boss-chain">${bossIconsHtml}</div>
          </div>
        `;

        card.addEventListener('click', () => {
          window.sound.playClick();
          this.selectedStageId = stg.id;
          this.saveData.selectedStage = stg.id;
          this.saveProgress();
          this.updateLobbySummaries();
          this.scrollToActiveCard('stageGrid', idx);
        });
        stageGrid.appendChild(card);

        if (stageDots) {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = `carousel-dot ${stg.id === this.selectedStageId ? 'active' : ''}`;
          dot.textContent = `${stg.id}`;
          dot.addEventListener('click', () => {
            window.sound.playClick();
            this.selectedStageId = stg.id;
            this.saveData.selectedStage = stg.id;
            this.saveProgress();
            this.updateLobbySummaries();
            this.scrollToActiveCard('stageGrid', idx);
          });
          stageDots.appendChild(dot);
        }
      });
    }

    // 2. Render Starter Pokemon Carousel Slides & Dots
    const grid = document.getElementById('starterGrid');
    const pokeDots = document.getElementById('pokeDots');
    if (grid && starters.length) {
      grid.innerHTML = '';
      if (pokeDots) pokeDots.innerHTML = '';

      starters.forEach((st, idx) => {
        const card = document.createElement('div');
        card.className = `starter-card carousel-slide-card ${st.id === this.selectedStarterId ? 'selected' : ''}`;
        const startW = window.GAME_DATA.weapons[st.startWeapon];

        const fullEvoSteps = [
          { level: 1, name: st.name, dex: st.dex },
          ...st.evolutions
        ];
        const evoChainHtml = fullEvoSteps
          .map((ev, eIdx) => `
            ${eIdx > 0 ? '<span class="pc-evo-arrow">➔</span>' : ''}
            <div class="pc-evo-step">
              <small>Lv.${ev.level}</small>
              <img src="./assets/art/${ev.dex}.png" alt="${ev.name}" />
              <span>${ev.name}</span>
            </div>
          `)
          .join('');

        const cleanTrait = String(st.traitName || '').replace(/\s*\(.*?\)/g, '');
        const cleanWeapon = String(startW.name || '').replace(/\s*\[.*?\]/g, '');
        const cleanWDesc = String(startW.desc || '').replace(/^\[.*?\]\s*/, '');

        card.innerHTML = `
          <div class="pc-header">
            <div class="pc-title-group">
              <span class="type-pill" style="background:${st.typeColor}">${st.type}</span>
              <span class="pc-name">${st.name}</span>
            </div>
            <span class="pc-bonus-badge">${startW.icon} ${cleanWeapon} · ${cleanTrait}</span>
          </div>
          <div class="pc-hero-section">
            <div class="pc-main-portrait">
              <img src="./assets/art/${st.dex}.png" alt="${st.name}" />
            </div>
            <div class="pc-evo-box">
              <div class="pc-evo-label">🧬 레벨업 자동 진화 트리</div>
              <div class="pc-evo-chain">${evoChainHtml}</div>
            </div>
          </div>
          <div class="pc-specs-footer">
            <div class="pc-spec-row">
              <span class="pc-spec-tag trait">✨ 고유 특성 [${cleanTrait}]</span>
              <span class="pc-spec-text">${st.traitDesc}</span>
            </div>
            <div class="pc-spec-row">
              <span class="pc-spec-tag weapon">${startW.icon} 전용 시작 기술 [${cleanWeapon}]</span>
              <span class="pc-spec-text">${cleanWDesc}</span>
            </div>
          </div>
        `;

        card.addEventListener('click', () => {
          window.sound.playClick();
          this.selectedStarterId = st.id;
          this.saveData.lastStarter = st.id;
          this.saveProgress();
          this.updateLobbySummaries();
          this.scrollToActiveCard('starterGrid', idx);
        });
        grid.appendChild(card);

        if (pokeDots) {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = `carousel-dot ${st.id === this.selectedStarterId ? 'active' : ''}`;
          dot.innerHTML = `<img src="./assets/sprites/${st.dex}.png" alt="${st.name}" />`;
          dot.addEventListener('click', () => {
            window.sound.playClick();
            this.selectedStarterId = st.id;
            this.saveData.lastStarter = st.id;
            this.saveProgress();
            this.updateLobbySummaries();
            this.scrollToActiveCard('starterGrid', idx);
          });
          pokeDots.appendChild(dot);
        }
      });
    }

    this.updateLobbySummaries();
    requestAnimationFrame(() => {
      if (this.lobbyStep === 1) {
        const stgIdx = Math.max(0, stages.findIndex(s => s.id === this.selectedStageId));
        this.scrollToActiveCard('stageGrid', stgIdx, true);
      } else {
        const pkIdx = Math.max(0, starters.findIndex(s => s.id === this.selectedStarterId));
        this.scrollToActiveCard('starterGrid', pkIdx, true);
      }
    });
  }

  renderLabModal() {
    document.getElementById('labCoins').textContent = this.saveData.coins.toLocaleString();
    const eggCount = this.getUpgradeLevel('golden_egg');
    const eggCountEl = document.getElementById('goldenEggCount');
    if (eggCountEl) eggCountEl.textContent = eggCount;
    const eggBtn = document.getElementById('btnBuyGoldenEgg');
    if (eggBtn) {
      const eggCost = 1500 + eggCount * 250;
      eggBtn.textContent = `🪙 ${eggCost.toLocaleString()} 부화`;
      eggBtn.disabled = this.saveData.coins < eggCost;
      eggBtn.onclick = () => {
        if (this.saveData.coins < eggCost) return;
        window.sound.playEvolve();
        this.saveData.coins -= eggCost;
        this.saveData.upgrades.golden_egg = eggCount + 1;
        this.saveProgress();
        this.renderLabModal();
      };
    }
    const grid = document.getElementById('labGrid');
    grid.innerHTML = '';

    for (const upg of window.GAME_DATA.metaUpgrades) {
      const lvl = this.getUpgradeLevel(upg.id);
      const isMax = lvl >= upg.max;
      const cost = Math.floor(upg.baseCost * Math.pow(1.52, lvl));
      const canBuy = !isMax && this.saveData.coins >= cost;

      const item = document.createElement('div');
      item.className = 'lab-item';
      const iconHtml = upg.img ? `<img src="${upg.img}" style="width:24px;height:24px;vertical-align:middle;image-rendering:pixelated" />` : upg.icon;
      item.innerHTML = `
        <div class="lab-item-head">
          <span>${iconHtml} ${upg.name}</span>
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
      const pIcon = passive.img ? `<img src="${passive.img}" style="width:20px;height:20px;vertical-align:middle;image-rendering:pixelated" />` : passive.icon;
      div.innerHTML = `
        <div style="font-weight:900;color:#fde047;font-size:0.96rem">
          ${w.icon} ${w.name} (Lv.8) + ${pIcon} ${passive.name}
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
    this.currentStage = (window.GAME_DATA.stages || []).find(s => s.id === this.selectedStageId) || window.GAME_DATA.stages[0];
    this.endlessMode = false;
    document.getElementById('titleScreen').classList.add('hidden');
    document.getElementById('hudScreen').classList.remove('hidden');
    document.getElementById('bossHud').classList.add('hidden');

    const eggLvl = this.getUpgradeLevel('golden_egg');
    const mightMeta = (1 + this.getUpgradeLevel('might') * 0.05) * (1 + eggLvl * 0.02);
    const hpMeta = (1 + this.getUpgradeLevel('hp') * 0.08) * (1 + eggLvl * 0.02);
    const speedMeta = 1 + this.getUpgradeLevel('speed') * 0.04;
    const magnetMeta = 1 + this.getUpgradeLevel('magnet') * 0.12;
    const greedMeta = (1 + this.getUpgradeLevel('greed') * 0.06) * (this.currentStage ? this.currentStage.coinMult : 1.0);
    const cooldownMeta = Math.pow(0.97, this.getUpgradeLevel('cooldown'));
    const armorMeta = this.getUpgradeLevel('armor') * 1.5;
    const regenMeta = this.getUpgradeLevel('armor') * 0.5;
    const revives = this.getUpgradeLevel('revive');
    const rerolls = 1 + this.getUpgradeLevel('reroll');

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
      baseArmor: starter.stats.armor + armorMeta,
      baseRegen: starter.stats.regen + regenMeta,
      baseMagnet: starter.stats.magnet * magnetMeta,
      baseCooldown: starter.stats.cooldown * cooldownMeta,
      baseExpMult: starter.stats.expMult * greedMeta,
      greedMult: greedMeta,
      revivesLeft: revives,
      rerollsLeft: rerolls,
      level: 1,
      exp: 0,
      nextExp: 10,
      invulnTimer: 0,
      walkAnim: 0,
      dustTimer: 0,
      auraRot: 0,
      waterShield: starter.id === 'squirtle',
      waterShieldTimer: 0,
      afterimages: [],
      weapons: {},
      passives: {}
    };

    this.addWeapon(starter.startWeapon);

    this.elapsedTime = 0;
    this.kills = 0;
    this.runCoins = 0;
    this.spawnTimer = 0;
    this.swarmTimer = 75; // First swarm starts at 1m 15s after player builds up skills!
    this.crateTimer = 4;
    this.spawnedBossTimes = new Set();
    this.activeBoss = null;
    this.screenShake = 0;

    // World Entities & Enhanced VFX Arrays
    this.enemies = [];
    this.projectiles = [];
    this.enemyBullets = [];
    this.gems = [];
    this.pickups = [];
    this.groundZones = [];
    this.fallingMeteors = []; // Falling Draco Meteors with warning reticles
    this.leechOrbs = []; // Giga Drain life-steal orbs flying to player
    this.lightningBolts = [];
    this.laserBeams = []; // Hyper Beam / Giga Impact piercing beams
    this.slashArcs = []; // Aerial Ace / Sacred Sword crescent slashes
    this.particles = [];
    this.floatingTexts = [];
    this.shockwaves = [];

    // Gentle initial spawn (5 weak enemies) so the start is comfortable!
    const stageWaves = (this.currentStage && this.currentStage.waves) ? this.currentStage.waves : window.GAME_DATA.waves;
    const firstWave = stageWaves[0];
    for (let i = 0; i < 5; i++) {
      this.spawnEnemy(firstWave.pool[i % firstWave.pool.length], false);
    }

    this.state = 'PLAYING';
    this.updateHud();
    this.showToast(`${this.currentStage.icon} ${this.currentStage.name} 돌입! 최종 보스를 격파하세요!`);
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

    // Charmander Trait [Blaze]: up to +50% bonus Might as HP drops!
    const missingHpRatio = p.maxHp > 0 ? Math.max(0, 1 - p.hp / p.maxHp) : 0;
    const blazeBonus = p.starter.id === 'charmander' ? (1 + missingHpRatio * 0.5) : 1.0;

    const labAreaMeta = 1 + this.getUpgradeLevel('area') * 0.05;
    const labAmountMeta = this.getUpgradeLevel('amount');

    return {
      might: p.baseMight * (1 + mightLv * 0.16) * blazeBonus,
      area: (1 + areaLv * 0.15) * labAreaMeta,
      regen: p.baseRegen + seedLv * 1.4,
      cooldown: p.baseCooldown * Math.pow(0.92, hasteLv),
      bonusAmount: Math.min(4, Math.ceil(amountLv * 0.6) + labAmountMeta),
      speed: p.baseSpeed * (1 + speedLv * 0.12),
      magnet: p.baseMagnet * (1 + magnetLv * 0.32),
      expMult: p.baseExpMult * (1 + luckyLv * 0.2),
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
        angle: 0,
        trailHistory: []
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
      angle: 0,
      trailHistory: []
    };
    window.sound.playEvolve();
    const evoDef = window.GAME_DATA.weapons[evolvedId];
    this.showToast(`🌟 궁극기 진화! [${evoDef.icon} ${evoDef.name}] 개방!`);
    this.screenShake = 0.45;
    this.shockwaves.push({ x: this.player.x, y: this.player.y, r: 10, maxR: 320, color: '#facc15', alpha: 1, hex: true });
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
        const iconHtml = def.img ? `<img src="${def.img}" alt="${def.name}" />` : def.icon;
        div.innerHTML = `${iconHtml}<span class="slot-lvl">${lvl}</span>`;
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

    if (this.currentStage) {
      const stgBadge = document.getElementById('hudStageBadge');
      if (stgBadge) stgBadge.textContent = this.endlessMode ? `♾️ 무한모드 (${this.currentStage.name})` : `${this.currentStage.icon} STAGE ${this.currentStage.id}`;
      const progFill = document.getElementById('stageProgFill');
      if (progFill) {
        const stgPct = Math.min(100, (this.elapsedTime / (this.currentStage.duration || 300)) * 100);
        progFill.style.width = `${stgPct}%`;
      }
    }

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
        this.screenShake = 0.4;
        this.showToast(`✨ 오잉?! ${oldName}의 상태가...! [${ev.name}](으)로 진화했다!`);
        this.shockwaves.push({
          x: this.player.x,
          y: this.player.y,
          r: 12,
          maxR: 320,
          color: '#38bdf8',
          alpha: 1,
          hex: true
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
      this.player.nextExp = Math.floor(10 + this.player.level * 8 + Math.pow(this.player.level, 1.4));
      this.checkPokemonEvolution();
      this.triggerLevelUpModal();
    }
    this.updateHud();
  }

  getAvailableUpgrades() {
    const pool = [];
    const wCount = Object.keys(this.player.weapons).length;
    const pCount = Object.keys(this.player.passives).length;

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
          desc: evoDef.desc
        });
      }
    }

    for (const wDef of Object.values(window.GAME_DATA.weapons)) {
      if (wDef.isEvolved) continue;
      // Enforce Exclusive Starter Signature Moves!
      if (wDef.exclusiveTo && wDef.exclusiveTo !== this.player.starter.id) continue;
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
            desc: `기술 위력 +22% 및 이펙트/발사체 강화 (${wDef.desc})`
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
          desc: wDef.desc
        });
      }
    }

    for (const pDef of Object.values(window.GAME_DATA.passives)) {
      const ownedLvl = this.player.passives[pDef.id] || 0;
      const iconHtml = pDef.img ? `<img src="${pDef.img}" alt="${pDef.name}" />` : pDef.icon;
      if (ownedLvl > 0) {
        if (ownedLvl < pDef.maxLevel) {
          pool.push({
            type: 'passive',
            id: pDef.id,
            name: pDef.name,
            icon: iconHtml,
            tag: `Lv.${ownedLvl} ➔ Lv.${ownedLvl + 1}`,
            tagClass: '',
            desc: pDef.desc
          });
        }
      } else if (pCount < 6) {
        pool.push({
          type: 'passive',
          id: pDef.id,
          name: pDef.name,
          icon: iconHtml,
          tag: 'NEW 도구',
          tagClass: 'new',
          desc: pDef.desc
        });
      }
    }

    const evolutions = pool.filter(p => p.type === 'evolve');
    const others = pool.filter(p => p.type !== 'evolve').sort(() => Math.random() - 0.5);
    const selected = [...evolutions, ...others].slice(0, 3);

    if (selected.length === 0) {
      selected.push(
        {
          type: 'heal',
          id: 'potion',
          name: '고급상처약 회복',
          icon: '<img src="./assets/items/hyper-potion.png" alt="Potion" />',
          tag: '회복',
          tagClass: 'new',
          desc: '최대 체력의 50%를 즉시 회복합니다.'
        },
        {
          type: 'gold',
          id: 'coin_bag',
          name: '부적금화 보너스',
          icon: '<img src="./assets/items/amulet-coin.png" alt="Coin" />',
          tag: '보너스',
          tagClass: 'evo',
          desc: '포켓코인 +50개를 즉시 획득합니다.'
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
          this.runCoins += 50;
          this.saveData.coins += 50;
          this.saveProgress();
        }

        document.getElementById('levelUpModal').classList.add('hidden');
        this.state = 'PLAYING';
        if (this.player.exp >= this.player.nextExp) {
          this.gainExp(0);
        }
      });

      listEl.appendChild(btn);
    }

    const rerollBtn = document.getElementById('btnRerollChoices');
    if (rerollBtn) {
      const left = this.player.rerollsLeft || 0;
      rerollBtn.textContent = left > 0
        ? `🎲 선택지 다시 뽑기 (리롤 ${left}회 남음)`
        : '🎲 리롤 횟수 소진 (오박사 연구소에서 확장 가능)';
      rerollBtn.disabled = left <= 0;
      rerollBtn.onclick = () => {
        if ((this.player.rerollsLeft || 0) <= 0) return;
        this.player.rerollsLeft--;
        window.sound.playClick();
        this.triggerLevelUpModal();
      };
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
      rewardTitle = `${reward.name} (${reward.tag})`;
      rewardDesc = reward.desc;
    } else {
      rewardTitle = '풀회복약 & 대량 코인';
      rewardDesc = '모든 기술이 최대 레벨에 도달하여 체력 100% 회복 및 추가 코인을 획득했습니다!';
    }

    const bonusCoins = Math.round((45 + Math.floor(this.elapsedTime * 0.3)) * this.player.greedMult);
    this.runCoins += bonusCoins;
    this.saveData.coins += bonusCoins;
    this.player.hp = Math.min(this.player.maxHp, this.player.hp + this.player.maxHp * 0.4);
    this.saveProgress();

    document.getElementById('chestRewardContent').innerHTML = `
      <div style="text-align:center"><img src="./assets/items/master-ball.png" style="width:48px;height:48px;image-rendering:pixelated" /></div>
      <div style="text-align:center;font-size:1.15rem;font-weight:900;color:#fde047">${rewardTitle}</div>
      <p style="text-align:center;color:#cbd5e1;font-size:0.86rem">${rewardDesc}</p>
      <div class="stat-line"><span>보너스 포켓코인</span><strong style="color:#fde047">+🪙 ${bonusCoins}</strong></div>
      <div class="stat-line"><span>체력 회복</span><strong style="color:#4ade80">+40% HP 회복</strong></div>
    `;
    document.getElementById('chestModal').classList.remove('hidden');
    this.updateHud();
  }

  loop(now) {
    const rawDt = Math.min(0.05, (now - this.lastFrameTime) / 1000);
    const dt = rawDt * (this.gameSpeed || 1.0);
    this.lastFrameTime = now;

    if (!document.hidden) {
      if (this.state === 'PLAYING') {
        this.update(dt);
      }
      if (this.state !== 'LOBBY') {
        this.draw();
      }
    }

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    this.elapsedTime += dt;
    const p = this.player;
    const st = this.getComputedStats();

    if (this.screenShake > 0) this.screenShake = Math.max(0, this.screenShake - dt * 2.2);
    p.auraRot = (p.auraRot + dt * 1.4) % (Math.PI * 2);

    if (p.hp < p.maxHp) {
      p.hp = Math.min(p.maxHp, p.hp + st.regen * dt);
    }
    if (p.invulnTimer > 0) p.invulnTimer -= dt;

    // Squirtle Trait [Shell Armor Water Shield]: regenerates every 8 seconds!
    if (p.starter.id === 'squirtle' && !p.waterShield) {
      p.waterShieldTimer += dt;
      if (p.waterShieldTimer >= 8.0) {
        p.waterShield = true;
        p.waterShieldTimer = 0;
        this.floatingTexts.push({
          x: p.x,
          y: p.y - 32,
          text: '💧물의 보호막!',
          color: '#38bdf8',
          scale: 1.1,
          life: 0.8
        });
      }
    }

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
      p.walkAnim += dt * 14;
      p.dustTimer -= dt;
      if (p.dustTimer <= 0) {
        p.dustTimer = 0.12;
        this.particles.push({
          x: p.x - moveX * 12 + (Math.random() - 0.5) * 8,
          y: p.y + 18,
          vx: -moveX * 25 + (Math.random() - 0.5) * 15,
          vy: -10 - Math.random() * 12,
          color: 'rgba(203, 213, 225, 0.45)',
          r: 4 + Math.random() * 3,
          life: 0.28,
          maxLife: 0.28
        });
      }
    }

    // Spawn Waves, Elites, Swarms & Bosses
    this.updateSpawning(dt);

    // Update Weapons
    this.updateWeapons(dt, st);

    // Update Falling Meteors (Draco Meteor)
    this.updateFallingMeteors(dt);

    // Update Projectiles
    this.updateProjectiles(dt);

    // Update Ground Zones (Draco Meteor Lava Pools & Blast Burn craters)
    for (let i = this.groundZones.length - 1; i >= 0; i--) {
      const gz = this.groundZones[i];
      gz.duration -= dt;
      gz.tickTimer -= dt;
      if (Math.random() < 0.35) {
        const ang = Math.random() * Math.PI * 2;
        const rad = Math.random() * gz.radius * 0.85;
        this.particles.push({
          x: gz.x + Math.cos(ang) * rad,
          y: gz.y + Math.sin(ang) * rad,
          vx: (Math.random() - 0.5) * 20,
          vy: -35 - Math.random() * 35,
          color: Math.random() < 0.5 ? '#fb7185' : '#fde047',
          r: 2.5 + Math.random() * 2.5,
          life: 0.35,
          maxLife: 0.35
        });
      }
      if (gz.tickTimer <= 0) {
        gz.tickTimer = 0.32;
        for (const e of this.enemies) {
          if (Math.hypot(e.x - gz.x, e.y - gz.y) <= gz.radius + e.radius) {
            this.damageEnemy(e, gz.damage, '#fb7185', 6);
          }
        }
      }
      if (gz.duration <= 0) this.groundZones.splice(i, 1);
    }

    // Update Leech Orbs (Giga Drain visual absorption)
    for (let i = this.leechOrbs.length - 1; i >= 0; i--) {
      const orb = this.leechOrbs[i];
      const dx = p.x - orb.x;
      const dy = p.y - orb.y;
      const dist = Math.hypot(dx, dy) || 1;
      orb.x += (dx / dist) * 420 * dt;
      orb.y += (dy / dist) * 420 * dt;
      if (dist < 18) {
        this.leechOrbs.splice(i, 1);
      }
    }

    // Update Enemies
    this.updateEnemies(dt, st);

    // Update Enemy Bullets
    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const b = this.enemyBullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      if (Math.hypot(b.x - p.x, b.y - p.y) < b.r + 15) {
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
    for (let i = this.laserBeams.length - 1; i >= 0; i--) {
      this.laserBeams[i].life -= dt;
      if (this.laserBeams[i].life <= 0) this.laserBeams.splice(i, 1);
    }
    for (let i = this.slashArcs.length - 1; i >= 0; i--) {
      this.slashArcs[i].life -= dt;
      if (this.slashArcs[i].life <= 0) this.slashArcs.splice(i, 1);
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
      ft.y -= 32 * dt;
      ft.life -= dt;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.r += (sw.maxR - sw.r) * 8.5 * dt;
      sw.alpha -= 1.8 * dt;
      if (sw.alpha <= 0) this.shockwaves.splice(i, 1);
    }

    this.updateHud();
  }

  updateSpawning(dt) {
    const stageBosses = (this.currentStage && this.currentStage.bosses) ? this.currentStage.bosses : window.GAME_DATA.bosses;
    for (const bossDef of stageBosses) {
      if (this.elapsedTime >= bossDef.time && !this.spawnedBossTimes.has(bossDef.time)) {
        this.spawnedBossTimes.add(bossDef.time);
        this.spawnBoss(bossDef);
      }
    }

    const stageWaves = (this.currentStage && this.currentStage.waves) ? this.currentStage.waves : window.GAME_DATA.waves;
    const wave = stageWaves.find(w => this.elapsedTime >= w.start && this.elapsedTime < w.end)
      || stageWaves[stageWaves.length - 1];

    // Regular High-Density Spawning
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.enemies.length < wave.maxEnemies) {
      this.spawnTimer = wave.spawnInterval;
      const batch = wave.spawnBatch || 3;
      for (let i = 0; i < batch; i++) {
        if (this.enemies.length >= wave.maxEnemies) break;
        const template = wave.pool[Math.floor(Math.random() * wave.pool.length)];
        const isElite = Math.random() < (wave.eliteChance || 0.04);
        this.spawnEnemy(template, isElite);
      }
    }

    // Periodic Swarm Encirclement Event!
    this.swarmTimer -= dt;
    if (this.swarmTimer <= 0) {
      this.swarmTimer = 42;
      const swarmTemplate = wave.pool[Math.floor(Math.random() * wave.pool.length)];
      this.showToast(`🚨 야생의 [${swarmTemplate.name}] 무리가 대발생했다!`);
      window.sound.playBossAlert();
      const swarmCount = 24 + Math.min(20, Math.floor(this.elapsedTime / 20));
      const rx = this.width * 0.44;
      const ry = this.height * 0.44;
      for (let i = 0; i < swarmCount; i++) {
        if (this.enemies.length >= wave.maxEnemies + 40) break;
        const ang = (Math.PI * 2 * i) / swarmCount + (Math.random() - 0.5) * 0.08;
        this.spawnEnemy(swarmTemplate, false, this.player.x + Math.cos(ang) * rx, this.player.y + Math.sin(ang) * ry);
      }
    }

    this.crateTimer -= dt;
    if (this.crateTimer <= 0) {
      this.crateTimer = 10;
      if (this.pickups.filter(p => p.type === 'crate').length < 7) {
        const ang = Math.random() * Math.PI * 2;
        const dist = 260 + Math.random() * 240;
        const ballTypes = ['poke-ball', 'great-ball', 'ultra-ball'];
        this.pickups.push({
          type: 'crate',
          ballImg: ballTypes[Math.floor(Math.random() * ballTypes.length)],
          x: this.player.x + Math.cos(ang) * dist,
          y: this.player.y + Math.sin(ang) * dist,
          hp: 25
        });
      }
    }
  }

  spawnEnemy(template, isElite = false, customX = null, customY = null) {
    const angle = Math.random() * Math.PI * 2;
    const rx = this.width * 0.48 + (Math.random() - 0.5) * 40;
    const ry = this.height * 0.48 + (Math.random() - 0.5) * 40;

    const mins = this.elapsedTime / 60;
    // Gentle early scaling, steep exponential late-game scaling after 2.5 minutes!
    const lateExponent = mins > 2.5 ? Math.pow(mins - 2.5, 2.15) * 0.55 : 0;
    const timeScale = 1 + mins * 0.20 + lateExponent;
    const eliteMult = isElite ? (3.5 + mins * 0.6) : 1.0;
    const stgHpMult = this.currentStage ? this.currentStage.hpMult : 1.0;
    const stgDmgMult = this.currentStage ? this.currentStage.dmgMult : 1.0;
    const hp = Math.round(template.hp * timeScale * eliteMult * stgHpMult);
    const scale = (template.scale || 1) * (isElite ? 1.35 : 1);
    const dmgScale = (1 + Math.max(0, mins - 2.0) * 0.25) * stgDmgMult;

    this.enemies.push({
      dex: template.dex,
      name: isElite ? `우두머리 ${template.name}` : template.name,
      x: customX !== null ? customX : this.player.x + Math.cos(angle) * rx,
      y: customY !== null ? customY : this.player.y + Math.sin(angle) * ry,
      hp,
      maxHp: hp,
      speed: template.speed * (isElite ? 1.12 : 1) * (1 + Math.max(0, mins - 3) * 0.04),
      damage: Math.round(template.damage * (isElite ? 1.35 : 1) * dmgScale),
      exp: template.exp * (isElite ? 5 : 1),
      scale,
      radius: 14 * scale,
      flashTimer: 0,
      slowTimer: 0,
      isElite,
      isBoss: false,
      animPhase: Math.random() * Math.PI * 2
    });
  }

  spawnBoss(bossDef) {
    window.sound.playBossAlert();
    this.screenShake = 0.5;
    this.showToast(`⚠️ 보스 출현! [${bossDef.name}]이(가) 전장에 난입했습니다!`);
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
      exp: 80,
      scale: bossDef.scale,
      radius: 36,
      flashTimer: 0,
      slowTimer: 0,
      isBoss: true,
      isFinal: !!bossDef.isFinal,
      skillTimer: 3.5,
      dashWarnTimer: 0,
      dashActiveTimer: 0,
      dashDirX: 0,
      dashDirY: 0,
      animPhase: 0
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

  createLightningSegments(x1, y1, x2, y2, segments = 7) {
    const pts = [{ x: x1, y: y1 }];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;

    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const jitter = (Math.random() - 0.5) * Math.min(38, len * 0.22);
      pts.push({
        x: x1 + dx * t + nx * jitter,
        y: y1 + dy * t + ny * jitter
      });
    }
    pts.push({ x: x2, y: y2 });
    return pts;
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

        // Spawn water bubble particles along orbit
        if (Math.random() < 0.55) {
          const randIdx = Math.floor(Math.random() * orbCount);
          const ang = w.angle + (Math.PI * 2 * randIdx) / orbCount;
          this.particles.push({
            x: p.x + Math.cos(ang) * radius + (Math.random() - 0.5) * 10,
            y: p.y + Math.sin(ang) * radius + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 25,
            vy: -15 - Math.random() * 20,
            color: w.id === 'hydrocannon' ? '#7dd3fc' : '#bae6fd',
            r: 2.5 + Math.random() * 2.5,
            life: 0.28,
            maxLife: 0.28
          });
        }

        w.timer -= dt;
        if (w.timer <= 0) {
          w.timer = 0.2;
          for (let i = 0; i < orbCount; i++) {
            const ang = w.angle + (Math.PI * 2 * i) / orbCount;
            const ox = p.x + Math.cos(ang) * radius;
            const oy = p.y + Math.sin(ang) * radius;
            for (const e of this.enemies) {
              if (Math.hypot(e.x - ox, e.y - oy) < orbSize + e.radius) {
                const kb = p.starter.id === 'squirtle' ? 54 : 28;
                this.damageEnemy(e, def.base.damage * dmgMult * 0.55, def.color, kb);
              }
            }
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
          let hitCount = 0;
          for (const e of this.enemies) {
            if (Math.hypot(e.x - p.x, e.y - p.y) <= radius + e.radius) {
              if (p.starter.id === 'bulbasaur') {
                e.poisonTimer = 4.0;
                e.armorBreak = 4.0;
              }
              this.damageEnemy(e, def.base.damage * dmgMult, def.color, 8);
              e.slowTimer = 0.85;
              hitCount++;
              if (this.leechOrbs.length < 18 && Math.random() < 0.35) {
                this.leechOrbs.push({ x: e.x, y: e.y, color: def.color });
              }
            }
          }
          this.checkCrateHit(p.x, p.y, radius);
          if (hitCount > 0 && Math.random() < def.base.healChance) {
            p.hp = Math.min(p.maxHp, p.hp + 1.8);
          }
        }
        continue;
      }

      w.timer -= dt;
      if (w.timer > 0) continue;
      w.timer = def.base.cooldown * Math.pow(0.95, lvl - 1) * st.cooldown;

      // 1. Thunderbolt / Volt Tackle (Fractal Chain Lightning + Sky Strike + Pikachu Static Stun)
      if (w.id === 'thunderbolt' || w.id === 'volttackle') {
        const count = def.base.count + Math.floor(lvl / 3) + st.bonusAmount;
        const chains = def.base.chains + Math.floor(lvl / 2);
        const speedBonusMult = p.starter.id === 'pikachu' ? Math.max(1, st.speed / 160) : 1;
        const dmg = def.base.damage * dmgMult * speedBonusMult;

        for (let s = 0; s < count; s++) {
          const hitSet = new Set();
          let curX = p.x;
          let curY = p.y;
          for (let c = 0; c < chains; c++) {
            const target = this.findNearestEnemy(curX, curY, def.base.range * st.area, hitSet);
            if (!target) break;
            hitSet.add(target);
            if (p.starter.id === 'pikachu' && Math.random() < 0.28) {
              target.stunTimer = 0.9;
            }
            this.damageEnemy(target, dmg * Math.pow(0.86, c), def.color, 20);

            // Sky strike on first target for Volt Tackle or high level Thunderbolt
            if (c === 0 && (w.id === 'volttackle' || lvl >= 5)) {
              this.lightningBolts.push({
                pts: this.createLightningSegments(target.x + (Math.random() - 0.5) * 40, target.y - 360, target.x, target.y, 9),
                color: '#38bdf8',
                coreColor: '#ffffff',
                width: w.id === 'volttackle' ? 6 : 4,
                life: 0.22,
                maxLife: 0.22
              });
              this.shockwaves.push({ x: target.x, y: target.y, r: 6, maxR: 48, color: '#fde047', alpha: 0.9 });
            }

            this.lightningBolts.push({
              pts: this.createLightningSegments(curX, curY, target.x, target.y, 7),
              color: def.color,
              coreColor: '#ffffff',
              width: w.id === 'volttackle' ? 4.5 : 3.2,
              life: 0.2,
              maxLife: 0.2
            });

            // Electric sparks burst
            for (let k = 0; k < 6; k++) {
              const ang = Math.random() * Math.PI * 2;
              const spd = 70 + Math.random() * 110;
              this.particles.push({
                x: target.x,
                y: target.y,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                color: k % 2 === 0 ? '#fde047' : '#38bdf8',
                r: 2.5,
                life: 0.22,
                maxLife: 0.22
              });
            }

            curX = target.x;
            curY = target.y;
            this.checkCrateHit(curX, curY, 55);
          }
        }
        this.checkCrateHit(p.x, p.y, 120);
        if (w.id === 'volttackle') this.screenShake = Math.max(this.screenShake, 0.14);
      }

      // 2. Flamethrower / Blast Burn
      else if (w.id === 'flamethrower' || w.id === 'blastburn') {
        const count = def.base.count + Math.floor(lvl / 2) + st.bonusAmount;
        const nearest = this.findNearestEnemy(p.x, p.y, 600);
        const baseAngle = nearest ? Math.atan2(nearest.y - p.y, nearest.x - p.x) : p.aimAngle;

        for (let i = 0; i < count; i++) {
          const spread = w.id === 'blastburn'
            ? (Math.PI * 2 * i) / count + this.elapsedTime * 1.2
            : baseAngle + (i - (count - 1) / 2) * 0.16;

          this.projectiles.push({
            kind: w.id === 'blastburn' ? 'blastburn' : 'fire',
            x: p.x,
            y: p.y,
            vx: Math.cos(spread) * def.base.speed,
            vy: Math.sin(spread) * def.base.speed,
            r: def.base.size * st.area,
            damage: def.base.damage * dmgMult,
            pierce: def.base.pierce + Math.floor(lvl / 2),
            color: def.color,
            life: 1.6,
            rot: 0,
            trail: [],
            hitSet: new Set()
          });
        }
      }

      // 3. Shadow Ball / Dark Void
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
            bounces: def.base.bounces + Math.floor(lvl / 2) + (p.starter.id === 'gastly' ? 2 : 0),
            color: def.color,
            life: 2.9,
            rot: 0,
            trail: [],
            hitSet: new Set()
          });
        }
      }

      // 4. Aura Sphere / Aura Storm (Spinning Shuriken Boomerang)
      else if (w.id === 'aurasphere' || w.id === 'aurastorm') {
        const count = def.base.count + Math.floor(lvl / 2) + st.bonusAmount;
        const nearest = this.findNearestEnemy(p.x, p.y, 500);
        const baseAng = nearest ? Math.atan2(nearest.y - p.y, nearest.x - p.x) : p.aimAngle;

        for (let i = 0; i < count; i++) {
          const ang = baseAng + (i * Math.PI * 2) / count;
          this.projectiles.push({
            kind: 'boomerang',
            isStorm: w.id === 'aurastorm',
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
            rot: 0,
            trail: [],
            life: 2.35,
            hitSet: new Set()
          });
        }
      }

      // 5. Draco Meteor (Real Falling Meteors from Sky + Warning Reticle + Lava Crater)
      else if (w.id === 'dracometeor') {
        const count = def.base.count + Math.floor(lvl / 2) + st.bonusAmount;
        const radius = (def.base.radius + lvl * 6) * st.area;
        for (let i = 0; i < count; i++) {
          const randEnemy = this.enemies[Math.floor(Math.random() * this.enemies.length)];
          const tx = randEnemy ? randEnemy.x : p.x + (Math.random() - 0.5) * 320;
          const ty = randEnemy ? randEnemy.y : p.y + (Math.random() - 0.5) * 320;

          this.fallingMeteors.push({
            startX: tx + 220,
            startY: ty - 380,
            targetX: tx,
            targetY: ty,
            progress: 0,
            duration: 0.42,
            radius,
            damage: def.base.damage * dmgMult,
            poolDuration: def.base.duration + lvl * 0.22
          });
        }
      }

      // 6. Psychic Wave (Multi-ring Hexagonal Prism Shockwave)
      else if (w.id === 'psychicwave') {
        const radius = (def.base.radius + lvl * 14) * st.area;
        this.shockwaves.push({ x: p.x, y: p.y, r: 14, maxR: radius, color: '#f472b6', alpha: 1, hex: true });
        this.shockwaves.push({ x: p.x, y: p.y, r: 6, maxR: radius * 0.78, color: '#38bdf8', alpha: 0.85, hex: true });
        for (const e of this.enemies) {
          const d = Math.hypot(e.x - p.x, e.y - p.y);
          if (d <= radius + e.radius) {
            this.damageEnemy(e, def.base.damage * dmgMult, '#f472b6', def.base.knockback);
          }
        }
        this.checkCrateHit(p.x, p.y, radius);
      }

      // 7. Swift (360 Spinning 5-Pointed Stars with Stardust Trail)
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
            pierce: 2 + Math.floor(lvl / 4),
            color: def.color,
            rot: ang,
            trail: [],
            life: 1.55,
            hitSet: new Set()
          });
        }
      }

      // 8. TM01 Hyper Beam / Giga Impact Laser (Piercing High-Energy Laser Beam)
      else if (w.id === 'hyperbeam' || w.id === 'gigaimpact') {
        const count = def.base.count + Math.floor(lvl / 3) + st.bonusAmount;
        const beamW = (def.base.width + lvl * 1.5) * st.area;
        const beamLen = def.base.range * st.area;
        // Prioritize highest HP enemy in range
        let bestTarget = null;
        let bestHp = -1;
        for (const e of this.enemies) {
          if (Math.hypot(e.x - p.x, e.y - p.y) < beamLen && e.hp > bestHp) {
            bestHp = e.hp;
            bestTarget = e;
          }
        }
        const baseAng = bestTarget ? Math.atan2(bestTarget.y - p.y, bestTarget.x - p.x) : p.aimAngle;

        for (let i = 0; i < count; i++) {
          const ang = count === 1 ? baseAng : baseAng + (i - (count - 1) / 2) * 0.28;
          const x2 = p.x + Math.cos(ang) * beamLen;
          const y2 = p.y + Math.sin(ang) * beamLen;

          this.laserBeams.push({
            x1: p.x,
            y1: p.y,
            x2,
            y2,
            width: beamW,
            color: def.color,
            coreColor: '#ffffff',
            life: 0.34,
            maxLife: 0.34
          });

          // Line-segment collision with all enemies along beam
          const dx = Math.cos(ang);
          const dy = Math.sin(ang);
          for (const e of this.enemies) {
            const ex = e.x - p.x;
            const ey = e.y - p.y;
            const proj = ex * dx + ey * dy;
            if (proj >= -15 && proj <= beamLen) {
              const perp = Math.abs(ex * (-dy) + ey * dx);
              if (perp <= beamW * 0.65 + e.radius) {
                this.damageEnemy(e, def.base.damage * dmgMult, def.color, 34);
              }
            }
          }
          this.checkCrateHit(p.x + dx * 180, p.y + dy * 180, beamW + 40);
        }
        this.screenShake = Math.max(this.screenShake, w.id === 'gigaimpact' ? 0.25 : 0.14);
      }

      // 9. TM02 Aerial Ace / Sacred Sword (High-Speed Crescent Sword Slashes)
      else if (w.id === 'aerialace' || w.id === 'sacredsword') {
        const count = def.base.count + Math.floor(lvl / 2) + st.bonusAmount;
        const radius = (def.base.radius + lvl * 6) * st.area;
        const nearest = this.findNearestEnemy(p.x, p.y, radius * 1.6);
        const baseAng = nearest ? Math.atan2(nearest.y - p.y, nearest.x - p.x) : p.aimAngle;

        for (let i = 0; i < count; i++) {
          const ang = count === 1 ? baseAng : baseAng + (Math.PI * 2 * i) / count;
          this.slashArcs.push({
            x: p.x + Math.cos(ang) * (radius * 0.38),
            y: p.y + Math.sin(ang) * (radius * 0.38),
            angle: ang,
            radius: radius * 0.85,
            color: def.color,
            coreColor: def.secondaryColor,
            life: 0.24,
            maxLife: 0.24
          });

          for (const e of this.enemies) {
            const d = Math.hypot(e.x - p.x, e.y - p.y);
            if (d <= radius + e.radius) {
              const eAng = Math.atan2(e.y - p.y, e.x - p.x);
              const diff = Math.abs(Math.atan2(Math.sin(eAng - ang), Math.cos(eAng - ang)));
              if (w.id === 'sacredsword' || diff <= 1.25 || d < 42) {
                this.damageEnemy(e, def.base.damage * dmgMult, def.color, 36);
              }
            }
          }
        }
        this.checkCrateHit(p.x, p.y, radius);
      }

      // 10. TM03 Rock Slide / Stone Edge (Rolling Boulders that Crush & Stun)
      else if (w.id === 'rockslide' || w.id === 'stoneedge') {
        const count = def.base.count + Math.floor(lvl / 2) + st.bonusAmount;
        const nearest = this.findNearestEnemy(p.x, p.y, 480);
        const baseAng = nearest ? Math.atan2(nearest.y - p.y, nearest.x - p.x) : p.aimAngle;

        for (let i = 0; i < count; i++) {
          const ang = baseAng + (i - (count - 1) / 2) * 0.32;
          this.projectiles.push({
            kind: 'rock',
            isEvolved: w.id === 'stoneedge',
            x: p.x,
            y: p.y,
            vx: Math.cos(ang) * def.base.speed,
            vy: Math.sin(ang) * def.base.speed,
            r: def.base.size * st.area,
            damage: def.base.damage * dmgMult,
            pierce: def.base.pierce + Math.floor(lvl / 2),
            color: def.color,
            rot: Math.random() * Math.PI,
            trail: [],
            life: 1.9,
            hitSet: new Set()
          });
        }
      }

      // 11. TM04 Twister / Hurricane (Roaming Multi-Hit Vortex Tornadoes)
      else if (w.id === 'twister' || w.id === 'hurricane') {
        const count = def.base.count + Math.floor(lvl / 3) + st.bonusAmount;
        for (let i = 0; i < count; i++) {
          const ang = (Math.PI * 2 * i) / count + this.elapsedTime * 0.7;
          this.projectiles.push({
            kind: 'tornado',
            isEvolved: w.id === 'hurricane',
            x: p.x,
            y: p.y,
            vx: Math.cos(ang) * def.base.speed,
            vy: Math.sin(ang) * def.base.speed,
            r: def.base.size * st.area,
            damage: def.base.damage * dmgMult,
            pierce: 999,
            color: def.color,
            rot: 0,
            tickTimer: 0,
            trail: [],
            life: def.base.life,
            hitSet: new Set()
          });
        }
      }

      // 12. TM05 Earthquake / Earth Power (Ground-Shattering Seismic Quake)
      else if (w.id === 'earthquake' || w.id === 'earthpower') {
        const radius = (def.base.radius + lvl * 12) * st.area;
        this.screenShake = Math.max(this.screenShake, w.id === 'earthpower' ? 0.32 : 0.20);
        this.shockwaves.push({ x: p.x, y: p.y, r: 12, maxR: radius, color: def.color, alpha: 1, hex: true });
        this.shockwaves.push({ x: p.x, y: p.y, r: 6, maxR: radius * 0.72, color: '#a8a29e', alpha: 0.9, hex: false });

        for (let k = 0; k < 14; k++) {
          const ang = (Math.PI * 2 * k) / 14 + Math.random() * 0.2;
          const dist = radius * (0.35 + Math.random() * 0.6);
          this.particles.push({
            x: p.x + Math.cos(ang) * dist,
            y: p.y + Math.sin(ang) * dist,
            vx: (Math.random() - 0.5) * 40,
            vy: -30 - Math.random() * 40,
            color: k % 2 === 0 ? '#eab308' : '#a8a29e',
            r: 4 + Math.random() * 3,
            life: 0.38,
            maxLife: 0.38
          });
        }

        for (const e of this.enemies) {
          if (Math.hypot(e.x - p.x, e.y - p.y) <= radius + e.radius) {
            this.damageEnemy(e, def.base.damage * dmgMult, def.color, 30);
            e.slowTimer = 1.8;
            if (w.id === 'earthpower') e.stunTimer = 0.75;
          }
        }
        this.checkCrateHit(p.x, p.y, radius);
      }

      // 13. TM06 Icicle Spear / Sheer Cold (Piercing Ice Spears that Freeze Enemies)
      else if (w.id === 'iciclespear' || w.id === 'sheercold') {
        const count = def.base.count + Math.floor(lvl / 2) + st.bonusAmount;
        const nearest = this.findNearestEnemy(p.x, p.y, 550);
        const baseAng = nearest ? Math.atan2(nearest.y - p.y, nearest.x - p.x) : p.aimAngle;

        for (let i = 0; i < count; i++) {
          const spread = w.id === 'sheercold'
            ? baseAng + (i - (count - 1) / 2) * 0.18
            : baseAng + (i - (count - 1) / 2) * 0.13;
          this.projectiles.push({
            kind: 'icicle',
            isEvolved: w.id === 'sheercold',
            x: p.x,
            y: p.y,
            vx: Math.cos(spread) * def.base.speed,
            vy: Math.sin(spread) * def.base.speed,
            r: def.base.size * st.area,
            damage: def.base.damage * dmgMult,
            pierce: def.base.pierce + Math.floor(lvl / 2),
            color: def.color,
            rot: spread,
            trail: [],
            life: 1.5,
            hitSet: new Set()
          });
        }
      }
    }
  }

  updateFallingMeteors(dt) {
    for (let i = this.fallingMeteors.length - 1; i >= 0; i--) {
      const m = this.fallingMeteors[i];
      m.progress += dt / m.duration;
      const curX = m.startX + (m.targetX - m.startX) * m.progress;
      const curY = m.startY + (m.targetY - m.startY) * m.progress;

      // Meteor fire trail particles
      this.particles.push({
        x: curX + (Math.random() - 0.5) * 14,
        y: curY + (Math.random() - 0.5) * 14,
        vx: 30 + Math.random() * 40,
        vy: -50 - Math.random() * 40,
        color: Math.random() < 0.5 ? '#fde047' : '#fb7185',
        r: 4 + Math.random() * 4,
        life: 0.25,
        maxLife: 0.25
      });

      if (m.progress >= 1) {
        this.screenShake = Math.max(this.screenShake, 0.22);
        this.shockwaves.push({ x: m.targetX, y: m.targetY, r: 10, maxR: m.radius * 1.15, color: '#fde047', alpha: 1 });
        for (const e of this.enemies) {
          if (Math.hypot(e.x - m.targetX, e.y - m.targetY) <= m.radius + e.radius) {
            this.damageEnemy(e, m.damage, '#fb7185', 38);
          }
        }
        this.checkCrateHit(m.targetX, m.targetY, m.radius);
        this.groundZones.push({
          x: m.targetX,
          y: m.targetY,
          radius: m.radius,
          damage: m.damage * 0.36,
          duration: m.poolDuration,
          tickTimer: 0.2
        });
        this.fallingMeteors.splice(i, 1);
      }
    }
  }

  updateProjectiles(dt) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const pr = this.projectiles[i];
      pr.life -= dt;
      pr.rot = (pr.rot || 0) + dt * 11;

      if (pr.trail) {
        pr.trail.push({ x: pr.x, y: pr.y });
        if (pr.trail.length > 7) pr.trail.shift();
      }

      if (pr.kind === 'boomerang') {
        pr.elapsed += dt;
        const factor = 1 - pr.elapsed * 2.1;
        pr.x += pr.dirX * pr.speed * factor * dt;
        pr.y += pr.dirY * pr.speed * factor * dt;
        if (Math.abs(pr.elapsed - 0.55) < dt) {
          pr.hitSet.clear();
        }
      } else if (pr.kind === 'tornado') {
        // Swirl slightly while roaming
        const swirl = Math.sin(this.elapsedTime * 4 + i) * 40;
        pr.x += (pr.vx + swirl * 0.3) * dt;
        pr.y += (pr.vy + Math.cos(this.elapsedTime * 4 + i) * 15) * dt;
        pr.tickTimer -= dt;
        if (pr.tickTimer <= 0) {
          pr.tickTimer = 0.26;
          pr.hitSet.clear();
        }
      } else {
        pr.x += pr.vx * dt;
        pr.y += pr.vy * dt;
      }

      // Fire & Blast Burn ember particles
      if ((pr.kind === 'fire' || pr.kind === 'blastburn') && Math.random() < 0.55) {
        this.particles.push({
          x: pr.x + (Math.random() - 0.5) * pr.r,
          y: pr.y + (Math.random() - 0.5) * pr.r,
          vx: -pr.vx * 0.15 + (Math.random() - 0.5) * 30,
          vy: -pr.vy * 0.15 + (Math.random() - 0.5) * 30,
          color: Math.random() < 0.5 ? '#fde047' : '#ef4444',
          r: pr.kind === 'blastburn' ? 4.5 : 3,
          life: 0.22,
          maxLife: 0.22
        });
      }

      // Dark Void gravity pull
      if (pr.kind === 'darkvoid') {
        for (const e of this.enemies) {
          const d = Math.hypot(pr.x - e.x, pr.y - e.y);
          if (d < 145 && d > 5) {
            e.x += ((pr.x - e.x) / d) * 105 * dt;
            e.y += ((pr.y - e.y) / d) * 105 * dt;
          }
        }
      }

      this.checkCrateHit(pr.x, pr.y, pr.r + 12);

      for (const e of this.enemies) {
        if (pr.hitSet.has(e)) continue;
        if (Math.hypot(pr.x - e.x, pr.y - e.y) <= pr.r + e.radius) {
          pr.hitSet.add(e);
          this.damageEnemy(e, pr.damage, pr.color, pr.kind === 'rock' ? 35 : 22);

          // Status Effects from Projectiles
          if ((pr.kind === 'fire' || pr.kind === 'blastburn') && this.player.starter.id === 'charmander') {
            e.burnTimer = 3.0;
            e.burnDmg = Math.max(4, Math.round(pr.damage * 0.28));
          }
          if (pr.kind === 'rock' && Math.random() < (pr.isEvolved ? 0.6 : 0.35)) {
            e.stunTimer = 0.9;
          }
          if (pr.kind === 'icicle' && Math.random() < (pr.isEvolved ? 0.65 : 0.35)) {
            e.freezeTimer = 1.35;
          }

          if (pr.kind === 'blastburn') {
            this.shockwaves.push({ x: pr.x, y: pr.y, r: 5, maxR: 42, color: '#f97316', alpha: 0.85 });
          }

          if (pr.kind === 'bounce' || pr.kind === 'darkvoid') {
            if (pr.bounces > 0) {
              pr.bounces--;
              this.shockwaves.push({ x: pr.x, y: pr.y, r: 4, maxR: 34, color: pr.color, alpha: 0.8 });
              const nextTarget = this.findNearestEnemy(pr.x, pr.y, 340, pr.hitSet);
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
        this.shockwaves.push({ x: pk.x, y: pk.y, r: 4, maxR: 38, color: '#ffffff', alpha: 0.9 });
        const roll = Math.random();
        let dropType = 'coin';
        if (roll < 0.34) dropType = 'potion';
        else if (roll < 0.54) dropType = 'magnet';
        else if (roll < 0.72) dropType = 'bomb';

        this.pickups.push({ type: dropType, x: pk.x, y: pk.y, magnetized: true });
      }
    }
  }

  damageEnemy(e, rawDamage, color = '#fff', knockback = 14) {
    const isRiolu = this.player.starter.id === 'riolu';
    const critLab = this.getUpgradeLevel('crit');
    const bossSlayerLab = this.getUpgradeLevel('boss_slayer');
    const critChance = (isRiolu ? 0.39 : 0.14) + critLab * 0.02;
    const critMult = (isRiolu ? 2.0 : 1.5) + critLab * 0.06;
    const isCrit = Math.random() < critChance;
    const bossBonus = ((isRiolu && (e.isBoss || e.isElite)) ? 1.25 : 1.0) * ((e.isBoss || e.isElite) ? (1 + bossSlayerLab * 0.08) : 1.0);
    const vulnMult = (e.armorBreak && e.armorBreak > 0) ? 1.25 : 1.0;
    const dmg = Math.max(1, Math.round(rawDamage * bossBonus * vulnMult * (isCrit ? critMult : 1) * (0.92 + Math.random() * 0.16)));
    e.hp -= dmg;
    e.flashTimer = 0.11;
    window.sound.playHit();

    const dx = e.x - this.player.x;
    const dy = e.y - this.player.y;
    const d = Math.hypot(dx, dy) || 1;
    const kb = e.isBoss ? knockback * 0.12 : e.isElite ? knockback * 0.45 : knockback;
    e.x += (dx / d) * kb;
    e.y += (dy / d) * kb;

    if (this.floatingTexts.length < 55) {
      this.floatingTexts.push({
        x: e.x + (Math.random() - 0.5) * 18,
        y: e.y - e.radius,
        text: isCrit ? `${dmg}!` : String(dmg),
        color: isCrit ? '#fde047' : color,
        scale: isCrit ? 1.25 : 1.0,
        life: 0.55
      });
    }
  }

  damagePlayer(rawDamage) {
    const p = this.player;
    if (p.invulnTimer > 0) return;

    // Gastly Trait [Levitate]: 30% Dodge Chance!
    if (p.starter.id === 'gastly' && Math.random() < 0.30) {
      p.invulnTimer = 0.25;
      this.floatingTexts.push({
        x: p.x,
        y: p.y - 26,
        text: '👻회피(MISS)!',
        color: '#c084fc',
        scale: 1.15,
        life: 0.65
      });
      return;
    }

    // Squirtle Trait [Shell Armor Water Shield]: blocks 1 hit & knocks back enemies!
    if (p.waterShield) {
      p.waterShield = false;
      p.waterShieldTimer = 0;
      p.invulnTimer = 0.45;
      window.sound.playHeal();
      this.shockwaves.push({ x: p.x, y: p.y, r: 8, maxR: 130, color: '#38bdf8', alpha: 0.95 });
      this.floatingTexts.push({
        x: p.x,
        y: p.y - 28,
        text: '🛡️보호막 방어!',
        color: '#38bdf8',
        scale: 1.2,
        life: 0.75
      });
      for (const e of this.enemies) {
        const d = Math.hypot(e.x - p.x, e.y - p.y) || 1;
        if (d < 150 && !e.isBoss) {
          e.x += ((e.x - p.x) / d) * 65;
          e.y += ((e.y - p.y) / d) * 65;
        }
      }
      return;
    }

    const st = this.getComputedStats();
    const dmg = Math.max(1, rawDamage - st.armor);
    p.hp -= dmg;
    p.invulnTimer = 0.36;
    this.screenShake = 0.2;
    window.sound.playHit();

    if (p.hp <= 0) {
      if (p.revivesLeft > 0) {
        p.revivesLeft--;
        p.hp = Math.round(p.maxHp * 0.6);
        p.invulnTimer = 2.5;
        window.sound.playEvolve();
        this.showToast('✨ 기력의덩어리 발동! 체력 60%로 부활했습니다!');
        this.shockwaves.push({ x: p.x, y: p.y, r: 10, maxR: 340, color: '#facc15', alpha: 1, hex: true });
        for (const e of this.enemies) {
          const d = Math.hypot(e.x - p.x, e.y - p.y) || 1;
          if (d < 300 && !e.isBoss) {
            e.x += ((e.x - p.x) / d) * 190;
            e.y += ((e.y - p.y) / d) * 190;
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
      e.animPhase = (e.animPhase || 0) + dt * 9;

      if (e.hp <= 0) {
        this.kills++;
        for (let k = 0; k < (e.isBoss ? 16 : e.isElite ? 9 : 5); k++) {
          const ang = Math.random() * Math.PI * 2;
          const spd = 45 + Math.random() * 95;
          this.particles.push({
            x: e.x,
            y: e.y,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd,
            color: e.isBoss ? '#facc15' : e.isElite ? '#fb7185' : '#cbd5e1',
            r: e.isBoss ? 5.5 : 3.2,
            life: 0.35,
            maxLife: 0.35
          });
        }

        this.gems.push({
          x: e.x,
          y: e.y,
          exp: e.exp,
          magnetized: false
        });

        if (e.isElite || Math.random() < 0.045) {
          this.pickups.push({ type: 'coin', x: e.x + 8, y: e.y });
        }

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
      if (e.stunTimer > 0) e.stunTimer -= dt;
      if (e.freezeTimer > 0) e.freezeTimer -= dt;
      if (e.armorBreak > 0) e.armorBreak -= dt;

      // Burn & Poison DoT tick
      if (e.burnTimer > 0) {
        e.burnTimer -= dt;
        e.hp -= (e.burnDmg || 8) * dt;
      }
      if (e.poisonTimer > 0) {
        e.poisonTimer -= dt;
        e.hp -= 10 * dt;
      }

      const dx = p.x - e.x;
      const dy = p.y - e.y;
      const dist = Math.hypot(dx, dy) || 1;

      if (!e.isBoss && dist > Math.max(this.width, this.height) * 1.15) {
        const ang = Math.random() * Math.PI * 2;
        const r = Math.hypot(this.width / 2, this.height / 2) + 40;
        e.x = p.x + Math.cos(ang) * r;
        e.y = p.y + Math.sin(ang) * r;
        continue;
      }

      const isImmobilized = (e.stunTimer > 0) || (e.freezeTimer > 0);
      if (isImmobilized && !e.isBoss) {
        // Stunned or frozen enemies cannot move!
        continue;
      }

      // Boss Dash & Radial Attack AI
      if (e.isBoss) {
        if (e.dashWarnTimer > 0) {
          e.dashWarnTimer -= dt;
          if (e.dashWarnTimer <= 0) {
            e.dashActiveTimer = 0.55;
          }
        } else if (e.dashActiveTimer > 0) {
          e.dashActiveTimer -= dt;
          e.x += e.dashDirX * e.speed * 3.1 * dt;
          e.y += e.dashDirY * e.speed * 3.1 * dt;
        } else {
          const spd = e.speed * (e.slowTimer > 0 ? 0.65 : 1);
          e.x += (dx / dist) * spd * dt;
          e.y += (dy / dist) * spd * dt;

          e.skillTimer -= dt;
          if (e.skillTimer <= 0) {
            e.skillTimer = e.isFinal ? 2.6 : 3.8;
            // Alternate between radial bullet burst and charge dash
            if (Math.random() < 0.45) {
              e.dashWarnTimer = 0.65;
              e.dashDirX = dx / dist;
              e.dashDirY = dy / dist;
            } else {
              const bulletCount = e.isFinal ? 12 : 8;
              const baseAng = Math.atan2(dy, dx);
              for (let b = 0; b < bulletCount; b++) {
                const ang = baseAng + (Math.PI * 2 * b) / bulletCount;
                this.enemyBullets.push({
                  x: e.x,
                  y: e.y,
                  vx: Math.cos(ang) * 210,
                  vy: Math.sin(ang) * 210,
                  r: 8.5,
                  damage: Math.round(e.damage * 0.8),
                  life: 3.5
                });
              }
            }
          }
        }
      } else {
        const spd = e.speed * (e.slowTimer > 0 ? 0.55 : 1);
        e.x += (dx / dist) * spd * dt;
        e.y += (dy / dist) * spd * dt;
      }

      // Fast neighbor separation
      const next = this.enemies[(i + 1) % this.enemies.length];
      if (next && next !== e) {
        const sx = e.x - next.x;
        const sy = e.y - next.y;
        const sd = Math.hypot(sx, sy);
        const minD = (e.radius + next.radius) * 0.72;
        if (sd > 0 && sd < minD) {
          const push = (minD - sd) * 0.35;
          e.x += (sx / sd) * push;
          e.y += (sy / sd) * push;
        }
      }

      if (dist < e.radius + 15) {
        this.damagePlayer(e.damage);
      }
    }
  }

  updatePickupsAndGems(dt, st) {
    const p = this.player;

    for (let i = this.gems.length - 1; i >= 0; i--) {
      const g = this.gems[i];
      const d = Math.hypot(p.x - g.x, p.y - g.y);
      if (d <= st.magnet) {
        g.magnetized = true;
      }
      if (g.magnetized) {
        const pullSpeed = 480;
        g.x += ((p.x - g.x) / (d || 1)) * pullSpeed * dt;
        g.y += ((p.y - g.y) / (d || 1)) * pullSpeed * dt;
      }
      if (d < 22) {
        window.sound.playGem();
        this.gainExp(g.exp);
        this.gems.splice(i, 1);
      }
    }

    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const pk = this.pickups[i];
      const d = Math.hypot(p.x - pk.x, p.y - pk.y);

      // Pokéball / Great Ball / Ultra Ball field capsules open automatically when player walks near!
      if (pk.type === 'crate') {
        if (d <= 48) {
          this.checkCrateHit(pk.x, pk.y, 24);
        }
        continue;
      }

      // Gold coins & field drops also get pulled in by player's magnet radius!
      if (pk.type !== 'chest' && d <= st.magnet) {
        pk.magnetized = true;
      }
      if (pk.magnetized) {
        const pullSpeed = 480;
        pk.x += ((p.x - pk.x) / (d || 1)) * pullSpeed * dt;
        pk.y += ((p.y - pk.y) / (d || 1)) * pullSpeed * dt;
      }

      if (d < 28) {
        this.pickups.splice(i, 1);
        if (pk.type === 'potion') {
          window.sound.playHeal();
          p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.4);
          this.showToast('🧪 좋은상처약 획득! 체력 40% 회복!');
        } else if (pk.type === 'magnet') {
          window.sound.playHeal();
          for (const g of this.gems) g.magnetized = true;
          for (const item of this.pickups) {
            if (item.type === 'coin') item.magnetized = true;
          }
          this.showToast('🧲 레어코일 자석 발동! 맵 전체 이상한사탕 & 코인 흡수!');
        } else if (pk.type === 'bomb') {
          window.sound.playBossAlert();
          this.screenShake = 0.45;
          this.shockwaves.push({ x: p.x, y: p.y, r: 10, maxR: 500, color: '#ef4444', alpha: 1, hex: true });
          for (const e of this.enemies) {
            if (!e.isBoss && Math.hypot(e.x - p.x, e.y - p.y) < 540) {
              this.damageEnemy(e, 999, '#ef4444');
            }
          }
          this.showToast('💥 대폭발 발동! 주변 야생 포켓몬 초토화!');
        } else if (pk.type === 'coin') {
          window.sound.playGem();
          const c = Math.max(1, Math.round(3 * p.greedMult));
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

    const stg = this.currentStage || window.GAME_DATA.stages[0];
    let firstClearBonus = 0;
    if (victory && stg) {
      if (!Array.isArray(this.saveData.clearedStages)) this.saveData.clearedStages = [];
      if (!this.saveData.clearedStages.includes(stg.id)) {
        this.saveData.clearedStages.push(stg.id);
        firstClearBonus = stg.clearBonus || 200;
      }
    }

    const bonusCoins = Math.round((Math.floor(this.elapsedTime * 0.4) + (victory ? (stg.clearBonus || 200) : 0)) * this.player.greedMult) + firstClearBonus;
    this.runCoins += bonusCoins;
    this.saveData.coins += bonusCoins;
    if (this.elapsedTime > (this.saveData.bestTime || 0)) {
      this.saveData.bestTime = Math.floor(this.elapsedTime);
    }
    this.saveProgress();

    const badge = document.getElementById('resultBadge');
    const title = document.getElementById('resultTitle');
    const btnNext = document.getElementById('btnNextStage');
    const btnEndless = document.getElementById('btnEndlessMode');

    if (victory) {
      badge.textContent = `STAGE ${stg.id} CLEAR!`;
      badge.className = 'levelup-badge gold';
      title.textContent = `🎉 ${stg.name} 정복 완료!`;
      if (btnNext) {
        if (stg.id < window.GAME_DATA.stages.length) {
          btnNext.classList.remove('hidden');
          btnNext.textContent = `⚔️ 다음 스테이지 (STAGE ${stg.id + 1}) 출격!`;
        } else {
          btnNext.classList.add('hidden');
        }
      }
      if (btnEndless) btnEndless.classList.remove('hidden');
    } else {
      badge.textContent = 'BATTLE ENDED';
      badge.className = 'levelup-badge';
      title.textContent = `${this.player.name}(은)는 쓰러졌다...`;
      if (btnNext) btnNext.classList.add('hidden');
      if (btnEndless) btnEndless.classList.add('hidden');
    }

    const mins = Math.floor(this.elapsedTime / 60);
    const secs = Math.floor(this.elapsedTime % 60);
    document.getElementById('resultSummary').innerHTML = `
      <div class="stat-line"><span>도전 스테이지</span><strong>${stg.icon} ${stg.name}</strong></div>
      <div class="stat-line"><span>최종 파트너</span><strong>${this.player.name} (Lv.${this.player.level})</strong></div>
      <div class="stat-line"><span>생존 시간</span><strong>${mins}분 ${secs}초</strong></div>
      <div class="stat-line"><span>처치한 야생 포켓몬</span><strong>${this.kills.toLocaleString()}마리</strong></div>
      <div class="stat-line"><span>총 획득 포켓코인</span><strong style="color:#fde047">+🪙 ${this.runCoins.toLocaleString()}</strong></div>
    `;

    document.getElementById('gameOverModal').classList.remove('hidden');
  }

  drawStarPolygon(ctx, cx, cy, spikes, outerR, innerR, rot = 0) {
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const ang = (i * Math.PI) / spikes + rot;
      const x = cx + Math.cos(ang) * r;
      const y = cy + Math.sin(ang) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  draw() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const p = this.player;

    ctx.save();
    if (this.screenShake > 0) {
      const mag = this.screenShake * 14;
      ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
    }

    const camX = p.x - w / 2;
    const camY = p.y - h / 2;

    // 1. Rich Textured Tilemap & Roads & Environment Props
    const tileSize = 64;
    const startCol = Math.floor(camX / tileSize) - 1;
    const endCol = Math.floor((camX + w) / tileSize) + 1;
    const startRow = Math.floor(camY / tileSize) - 1;
    const endRow = Math.floor((camY + h) / tileSize) + 1;

    const grass1 = this.assets.getEnv('grass_1');
    const grass2 = this.assets.getEnv('grass_2');
    const pathTile = this.assets.getEnv('path_1');
    const bushImg = this.assets.getEnv('bush');
    const rockImg = this.assets.getEnv('rock');
    const flowersImg = this.assets.getEnv('flowers');

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const sx = Math.floor(c * tileSize - camX);
        const sy = Math.floor(r * tileSize - camY);
        const hash = Math.abs((c * 73856093) ^ (r * 19349663)) % 100;

        const isRoad = (Math.abs(c % 14) <= 1) || (Math.abs(r % 14) <= 1);
        if (isRoad && pathTile.complete && pathTile.naturalWidth > 0) {
          ctx.drawImage(pathTile, sx, sy, tileSize, tileSize);
        } else {
          const gTile = (c + r) % 2 === 0 ? grass1 : grass2;
          if (gTile && gTile.complete && gTile.naturalWidth > 0) {
            ctx.drawImage(gTile, sx, sy, tileSize, tileSize);
          } else {
            ctx.fillStyle = (c + r) % 2 === 0 ? '#1c3b28' : '#183423';
            ctx.fillRect(sx, sy, tileSize, tileSize);
          }

          // Decorative environment props on grass
          if (hash < 6 && bushImg.complete && bushImg.naturalWidth > 0) {
            ctx.drawImage(bushImg, sx + 8, sy + 8, 48, 48);
          } else if (hash >= 6 && hash < 9 && rockImg.complete && rockImg.naturalWidth > 0) {
            ctx.drawImage(rockImg, sx + 8, sy + 8, 44, 44);
          } else if (hash >= 9 && hash < 18 && flowersImg.complete && flowersImg.naturalWidth > 0) {
            ctx.drawImage(flowersImg, sx + 8, sy + 8, 48, 48);
          }
        }
      }
    }

    // Stage Biome Tint Overlay
    if (this.currentStage && this.currentStage.mapTint && this.currentStage.id > 1) {
      ctx.fillStyle = this.currentStage.mapTint;
      ctx.fillRect(0, 0, w, h);
    }

    const st = this.getComputedStats();

    // 2. Ground Zones (Draco Meteor Lava Pools)
    for (const gz of this.groundZones) {
      const gx = gz.x - camX;
      const gy = gz.y - camY;
      ctx.save();
      const grad = ctx.createRadialGradient(gx, gy, gz.radius * 0.1, gx, gy, gz.radius);
      grad.addColorStop(0, 'rgba(253, 224, 71, 0.55)');
      grad.addColorStop(0.55, 'rgba(249, 115, 22, 0.38)');
      grad.addColorStop(1, 'rgba(244, 63, 94, 0.0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(gx, gy, gz.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(251, 113, 133, 0.75)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(gx, gy, gz.radius * 0.9, this.elapsedTime * 2, this.elapsedTime * 2 + Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 3. Giga Drain / Frenzy Plant Arcane Nature Sanctuary Aura
    const auraW = p.weapons.frenzyplant || p.weapons.gigadrain;
    if (auraW) {
      const def = window.GAME_DATA.weapons[auraW.id];
      const radius = (def.base.radius + (auraW.level - 1) * 10) * st.area;
      const cx = w / 2;
      const cy = h / 2;

      ctx.save();
      const grad = ctx.createRadialGradient(cx, cy, radius * 0.15, cx, cy, radius);
      grad.addColorStop(0, 'rgba(74, 222, 128, 0.04)');
      grad.addColorStop(0.75, auraW.id === 'frenzyplant' ? 'rgba(22, 163, 74, 0.24)' : 'rgba(74, 222, 128, 0.16)');
      grad.addColorStop(1, 'rgba(74, 222, 128, 0.35)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Rotating arcane geometric ring
      ctx.strokeStyle = def.color;
      ctx.lineWidth = auraW.id === 'frenzyplant' ? 2.8 : 1.8;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.globalAlpha = 0.45;
      this.drawStarPolygon(ctx, cx, cy, auraW.id === 'frenzyplant' ? 8 : 6, radius * 0.95, radius * 0.55, p.auraRot);
      ctx.stroke();
      ctx.restore();
    }

    // 4. EXP Gems (Official Rare Candy Sprites + Tier Glow)
    const candyImg = this.assets.getItem('rare-candy');
    for (const g of this.gems) {
      const gx = g.x - camX;
      const gy = g.y - camY;
      if (gx < -24 || gx > w + 24 || gy < -24 || gy > h + 24) continue;

      ctx.save();
      ctx.fillStyle = g.exp >= 10 ? 'rgba(250, 204, 21, 0.45)' : g.exp >= 5 ? 'rgba(74, 222, 128, 0.4)' : 'rgba(56, 189, 248, 0.35)';
      ctx.beginPath();
      ctx.arc(gx, gy, g.exp >= 10 ? 11 : 8, 0, Math.PI * 2);
      ctx.fill();

      if (candyImg && candyImg.complete && candyImg.naturalWidth > 0) {
        const sz = g.exp >= 10 ? 26 : 22;
        ctx.drawImage(candyImg, gx - sz / 2, gy - sz / 2, sz, sz);
      }
      ctx.restore();
    }

    // 5. Pickups & Pokéball Crates (Official Item Sprites)
    for (const pk of this.pickups) {
      const px = pk.x - camX;
      const py = pk.y - camY;
      if (px < -40 || px > w + 40 || py < -40 || py > h + 40) continue;

      const bob = Math.sin(this.elapsedTime * 5 + pk.x) * 3;
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(px, py + 12, 11, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      let itemName = 'poke-ball';
      let sz = 30;
      if (pk.type === 'crate') {
        itemName = pk.ballImg || 'poke-ball';
        sz = 32;
      } else if (pk.type === 'potion') {
        itemName = 'super-potion';
      } else if (pk.type === 'magnet') {
        itemName = 'magnet';
      } else if (pk.type === 'bomb') {
        itemName = 'ultra-ball';
      } else if (pk.type === 'coin') {
        itemName = 'amulet-coin';
      } else if (pk.type === 'chest') {
        itemName = 'master-ball';
        sz = 40;
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(px, py + bob, 22, 0, Math.PI * 2);
        ctx.stroke();
      }

      const img = this.assets.getItem(itemName);
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, px - sz / 2, py + bob - sz / 2, sz, sz);
      }
      ctx.restore();
    }

    // 6. Enemies (With Squash & Stretch, Elite Aura, Boss Dash Warning Line)
    for (const e of this.enemies) {
      const ex = e.x - camX;
      const ey = e.y - camY;
      if (ex < -90 || ex > w + 90 || ey < -90 || ey > h + 90) continue;

      // Boss Dash Warning Line
      if (e.isBoss && e.dashWarnTimer > 0) {
        ctx.save();
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
        ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 6]);
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex + e.dashDirX * 290, ey + e.dashDirY * 290);
        ctx.stroke();
        ctx.restore();
      }

      // Ground Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.42)';
      ctx.beginPath();
      ctx.ellipse(ex, ey + e.radius * 0.78, e.radius * 0.85, e.radius * 0.36, 0, 0, Math.PI * 2);
      ctx.fill();

      // Elite or Boss Aura Ring
      if (e.isElite || e.isBoss) {
        ctx.save();
        ctx.strokeStyle = e.isBoss ? '#ef4444' : '#facc15';
        ctx.lineWidth = e.isBoss ? 3 : 2;
        ctx.beginPath();
        ctx.arc(ex, ey, e.radius + 5 + Math.sin(this.elapsedTime * 8) * 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      const img = this.assets.getSprite(e.dex);
      const animImg = this.assets.getAnim(e.dex);
      const meta = this.assets.animMeta[String(e.dex)];
      const drawSize = 44 * e.scale;
      const squash = Math.sin(e.animPhase) * 0.08;
      const hopY = Math.abs(Math.sin(e.animPhase * 0.85)) * 4.5;
      const tilt = Math.sin(e.animPhase * 0.85) * 0.11;

      ctx.save();
      ctx.translate(ex, ey - hopY);
      if (e.x < p.x) ctx.scale(-1, 1);
      ctx.rotate(tilt);
      ctx.scale(1 + squash, 1 - squash);
      if (e.flashTimer > 0) {
        ctx.filter = 'brightness(3) contrast(2)';
      } else if (e.freezeTimer > 0) {
        ctx.filter = 'hue-rotate(175deg) saturate(2.2) brightness(1.35)';
      } else if (e.poisonTimer > 0) {
        ctx.filter = 'hue-rotate(250deg) saturate(1.8)';
      } else if (e.burnTimer > 0) {
        ctx.filter = 'sepia(0.8) saturate(3) hue-rotate(-25deg)';
      } else if (e.slowTimer > 0) {
        ctx.filter = 'hue-rotate(90deg)';
      }
      if (animImg && animImg.complete && animImg.naturalWidth > 0 && meta && meta.frames > 0) {
        const frameIdx = Math.floor(e.animPhase * 1.1) % meta.frames;
        const fw = meta.size;
        ctx.drawImage(animImg, frameIdx * fw, 0, fw, fw, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
      } else if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
      }
      ctx.restore();

      // Status overhead badge (Freeze / Stun)
      if (e.freezeTimer > 0 || e.stunTimer > 0) {
        ctx.save();
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(e.freezeTimer > 0 ? '❄️' : '⚡', ex, ey - e.radius - 6);
        ctx.restore();
      }
    }

    // 7. Leech Orbs (Giga Drain energy spheres)
    for (const orb of this.leechOrbs) {
      ctx.save();
      ctx.fillStyle = '#4ade80';
      ctx.shadowColor = '#4ade80';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(orb.x - camX, orb.y - camY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 8. Player Character
    const px = w / 2;
    const py = h / 2;
    const bounce = Math.abs(Math.sin(p.walkAnim)) * -4.5;

    ctx.fillStyle = 'rgba(0,0,0,0.48)';
    ctx.beginPath();
    ctx.ellipse(px, py + 21, 19, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(px, py + bounce);
    if (p.facing > 0) ctx.scale(-1, 1);
    if (p.invulnTimer > 0 && Math.floor(p.invulnTimer * 16) % 2 === 0) {
      ctx.globalAlpha = 0.55;
    }
    const pImg = this.assets.getSprite(p.dex);
    const pAnim = this.assets.getAnim(p.dex);
    const pMeta = this.assets.animMeta[String(p.dex)];
    const pSize = 54;
    if (pAnim && pAnim.complete && pAnim.naturalWidth > 0 && pMeta && pMeta.frames > 0) {
      const fIdx = Math.floor(this.elapsedTime * 10) % pMeta.frames;
      const fw = pMeta.size;
      ctx.drawImage(pAnim, fIdx * fw, 0, fw, fw, -pSize / 2, -pSize / 2, pSize, pSize);
    } else if (pImg && pImg.complete && pImg.naturalWidth > 0) {
      ctx.drawImage(pImg, -pSize / 2, -pSize / 2, pSize, pSize);
    }
    ctx.restore();

    const hpW = 48;
    const hpH = 6;
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(px - hpW / 2 - 1, py + 27 - 1, hpW + 2, hpH + 2);
    const hpRatio = Math.max(0, p.hp / p.maxHp);
    ctx.fillStyle = hpRatio > 0.5 ? '#4ade80' : hpRatio > 0.25 ? '#facc15' : '#ef4444';
    ctx.fillRect(px - hpW / 2, py + 27, hpW * hpRatio, hpH);

    // Squirtle Water Shield Visual Sphere
    if (p.waterShield) {
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.88)';
      ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(px, py - 2, 31 + Math.sin(this.elapsedTime * 6) * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 9. Orbiting Aqua Ring / Hydro Cannon (With Water Ribbon Tails & Vortex)
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
        // Curved water wake ribbon
        ctx.strokeStyle = orbitW.id === 'hydrocannon' ? 'rgba(56, 189, 248, 0.55)' : 'rgba(125, 211, 252, 0.42)';
        ctx.lineWidth = orbSize * 0.9;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(px, py, radius, ang - 0.55, ang);
        ctx.stroke();

        // Outer vortex glow
        const grad = ctx.createRadialGradient(ox, oy, 2, ox, oy, orbSize * 1.25);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.45, def.secondaryColor || '#bae6fd');
        grad.addColorStop(1, def.color);
        ctx.fillStyle = grad;
        ctx.shadowColor = def.color;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(ox, oy, orbSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // 10. Multi-Layer Projectiles (Flamethrower, Blast Burn, Shadow Ball, Dark Void, Aura Shuriken, Swift Stars)
    for (const pr of this.projectiles) {
      const sx = pr.x - camX;
      const sy = pr.y - camY;
      ctx.save();

      // Draw motion trail
      if (pr.trail && pr.trail.length > 1) {
        for (let t = 0; t < pr.trail.length; t++) {
          const pt = pr.trail[t];
          const ratio = (t + 1) / pr.trail.length;
          ctx.fillStyle = pr.color;
          ctx.globalAlpha = ratio * 0.35;
          ctx.beginPath();
          ctx.arc(pt.x - camX, pt.y - camY, pr.r * ratio * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      if (pr.kind === 'boomerang') {
        // Spinning 4-blade Aura Shuriken
        ctx.translate(sx, sy);
        ctx.rotate(pr.rot * 1.4);
        ctx.fillStyle = pr.color;
        ctx.shadowColor = pr.color;
        ctx.shadowBlur = 14;
        this.drawStarPolygon(ctx, 0, 0, 4, pr.r * 1.35, pr.r * 0.45, 0);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, pr.r * 0.38, 0, Math.PI * 2);
        ctx.fill();
      } else if (pr.kind === 'star') {
        // Spinning 5-pointed Swift Star
        ctx.translate(sx, sy);
        ctx.rotate(pr.rot);
        ctx.fillStyle = '#fde047';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#fde047';
        ctx.shadowBlur = 12;
        this.drawStarPolygon(ctx, 0, 0, 5, pr.r * 1.25, pr.r * 0.52, 0);
        ctx.fill();
        ctx.stroke();
      } else if (pr.kind === 'darkvoid' || pr.kind === 'bounce') {
        // Dark Void / Shadow Ball accretion vortex
        ctx.translate(sx, sy);
        ctx.rotate(pr.rot);
        ctx.strokeStyle = pr.kind === 'darkvoid' ? '#f0abfc' : '#c084fc';
        ctx.lineWidth = 2.5;
        this.drawStarPolygon(ctx, 0, 0, 6, pr.r * 1.2, pr.r * 0.65, 0);
        ctx.stroke();
        ctx.fillStyle = '#1e1b4b';
        ctx.shadowColor = pr.color;
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(0, 0, pr.r * 0.8, 0, Math.PI * 2);
        ctx.fill();
      } else if (pr.kind === 'rock') {
        // Rolling Boulder / Stone Edge Jagged Crystal
        ctx.translate(sx, sy);
        ctx.rotate(pr.rot);
        ctx.fillStyle = pr.isEvolved ? '#d97706' : '#78716c';
        ctx.strokeStyle = pr.isEvolved ? '#fef08a' : '#d6d3d1';
        ctx.lineWidth = 2.5;
        this.drawStarPolygon(ctx, 0, 0, 7, pr.r * 1.1, pr.r * 0.82, 0);
        ctx.fill();
        ctx.stroke();
      } else if (pr.kind === 'tornado') {
        // Swirling Vortex Tornado
        ctx.translate(sx, sy);
        ctx.rotate(pr.rot * 1.6);
        ctx.strokeStyle = pr.isEvolved ? '#10b981' : '#34d399';
        ctx.lineWidth = 3;
        for (let ring = 0; ring < 3; ring++) {
          ctx.beginPath();
          ctx.arc(0, 0, pr.r * (0.4 + ring * 0.3), ring, ring + Math.PI * 1.35);
          ctx.stroke();
        }
      } else if (pr.kind === 'icicle') {
        // Piercing Crystal Ice Spear
        const ang = Math.atan2(pr.vy, pr.vx);
        ctx.translate(sx, sy);
        ctx.rotate(ang);
        ctx.fillStyle = '#e0f2fe';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(pr.r * 1.6, 0);
        ctx.lineTo(-pr.r * 0.9, -pr.r * 0.55);
        ctx.lineTo(-pr.r * 0.5, 0);
        ctx.lineTo(-pr.r * 0.9, pr.r * 0.55);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        // Fireball / Blast Burn multi-core gradient
        const grad = ctx.createRadialGradient(sx, sy, 2, sx, sy, pr.r * 1.2);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.4, '#fde047');
        grad.addColorStop(0.8, pr.color);
        grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(sx, sy, pr.r * 1.25, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // 10b. Hyper Beam / Giga Impact Piercing Laser Beams
    for (const lb of this.laserBeams) {
      const ratio = Math.max(0, lb.life / lb.maxLife);
      ctx.save();
      ctx.globalAlpha = ratio;
      ctx.strokeStyle = lb.color;
      ctx.shadowColor = lb.color;
      ctx.shadowBlur = 22;
      ctx.lineWidth = lb.width * ratio;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(lb.x1 - camX, lb.y1 - camY);
      ctx.lineTo(lb.x2 - camX, lb.y2 - camY);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = lb.width * 0.42 * ratio;
      ctx.stroke();
      ctx.restore();
    }

    // 10c. Aerial Ace / Sacred Sword Crescent Slashes
    for (const sl of this.slashArcs) {
      const ratio = Math.max(0, sl.life / sl.maxLife);
      ctx.save();
      ctx.translate(sl.x - camX, sl.y - camY);
      ctx.rotate(sl.angle);
      ctx.globalAlpha = ratio;
      ctx.strokeStyle = sl.color;
      ctx.shadowColor = sl.color;
      ctx.shadowBlur = 16;
      ctx.lineWidth = 10 * ratio;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, 0, sl.radius, -0.95, 0.95);
      ctx.stroke();

      ctx.strokeStyle = sl.coreColor || '#ffffff';
      ctx.lineWidth = 4 * ratio;
      ctx.stroke();
      ctx.restore();
    }

    // 11. Falling Draco Meteors & Target Reticles
    for (const m of this.fallingMeteors) {
      const tx = m.targetX - camX;
      const ty = m.targetY - camY;
      const mx = m.startX + (m.targetX - m.startX) * m.progress - camX;
      const my = m.startY + (m.targetY - m.startY) * m.progress - camY;

      ctx.save();
      // Target Warning Reticle on ground
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.85)';
      ctx.fillStyle = 'rgba(244, 63, 94, 0.18)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(tx, ty, m.radius * m.progress, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Falling Burning Meteor Rock
      const grad = ctx.createRadialGradient(mx, my, 4, mx, my, 26);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, '#fde047');
      grad.addColorStop(0.8, '#ef4444');
      grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(mx, my, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 12. Enemy Bullets
    for (const b of this.enemyBullets) {
      const sx = b.x - camX;
      const sy = b.y - camY;
      ctx.save();
      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(sx, sy, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(sx, sy, b.r * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 13. Fractal Multi-Segment Lightning Bolts
    for (const lb of this.lightningBolts) {
      if (!lb.pts || lb.pts.length < 2) continue;
      ctx.save();
      ctx.globalAlpha = Math.max(0, lb.life / (lb.maxLife || 0.2));

      // Outer Electric Glow
      ctx.strokeStyle = lb.color;
      ctx.shadowColor = lb.color;
      ctx.shadowBlur = 18;
      ctx.lineWidth = (lb.width || 3.5) * 2.2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(lb.pts[0].x - camX, lb.pts[0].y - camY);
      for (let i = 1; i < lb.pts.length; i++) {
        ctx.lineTo(lb.pts[i].x - camX, lb.pts[i].y - camY);
      }
      ctx.stroke();

      // Inner White-Hot Core
      ctx.strokeStyle = lb.coreColor || '#ffffff';
      ctx.lineWidth = (lb.width || 3.5) * 0.75;
      ctx.stroke();
      ctx.restore();
    }

    // 14. Shockwaves & Particles
    for (const sw of this.shockwaves) {
      ctx.save();
      ctx.strokeStyle = sw.color;
      ctx.shadowColor = sw.color;
      ctx.shadowBlur = 12;
      ctx.globalAlpha = Math.max(0, sw.alpha);
      ctx.lineWidth = 4;
      if (sw.hex) {
        this.drawStarPolygon(ctx, sw.x - camX, sw.y - camY, 6, sw.r, sw.r * 0.88, this.elapsedTime * 2);
      } else {
        ctx.beginPath();
        ctx.arc(sw.x - camX, sw.y - camY, sw.r, 0, Math.PI * 2);
      }
      ctx.stroke();
      ctx.restore();
    }

    for (const pt of this.particles) {
      ctx.save();
      ctx.fillStyle = pt.color;
      if (pt.maxLife) ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
      ctx.beginPath();
      ctx.arc(pt.x - camX, pt.y - camY, pt.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 15. Floating Damage Numbers
    for (const ft of this.floatingTexts) {
      ctx.save();
      const fontSize = Math.round(14 * (ft.scale || 1));
      ctx.font = `900 ${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#000';
      ctx.fillText(ft.text, ft.x - camX + 1.5, ft.y - camY + 1.5);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x - camX, ft.y - camY);
      ctx.restore();
    }

    // 16. Subtle Atmospheric Edge Vignette
    const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(4, 8, 18, 0.42)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);

    ctx.restore();
  }
}

if ('serviceWorker' in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js', { updateViaCache: 'none' })
      .then((reg) => {
        reg.update();
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') reg.update();
        });
      })
      .catch((err) => {
        console.warn('SW registration skipped:', err);
      });
  });
}

window.addEventListener('DOMContentLoaded', () => {
  window.game = new PokeSurvivorsGame();
  const btnUpdate = document.getElementById('btnForceUpdate');
  if (btnUpdate) {
    btnUpdate.addEventListener('click', async () => {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      window.location.reload();
    });
  }
});
