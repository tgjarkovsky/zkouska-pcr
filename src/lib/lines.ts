// Co říká Nanynka. Formulace jsou genderově neutrální.

export const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const LINES = {
  lock: [
    'Ahoj, já jsem Nanynka! Řekni heslo a jdeme se učit. 😉',
    'Stůj, kontrola! 👮‍♀️ Heslo, prosím. A pak hurá do učení.',
  ],
  wrongPassword: ['Hmm, tohle heslo nesedí. Zkus to znovu. 🤔', 'Kdepak, s tímhle tě nepustím. Zkus to ještě jednou.'],
  greetMorning: ['Dobré ráno! Kafe v ruce, otázky v hlavě? ☕', 'Ranní ptáče dál doskáče. Dáme pár otázek?'],
  greetDay: ['Ahoj! Dáme dneska pár otázek spolu?', 'Vítej zpátky! Jsem připravená, a ty?', 'Čau! Pojď, ať máme denní cíl v kapse.'],
  greetEvening: ['Dobrý večer! Ještě malé kolečko před spaním? 🌙', 'Večerní služba začíná. Pár otázek a hotovo!'],
  tips: [
    'Tip: kratší opakování každý den funguje líp než jedno dlouhé biflování.',
    'Tip: u ústních otázek si odpověď nejdřív řekni nahlas, až pak ji odkryj.',
    'Tip: chyby nevadí, otázky, které nejdou, ti budu vracet častěji.',
    'Tip: u ABCD si přečti vysvětlení i u ostatních možností, tam je nejvíc chytáků.',
    'Tip: zkus si občas simulaci, ať si zvykneš na časový tlak.',
  ],
  correct: ['Přesně tak! 🎯', 'Paráda, sedí to jako služební čepice!', 'Výborně, takhle se to dělá! 💪', 'Jo! Tohle máš v malíčku.', 'Bingo! ⭐', 'Správně, jen tak dál!'],
  combo: ['Jsi v ráži! 🔥', 'Série jak na střelnici! 🔥', 'Nezastavitelné! 🚀'],
  wrong: [
    'Nevadí, z chyb se učíme. Mrkni na vysvětlení. 👇',
    'Tahle byla záludná. Přečti si proč a příště to dáš!',
    'Vedle, ale aspoň víme, co si zopakovat. 😉',
    'I zkušený strážmistr občas šlápne vedle. Koukni dolů.',
  ],
  oralHint: [
    'Zkus si odpověď nejdřív říct nahlas, pak si ji odkryj.',
    'Představ si, že sedíš před komisí. Co bys řekl/a?',
    'Osnova stačí: definice, podmínky, paragraf. Jdeme na to!',
  ],
  oralGood: ['Super, to bys u komise dal/a! 🎉', 'Výborně! 👏'],
  oralPartial: ['Napůl taky dobrý. Vrátíme se k tomu zítra.', 'Už to skoro je! 💪'],
  oralBad: ['Nevadí, brzy ti ji připomenu.', 'Dáme ji znovu za chvíli, uvidíš.'],
  doneGreat: ['Bomba výkon! Takhle u zkoušky zazáříš. 🌟', 'Wow! Tohle bylo skoro bez chyby! 🏆'],
  doneOk: ['Dobrá práce! Ještě kolečko a bude to perfektní.', 'Slušný výkon! Chyby ti brzy připomenu.'],
  donePoor: ['Začátky bývají těžké. Jdeme na to znovu? 💪', 'Nevěš hlavu, opakování dělá mistra!'],
  reviewEmpty: ['Pro dnešek hotovo! Zasloužíš si pauzu. 🎉', 'Všechno zopakováno, jsem na tebe pyšná! 🥳'],
  empty: ['Tady zatím nic není. Pošli fotky podkladů a já to připravím!'],
  examStart: ['Simulace je bez nápovědy, jako u ostré zkoušky. Zvládneš to! 💪'],
  examPass: ['Uspěl/a jsi! Takhle to u ostré zkoušky dopadne taky! 🎉', 'Prošlo to! Gratuluju! 🏅'],
  examFail: ['Tentokrát to nevyšlo, ale máme rozbor chyb. Projdeme ho? 💪', 'Ještě to chce trénink. Chyby si procvičíme!'],
  stats: ['Tady vidíš, jak ti to jde. Já jsem spokojená! 📈'],
  levelUp: ['Gratuluju k povýšení! 🎖️ Pokračuj v dobré práci!'],
  badge: ['Nový odznak do sbírky! Jen tak dál! ✨'],
};
