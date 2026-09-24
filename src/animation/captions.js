export const CAPTIONS = [
  {
    start: 0,
    end: 7,
    en: '44" outer diameter · 42" blade sweep · 5" deep housing',
    hi: '44 इंच बाहरी व्यास · 42 इंच ब्लेड स्वीप · 5 इंच गहराई',
  },
  {
    start: 7,
    end: 14,
    en: '360° turntable view',
    hi: '360° टर्नटेबल दृश्य',
  },
  {
    start: 14,
    end: 21.5,
    en: '0.55 kW motor · 900 RPM · single & three phase',
    hi: '0.55 kW मोटर · 900 RPM · सिंगल और थ्री फेज़',
  },
  {
    start: 21.5,
    end: 40,
    en: '50 ft powerful air throw',
    hi: '50 फ़ुट तक शक्तिशाली हवा फेंक',
  },
];

export const STEP_BOUNDS = [0, 7, 14, 21.5, 40];

export function stepIndexForTime(t) {
  for (let i = STEP_BOUNDS.length - 2; i >= 0; i--) {
    if (t >= STEP_BOUNDS[i]) return i;
  }
  return 0;
}
