// Game Data: Starters (with Exclusive Signatures & Unique Traits), TM Weapons, Passives, Waves, Bosses

window.GAME_DATA = {
  starters: [
    {
      id: 'pikachu',
      name: '피카츄',
      dex: 25,
      type: '전기',
      typeColor: '#facc15',
      traitName: '정전기 (Static)',
      traitDesc: '번개 타격 시 25% 확률로 적 마비(기절) · 추가 이동속도 비례 번개 피해량 증가',
      desc: '[전용기: 10만볼트] 빠른 기동력과 마비 뇌격으로 적 군단을 감전시키는 스피드스터',
      bonusText: '특성 [정전기] · 전용기 [10만볼트]',
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
      traitName: '맹화 (Blaze)',
      traitDesc: '화염 공격이 3초간 지속 화상(DoT) 부여 · 잃은 체력 비례 공격력 최대 +50% 증가',
      desc: '[전용기: 화염방사] 압도적인 맹화 화력과 화상 폭발로 군단을 소각하는 메인 딜러',
      bonusText: '특성 [맹화] · 전용기 [화염방사]',
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
      traitName: '조가비갑옷 & 급류',
      traitDesc: '8초마다 피해를 1회 완전 무시하는 [물의 보호막] 생성 · 수압 넉백 거리 2배',
      desc: '[전용기: 아쿠아링] 자동 재생되는 물의 보호막과 회전 해류로 포위망을 분쇄하는 수호자',
      bonusText: '특성 [물의 보호막] · 전용기 [아쿠아링]',
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
      traitName: '맹독포자 & 심록',
      traitDesc: '오라에 닿은 적에게 지속 맹독 및 방어력 감소(받는 모든 피해 +25% 증폭) 부여',
      desc: '[전용기: 기가드레인] 적의 생명력을 흡수하고 방어력을 깎는 맹독 결계의 생존 전문가',
      bonusText: '특성 [맹독/방깎] · 전용기 [기가드레인]',
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
      traitName: '부유 & 저주받은바디',
      traitDesc: '적에게 피격 시 30% 확률로 공격 완전 회피(MISS) · 투사체 도탄(튕김) 횟수 +2회',
      desc: '[전용기: 섀도볼] 유령처럼 공격을 흘려내고 도탄 구체로 적들을 유린하는 마법사',
      bonusText: '특성 [30% 회피/도탄+2] · 전용기 [섀도볼]',
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
      traitName: '정신의력 (Inner Focus)',
      traitDesc: '기본 치명타 확률 +25% & 치명타 피해량 2배 · 보스 및 우두머리 대상 피해 +25%',
      desc: '[전용기: 파동탄] 치명적인 파동 크리티컬과 보스 학살 능력을 지닌 파동의 용사',
      bonusText: '특성 [치명타 특화] · 전용기 [파동탄]',
      startWeapon: 'aurasphere',
      stats: { hp: 122, speed: 170, might: 1.12, armor: 1, regen: 0.35, magnet: 98, cooldown: 0.94, expMult: 1.2 },
      evolutions: [
        { level: 12, name: '루카리오', dex: 448, hpBonus: 85, mightBonus: 0.38, speedBonus: 24 }
      ]
    }
  ],

  weapons: {
    // ================= 6 EXCLUSIVE STARTER SIGNATURE WEAPONS =================
    thunderbolt: {
      id: 'thunderbolt',
      name: '10만볼트 [피카츄 전용]',
      icon: '⚡',
      color: '#facc15',
      secondaryColor: '#fef08a',
      exclusiveTo: 'pikachu',
      maxLevel: 8,
      evolveWith: 'magnet_coil',
      evolveInto: 'volttackle',
      desc: '[피카츄 전용기] 가까운 적에게 다중 분기 낙뢰를 내리꽂고 연쇄 감전 및 정전기 마비를 일으킵니다.',
      base: { damage: 28, cooldown: 1.05, count: 1, chains: 3, range: 310 }
    },
    volttackle: {
      id: 'volttackle',
      name: '백만볼트 뇌신폭풍',
      icon: '🌩️',
      color: '#fde047',
      secondaryColor: '#38bdf8',
      exclusiveTo: 'pikachu',
      isEvolved: true,
      maxLevel: 1,
      desc: '[피카츄 궁극기] 천공에서 거대한 뇌신 기둥이 연속 낙하하며 화면 전체를 마비 번개로 초토화합니다!',
      base: { damage: 78, cooldown: 0.58, count: 3, chains: 6, range: 410 }
    },

    flamethrower: {
      id: 'flamethrower',
      name: '화염방사 [파이리 전용]',
      icon: '🔥',
      color: '#f97316',
      secondaryColor: '#fde047',
      exclusiveTo: 'charmander',
      maxLevel: 8,
      evolveWith: 'charcoal',
      evolveInto: 'blastburn',
      desc: '[파이리 전용기] 적들을 관통·소각하며 맹화 화상(지속 피해)을 입히는 고열 화염탄을 발사합니다.',
      base: { damage: 24, cooldown: 0.9, count: 2, speed: 410, pierce: 3, size: 15 }
    },
    blastburn: {
      id: 'blastburn',
      name: '블러스트번',
      icon: '🌋',
      color: '#ef4444',
      secondaryColor: '#facc15',
      exclusiveTo: 'charmander',
      isEvolved: true,
      maxLevel: 1,
      desc: '[리자몽 궁극기] 전방위로 거대한 태양 화염구를 난사하며 지면에 용암 폭발 흔적을 남깁니다!',
      base: { damage: 68, cooldown: 0.55, count: 7, speed: 460, pierce: 9, size: 23 }
    },

    aquaring: {
      id: 'aquaring',
      name: '아쿠아링 [꼬부기 전용]',
      icon: '💧',
      color: '#38bdf8',
      secondaryColor: '#bae6fd',
      exclusiveTo: 'squirtle',
      maxLevel: 8,
      evolveWith: 'mystic_water',
      evolveInto: 'hydrocannon',
      desc: '[꼬부기 전용기] 물결 리본을 일으키며 고속 회전하는 수압 구체로 적을 강하게 밀쳐냅니다.',
      base: { damage: 20, cooldown: 0.1, count: 2, radius: 86, rotSpeed: 3.4, size: 17 }
    },
    hydrocannon: {
      id: 'hydrocannon',
      name: '하이드로캐논',
      icon: '🌊',
      color: '#0284c7',
      secondaryColor: '#7dd3fc',
      exclusiveTo: 'squirtle',
      isEvolved: true,
      maxLevel: 1,
      desc: '[거북왕 궁극기] 6개의 거대한 심해 해류 소용돌이가 폭풍처럼 회전하며 모든 적을 분쇄합니다!',
      base: { damage: 54, cooldown: 0.1, count: 6, radius: 118, rotSpeed: 5.5, size: 25 }
    },

    gigadrain: {
      id: 'gigadrain',
      name: '기가드레인 [이상해씨 전용]',
      icon: '🌿',
      color: '#4ade80',
      secondaryColor: '#bbf7d0',
      exclusiveTo: 'bulbasaur',
      maxLevel: 8,
      evolveWith: 'miracle_seed',
      evolveInto: 'frenzyplant',
      desc: '[이상해씨 전용기] 생명력 흡수 마법진을 펼쳐 적에게 맹독·방깎·둔화를 걸고 체력을 흡수합니다.',
      base: { damage: 13, cooldown: 0.38, radius: 85, healChance: 0.12 }
    },
    frenzyplant: {
      id: 'frenzyplant',
      name: '하드플랜트 성역',
      icon: '🌳',
      color: '#16a34a',
      secondaryColor: '#86efac',
      exclusiveTo: 'bulbasaur',
      isEvolved: true,
      maxLevel: 1,
      desc: '[이상해꽃 궁극기] 고대 숲의 마법진이 펼쳐져 적들의 방어력을 무너뜨리고 생명력을 흡수합니다!',
      base: { damage: 38, cooldown: 0.25, radius: 148, healChance: 0.30 }
    },

    shadowball: {
      id: 'shadowball',
      name: '섀도볼 [고오스 전용]',
      icon: '👻',
      color: '#c084fc',
      secondaryColor: '#e9d5ff',
      exclusiveTo: 'gastly',
      maxLevel: 8,
      evolveWith: 'spell_tag',
      evolveInto: 'darkvoid',
      desc: '[고오스 전용기] 암흑 오라 꼬리를 끌며 적들 사이를 끝없이 연쇄 도탄하는 고스트 구체입니다.',
      base: { damage: 26, cooldown: 1.05, count: 1, bounces: 3, speed: 360, size: 15 }
    },
    darkvoid: {
      id: 'darkvoid',
      name: '다크홀',
      icon: '🌑',
      color: '#9333ea',
      secondaryColor: '#f0abfc',
      exclusiveTo: 'gastly',
      isEvolved: true,
      maxLevel: 1,
      desc: '[팬텀 궁극기] 주변 적들을 중력으로 강하게 빨아들이며 연쇄 폭발하는 블랙홀을 발사합니다!',
      base: { damage: 72, cooldown: 0.72, count: 3, bounces: 6, speed: 420, size: 24 }
    },

    aurasphere: {
      id: 'aurasphere',
      name: '파동탄 [리오르 전용]',
      icon: '🌀',
      color: '#60a5fa',
      secondaryColor: '#bfdbfe',
      exclusiveTo: 'riolu',
      maxLevel: 8,
      evolveWith: 'expert_belt',
      evolveInto: 'aurastorm',
      desc: '[리오르 전용기] 고속 회전하는 파동 수리검이 소닉붐을 일으키며 왕복 관통합니다.',
      base: { damage: 25, cooldown: 1.08, count: 1, speed: 380, size: 17 }
    },
    aurastorm: {
      id: 'aurastorm',
      name: '파동의 폭풍',
      icon: '💠',
      color: '#2563eb',
      secondaryColor: '#93c5fd',
      exclusiveTo: 'riolu',
      isEvolved: true,
      maxLevel: 1,
      desc: '[루카리오 궁극기] 거대한 파동 십자 칼날들이 다방향으로 교차 비행하며 전장을 난도질합니다!',
      base: { damage: 70, cooldown: 0.65, count: 4, speed: 480, size: 25 }
    },

    // ================= 9 UNIVERSAL TM SKILLS (ALL POKÉMON CAN LEARN!) =================
    hyperbeam: {
      id: 'hyperbeam',
      name: 'TM01 파괴광선',
      icon: '💥',
      color: '#f59e0b',
      secondaryColor: '#fef047',
      maxLevel: 8,
      evolveWith: 'charcoal',
      evolveInto: 'gigaimpact',
      desc: '[공용 TM] 가장 강한 적을 조준해 화면 끝까지 일직선으로 꿰뚫는 초대형 관통 레이저를 발사합니다.',
      base: { damage: 46, cooldown: 2.3, count: 1, width: 22, range: 680 }
    },
    gigaimpact: {
      id: 'gigaimpact',
      name: '기가임팩트 레이저',
      icon: '🌟',
      color: '#fde047',
      secondaryColor: '#ef4444',
      isEvolved: true,
      maxLevel: 1,
      desc: '[진화 TM] 다중 초고열 파괴광선이 교차 발사되어 일직선상의 모든 적을 증발시킵니다!',
      base: { damage: 115, cooldown: 1.35, count: 3, width: 34, range: 780 }
    },

    aerialace: {
      id: 'aerialace',
      name: 'TM02 제비반환 & 칼춤',
      icon: '⚔️',
      color: '#38bdf8',
      secondaryColor: '#e0f2fe',
      maxLevel: 8,
      evolveWith: 'spell_tag',
      evolveInto: 'sacredsword',
      desc: '[공용 TM] 접근하는 적들을 초고속 초승달 검기(Slash)로 연속 베어 넘기는 근접 호위 기술입니다.',
      base: { damage: 30, cooldown: 0.92, count: 1, radius: 95 }
    },
    sacredsword: {
      id: 'sacredsword',
      name: '성스러운칼날 난무',
      icon: '🗡️',
      color: '#60a5fa',
      secondaryColor: '#fde047',
      isEvolved: true,
      maxLevel: 1,
      desc: '[진화 TM] 전방위 360도로 거대한 빛의 검기가 쉴 새 없이 휘몰아치며 주변 적을 도륙합니다!',
      base: { damage: 76, cooldown: 0.52, count: 3, radius: 135 }
    },

    rockslide: {
      id: 'rockslide',
      name: 'TM03 스톤샤워',
      icon: '🪨',
      color: '#a8a29e',
      secondaryColor: '#d6d3d1',
      maxLevel: 8,
      evolveWith: 'expert_belt',
      evolveInto: 'stoneedge',
      desc: '[공용 TM] 거대한 바위들을 굴려 경로상의 적들을 뭉개고 기절(Stun)시킵니다.',
      base: { damage: 34, cooldown: 1.45, count: 2, speed: 290, size: 19, pierce: 5 }
    },
    stoneedge: {
      id: 'stoneedge',
      name: '스톤에지 대분쇄',
      icon: '⛰️',
      color: '#d97706',
      secondaryColor: '#fef08a',
      isEvolved: true,
      maxLevel: 1,
      desc: '[진화 TM] 거대한 암석 쐐기들이 전방위로 돌진하며 적들을 연쇄 기절시키고 분쇄합니다!',
      base: { damage: 84, cooldown: 0.88, count: 5, speed: 350, size: 26, pierce: 10 }
    },

    twister: {
      id: 'twister',
      name: 'TM04 회오리바람',
      icon: '🌪️',
      color: '#34d399',
      secondaryColor: '#a7f3d0',
      maxLevel: 8,
      evolveWith: 'choice_scarf',
      evolveInto: 'hurricane',
      desc: '[공용 TM] 전장을 소용돌이치며 떠돌아다니는 진공 회오리를 생성해 적들을 다단히트로 베어냅니다.',
      base: { damage: 18, cooldown: 2.1, count: 2, speed: 155, size: 28, life: 3.4 }
    },
    hurricane: {
      id: 'hurricane',
      name: '폭풍 (Hurricane)',
      icon: '🌀',
      color: '#10b981',
      secondaryColor: '#6ee7b7',
      isEvolved: true,
      maxLevel: 1,
      desc: '[진화 TM] 초대형 폭풍 토네이도 군단이 전장을 휩쓸며 적들을 빨아들이고 갈아버립니다!',
      base: { damage: 46, cooldown: 1.4, count: 4, speed: 195, size: 42, life: 4.2 }
    },

    earthquake: {
      id: 'earthquake',
      name: 'TM05 지진',
      icon: '🌍',
      color: '#eab308',
      secondaryColor: '#fde047',
      maxLevel: 8,
      evolveWith: 'miracle_seed',
      evolveInto: 'earthpower',
      desc: '[공용 TM] 주기적으로 대지를 강타하여 넓은 범위의 모든 적에게 균열 피해와 강한 둔화를 입힙니다.',
      base: { damage: 36, cooldown: 2.2, radius: 170 }
    },
    earthpower: {
      id: 'earthpower',
      name: '대지의힘 (단애의칼)',
      icon: '🌋',
      color: '#f97316',
      secondaryColor: '#fde047',
      isEvolved: true,
      maxLevel: 1,
      desc: '[진화 TM] 대지가 연쇄 폭발하며 광역 지진파와 함께 적들을 기절시키고 둔화시킵니다!',
      base: { damage: 92, cooldown: 1.35, radius: 245 }
    },

    iciclespear: {
      id: 'iciclespear',
      name: 'TM06 고드름침',
      icon: '❄️',
      color: '#7dd3fc',
      secondaryColor: '#e0f2fe',
      maxLevel: 8,
      evolveWith: 'mystic_water',
      evolveInto: 'sheercold',
      desc: '[공용 TM] 적을 관통하며 30% 확률로 적을 꽁꽁 얼려 정지(빙결)시키는 얼음 창을 연사합니다.',
      base: { damage: 22, cooldown: 1.0, count: 3, speed: 440, size: 13, pierce: 3 }
    },
    sheercold: {
      id: 'sheercold',
      name: '절대영도 눈보라',
      icon: '🧊',
      color: '#38bdf8',
      secondaryColor: '#ffffff',
      isEvolved: true,
      maxLevel: 1,
      desc: '[진화 TM] 극저온의 빙결 창이 폭우처럼 쏟아지며 적들을 집단 빙결 상태로 만듭니다!',
      base: { damage: 58, cooldown: 0.62, count: 7, speed: 500, size: 18, pierce: 7 }
    },

    dracometeor: {
      id: 'dracometeor',
      name: 'TM07 용성군',
      icon: '☄️',
      color: '#fb7185',
      secondaryColor: '#fde047',
      maxLevel: 8,
      desc: '[공용 TM] 하늘에서 거대한 불타는 운석이 실제로 낙하하여 대폭발과 용암 화염 지대를 생성합니다.',
      base: { damage: 38, cooldown: 1.65, count: 1, radius: 66, duration: 2.6 }
    },

    psychicwave: {
      id: 'psychicwave',
      name: 'TM08 사이코키네시스',
      icon: '🔮',
      color: '#f472b6',
      secondaryColor: '#f9a8d4',
      maxLevel: 8,
      desc: '[공용 TM] 다중 염동력 프리즘 충격파를 방출하여 주변 적 전체에 큰 피해와 강력한 넉백을 입힙니다.',
      base: { damage: 30, cooldown: 2.0, radius: 145, knockback: 105 }
    },

    swift: {
      id: 'swift',
      name: 'TM09 고속스타',
      icon: '⭐',
      color: '#fde047',
      secondaryColor: '#ffffff',
      maxLevel: 8,
      desc: '[공용 TM] 황금빛 스타더스트 궤적을 남기는 회전 별 탄환을 360도 전방위로 난사합니다.',
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
      name: '목탄 & 구애머리띠',
      icon: '🔥',
      img: './assets/items/charcoal.png',
      maxLevel: 5,
      evolvesWeapon: 'flamethrower',
      desc: '모든 기술의 공격력이 +16% 증가합니다. (화염방사 & 파괴광선 진화 재료)'
    },
    mystic_water: {
      id: 'mystic_water',
      name: '신비의물방울',
      icon: '💧',
      img: './assets/items/mystic-water.png',
      maxLevel: 5,
      evolvesWeapon: 'aquaring',
      desc: '기술 범위/크기가 +15% 증가합니다. (아쿠아링 & 고드름침 진화 재료)'
    },
    miracle_seed: {
      id: 'miracle_seed',
      name: '기적의씨',
      icon: '🌱',
      img: './assets/items/miracle-seed.png',
      maxLevel: 5,
      evolvesWeapon: 'gigadrain',
      desc: '최대 체력 +15% 및 초당 회복량 +1.4 증가. (기가드레인 & 지진 진화 재료)'
    },
    spell_tag: {
      id: 'spell_tag',
      name: '저주받은부적',
      icon: '📿',
      img: './assets/items/spell-tag.png',
      maxLevel: 5,
      evolvesWeapon: 'shadowball',
      desc: '모든 기술의 쿨타임이 -8% 감소합니다. (섀도볼 & 제비반환 진화 재료)'
    },
    expert_belt: {
      id: 'expert_belt',
      name: '달인의띠',
      icon: '🥋',
      img: './assets/items/expert-belt.png',
      maxLevel: 5,
      evolvesWeapon: 'aurasphere',
      desc: '발사되는 투사체 개수가 +1 증가합니다(최대 +3). (파동탄 & 스톤샤워 진화 재료)'
    },
    choice_scarf: {
      id: 'choice_scarf',
      name: '구애스카프',
      icon: '🧣',
      img: './assets/items/choice-scarf.png',
      maxLevel: 5,
      evolvesWeapon: 'twister',
      desc: '포켓몬의 이동속도가 +12% 증가합니다. (회오리바람 진화 재료)'
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

  // Balanced Difficulty Curve: Smooth Early Game -> Intense Exponential Late Game!
  waves: [
    { start: 0, end: 60, spawnInterval: 0.58, spawnBatch: 1, maxEnemies: 55, eliteChance: 0.0, pool: [
      { dex: 19, name: '꼬렛', hp: 13, speed: 62, damage: 5, exp: 3, scale: 1.0 },
      { dex: 10, name: '캐터피', hp: 11, speed: 52, damage: 4, exp: 3, scale: 0.95 },
      { dex: 16, name: '구구', hp: 14, speed: 68, damage: 5, exp: 3, scale: 1.0 }
    ]},
    { start: 60, end: 150, spawnInterval: 0.36, spawnBatch: 2, maxEnemies: 115, eliteChance: 0.025, pool: [
      { dex: 41, name: '주뱃', hp: 32, speed: 84, damage: 9, exp: 4, scale: 1.0 },
      { dex: 50, name: '디그다', hp: 38, speed: 78, damage: 10, exp: 4, scale: 1.0 },
      { dex: 23, name: '아보', hp: 46, speed: 76, damage: 11, exp: 5, scale: 1.05 },
      { dex: 66, name: '알통몬', hp: 56, speed: 74, damage: 12, exp: 5, scale: 1.08 }
    ]},
    { start: 150, end: 270, spawnInterval: 0.22, spawnBatch: 4, maxEnemies: 240, eliteChance: 0.06, pool: [
      { dex: 66, name: '알통몬', hp: 135, speed: 96, damage: 17, exp: 7, scale: 1.1 },
      { dex: 81, name: '코일', hp: 125, speed: 104, damage: 17, exp: 7, scale: 1.05 },
      { dex: 88, name: '질퍽이', hp: 175, speed: 88, damage: 20, exp: 8, scale: 1.15 },
      { dex: 109, name: '또가스', hp: 150, speed: 100, damage: 19, exp: 8, scale: 1.1 }
    ]},
    { start: 270, end: 420, spawnInterval: 0.14, spawnBatch: 6, maxEnemies: 360, eliteChance: 0.10, pool: [
      { dex: 123, name: '스라크', hp: 420, speed: 128, damage: 28, exp: 12, scale: 1.2 },
      { dex: 125, name: '에레브', hp: 480, speed: 116, damage: 30, exp: 13, scale: 1.2 },
      { dex: 126, name: '마그마', hp: 500, speed: 114, damage: 30, exp: 13, scale: 1.2 },
      { dex: 111, name: '뿔카노', hp: 620, speed: 104, damage: 34, exp: 15, scale: 1.25 }
    ]},
    { start: 420, end: 9999, spawnInterval: 0.10, spawnBatch: 8, maxEnemies: 460, eliteChance: 0.15, pool: [
      { dex: 149, name: '망나뇽', hp: 1150, speed: 132, damage: 42, exp: 22, scale: 1.35 },
      { dex: 248, name: '마기라스', hp: 1450, speed: 120, damage: 48, exp: 24, scale: 1.4 },
      { dex: 373, name: '보만다', hp: 1280, speed: 142, damage: 45, exp: 24, scale: 1.38 },
      { dex: 376, name: '메타그로스', hp: 1680, speed: 125, damage: 52, exp: 26, scale: 1.4 }
    ]}
  ],

  bosses: [
    { time: 60, dex: 95, name: '우두머리 롱스톤', hp: 900, speed: 84, damage: 18, scale: 2.2 },
    { time: 150, dex: 143, name: '광폭화 잠만보', hp: 3800, speed: 92, damage: 28, scale: 2.35 },
    { time: 240, dex: 130, name: '폭주하는 갸라도스', hp: 13500, speed: 116, damage: 38, scale: 2.4 },
    { time: 360, dex: 145, name: '전설의 뇌신 썬더', hp: 32000, speed: 130, damage: 48, scale: 2.45 },
    { time: 480, dex: 150, name: '초전설 뮤츠', hp: 72000, speed: 142, damage: 62, scale: 2.6, isFinal: true }
  ],

  stages: [
    {
      id: 1,
      name: 'STAGE 1. 상록숲 초원',
      sub: '트레이너의 첫 관문 · 초록 숲과 오솔길',
      icon: '🌲',
      themeColor: '#22c55e',
      mapTint: 'rgba(16, 185, 129, 0.0)',
      roadTint: 'rgba(234, 179, 8, 0.0)',
      duration: 300,
      hpMult: 1.0,
      dmgMult: 1.0,
      coinMult: 1.0,
      clearBonus: 150,
      bossImg: 112,
      waves: [
        { start: 0, end: 75, spawnInterval: 0.56, spawnBatch: 1, maxEnemies: 55, eliteChance: 0.0, pool: [
          { dex: 10, name: '캐터피', hp: 11, speed: 52, damage: 4, exp: 3, scale: 0.95 },
          { dex: 19, name: '꼬렛', hp: 13, speed: 62, damage: 5, exp: 3, scale: 1.0 },
          { dex: 16, name: '구구', hp: 14, speed: 68, damage: 5, exp: 3, scale: 1.0 }
        ]},
        { start: 75, end: 180, spawnInterval: 0.34, spawnBatch: 2, maxEnemies: 120, eliteChance: 0.03, pool: [
          { dex: 41, name: '주뱃', hp: 32, speed: 84, damage: 9, exp: 4, scale: 1.0 },
          { dex: 50, name: '디그다', hp: 38, speed: 78, damage: 10, exp: 4, scale: 1.0 },
          { dex: 23, name: '아보', hp: 46, speed: 76, damage: 11, exp: 5, scale: 1.05 }
        ]},
        { start: 180, end: 9999, spawnInterval: 0.20, spawnBatch: 4, maxEnemies: 240, eliteChance: 0.07, pool: [
          { dex: 66, name: '알통몬', hp: 125, speed: 94, damage: 16, exp: 7, scale: 1.1 },
          { dex: 88, name: '질퍽이', hp: 160, speed: 88, damage: 18, exp: 8, scale: 1.15 },
          { dex: 111, name: '뿔카노', hp: 210, speed: 96, damage: 20, exp: 9, scale: 1.18 }
        ]}
      ],
      bosses: [
        { time: 90, dex: 95, name: '우두머리 롱스톤', hp: 950, speed: 84, damage: 16, scale: 2.15 },
        { time: 180, dex: 143, name: '광폭화 잠만보', hp: 3600, speed: 92, damage: 24, scale: 2.3 },
        { time: 300, dex: 112, name: '[보스] 대지의 코뿌리', hp: 11500, speed: 112, damage: 34, scale: 2.45, isFinal: true }
      ]
    },
    {
      id: 2,
      name: 'STAGE 2. 블루시티 해안 협곡',
      sub: '거센 해류와 빙결의 폭풍이 몰아치는 해안',
      icon: '🌊',
      themeColor: '#38bdf8',
      mapTint: 'rgba(14, 165, 233, 0.22)',
      roadTint: 'rgba(56, 189, 248, 0.25)',
      duration: 360,
      hpMult: 1.45,
      dmgMult: 1.25,
      coinMult: 1.4,
      clearBonus: 250,
      bossImg: 144,
      waves: [
        { start: 0, end: 90, spawnInterval: 0.50, spawnBatch: 1, maxEnemies: 65, eliteChance: 0.01, pool: [
          { dex: 16, name: '구구', hp: 16, speed: 70, damage: 6, exp: 3, scale: 1.0 },
          { dex: 41, name: '주뱃', hp: 20, speed: 78, damage: 7, exp: 3, scale: 1.0 },
          { dex: 7, name: '야생 꼬부기', hp: 24, speed: 66, damage: 7, exp: 4, scale: 1.0 }
        ]},
        { start: 90, end: 210, spawnInterval: 0.30, spawnBatch: 3, maxEnemies: 150, eliteChance: 0.04, pool: [
          { dex: 81, name: '코일', hp: 62, speed: 94, damage: 12, exp: 5, scale: 1.05 },
          { dex: 8, name: '어니부기', hp: 85, speed: 86, damage: 14, exp: 6, scale: 1.1 },
          { dex: 123, name: '스라크', hp: 95, speed: 108, damage: 15, exp: 7, scale: 1.12 }
        ]},
        { start: 210, end: 9999, spawnInterval: 0.16, spawnBatch: 5, maxEnemies: 280, eliteChance: 0.09, pool: [
          { dex: 123, name: '스라크', hp: 220, speed: 118, damage: 22, exp: 9, scale: 1.15 },
          { dex: 130, name: '야생 갸라도스', hp: 310, speed: 106, damage: 26, exp: 11, scale: 1.25 },
          { dex: 148, name: '신뇽', hp: 280, speed: 112, damage: 24, exp: 11, scale: 1.2 }
        ]}
      ],
      bosses: [
        { time: 90, dex: 130, name: '폭주하는 갸라도스', hp: 1900, speed: 96, damage: 22, scale: 2.25 },
        { time: 210, dex: 9, name: '심해의 거북왕', hp: 7200, speed: 102, damage: 30, scale: 2.35 },
        { time: 360, dex: 144, name: '[전설] 빙조 프리져', hp: 24000, speed: 122, damage: 42, scale: 2.5, isFinal: true }
      ]
    },
    {
      id: 3,
      name: 'STAGE 3. 보라타운 유령탑',
      sub: '보라빛 안개와 고스트·번개 군단이 배회하는 성소',
      icon: '👻',
      themeColor: '#c084fc',
      mapTint: 'rgba(109, 40, 217, 0.28)',
      roadTint: 'rgba(139, 92, 246, 0.22)',
      duration: 420,
      hpMult: 2.0,
      dmgMult: 1.5,
      coinMult: 1.8,
      clearBonus: 400,
      bossImg: 145,
      waves: [
        { start: 0, end: 90, spawnInterval: 0.46, spawnBatch: 2, maxEnemies: 75, eliteChance: 0.02, pool: [
          { dex: 92, name: '고오스', hp: 22, speed: 74, damage: 7, exp: 4, scale: 1.0 },
          { dex: 41, name: '주뱃', hp: 24, speed: 82, damage: 7, exp: 4, scale: 1.0 },
          { dex: 109, name: '또가스', hp: 28, speed: 68, damage: 8, exp: 4, scale: 1.05 }
        ]},
        { start: 90, end: 240, spawnInterval: 0.26, spawnBatch: 3, maxEnemies: 180, eliteChance: 0.06, pool: [
          { dex: 93, name: '고우스트', hp: 90, speed: 98, damage: 15, exp: 6, scale: 1.1 },
          { dex: 88, name: '질퍽이', hp: 120, speed: 88, damage: 17, exp: 7, scale: 1.15 },
          { dex: 64, name: '윤겔라', hp: 105, speed: 100, damage: 16, exp: 7, scale: 1.1 }
        ]},
        { start: 240, end: 9999, spawnInterval: 0.14, spawnBatch: 6, maxEnemies: 320, eliteChance: 0.11, pool: [
          { dex: 94, name: '그림자 팬텀', hp: 320, speed: 120, damage: 26, exp: 11, scale: 1.2 },
          { dex: 125, name: '에레브', hp: 350, speed: 116, damage: 28, exp: 12, scale: 1.2 },
          { dex: 212, name: '핫삼', hp: 390, speed: 124, damage: 30, exp: 13, scale: 1.22 }
        ]}
      ],
      bosses: [
        { time: 110, dex: 94, name: '심연의 다크 팬텀', hp: 3400, speed: 106, damage: 26, scale: 2.3 },
        { time: 250, dex: 142, name: '고대 익룡 프테라', hp: 14000, speed: 124, damage: 36, scale: 2.4 },
        { time: 420, dex: 145, name: '[전설] 뇌신 썬더', hp: 42000, speed: 132, damage: 48, scale: 2.55, isFinal: true }
      ]
    },
    {
      id: 4,
      name: 'STAGE 4. 홍련섬 화산 분화구',
      sub: '붉게 타오르는 용암 대지와 고대 괴수들의 격전지',
      icon: '🌋',
      themeColor: '#f97316',
      mapTint: 'rgba(220, 38, 38, 0.28)',
      roadTint: 'rgba(249, 115, 22, 0.30)',
      duration: 480,
      hpMult: 2.7,
      dmgMult: 1.8,
      coinMult: 2.4,
      clearBonus: 650,
      bossImg: 383,
      waves: [
        { start: 0, end: 100, spawnInterval: 0.44, spawnBatch: 2, maxEnemies: 85, eliteChance: 0.03, pool: [
          { dex: 50, name: '디그다', hp: 28, speed: 78, damage: 8, exp: 4, scale: 1.0 },
          { dex: 74, name: '꼬마돌', hp: 34, speed: 68, damage: 9, exp: 4, scale: 1.05 },
          { dex: 5, name: '야생 리자드', hp: 38, speed: 84, damage: 10, exp: 5, scale: 1.08 }
        ]},
        { start: 100, end: 260, spawnInterval: 0.22, spawnBatch: 4, maxEnemies: 210, eliteChance: 0.08, pool: [
          { dex: 126, name: '마그마', hp: 135, speed: 104, damage: 18, exp: 8, scale: 1.15 },
          { dex: 111, name: '뿔카노', hp: 165, speed: 98, damage: 20, exp: 8, scale: 1.18 },
          { dex: 229, name: '헬가', hp: 150, speed: 114, damage: 20, exp: 9, scale: 1.15 }
        ]},
        { start: 260, end: 9999, spawnInterval: 0.12, spawnBatch: 7, maxEnemies: 380, eliteChance: 0.13, pool: [
          { dex: 6, name: '야생 리자몽', hp: 460, speed: 124, damage: 32, exp: 14, scale: 1.25 },
          { dex: 112, name: '코뿌리', hp: 540, speed: 112, damage: 35, exp: 15, scale: 1.28 },
          { dex: 248, name: '마기라스', hp: 650, speed: 118, damage: 38, exp: 17, scale: 1.32 }
        ]}
      ],
      bosses: [
        { time: 120, dex: 146, name: '[전설] 화조 파이어', hp: 5800, speed: 112, damage: 30, scale: 2.35 },
        { time: 280, dex: 248, name: '사막의 폭군 마기라스', hp: 24000, speed: 118, damage: 42, scale: 2.45 },
        { time: 480, dex: 383, name: '[초전설] 대륙의 신 그란돈', hp: 75000, speed: 128, damage: 56, scale: 2.65, isFinal: true }
      ]
    },
    {
      id: 5,
      name: 'STAGE 5. 석영고원 신들의 성전',
      sub: '드래곤 군단과 창조신 아르세우스가 강림하는 최종 결전!',
      icon: '🏛️',
      themeColor: '#facc15',
      mapTint: 'rgba(234, 179, 8, 0.22)',
      roadTint: 'rgba(250, 204, 21, 0.28)',
      duration: 540,
      hpMult: 3.6,
      dmgMult: 2.1,
      coinMult: 3.5,
      clearBonus: 1200,
      bossImg: 493,
      waves: [
        { start: 0, end: 110, spawnInterval: 0.40, spawnBatch: 2, maxEnemies: 95, eliteChance: 0.04, pool: [
          { dex: 147, name: '미뇽', hp: 36, speed: 84, damage: 10, exp: 5, scale: 1.05 },
          { dex: 246, name: '애버라스', hp: 42, speed: 78, damage: 11, exp: 5, scale: 1.05 },
          { dex: 371, name: '아공이', hp: 40, speed: 86, damage: 11, exp: 5, scale: 1.05 }
        ]},
        { start: 110, end: 300, spawnInterval: 0.18, spawnBatch: 5, maxEnemies: 260, eliteChance: 0.10, pool: [
          { dex: 148, name: '신뇽', hp: 180, speed: 112, damage: 22, exp: 9, scale: 1.18 },
          { dex: 375, name: '메탕구', hp: 220, speed: 104, damage: 24, exp: 10, scale: 1.2 },
          { dex: 444, name: '한바이트', hp: 200, speed: 118, damage: 24, exp: 10, scale: 1.18 }
        ]},
        { start: 300, end: 9999, spawnInterval: 0.10, spawnBatch: 8, maxEnemies: 450, eliteChance: 0.16, pool: [
          { dex: 149, name: '망나뇽', hp: 680, speed: 130, damage: 38, exp: 18, scale: 1.32 },
          { dex: 373, name: '보만다', hp: 740, speed: 138, damage: 40, exp: 19, scale: 1.35 },
          { dex: 376, name: '메타그로스', hp: 860, speed: 122, damage: 44, exp: 20, scale: 1.36 },
          { dex: 445, name: '한카리아스', hp: 820, speed: 142, damage: 42, exp: 20, scale: 1.36 }
        ]}
      ],
      bosses: [
        { time: 150, dex: 150, name: '[초전설] 유전자 뮤츠', hp: 12000, speed: 126, damage: 38, scale: 2.4 },
        { time: 330, dex: 384, name: '[초전설] 천공의 신 레쿠쟈', hp: 48000, speed: 138, damage: 50, scale: 2.55 },
        { time: 540, dex: 493, name: '[창조신] 아르세우스', hp: 135000, speed: 145, damage: 68, scale: 2.75, isFinal: true }
      ]
    }
  ],

  metaUpgrades: [
    { id: 'might', name: '근력 강화 (공격력)', icon: '⚔️', img: './assets/items/charcoal.png', max: 15, baseCost: 150, desc: '레벨당 기본 공격력 +5% 영구 증가' },
    { id: 'cooldown', name: '고속 영창 (쿨타임)', icon: '⏱️', img: './assets/items/spell-tag.png', max: 10, baseCost: 280, desc: '레벨당 모든 기술 공격 쿨타임 -3% 영구 단축' },
    { id: 'amount', name: '연발 장전 (투사체 +1)', icon: '🎯', img: './assets/items/expert-belt.png', max: 2, baseCost: 2400, desc: '레벨당 기본 발사체/타격 횟수 +1개 영구 추가!' },
    { id: 'crit', name: '급소 타격 연구 (치명타)', icon: '💥', img: './assets/items/dragon-fang.png', max: 10, baseCost: 260, desc: '레벨당 치명타 확률 +2% 및 치명타 피해 +6% 증가' },
    { id: 'area', name: '광역 증폭 (공격 범위)', icon: '🌊', img: './assets/items/mystic-water.png', max: 10, baseCost: 240, desc: '레벨당 모든 기술 공격 크기 및 폭발 반경 +5% 증가' },
    { id: 'boss_slayer', name: '보스 사냥꾼 (보스 추뎀)', icon: '👑', img: './assets/items/fire-stone.png', max: 10, baseCost: 300, desc: '레벨당 보스 및 엘리트 몬스터 대상 피해량 +8% 증가' },
    { id: 'hp', name: '체력 단련 (최대 HP)', icon: '❤️', img: './assets/items/full-restore.png', max: 15, baseCost: 130, desc: '레벨당 최대 체력 +8% 영구 증가' },
    { id: 'armor', name: '강철 갑옷 (방어/재생)', icon: '🛡️', img: './assets/items/miracle-seed.png', max: 10, baseCost: 220, desc: '레벨당 받는 피해 -1.5 감소 및 초당 체력 재생 +0.5 증가' },
    { id: 'reroll', name: '오박사의 주사위 (리롤)', icon: '🎲', img: './assets/items/moon-stone.png', max: 5, baseCost: 450, desc: '레벨업 시 기술 선택지 다시 뽑기(리롤) 횟수 +1회 추가' },
    { id: 'speed', name: '신속의 날개 (이동속도)', icon: '👟', img: './assets/items/choice-scarf.png', max: 8, baseCost: 160, desc: '레벨당 이동속도 +4% 영구 증가' },
    { id: 'magnet', name: '자석 코일 (획득 반경)', icon: '🧲', img: './assets/items/magnet.png', max: 8, baseCost: 150, desc: '레벨당 아이템 자동 흡수 반경 +12% 영구 증가' },
    { id: 'greed', name: '부적금화 (코인/경험치)', icon: '🪙', img: './assets/items/amulet-coin.png', max: 10, baseCost: 200, desc: '레벨당 코인 및 경험치 획득량 +6% 영구 증가' },
    { id: 'revive', name: '기력의덩어리 (부활)', icon: '✨', img: './assets/items/max-revive.png', max: 3, baseCost: 1200, desc: '전투 중 쓰러졌을 때 체력 70%로 즉시 부활 (최대 3회)' }
  ]
};
