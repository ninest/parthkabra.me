export type GeocodedLocation = { lat: number; lng: number; display: string };

// --- Shared rate-limited queue (Nominatim: 1 req/sec) ---

type QueueItem = {
  run: () => Promise<void>;
};

const queue: QueueItem[] = [];
let timer: ReturnType<typeof setInterval> | null = null;

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    queue.push({
      run: () => fn().then(resolve, reject),
    });
    if (!timer) {
      processQueue();
      timer = setInterval(processQueue, 1100);
    }
  });
}

async function processQueue() {
  if (queue.length === 0) {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    return;
  }
  const item = queue.shift()!;
  await item.run();
}

// --- Forward geocode ---

export function geocode(query: string): Promise<GeocodedLocation | null> {
  return enqueue(async () => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
      const resp = await fetch(url, {
        headers: { "User-Agent": "AverageLocationCalculator/1.0" },
      });
      const data = await resp.json();
      if (data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          display: data[0].display_name,
        };
      }
      return null;
    } catch {
      return null;
    }
  });
}

// --- Reverse geocode ---

export function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  return enqueue(async () => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
      const resp = await fetch(url, {
        headers: { "User-Agent": "AverageLocationCalculator/1.0" },
      });
      const data = await resp.json();
      return data.display_name || null;
    } catch {
      return null;
    }
  });
}

// --- Geographic midpoint (spherical) ---

export function geographicMidpoint(
  points: { lat: number; lng: number }[]
): { lat: number; lng: number } {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;

  let x = 0,
    y = 0,
    z = 0;
  for (const p of points) {
    const latR = toRad(p.lat);
    const lngR = toRad(p.lng);
    x += Math.cos(latR) * Math.cos(lngR);
    y += Math.cos(latR) * Math.sin(lngR);
    z += Math.sin(latR);
  }
  x /= points.length;
  y /= points.length;
  z /= points.length;

  return {
    lat: toDeg(Math.atan2(z, Math.sqrt(x * x + y * y))),
    lng: toDeg(Math.atan2(y, x)),
  };
}
