export interface CountryData {
  name: string;
  polygons: [number, number][][];
  center: [number, number];
}

let cached: CountryData[] | null = null;

export async function loadCountries(): Promise<CountryData[]> {
  if (cached) return cached;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  const res = await fetch('/countries.geo.json', {
    signal: controller.signal,
    cache: 'force-cache'
  });
  clearTimeout(timeoutId);

  if (!res.ok) throw new Error(`Failed to load countries: ${res.status}`);
  const json = await res.json();

  const countries: CountryData[] = [];

  for (const feature of json.features) {
    const name = feature.properties?.name ?? '';
    const geom = feature.geometry;
    const polygons: [number, number][][] = [];

    if (geom.type === 'Polygon') {
      for (const ring of geom.coordinates) {
        polygons.push(ring.map((c: number[]) => [c[0], c[1]]));
      }
    } else if (geom.type === 'MultiPolygon') {
      for (const poly of geom.coordinates) {
        for (const ring of poly) {
          polygons.push(ring.map((c: number[]) => [c[0], c[1]]));
        }
      }
    }

    let totalLat = 0;
    let totalLng = 0;
    let count = 0;
    for (const ring of polygons) {
      for (const [lng, lat] of ring) {
        totalLng += lng;
        totalLat += lat;
        count++;
      }
    }
    const center: [number, number] = count > 0
      ? [totalLat / count, totalLng / count]
      : [0, 0];

    countries.push({ name, polygons, center });
  }

  cached = countries;
  return countries;
}
