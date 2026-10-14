// Game Data: Starters, Evolutions, Moves (Weapons), Items (Passives), Waves, Bosses, Meta Upgrades

window.GAME_DATA = {
  starters: [
    {
      id: 'pikachu',
      name: '피카츄',
      dex: 25,
      type: '전기',
      typeColor: '#facc15',
      desc: '빠른 기동력과 강력한 낙뢰로 적을 제압하는 만능형 파트너',
      bonusText: '이동속도 +15% · 행운 +15%',
      startWeapon: 'thunderbolt',
      stats: { hp: 110, speed: 175, might: 1.05, armor: 0, regen: 0.2, magnet: 95, cooldown: 1.0, expMult: 1.0 },
      evolutions: [
        { level: 10, name: '라이츄', dex: 26, hpBonus: 60, mightBonus: 0.25, speedBonus: 18 }
      ]
    },
    {
      id: 'charmander',
      name: '파이리',
      dex: 4,
      type: '불꽃',
      typeColor: '#f97316',
      desc: '압도적인 화력의 관통 화염으로 몰려오는 군단을 태워버리는 딜러',
      bonusText: '공격력 +20% · 투사체 속도 증가',
      startWeapon: 'flamethrower',
      stats: { hp: 105, speed: 158, might: 1.2, armor: 0, regen: 0.1, magnet: 85, cooldown: 1.0, expMult: 1.0 },
      evolutions: [
        { level: 8, name: '리자드', dex: 5, hpBonus: 45, mightBonus: 0.18, speedBonus: 10 },
        { level: 16, name: '리자몽', dex: 6, hpBonus: 80, mightBonus: 0.35, speedBonus: 20 }
      ]
    },
    {
      id: 'squirtle',
      name: '꼬부기',
      dex: 7,
      type: '물',
      typeColor: '#38bdf8',
      desc: '단단한 등껍질과 회전하는 물의 방패로 포위망을 뚫는 탱커',
      bonusText: '최대 체력 +30% · 방어력 +2',
      startWeapon: 'aquaring',
      stats: { hp: 145, speed: 150, might: 1.0, armor: 2, regen: 0.3, magnet: 85, cooldown: 1.0, expMult: 1.0 },
      evolutions: [
        { level: 8, name: '어니부기', dex: 8, hpBonus: 55, mightBonus: 0.15, speedBonus: 8 },
        { level: 16, name: '거북왕', dex: 9, hpBonus: 100, mightBonus: 0.3, speedBonus: 10 }
      ]
    },
    {
      id: 'bulbasaur',
      name: '이상해씨',
      dex: 1,
      type: '풀/독',
      typeColor: '#4ade80',
      desc: '주변 적의 생명력을 흡수하는 기가드레인 오라로 버티는 생존 전문가',
      bonusText: '체력 재생 +1.5/초 · 자석 범위 +25%',
      startWeapon: 'gigadrain',
      stats: { hp: 130, speed: 152, might: 1.0, armor: 1, regen: 1.5, magnet: 110, cooldown: 1.0, expMult: 1.0 },
      evolutions: [
        { level: 8, name: '이상해풀', dex: 2, hpBonus: 50, mightBonus: 0.15, speedBonus: 8 },
        { level: 16, name: '이상해꽃', dex: 3, hpBonus: 95, mightBonus: 0.28, speedBonus: 10 }
      ]
    },
    {
      id: 'gastly',
      name: '고오스',
      dex: 92,
      type: '고스트',
      typeColor: '#c084fc',
      desc: '적 사이를 튕겨 다니는 섀도볼과 빠른 기술 회전율을 지닌 마법사',
      bonusText: '쿨타임 감소 -15% · 이동속도 +10%',
      startWeapon: 'shadowball',
      stats: { hp: 95, speed: 168, might: 1.1, armor: 0, regen: 0.1, magnet: 95, cooldown: 0.85, expMult: 1.05 },
      evolutions: [
        { level: 8, name: '고우스트', dex: 93, hpBonus: 40, mightBonus: 0.2, speedBonus: 12 },
        { level: 16, name: '팬텀', dex: 94, hpBonus: 70, mightBonus: 0.35, speedBonus: 18 }
      ]
    },
    {
      id: 'riolu',
      name: '리오르',
      dex: 447,
      type: '격투/강철',
      typeColor: '#60a5fa',
      desc: '돌아오는 파동 부메랑과 높은 성장 잠재력을 가진 파동의 용사',
      bonusText: '경험치 획득 +20% · 공격력 +10%',
      startWeapon: 'aurasphere',
      stats: { hp: 115, speed: 165, might: 1.1, armor: 1, regen: 0.3, magnet: 95, cooldown: 0.95, expMult: 1.2 },
      evolutions: [
        { level: 12, name: '루카리오', dex: 448, hpBonus: 75, mightBonus: 0.35, speedBonus: 22 }
      ]
    }
  ],

  weapons: {
    thunderbolt: {
      id: 'thunderbolt',
      name: '10만볼트',
      icon: '⚡',
      color: '#facc15',
      maxLevel: 8,
      evolveWith: 'magnet_coil',
      evolveInto: 'volttackle',
      desc: '가까운 적에게 강력한 번개를 내리꽂고 주변 적에게 감전 연쇄 피해를 줍니다.',
      base: { damage: 26, cooldown: 1.15, count: 1, chains: 2, range: 290 }
    },
    volttackle: {
      id: 'volttackle',
      name: '백만볼트 폭풍',
      icon: '🌩️',
      color: '#fde047',
      isEvolved: true,
      maxLevel: 1,
      desc: '[진화 기술] 하늘에서 쉴 새 없이 번개 폭풍이 내리꽂히며 광역 감전 폭발을 일으킵니다!',
      base: { damage: 72, cooldown: 0.65, count: 3, chains: 5, range: 380 }
    },

    flamethrower: {
      id: 'flamethrower',
      name: '화염방사',
      icon: '🔥',
      color: '#f97316',
      maxLevel: 8,
      evolveWith: 'charcoal',
      evolveInto: 'blastburn',
      desc: '가장 가까운 적 방향으로 적을 관통하는 고열 화염구를 연속 발사합니다.',
      base: { damage: 22, cooldown: 0.95, count: 2, speed: 390, pierce: 3, size: 14 }
    },
    blastburn: {
      id: 'blastburn',
      name: '블러스트번',
      icon: '🌋',
      color: '#ef4444',
      isEvolved: true,
      maxLevel: 1,
      desc: '[진화 기술] 전방위로 거대한 폭발 화염탄을 난사하며 대지를 불태웁니다!',
      base: { damage: 64, cooldown: 0.6, count: 6, speed: 450, pierce: 8, size: 22 }
    },

    aquaring: {
      id: 'aquaring',
      name: '아쿠아링',
      icon: '💧',
      color: '#38bdf8',
      maxLevel: 8,
      evolveWith: 'mystic_water',
      evolveInto: 'hydrocannon',
      desc: '플레이어 주위를 회전하며 닿는 적을 밀쳐내고 피해를 주는 물의 구체입니다.',
      base: { damage: 18, cooldown: 0.1, count: 2, radius: 82, rotSpeed: 3.2, size: 16 }
    },
    hydrocannon: {
      id: 'hydrocannon',
      name: '하이드로캐논',
      icon: '🌊',
      color: '#0284c7',
      isEvolved: true,
      maxLevel: 1,
      desc: '[진화 기술] 6개의 거대한 해류 소용돌이가 초고속으로 영구 회전하며 모든 적을 분쇄합니다!',
      base: { damage: 48, cooldown: 0.1, count: 6, radius: 112, rotSpeed: 5.2, size: 24 }
    },

    gigadrain: {
      id: 'gigadrain',
      name: '기가드레인',
      icon: '🌿',
      color: '#4ade80',
      maxLevel: 8,
      evolveWith: 'miracle_seed',
      evolveInto: 'frenzyplant',
      desc: '주변에 생명력 흡수 결계를 펼쳐 범위 내 모든 적에게 지속 피해와 둔화를 줍니다.',
      base: { damage: 11, cooldown: 0.42, radius: 78, healChance: 0.08 }
    },
    frenzyplant: {
      id: 'frenzyplant',
      name: '하드플랜트 영역',
      icon: '🌳',
      color: '#16a34a',
      isEvolved: true,
      maxLevel: 1,
      desc: '[진화 기술] 거대한 자연의 성역이 펼쳐져 적의 체력을 지속적으로 흡수해 회복합니다!',
      base: { damage: 34, cooldown: 0.28, radius: 138, healChance: 0.25 }
    },

    shadowball: {
      id: 'shadowball',
      name: '섀도볼',
      icon: '👻',
      color: '#c084fc',
      maxLevel: 8,
      evolveWith: 'spell_tag',
      evolveInto: 'darkvoid',
      desc: '적들 사이를 튕겨 다니며 암흑 피해를 입히는 고스트 구체를 발사합니다.',
      base: { damage: 24, cooldown: 1.1, count: 1, bounces: 3, speed: 340, size: 15 }
    },
    darkvoid: {
      id: 'darkvoid',
      name: '다크홀',
      icon: '🌑',
      color: '#9333ea',
      isEvolved: true,
      maxLevel: 1,
      desc: '[진화 기술] 적들을 강하게 빨아들이며 연쇄 폭발하는 심연의 암흑 구체를 발사합니다!',
      base: { damage: 68, cooldown: 0.75, count: 3, bounces: 6, speed: 410, size: 23 }
    },

    aurasphere: {
      id: 'aurasphere',
      name: '파동탄 & 잎날 부메랑',
      icon: '🌀',
      color: '#60a5fa',
      maxLevel: 8,
      evolveWith: 'expert_belt',
      evolveInto: 'aurastorm',
      desc: '전방으로 날아갔다 플레이어에게 되돌아오며 적들을 왕복 관통하는 파동 부메랑입니다.',
      base: { damage: 23, cooldown: 1.15, count: 1, speed: 360, size: 16 }
    },
    aurastorm: {
      id: 'aurastorm',
      name: '파동의 폭풍',
      icon: '💠',
      color: '#2563eb',
      isEvolved: true,
      maxLevel: 1,
      desc: '[진화 기술] 거대한 파동 칼날이 다방향으로 교차 비행하며 화면의 모든 적을 베어냅니다!',
      base: { damage: 66, cooldown: 0.7, count: 4, speed: 460, size: 24 }
    },

    dracometeor: {
      id: 'dracometeor',
      name: '용성군',
      icon: '☄️',
      color: '#fb7185',
      maxLevel: 8,
      desc: '하늘에서 주변 적 머리 위로 운석을 떨어뜨려 폭발과 함께 불타는 장판을 생성합니다.',
      base: { damage: 32, cooldown: 1.8, count: 1, radius: 58, duration: 2.2 }
    },

    psychicwave: {
      id: 'psychicwave',
      name: '사이코키네시스',
      icon: '🔮',
      color: '#f472b6',
      maxLevel: 8,
      desc: '주기적으로 강력한 염동력 충격파를 방출하여 주변 적 전체에 피해와 강한 넉백을 줍니다.',
      base: { damage: 28, cooldown: 2.2, radius: 135, knockback: 95 }
    },

    swift: {
      id: 'swift',
      name: '고속스타',
      icon: '⭐',
      color: '#fde047',
      maxLevel: 8,
      desc: '플레이어 주변 360도 전방위로 별 모양 탄환을 흩뿌립니다.',
      base: { damage: 17, cooldown: 1.25, count: 5, speed: 350, size: 12 }
    }
  },

  passives: {
    magnet_coil: {
      id: 'magnet_coil',
      name: '자석 코일',
      icon: '🧲',
      maxLevel: 5,
      evolvesWeapon: 'thunderbolt',
      desc: '이상한사탕(경험치) 획득 범위가 +30% 증가합니다. (10만볼트 진화 재료)'
    },
    charcoal: {
      id: 'charcoal',
      name: '목탄 & 구애머리띠',
      icon: '🥊',
      maxLevel: 5,
      evolvesWeapon: 'flamethrower',
      desc: '모든 기술의 공격력이 +15% 증가합니다. (화염방사 진화 재료)'
    },
    mystic_water: {
      id: 'mystic_water',
      name: '신비의물방울',
      icon: '💧',
      maxLevel: 5,
      evolvesWeapon: 'aquaring',
      desc: '기술 범위/크기가 +14% 증가하고 투사체가 강화됩니다. (아쿠아링 진화 재료)'
    },
    miracle_seed: {
      id: 'miracle_seed',
      name: '먹다남은음식',
      icon: '🍎',
      maxLevel: 5,
      evolvesWeapon: 'gigadrain',
      desc: '최대 체력이 +15% 증가하고 초당 체력 회복량이 +1.2 증가합니다. (기가드레인 진화 재료)'
    },
    spell_tag: {
      id: 'spell_tag',
      name: '선제공격손톱',
      icon: '⚡',
      maxLevel: 5,
      evolvesWeapon: 'shadowball',
      desc: '모든 기술의 재사용 대기시간이 -8% 감소합니다. (섀도볼 진화 재료)'
    },
    expert_belt: {
      id: 'expert_belt',
      name: '달인의띠',
      icon: '🥋',
      maxLevel: 5,
      evolvesWeapon: 'aurasphere',
      desc: '발사되는 투사체 개수가 +1 증가합니다(최대 +3). (파동탄 진화 재료)'
    },
    choice_scarf: {
      id: 'choice_scarf',
      name: '구애스카프',
      icon: '🧣',
      maxLevel: 5,
      desc: '포켓몬의 이동속도가 +12% 증가합니다.'
    },
    lucky_egg: {
      id: 'lucky_egg',
      name: '행복의알',
      icon: '🥚',
      maxLevel: 5,
      desc: '경험치 및 포켓코인 획득량이 +18% 증가합니다.'
    }
  },

  // Enemy Waves by Elapsed Seconds
  waves: [
    { start: 0, end: 60, spawnInterval: 0.85, maxEnemies: 65, pool: [
      { dex: 19, name: '꼬렛', hp: 18, speed: 68, damage: 6, exp: 2, scale: 1.0 },
      { dex: 10, name: '캐터피', hp: 14, speed: 52, damage: 5, exp: 2, scale: 0.95 },
      { dex: 16, name: '구구', hp: 20, speed: 78, damage: 6, exp: 3, scale: 1.0 }
    ]},
    { start: 60, end: 150, spawnInterval: 0.62, maxEnemies: 95, pool: [
      { dex: 41, name: '주뱃', hp: 32, speed: 92, damage: 8, exp: 3, scale: 1.0 },
      { dex: 50, name: '디그다', hp: 38, speed: 82, damage: 9, exp: 4, scale: 1.0 },
      { dex: 23, name: '아보', hp: 45, speed: 76, damage: 10, exp: 4, scale: 1.05 }
    ]},
    { start: 150, end: 270, spawnInterval: 0.48, maxEnemies: 130, pool: [
      { dex: 66, name: '알통몬', hp: 75, speed: 80, damage: 12, exp: 6, scale: 1.1 },
      { dex: 81, name: '코일', hp: 68, speed: 88, damage: 12, exp: 6, scale: 1.0 },
      { dex: 88, name: '질퍽이', hp: 95, speed: 68, damage: 14, exp: 7, scale: 1.15 },
      { dex: 109, name: '또가스', hp: 82, speed: 84, damage: 13, exp: 7, scale: 1.1 }
    ]},
    { start: 270, end: 420, spawnInterval: 0.36, maxEnemies: 170, pool: [
      { dex: 123, name: '스라크', hp: 135, speed: 112, damage: 16, exp: 10, scale: 1.2 },
      { dex: 125, name: '에레브', hp: 155, speed: 95, damage: 18, exp: 11, scale: 1.2 },
      { dex: 126, name: '마그마', hp: 160, speed: 92, damage: 18, exp: 11, scale: 1.2 },
      { dex: 111, name: '뿔카노', hp: 195, speed: 78, damage: 20, exp: 12, scale: 1.25 }
    ]},
    { start: 420, end: 9999, spawnInterval: 0.26, maxEnemies: 220, pool: [
      { dex: 149, name: '망나뇽', hp: 310, speed: 105, damage: 24, exp: 18, scale: 1.35 },
      { dex: 248, name: '마기라스', hp: 380, speed: 92, damage: 26, exp: 20, scale: 1.4 },
      { dex: 373, name: '보만다', hp: 340, speed: 118, damage: 25, exp: 20, scale: 1.38 },
      { dex: 376, name: '메타그로스', hp: 420, speed: 96, damage: 28, exp: 22, scale: 1.4 }
    ]}
  ],

  bosses: [
    { time: 60, dex: 95, name: '우두머리 롱스톤', hp: 950, speed: 82, damage: 20, scale: 2.1 },
    { time: 150, dex: 143, name: '야생의 잠만보', hp: 2400, speed: 75, damage: 26, scale: 2.3 },
    { time: 240, dex: 130, name: '분노한 갸라도스', hp: 4800, speed: 98, damage: 30, scale: 2.35 },
    { time: 360, dex: 145, name: '전설의 썬더', hp: 8500, speed: 112, damage: 35, scale: 2.4 },
    { time: 480, dex: 150, name: '최종보스 뮤츠', hp: 16000, speed: 120, damage: 42, scale: 2.55, isFinal: true }
  ],

  metaUpgrades: [
    { id: 'might', name: '근력 강화 (공격력)', icon: '⚔️', max: 10, baseCost: 50, desc: '레벨당 기본 공격력 +5% 영구 증가' },
    { id: 'hp', name: '체력 강화 (HP)', icon: '❤️', max: 10, baseCost: 45, desc: '레벨당 최대 체력 +8% 영구 증가' },
    { id: 'speed', name: '스피드 강화', icon: '👟', max: 5, baseCost: 60, desc: '레벨당 이동속도 +5% 영구 증가' },
    { id: 'magnet', name: '자석 출력 강화', icon: '🧲', max: 5, baseCost: 55, desc: '레벨당 아이템 획득 반경 +12% 영구 증가' },
    { id: 'greed', name: '부적금화 (골드/경험치)', icon: '🪙', max: 8, baseCost: 70, desc: '레벨당 코인 및 경험치 획득량 +8% 영구 증가' },
    { id: 'revive', name: '기력의덩어리 (부활)', icon: '✨', max: 1, baseCost: 350, desc: '전투 중 쓰러졌을 때 체력 60%로 1회 즉시 부활' }
  ]
};
