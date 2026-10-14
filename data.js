// Game Data: Starters, Evolutions, Moves (Weapons), Items (Passives), Waves, Bosses, Meta Upgrades

window.GAME_DATA = {
  starters: [
    {
      id: 'pikachu',
      name: '피카츄',
      dex: 25,
      type: '전기',
      typeColor: '#facc15',
      desc: '빠른 기동력과 강력한 연쇄 뇌격으로 적 군단을 감전시키는 스피드스터',
      bonusText: '이동속도 +15% · 번개 연쇄 특화',
      startWeapon: 'thunderbolt',
      stats: { hp: 118, speed: 180, might: 1.08, armor: 0, regen: 0.3, magnet: 98, cooldown: 0.96, expMult: 1.0 },
      evolutions: [
        { level: 10, name: '라이츄', dex: 26, hpBonus: 65, mightBonus: 0.28, speedBonus: 20 }
      ]
    },
    {
      id: 'charmander',
      name: '파이리',
      dex: 4,
      type: '불꽃',
      typeColor: '#f97316',
      desc: '압도적인 화력의 관통 화염 브레스로 몰려오는 포켓몬 무리를 소각하는 딜러',
      bonusText: '공격력 +22% · 화염 폭발 특화',
      startWeapon: 'flamethrower',
      stats: { hp: 112, speed: 164, might: 1.22, armor: 0, regen: 0.2, magnet: 90, cooldown: 1.0, expMult: 1.0 },
      evolutions: [
        { level: 8, name: '리자드', dex: 5, hpBonus: 50, mightBonus: 0.2, speedBonus: 12 },
        { level: 16, name: '리자몽', dex: 6, hpBonus: 90, mightBonus: 0.38, speedBonus: 22 }
      ]
    },
    {
      id: 'squirtle',
      name: '꼬부기',
      dex: 7,
      type: '물',
      typeColor: '#38bdf8',
      desc: '단단한 등껍질과 회전하는 해류 소용돌이로 포위망을 분쇄하는 수호자',
      bonusText: '최대 체력 +35% · 방어력 +3',
      startWeapon: 'aquaring',
      stats: { hp: 158, speed: 156, might: 1.05, armor: 3, regen: 0.4, magnet: 90, cooldown: 1.0, expMult: 1.0 },
      evolutions: [
        { level: 8, name: '어니부기', dex: 8, hpBonus: 60, mightBonus: 0.18, speedBonus: 10 },
        { level: 16, name: '거북왕', dex: 9, hpBonus: 110, mightBonus: 0.32, speedBonus: 12 }
      ]
    },
    {
      id: 'bulbasaur',
      name: '이상해씨',
      dex: 1,
      type: '풀/독',
      typeColor: '#4ade80',
      desc: '주변 적의 생명력을 빨아들이는 기가드레인 영역으로 불사신처럼 버티는 전문가',
      bonusText: '체력 재생 +1.8/초 · 자석 범위 +25%',
      startWeapon: 'gigadrain',
      stats: { hp: 140, speed: 158, might: 1.05, armor: 1, regen: 1.8, magnet: 115, cooldown: 1.0, expMult: 1.0 },
      evolutions: [
        { level: 8, name: '이상해풀', dex: 2, hpBonus: 55, mightBonus: 0.18, speedBonus: 10 },
        { level: 16, name: '이상해꽃', dex: 3, hpBonus: 105, mightBonus: 0.3, speedBonus: 12 }
      ]
    },
    {
      id: 'gastly',
      name: '고오스',
      dex: 92,
      type: '고스트',
      typeColor: '#c084fc',
      desc: '적 사이를 튕겨 다니는 섀도볼과 빠른 기술 회전율을 지닌 심연의 마법사',
      bonusText: '쿨타임 감소 -15% · 이동속도 +10%',
      startWeapon: 'shadowball',
      stats: { hp: 105, speed: 172, might: 1.12, armor: 0, regen: 0.25, magnet: 98, cooldown: 0.85, expMult: 1.05 },
      evolutions: [
        { level: 8, name: '고우스트', dex: 93, hpBonus: 45, mightBonus: 0.22, speedBonus: 14 },
        { level: 16, name: '팬텀', dex: 94, hpBonus: 80, mightBonus: 0.38, speedBonus: 20 }
      ]
    },
    {
      id: 'riolu',
      name: '리오르',
      dex: 447,
      type: '격투/강철',
      typeColor: '#60a5fa',
      desc: '돌아오는 파동 수리검과 높은 성장 잠재력을 가진 파동의 용사',
      bonusText: '경험치 획득 +20% · 공격력 +12%',
      startWeapon: 'aurasphere',
      stats: { hp: 122, speed: 170, might: 1.12, armor: 1, regen: 0.35, magnet: 98, cooldown: 0.94, expMult: 1.2 },
      evolutions: [
        { level: 12, name: '루카리오', dex: 448, hpBonus: 85, mightBonus: 0.38, speedBonus: 24 }
      ]
    }
  ],

  weapons: {
    thunderbolt: {
      id: 'thunderbolt',
      name: '10만볼트',
      icon: '⚡',
      color: '#facc15',
      secondaryColor: '#fef08a',
      maxLevel: 8,
      evolveWith: 'magnet_coil',
      evolveInto: 'volttackle',
      desc: '가까운 적에게 다중 분기 낙뢰를 내리꽂고 주변 적들에게 연쇄 감전 아크와 스파크 폭발을 일으킵니다.',
      base: { damage: 28, cooldown: 1.05, count: 1, chains: 3, range: 310 }
    },
    volttackle: {
      id: 'volttackle',
      name: '백만볼트 뇌신폭풍',
      icon: '🌩️',
      color: '#fde047',
      secondaryColor: '#38bdf8',
      isEvolved: true,
      maxLevel: 1,
      desc: '[궁극기] 천공에서 거대한 뇌신 기둥이 연속 낙하하며 화면 전체를 연쇄 번개로 초토화합니다!',
      base: { damage: 78, cooldown: 0.58, count: 3, chains: 6, range: 410 }
    },

    flamethrower: {
      id: 'flamethrower',
      name: '화염방사',
      icon: '🔥',
      color: '#f97316',
      secondaryColor: '#fde047',
      maxLevel: 8,
      evolveWith: 'charcoal',
      evolveInto: 'blastburn',
      desc: '적 방향으로 불티와 화염 꼬리를 남기며 적들을 관통·소각하는 고열 화염탄을 발사합니다.',
      base: { damage: 24, cooldown: 0.9, count: 2, speed: 410, pierce: 3, size: 15 }
    },
    blastburn: {
      id: 'blastburn',
      name: '블러스트번',
      icon: '🌋',
      color: '#ef4444',
      secondaryColor: '#facc15',
      isEvolved: true,
      maxLevel: 1,
      desc: '[궁극기] 전방위로 거대한 태양 화염구를 난사하며 지면에 용암 폭발 흔적을 남깁니다!',
      base: { damage: 68, cooldown: 0.55, count: 7, speed: 460, pierce: 9, size: 23 }
    },

    aquaring: {
      id: 'aquaring',
      name: '아쿠아링',
      icon: '💧',
      color: '#38bdf8',
      secondaryColor: '#bae6fd',
      maxLevel: 8,
      evolveWith: 'mystic_water',
      evolveInto: 'hydrocannon',
      desc: '플레이어 주위에 물결 리본과 거품을 일으키며 고속 회전하는 수압 구체로 적을 밀쳐냅니다.',
      base: { damage: 20, cooldown: 0.1, count: 2, radius: 86, rotSpeed: 3.4, size: 17 }
    },
    hydrocannon: {
      id: 'hydrocannon',
      name: '하이드로캐논',
      icon: '🌊',
      color: '#0284c7',
      secondaryColor: '#7dd3fc',
      isEvolved: true,
      maxLevel: 1,
      desc: '[궁극기] 6개의 거대한 심해 해류 소용돌이가 폭풍처럼 회전하며 접근하는 모든 적을 분쇄합니다!',
      base: { damage: 54, cooldown: 0.1, count: 6, radius: 118, rotSpeed: 5.5, size: 25 }
    },

    gigadrain: {
      id: 'gigadrain',
      name: '기가드레인',
      icon: '🌿',
      color: '#4ade80',
      secondaryColor: '#bbf7d0',
      maxLevel: 8,
      evolveWith: 'miracle_seed',
      evolveInto: 'frenzyplant',
      desc: '생명력 흡수 마법진을 펼쳐 범위 내 적의 에너지를 초록빛 구체로 빨아들이고 둔화시킵니다.',
      base: { damage: 13, cooldown: 0.38, radius: 85, healChance: 0.1 }
    },
    frenzyplant: {
      id: 'frenzyplant',
      name: '하드플랜트 성역',
      icon: '🌳',
      color: '#16a34a',
      secondaryColor: '#86efac',
      isEvolved: true,
      maxLevel: 1,
      desc: '[궁극기] 고대 숲의 마법진과 가시 덩굴이 펼쳐져 적들의 생명력을 쉴 새 없이 흡수합니다!',
      base: { damage: 38, cooldown: 0.25, radius: 148, healChance: 0.28 }
    },

    shadowball: {
      id: 'shadowball',
      name: '섀도볼',
      icon: '👻',
      color: '#c084fc',
      secondaryColor: '#e9d5ff',
      maxLevel: 8,
      evolveWith: 'spell_tag',
      evolveInto: 'darkvoid',
      desc: '암흑 오라 꼬리를 끌며 적들 사이를 연쇄 도탄(Ricochet)하는 고스트 구체를 발사합니다.',
      base: { damage: 26, cooldown: 1.05, count: 1, bounces: 3, speed: 360, size: 15 }
    },
    darkvoid: {
      id: 'darkvoid',
      name: '다크홀',
      icon: '🌑',
      color: '#9333ea',
      secondaryColor: '#f0abfc',
      isEvolved: true,
      maxLevel: 1,
      desc: '[궁극기] 주변 적들을 중력으로 강하게 빨아들이며 연쇄 암흑 폭발을 일으키는 블랙홀을 발사합니다!',
      base: { damage: 72, cooldown: 0.72, count: 3, bounces: 6, speed: 420, size: 24 }
    },

    aurasphere: {
      id: 'aurasphere',
      name: '파동탄 부메랑',
      icon: '🌀',
      color: '#60a5fa',
      secondaryColor: '#bfdbfe',
      maxLevel: 8,
      evolveWith: 'expert_belt',
      evolveInto: 'aurastorm',
      desc: '고속 회전하는 파동 수리검이 소닉붐을 일으키며 날아갔다 플레이어에게 되돌아옵니다.',
      base: { damage: 25, cooldown: 1.08, count: 1, speed: 380, size: 17 }
    },
    aurastorm: {
      id: 'aurastorm',
      name: '파동의 폭풍',
      icon: '💠',
      color: '#2563eb',
      secondaryColor: '#93c5fd',
      isEvolved: true,
      maxLevel: 1,
      desc: '[궁극기] 거대한 파동 십자 칼날들이 다방향으로 교차 비행하며 전장을 난도질합니다!',
      base: { damage: 70, cooldown: 0.65, count: 4, speed: 480, size: 25 }
    },

    dracometeor: {
      id: 'dracometeor',
      name: '용성군',
      icon: '☄️',
      color: '#fb7185',
      secondaryColor: '#fde047',
      maxLevel: 8,
      desc: '하늘에서 거대한 불타는 운석이 실제로 낙하하여 대폭발과 함께 용암 화염 지대를 생성합니다.',
      base: { damage: 38, cooldown: 1.65, count: 1, radius: 66, duration: 2.6 }
    },

    psychicwave: {
      id: 'psychicwave',
      name: '사이코키네시스',
      icon: '🔮',
      color: '#f472b6',
      secondaryColor: '#f9a8d4',
      maxLevel: 8,
      desc: '다중 염동력 프리즘 충격파를 방출하여 주변 적 전체에 큰 피해와 강력한 넉백을 입힙니다.',
      base: { damage: 30, cooldown: 2.0, radius: 145, knockback: 105 }
    },

    swift: {
      id: 'swift',
      name: '고속스타',
      icon: '⭐',
      color: '#fde047',
      secondaryColor: '#ffffff',
      maxLevel: 8,
      desc: '황금빛 스타더스트 궤적을 남기는 회전 별 탄환을 360도 전방위로 난사합니다.',
      base: { damage: 19, cooldown: 1.15, count: 6, speed: 370, size: 13 }
    }
  },

  passives: {
    magnet_coil: {
      id: 'magnet_coil',
      name: '레어코일 자석',
      icon: '🧲',
      img: './assets/items/magnet.png',
      maxLevel: 5,
      evolvesWeapon: 'thunderbolt',
      desc: '이상한사탕(경험치) 획득 범위가 +32% 증가합니다. (10만볼트 진화 재료)'
    },
    charcoal: {
      id: 'charcoal',
      name: '목탄',
      icon: '🔥',
      img: './assets/items/charcoal.png',
      maxLevel: 5,
      evolvesWeapon: 'flamethrower',
      desc: '모든 기술의 공격력이 +16% 증가합니다. (화염방사 진화 재료)'
    },
    mystic_water: {
      id: 'mystic_water',
      name: '신비의물방울',
      icon: '💧',
      img: './assets/items/mystic-water.png',
      maxLevel: 5,
      evolvesWeapon: 'aquaring',
      desc: '기술 범위/크기가 +15% 증가합니다. (아쿠아링 진화 재료)'
    },
    miracle_seed: {
      id: 'miracle_seed',
      name: '기적의씨',
      icon: '🌱',
      img: './assets/items/miracle-seed.png',
      maxLevel: 5,
      evolvesWeapon: 'gigadrain',
      desc: '최대 체력이 +15% 증가하고 초당 체력 회복량이 +1.4 증가합니다. (기가드레인 진화 재료)'
    },
    spell_tag: {
      id: 'spell_tag',
      name: '저주받은부적',
      icon: '📿',
      img: './assets/items/spell-tag.png',
      maxLevel: 5,
      evolvesWeapon: 'shadowball',
      desc: '모든 기술의 재사용 대기시간이 -8% 감소합니다. (섀도볼 진화 재료)'
    },
    expert_belt: {
      id: 'expert_belt',
      name: '달인의띠',
      icon: '🥋',
      img: './assets/items/expert-belt.png',
      maxLevel: 5,
      evolvesWeapon: 'aurasphere',
      desc: '발사되는 투사체 개수가 +1 증가합니다(최대 +3). (파동탄 진화 재료)'
    },
    choice_scarf: {
      id: 'choice_scarf',
      name: '구애스카프',
      icon: '🧣',
      img: './assets/items/choice-scarf.png',
      maxLevel: 5,
      desc: '포켓몬의 이동속도가 +12% 증가합니다.'
    },
    lucky_egg: {
      id: 'lucky_egg',
      name: '행복의알',
      icon: '🥚',
      img: './assets/items/lucky-egg.png',
      maxLevel: 5,
      desc: '경험치 및 포켓코인 획득량이 +20% 증가합니다.'
    }
  },

  // Difficulty & Swarm Density Significantly Increased!
  waves: [
    { start: 0, end: 60, spawnInterval: 0.26, spawnBatch: 3, maxEnemies: 165, eliteChance: 0.035, pool: [
      { dex: 19, name: '꼬렛', hp: 25, speed: 86, damage: 9, exp: 2, scale: 1.0 },
      { dex: 10, name: '캐터피', hp: 19, speed: 70, damage: 7, exp: 2, scale: 0.95 },
      { dex: 16, name: '구구', hp: 27, speed: 96, damage: 9, exp: 3, scale: 1.0 },
      { dex: 41, name: '주뱃', hp: 30, speed: 105, damage: 10, exp: 3, scale: 1.0 }
    ]},
    { start: 60, end: 150, spawnInterval: 0.21, spawnBatch: 4, maxEnemies: 240, eliteChance: 0.055, pool: [
      { dex: 41, name: '주뱃', hp: 46, speed: 110, damage: 12, exp: 3, scale: 1.0 },
      { dex: 50, name: '디그다', hp: 54, speed: 98, damage: 13, exp: 4, scale: 1.0 },
      { dex: 23, name: '아보', hp: 65, speed: 94, damage: 14, exp: 4, scale: 1.05 },
      { dex: 66, name: '알통몬', hp: 78, speed: 92, damage: 15, exp: 5, scale: 1.08 }
    ]},
    { start: 150, end: 270, spawnInterval: 0.17, spawnBatch: 5, maxEnemies: 310, eliteChance: 0.07, pool: [
      { dex: 66, name: '알통몬', hp: 110, speed: 100, damage: 17, exp: 6, scale: 1.1 },
      { dex: 81, name: '코일', hp: 100, speed: 108, damage: 17, exp: 6, scale: 1.05 },
      { dex: 88, name: '질퍽이', hp: 140, speed: 88, damage: 19, exp: 7, scale: 1.15 },
      { dex: 109, name: '또가스', hp: 120, speed: 102, damage: 18, exp: 7, scale: 1.1 }
    ]},
    { start: 270, end: 420, spawnInterval: 0.14, spawnBatch: 6, maxEnemies: 370, eliteChance: 0.085, pool: [
      { dex: 123, name: '스라크', hp: 195, speed: 128, damage: 23, exp: 10, scale: 1.2 },
      { dex: 125, name: '에레브', hp: 220, speed: 112, damage: 25, exp: 11, scale: 1.2 },
      { dex: 126, name: '마그마', hp: 230, speed: 110, damage: 25, exp: 11, scale: 1.2 },
      { dex: 111, name: '뿔카노', hp: 280, speed: 98, damage: 28, exp: 12, scale: 1.25 }
    ]},
    { start: 420, end: 9999, spawnInterval: 0.11, spawnBatch: 7, maxEnemies: 430, eliteChance: 0.11, pool: [
      { dex: 149, name: '망나뇽', hp: 450, speed: 122, damage: 32, exp: 18, scale: 1.35 },
      { dex: 248, name: '마기라스', hp: 550, speed: 110, damage: 36, exp: 20, scale: 1.4 },
      { dex: 373, name: '보만다', hp: 490, speed: 135, damage: 34, exp: 20, scale: 1.38 },
      { dex: 376, name: '메타그로스', hp: 620, speed: 115, damage: 38, exp: 22, scale: 1.4 }
    ]}
  ],

  bosses: [
    { time: 60, dex: 95, name: '우두머리 롱스톤', hp: 1600, speed: 96, damage: 24, scale: 2.2 },
    { time: 150, dex: 143, name: '광폭화 잠만보', hp: 3800, speed: 90, damage: 30, scale: 2.35 },
    { time: 240, dex: 130, name: '폭주하는 갸라도스', hp: 7600, speed: 114, damage: 36, scale: 2.4 },
    { time: 360, dex: 145, name: '전설의 뇌신 썬더', hp: 13500, speed: 126, damage: 42, scale: 2.45 },
    { time: 480, dex: 150, name: '초전설 뮤츠', hp: 25000, speed: 135, damage: 50, scale: 2.6, isFinal: true }
  ],

  metaUpgrades: [
    { id: 'might', name: '근력 강화 (공격력)', icon: '⚔️', img: './assets/items/charcoal.png', max: 10, baseCost: 50, desc: '레벨당 기본 공격력 +5% 영구 증가' },
    { id: 'hp', name: '체력 강화 (HP)', icon: '❤️', img: './assets/items/full-restore.png', max: 10, baseCost: 45, desc: '레벨당 최대 체력 +8% 영구 증가' },
    { id: 'speed', name: '스피드 강화', icon: '👟', img: './assets/items/choice-scarf.png', max: 5, baseCost: 60, desc: '레벨당 이동속도 +5% 영구 증가' },
    { id: 'magnet', name: '자석 출력 강화', icon: '🧲', img: './assets/items/magnet.png', max: 5, baseCost: 55, desc: '레벨당 아이템 획득 반경 +12% 영구 증가' },
    { id: 'greed', name: '부적금화 (골드/경험치)', icon: '🪙', img: './assets/items/amulet-coin.png', max: 8, baseCost: 70, desc: '레벨당 코인 및 경험치 획득량 +8% 영구 증가' },
    { id: 'revive', name: '기력의덩어리 (부활)', icon: '✨', img: './assets/items/max-revive.png', max: 1, baseCost: 350, desc: '전투 중 쓰러졌을 때 체력 60%로 1회 즉시 부활' }
  ]
};
