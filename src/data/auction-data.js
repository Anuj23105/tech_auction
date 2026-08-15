// ============================================================
//  AUCTION ITEMS
// ============================================================
export const AUCTION_ITEMS = [
  // --- Networking ---
  { id: 'router',      name: 'Enterprise Router',        category: 'Networking',  emoji: '🔌', base: 40,  desc: 'Core routing for entire city network',           special: false },
  { id: 'switch',      name: 'Core Switch',              category: 'Networking',  emoji: '🔀', base: 35,  desc: 'High-speed switching fabric for data centers',    special: false },
  { id: 'firewall',    name: 'Firewall',                 category: 'Security',    emoji: '🛡️', base: 80,  desc: 'Protects city network from cyber threats',        special: false },
  { id: 'wifi',        name: 'Wi-Fi Access Point',       category: 'Networking',  emoji: '📶', base: 20,  desc: 'Public Wi-Fi coverage across the city',           special: false },
  { id: 'cable',       name: 'Network Cable (Bundle)',   category: 'Networking',  emoji: '🔗', base: 15,  desc: 'Wired backbone for all city buildings',           special: false },
  { id: 'fiber',       name: 'Fiber Connection',         category: 'Networking',  emoji: '💡', base: 60,  desc: 'Ultra-fast fibre ISP for the city',               special: false },
  { id: 'loadbal',     name: 'Load Balancer',            category: 'Networking',  emoji: '⚖️', base: 45,  desc: 'Distributes traffic across servers evenly',       special: false },

  // --- Computing ---
  { id: 'server',      name: 'Server',                   category: 'Computing',   emoji: '🖥️', base: 200, desc: 'Powers all digital city services',                special: false },
  { id: 'dbserver',    name: 'Database Server',          category: 'Computing',   emoji: '🗄️', base: 200, desc: 'Stores all city data securely',                   special: false },
  { id: 'gpu',         name: 'GPU Cluster',              category: 'Computing',   emoji: '🎮', base: 300, desc: 'AI & smart analytics for the city',               special: false },
  { id: 'cloud',       name: 'Cloud Subscription',       category: 'Computing',   emoji: '☁️', base: 150, desc: 'Scalable cloud infrastructure on-demand',         special: false },
  { id: 'nas',         name: 'NAS Storage',              category: 'Computing',   emoji: '💾', base: 80,  desc: 'Centralised network-attached storage',            special: false },

  // --- IoT ---
  { id: 'cctv',        name: 'CCTV Camera System',       category: 'IoT',         emoji: '📷', base: 30,  desc: 'Smart surveillance across all city zones',        special: false },
  { id: 'traffic',     name: 'Smart Traffic Signal',     category: 'IoT',         emoji: '🚦', base: 100, desc: 'AI-controlled traffic management',                special: false },
  { id: 'parking',     name: 'Smart Parking Sensor',     category: 'IoT',         emoji: '🅿️', base: 40,  desc: 'Real-time parking availability updates',          special: false },
  { id: 'envsensor',   name: 'Environmental Sensor',     category: 'IoT',         emoji: '🌡️', base: 25,  desc: 'Monitors air quality, temp, humidity',            special: false },
  { id: 'rfid',        name: 'RFID Gate System',         category: 'IoT',         emoji: '🚪', base: 35,  desc: 'Automated entry/exit for secured zones',          special: false },
  { id: 'streetlight', name: 'Smart Street Light',       category: 'IoT',         emoji: '💡', base: 20,  desc: 'Energy-saving adaptive street lighting',          special: false },

  // --- Security ---
  { id: 'antivirus',   name: 'Antivirus License',        category: 'Security',    emoji: '🔒', base: 30,  desc: 'City-wide endpoint protection',                   special: false },
  { id: 'idsips',      name: 'IDS/IPS System',           category: 'Security',    emoji: '🕵️', base: 90,  desc: 'Intrusion Detection & Prevention System',         special: false },
  { id: 'backup',      name: 'Backup Server',            category: 'Security',    emoji: '📦', base: 70,  desc: 'Disaster recovery and data backup',               special: false },
  { id: 'biometric',   name: 'Biometric System',         category: 'Security',    emoji: '👆', base: 50,  desc: 'Fingerprint & face ID for govt buildings',        special: false },
  { id: 'siem',        name: 'SIEM Software',            category: 'Security',    emoji: '🧠', base: 120, desc: 'Security event monitoring & response',            special: false },

  // --- Power ---
  { id: 'solar',       name: 'Solar Power Plant',        category: 'Power',       emoji: '☀️', base: 150, desc: 'Clean renewable energy for the city',             special: false },
  { id: 'wind',        name: 'Wind Turbine',             category: 'Power',       emoji: '🌬️', base: 120, desc: 'Wind energy harvesting plant',                    special: false },
  { id: 'ups',         name: 'UPS System',               category: 'Power',       emoji: '🔋', base: 35,  desc: 'Uninterruptible power for critical systems',      special: false },
  { id: 'generator',   name: 'Generator',                category: 'Power',       emoji: '⚡', base: 50,  desc: 'Emergency backup generator',                     special: false },
  { id: 'battery',     name: 'Battery Storage',          category: 'Power',       emoji: '🔌', base: 80,  desc: 'Grid-scale energy storage system',                special: false },

  // --- Public Services ---
  { id: 'hospital',    name: 'Hospital Network',         category: 'Public',      emoji: '🏥', base: 180, desc: 'Digital health infrastructure for hospitals',     special: false },
  { id: 'school',      name: 'School Digital System',    category: 'Public',      emoji: '🏫', base: 120, desc: 'E-learning & digital classrooms',                 special: false },
  { id: 'emergency',   name: 'Emergency Control Room',   category: 'Public',      emoji: '🚨', base: 150, desc: 'City-wide emergency operations centre',           special: false },
  { id: 'police',      name: 'Police Communication',     category: 'Public',      emoji: '👮', base: 100, desc: 'Real-time comms for law enforcement',             special: false },
  { id: 'datacenter',  name: 'Data Center',              category: 'Public',      emoji: '🏢', base: 250, desc: 'Central hub for all city digital services',       special: false },

  // --- Special / Bonus ---
  { id: 'cloudcredit', name: 'Cloud Credits Bonus',      category: 'Special',     emoji: '🎁', base: 50,  desc: '+10 bonus points to your final score',            special: true,  bonus: { type: 'points', value: 10 } },
  { id: 'govgrant',    name: 'Government Grant',         category: 'Special',     emoji: '💰', base: 60,  desc: 'Receive ₹1 Crore extra budget',                   special: true,  bonus: { type: 'money',  value: 100 } },
  { id: 'cybersec',    name: 'Cyber Security Upgrade',   category: 'Special',     emoji: '🛡️', base: 70,  desc: 'Full protection against cyber attack events',     special: true,  bonus: { type: 'shield', value: 1 } },
  { id: 'research',    name: 'Research Center',          category: 'Special',     emoji: '🔬', base: 80,  desc: '+15 innovation points',                           special: true,  bonus: { type: 'points', value: 15 } },
];

// ============================================================
//  SURPRISE EVENTS  (trigger every 8–10 items)
// ============================================================
export const SURPRISE_EVENTS = [
  {
    id: 'cyberattack',
    name: '⚠️ CYBER ATTACK!',
    desc: 'A city-wide cyber attack is underway!',
    effect: 'Teams WITHOUT a Firewall or Cyber Security Upgrade lose 10 points.',
    icon: '💻',
    penaltyPoints: 10,
    penaltyIf: (inv) => !inv.includes('firewall') && !inv.includes('cybersec'),
  },
  {
    id: 'powerfailure',
    name: '⚡ POWER FAILURE!',
    desc: 'The city grid has crashed!',
    effect: 'Teams WITHOUT a UPS or Generator lose 5 points.',
    icon: '🔴',
    penaltyPoints: 5,
    penaltyIf: (inv) => !inv.includes('ups') && !inv.includes('generator'),
  },
  {
    id: 'flood',
    name: '🌊 FLASH FLOOD!',
    desc: 'Heavy rains are flooding the city!',
    effect: 'Teams WITH Environmental Sensors gain 5 bonus points.',
    icon: '💧',
    bonusPoints: 5,
    bonusIf: (inv) => inv.includes('envsensor'),
  },
  {
    id: 'traffic',
    name: '🚗 HEAVY TRAFFIC JAM!',
    desc: 'City roads are completely gridlocked!',
    effect: 'Teams WITH Smart Traffic Signals gain 5 bonus points.',
    icon: '🚦',
    bonusPoints: 5,
    bonusIf: (inv) => inv.includes('traffic'),
  },
  {
    id: 'netfail',
    name: '📡 INTERNET FAILURE!',
    desc: 'The city ISP has gone down!',
    effect: 'Teams WITHOUT Fiber Connection or Load Balancer lose 8 points.',
    icon: '🔌',
    penaltyPoints: 8,
    penaltyIf: (inv) => !inv.includes('fiber') && !inv.includes('loadbal'),
  },
];

// ============================================================
//  CITY ZONES (for the map)
// ============================================================
export const CITY_ZONES = [
  { id: 'residential', name: 'Residential Area',    emoji: '🏘️', x: 10,  y: 10, w: 20, h: 18 },
  { id: 'hospital',    name: 'Hospital',            emoji: '🏥', x: 35,  y: 10, w: 15, h: 15 },
  { id: 'school',      name: 'School',              emoji: '🏫', x: 55,  y: 10, w: 15, h: 15 },
  { id: 'airport',     name: 'Airport',             emoji: '✈️', x: 75,  y: 10, w: 20, h: 15 },
  { id: 'railway',     name: 'Railway Station',     emoji: '🚂', x: 10,  y: 35, w: 18, h: 14 },
  { id: 'govoffice',   name: 'Government Office',   emoji: '🏛️', x: 35,  y: 35, w: 15, h: 14 },
  { id: 'police',      name: 'Police Station',      emoji: '👮', x: 55,  y: 35, w: 14, h: 14 },
  { id: 'mall',        name: 'Shopping Mall',       emoji: '🛍️', x: 75,  y: 35, w: 20, h: 14 },
  { id: 'industrial',  name: 'Industrial Zone',     emoji: '🏭', x: 10,  y: 60, w: 20, h: 17 },
  { id: 'datacenter',  name: 'Data Center',         emoji: '🏢', x: 35,  y: 60, w: 15, h: 17 },
  { id: 'park',        name: 'City Park',           emoji: '🌳', x: 55,  y: 60, w: 14, h: 17 },
  { id: 'roads',       name: 'Smart Roads',         emoji: '🛣️', x: 75,  y: 60, w: 20, h: 17 },
];

// ============================================================
//  CITY REQUIREMENTS (checklist)
// ============================================================
export const CITY_REQUIREMENTS = [
  { id: 'req_net',      label: 'Internet Connectivity',    needs: ['router', 'fiber', 'wifi'] },
  { id: 'req_sec',      label: 'Security Systems',         needs: ['firewall', 'cctv', 'biometric'] },
  { id: 'req_safety',   label: 'Public Safety',            needs: ['cctv', 'police', 'emergency'] },
  { id: 'req_power',    label: 'Power Backup',             needs: ['ups', 'generator', 'solar'] },
  { id: 'req_transport',label: 'Smart Transportation',     needs: ['traffic', 'parking'] },
  { id: 'req_edu',      label: 'Education',                needs: ['school'] },
  { id: 'req_health',   label: 'Healthcare',               needs: ['hospital'] },
  { id: 'req_dr',       label: 'Disaster Recovery',        needs: ['backup', 'ups'] },
  { id: 'req_env',      label: 'Environmental Monitoring', needs: ['envsensor'] },
];