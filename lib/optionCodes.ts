// lib/optionCodes.ts

// Comprehensive option code mapping for all manufacturers
// These codes are standardized across the automotive industry
export const optionCodeMap: Record<string, string> = {
    // Safety & Security (000-099)
    '001': 'ABS - Sistemi kundër bllokimit të frenave',
    '002': 'ESP - Stabiliteti elektronik',
    '003': 'ASR - Kontrolli i tërheqjes',
    '004': 'Airbag përpara',
    '005': 'Airbag anësor',
    '006': 'Airbag perde',
    '007': 'Airbag gjuri',
    '008': 'Sistemi i alarmit',
    '009': 'Imobilizator',
    '010': 'Kyçje qendrore',
    '011': 'ISOFIX për sediljet e fëmijëve',
    '012': 'Kontrolli i presionit të gomave',
    '013': 'Ndihmë për nisje në pjerrësi',
    '014': 'Asistencë për zbritje',
    '015': 'Diferencial me kontroll elektronik',
    '016': 'Sistemi i parandalimit të përmbysjes',
    '017': 'Sensorë parkimi para',
    '018': 'Sensorë parkimi mbrapa',
    '019': 'Kamera mbrapa',
    '020': 'Kamera 360°',
    '021': 'Asistencë për mbajtjen e korsisë',
    '022': 'Asistencë për ndërrimin e korsisë',
    '023': 'Monitorim i pikës së verbër',
    '024': 'Njohja e shenjave të trafikut',
    '025': 'Frenim automatik emergjent',
    '026': 'Asistencë për qarkullim ndërqytetës',
    '027': 'Asistencë për autostradë',
    '028': 'Tempomat adaptiv (ACC)',
    '029': 'Limiter shpejtësie',
    '030': 'Njohja e përgjumjes së shoferit',

    // Comfort & Convenience (100-199)
    '051': 'Klima automatike me 1 zonë',
    '052': 'Klima automatike me 2 zona',
    '053': 'Klima automatike me 3 zona',
    '054': 'Klima automatike me 4 zona',
    '055': 'Sediljet e përparme me ngrohje',
    '056': 'Sediljet e pasme me ngrohje',
    '057': 'Sediljet me ventilim',
    '058': 'Sediljet me masazh',
    '059': 'Sediljet elektrike (8 drejtime)',
    '060': 'Sediljet elektrike (12 drejtime)',
    '061': 'Memorie për sedilje',
    '062': 'Sediljet lëkure',
    '063': 'Sediljet prej pëlhure',
    '064': 'Sediljet kombinim',
    '065': 'Timon me ngrohje',
    '066': 'Timon elektrik',
    '067': 'Timon sportiv',
    '068': 'Xhami i përparmë me ngrohje',
    '069': 'Xhamat anësor me ngrohje',
    '070': 'Xhami i pasmë me ngrohje',
    '071': 'Pasqyrat anësore me ngrohje',
    '072': 'Pasqyrat anësore elektrike',
    '073': 'Pasqyrat anësore me palosje automatike',
    '074': 'Pasqyra e brendshme elektrokromatike',
    '075': 'Çati diellore',
    '076': 'Çati panoramik',
    '077': 'Çati xhami',
    '078': 'Çati elektrike',
    '079': 'Hapje elektrike e bagazhit',
    '080': 'Dyer elektrike',
    '081': 'Start pa çelës (Keyless Go)',
    '082': 'Hyrje pa çelës',
    '083': 'Butoni Start/Stop',
    '084': 'Telekomandë në distancë',
    '085': 'Klima e ndalur (Start/Stop)',
    '086': 'Modalitet ECO',
    '087': 'Modalitet Sport',
    '088': 'Modalitet Comfort',
    '089': 'Modalitet Individual',
    '090': 'Modalitet Off-road',
    '091': 'Modalitet Snow',
    '092': 'Modalitet Tow',
    '093': 'Modalitet Race',
    '094': 'Sistem i kontrollit të amortizimit',
    '095': 'Pezullim adaptiv',
    '096': 'Pezullim pneumatik',
    '097': 'Pezullim sportiv',
    '098': 'Pezullim i ngurtë',
    '099': 'Pezullim i butë',

    // Technology & Infotainment (200-299)
    '201': 'Radio',
    '202': 'Radio me CD',
    '203': 'Radio me DVD',
    '204': 'Sistemi i navigacionit',
    '205': 'Navigacion me ekran 8"',
    '206': 'Navigacion me ekran 10"',
    '207': 'Navigacion me ekran 12"',
    '208': 'Apple CarPlay',
    '209': 'Android Auto',
    '210': 'Bluetooth për telefon',
    '211': 'Bluetooth për audio',
    '212': 'WiFi Hotspot',
    '213': 'USB port (para)',
    '214': 'USB port (mbrapa)',
    '215': 'USB port (të gjitha)',
    '216': 'Aux port',
    '217': 'HDMI port',
    '218': 'SIM card slot',
    '219': 'eSIM',
    '220': 'LTE Modem',
    '221': '5G Modem',
    '222': 'Sistemi i zërit premium',
    '223': 'Sistemi Burmester',
    '224': 'Sistemi Harman Kardon',
    '225': 'Sistemi Bang & Olufsen',
    '226': 'Sistemi BOSE',
    '227': 'Sistemi JBL',
    '228': 'Sistemi Bowers & Wilkins',
    '229': 'Sistemi Mark Levinson',
    '230': 'Subwoofer',
    '231': 'Amplifikator',
    '232': 'Radio DAB+',
    '233': 'Radio satelitore',
    '234': 'Head-up Display',
    '235': 'Ekran në xham',
    '236': 'Paneli i instrumenteve digjital',
    '237': 'Virtual Cockpit',
    '238': 'Ekran i dyfishtë',
    '239': 'Kontrolle me zë',
    '240': 'Asistencë virtuale',
    '241': 'Aplikacion për telefon',
    '242': 'Remote start',
    '243': 'Remote climate',
    '244': 'Vehicle tracking',
    '245': 'Geofencing',
    '246': 'Valet mode',
    '247': 'Sistemi i parkimit automatik',
    '248': 'Asistencë për parkim',
    '249': 'Kamera 360°',
    '250': 'Kamera përpara',

    // Exterior & Lighting (300-399)
    '301': 'Fenerë Halogjen',
    '302': 'Fenerë Xenon',
    '303': 'Fenerë LED',
    '304': 'Fenerë Matrix LED',
    '305': 'Fenerë Laser',
    '306': 'Dritat automatike',
    '307': 'Dritat e gjata automatike',
    '308': 'Dritat adaptive',
    '309': 'Dritat e mjegullës para',
    '310': 'Dritat e mjegullës mbrapa',
    '311': 'Dritat e ditës LED',
    '312': 'Dritat e pasme LED',
    '313': 'Dritat e pasme dinamike',
    '314': 'Sekuenca e dritave',
    '315': 'Dritat e ambientit',
    '316': 'Ndriçim ambienti me 10 ngjyra',
    '317': 'Ndriçim ambienti me 64 ngjyra',
    '318': 'Rrota alumini 16"',
    '319': 'Rrota alumini 17"',
    '320': 'Rrota alumini 18"',
    '321': 'Rrota alumini 19"',
    '322': 'Rrota alumini 20"',
    '323': 'Rrota alumini 21"',
    '324': 'Rrota alumini 22"',
    '325': 'Rrota çeliku',
    '326': 'Kapakë të rrotave',
    '327': 'Goma dimërore',
    '328': 'Goma verore',
    '329': 'Goma gjithësezonale',
    '330': 'Run-flat goma',
    '331': 'Spoiler para',
    '332': 'Spoiler mbrapa',
    '333': 'Spoiler çatie',
    '334': 'Paketë aerodinamike',
    '335': 'Paketë AMG Line',
    '336': 'Paketë M Sport',
    '337': 'Paketë S Line',
    '338': 'Paketë R-Line',
    '339': 'Paketë Black Edition',
    '340': 'Paketë Night',
    '341': 'Paketë Chrome',
    '342': 'Roof rails',
    '343': 'Hitch (Shul për rimorkio)',
    '344': 'Mbrojtëse para',
    '345': 'Mbrojtëse mbrapa',
    '346': 'Mbrojtëse anësore',
    '347': 'Mbrojtëse e poshtme',
    '348': 'Kapuç sportiv',
    '349': 'Grilë sportive',
    '350': 'Pasqyra sportive',

    // Interior (400-499)
    '401': 'Tapiceri lëkure',
    '402': 'Tapiceri pëlhure',
    '403': 'Tapiceri kombinim',
    '404': 'Tapiceri Alcantara',
    '405': 'Tapiceri veluri',
    '406': 'Qilime',
    '407': 'Qilime të avancuara',
    '408': 'Mbulesë bagazhi',
    '409': 'Rrjetë bagazhi',
    '410': 'Organizator bagazhi',
    '411': 'Çanta ski',
    '412': 'Mbajtëse biçikletash',
    '413': 'Tavani panoramik',
    '414': 'Tavani xhami',
    '415': 'Tavani elektrik',
    '416': 'Tavani i hapur',
    '417': 'Shtylla A e zezë',
    '418': 'Shtylla B e zezë',
    '419': 'Shtylla C e zezë',
    '420': 'Shtylla D e zezë',
    '421': 'Paneli i instrumenteve',
    '422': 'Konsola qendrore',
    '423': 'Konsola e tavanit',
    '424': 'Pasqyra e brendshme',
    '425': 'Pasqyra e diellit',
    '426': 'Mbulesa e diellit',
    '427': 'Dritat e leximit',
    '428': 'Ndriçimi i hapësirës së këmbëve',
    '429': 'Ndriçimi i derës',
    '430': 'Ndriçimi i bagazhit',

    // Windows & Mirrors (500-599)
    '501': 'Dritare elektrike para',
    '502': 'Dritare elektrike mbrapa',
    '503': 'Dritare elektrike të gjitha',
    '504': 'Xham i përparmë me izolim termik',
    '505': 'Xham i përparmë me mbrojtje UV',
    '506': 'Xhamat anësor me izolim termik',
    '507': 'Xhamat anësor me mbrojtje UV',
    '508': 'Xhami i pasmë me izolim termik',
    '509': 'Xhami i pasmë me mbrojtje UV',
    '510': 'Xhamat me ngjyrim',
    '511': 'Xhamat privatësi',
    '512': 'Fshirëse me sensor shiu',
    '513': 'Fshirëse automatike',
    '514': 'Larëse e fenerëve',
    '515': 'Larëse e xhamit me ngrohje',
    '516': 'Pasqyra anësore me memorie',
    '517': 'Pasqyra anësore me errësim automatik',
    '518': 'Pasqyra anësore me dritë sinjalizuese',

    // Specific codes from your data
    // '055': 'Sediljet e përparme me ngrohje',
    // '056': 'Sediljet e pasme me ngrohje',
    // '057': 'Sediljet me ventilim',
    // '058': 'Sediljet me masazh',
    // '068': 'Xhami i përparmë me ngrohje',
    // '072': 'Pasqyrat anësore elektrike',
    // '074': 'Pasqyra e brendshme elektrokromatike',
    // '075': 'Çati diellore',
    // '077': 'Çati xhami',
    // '082': 'Hyrje pa çelës',
    // '084': 'Telekomandë në distancë',
    // '085': 'Klima e ndalur (Start/Stop)',
    // '087': 'Modalitet Sport',
    // '088': 'Modalitet Comfort',
    // '094': 'Sistem i kontrollit të amortizimit',
    // '096': 'Pezullim sportiv',
    // '097': 'Pezullim i butë',
    '10004': 'Paketë speciale',
};

// Function to get option name
export function getOptionName(code: string): string {
    return optionCodeMap[code] || `Opsion ${code}`;
}

export type OptionDescriptor = { code: string; name: string };

// Function to categorize options
export function categorizeOptions(options: (string | OptionDescriptor)[]) {
    const categories: Record<string, OptionDescriptor[]> = {
        safety: [],
        comfort: [],
        technology: [],
        exterior: [],
        interior: [],
        audio: [],
        other: []
    };

    // Keywords for categorization (Albanian + English source names)
    const safetyKeywords = [
        'abs', 'esp', 'asr', 'airbag', 'isofix', 'alarm', 'imobilizator', 'presionit',
        'asistencë', 'korsie', 'frenim', 'monitorim', 'njohja', 'tempomat', 'limit',
        'stability', 'traction', 'brake', 'seat belt', 'lane', 'collision', 'blind spot'
    ];

    const comfortKeywords = [
        'klima', 'ngrohje', 'sedilje', 'timon', 'çati', 'diellore', 'panoramik',
        'elektrike', 'keyless', 'start/stop', 'xham', 'pasqyra', 'memorie', 'lëkure',
        'climate', 'seat', 'steering', 'heating', 'ventilat', 'memory', 'leather'
    ];

    const technologyKeywords = [
        'fener', 'led', 'xenon', 'navigacion', 'bluetooth', 'carplay', 'android',
        'usb', 'head-up', 'panel', 'cockpit', 'ekran', 'radio', 'wifi', 'modem',
        'navigation', 'display', 'infotainment', 'camera', 'sensor', 'cruise'
    ];

    const exteriorKeywords = [
        'rrota', 'alumini', 'spoiler', 'roof', 'hitch', 'paketë', 'mbrojtëse',
        'kapuç', 'grilë', 'dritat', 'fenerët',
        'wheels', 'alloy', 'mirror', 'headlight', 'roof rail', 'spoiler', 'sunroof', 'panoramic'
    ];

    const interiorKeywords = [
        'tapiceri', 'qilime', 'bagazh', 'tavani', 'shtylla', 'konsola',
        'pasqyrë', 'mbulesë',
        'upholstery', 'carpet', 'console', 'glovebox', 'armrest', 'seats'
    ];

    const audioKeywords = [
        'audio', 'burmester', 'harman', 'bang', 'olufsen', 'bose', 'jbl',
        'bowers', 'wilkins', 'levinson', 'subwoofer', 'amplifikator',
        'sound', 'speaker', 'stereo', 'cd player', 'radio'
    ];

    options.forEach(item => {
        const code = typeof item === 'string' ? item : item.code;
        const name = typeof item === 'string' ? getOptionName(code) : (item.name || `Opsion ${code}`);
        const nameLower = name.toLowerCase();

        if (safetyKeywords.some(keyword => nameLower.includes(keyword))) {
            categories.safety.push({ code, name });
        } else if (comfortKeywords.some(keyword => nameLower.includes(keyword))) {
            categories.comfort.push({ code, name });
        } else if (technologyKeywords.some(keyword => nameLower.includes(keyword))) {
            categories.technology.push({ code, name });
        } else if (exteriorKeywords.some(keyword => nameLower.includes(keyword))) {
            categories.exterior.push({ code, name });
        } else if (interiorKeywords.some(keyword => nameLower.includes(keyword))) {
            categories.interior.push({ code, name });
        } else if (audioKeywords.some(keyword => nameLower.includes(keyword))) {
            categories.audio.push({ code, name });
        } else {
            categories.other.push({ code, name });
        }
    });

    return categories;
}