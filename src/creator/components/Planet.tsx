import { useEffect, useRef, useState, useCallback } from 'react';
import { loadCountries, type CountryData } from '@/shared/lib/countriesLoader';

interface PlanetProps {
  onCountryClick?: (countryName: string) => void;
  isMars?: boolean;
}

function latLngTo3D(lat: number, lng: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return [
    Math.sin(phi) * Math.cos(theta),
    Math.cos(phi),
    Math.sin(phi) * Math.sin(theta),
  ];
}

function rotateY(x: number, y: number, z: number, a: number): [number, number, number] {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [x * c + z * s, y, -x * s + z * c];
}

function tiltX(x: number, y: number, z: number, a: number): [number, number, number] {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [x, y * c - z * s, y * s + z * c];
}

function indexToColor(i: number): string {
  const r = ((i + 1) >> 16) & 0xff;
  const g = ((i + 1) >> 8) & 0xff;
  const b = (i + 1) & 0xff;
  return `rgb(${r},${g},${b})`;
}

function colorToIndex(r: number, g: number, b: number): number {
  const val = (r << 16) | (g << 8) | b;
  return val === 0 ? -1 : val - 1;
}

export default function Planet({ onCountryClick, isMars = false }: PlanetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pickCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rot = useRef(-0.4);
  const tiltRef = useRef(-0.18);
  const zoomRef = useRef(1);
  const targetZoomRef = useRef(1);
  const frame = useRef(0);
  const countriesRef = useRef<CountryData[]>([]);
  const hoveredRef = useRef(-1);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const draggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number; rotAtStart: number; tiltAtStart: number } | null>(null);
  const dragDistRef = useRef(0);
  const velocityXRef = useRef(0);
  const velocityYRef = useRef(0);
  const lastDragRef = useRef({ x: 0, y: 0 });
  const autoSpeedRef = useRef(0.0012);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    let attempts = 0;
    let mounted = true;
    const tryLoad = () => {
      loadCountries().then((data) => {
        if (!mounted) return;
        countriesRef.current = data;
        setLoaded(true);
        setLoadError(false);
      }).catch(() => {
        if (!mounted) return;
        if (attempts < 5) {
          attempts++;
          setTimeout(tryLoad, 1500 * attempts);
        } else {
          setLoadError(true);
          setLoaded(true);
        }
      });
    };
    tryLoad();
    return () => { mounted = false; };
  }, []);

  const handleClick = useCallback(() => {
    if (dragDistRef.current > 5) return;
    if (hoveredRef.current >= 0 && onCountryClick) {
      const country = countriesRef.current[hoveredRef.current];
      if (country) onCountryClick(country.name);
    }
  }, [onCountryClick]);

  useEffect(() => {
    if (!loaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf: number;

    const isMobile = window.innerWidth < 768 && 'ontouchstart' in window;

    const pickCanvas = isMobile ? null : document.createElement('canvas');
    pickCanvasRef.current = pickCanvas;
    const pickCtx = pickCanvas?.getContext('2d', { willReadFrequently: true }) ?? null;

    let lastW = 0;
    let lastH = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 2.5 : 2);
      const { width, height } = canvas.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      lastW = width;
      lastH = height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (pickCanvas) {
        pickCanvas.width = width;
        pickCanvas.height = height;
      }
    };

    resize();
    if (canvas.width === 0 || canvas.height === 0) {
      const retryResize = () => {
        resize();
        if (canvas.width === 0 || canvas.height === 0) {
          requestAnimationFrame(retryResize);
        }
      };
      requestAnimationFrame(retryResize);
    }
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      mouseRef.current = { x: mx, y: my };
      setTooltipPos({ x: mx, y: my });

      if (draggingRef.current && dragStartRef.current) {
        const dx = mx - dragStartRef.current.x;
        const dy = my - dragStartRef.current.y;
        dragDistRef.current = Math.max(dragDistRef.current, Math.abs(dx) + Math.abs(dy));
        const sensitivity = 0.005;
        rot.current = dragStartRef.current.rotAtStart + dx * sensitivity;
        const newTilt = dragStartRef.current.tiltAtStart + dy * sensitivity;
        tiltRef.current = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, newTilt));
        velocityXRef.current = (mx - lastDragRef.current.x) * sensitivity;
        velocityYRef.current = (my - lastDragRef.current.y) * sensitivity;
        lastDragRef.current = { x: mx, y: my };
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      draggingRef.current = true;
      dragDistRef.current = 0;
      dragStartRef.current = { x: mx, y: my, rotAtStart: rot.current, tiltAtStart: tiltRef.current };
      lastDragRef.current = { x: mx, y: my };
      velocityXRef.current = 0;
      velocityYRef.current = 0;
      autoSpeedRef.current = 0;
      setIsDragging(true);
    };

    const handleMouseUp = () => {
      draggingRef.current = false;
      dragStartRef.current = null;
      setIsDragging(false);
    };

    const handleMouseLeave = () => {
      mouseRef.current = null;
      hoveredRef.current = -1;
      setHoveredName(null);
      setIsHovering(false);
      if (draggingRef.current) {
        draggingRef.current = false;
        dragStartRef.current = null;
        setIsDragging(false);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.001;
      targetZoomRef.current = Math.max(0.6, Math.min(3, targetZoomRef.current + delta));
    };

    if (!isMobile) {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mousedown', handleMouseDown);
      canvas.addEventListener('mouseup', handleMouseUp);
      canvas.addEventListener('mouseleave', handleMouseLeave);
      canvas.addEventListener('wheel', handleWheel, { passive: false });
    }

    const project = (lat: number, lng: number, cx: number, cy: number, r: number, rotation: number, currentTilt: number) => {
      const [x3, y3, z3] = latLngTo3D(lat, lng);
      const [rx, ry, rz] = rotateY(x3, y3, z3, rotation);
      const [tx, ty, tz] = tiltX(rx, ry, rz, currentTilt);
      return { x: cx + tx * r, y: cy - ty * r, z: tz };
    };

    const gridStep = isMobile ? 6 : 3;
    const gridLatStep = isMobile ? 60 : 30;
    const gridLngStep = isMobile ? 60 : 30;

    const drawGridLines = (cx: number, cy: number, r: number, rotation: number, currentTilt: number) => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
      ctx.lineWidth = 0.5;

      for (let lat = -60; lat <= 60; lat += gridLatStep) {
        ctx.beginPath();
        let started = false;
        for (let lng = -180; lng <= 180; lng += gridStep) {
          const p = project(lat, lng, cx, cy, r, rotation, currentTilt);
          if (p.z < -0.02) { started = false; continue; }
          if (!started) { ctx.moveTo(p.x, p.y); started = true; }
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      for (let lng = -180; lng < 180; lng += gridLngStep) {
        ctx.beginPath();
        let started = false;
        for (let lat = -90; lat <= 90; lat += gridStep) {
          const p = project(lat, lng, cx, cy, r, rotation, currentTilt);
          if (p.z < -0.02) { started = false; continue; }
          if (!started) { ctx.moveTo(p.x, p.y); started = true; }
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }
    };

    const drawCountryPolygon = (
      targetCtx: CanvasRenderingContext2D,
      polygon: [number, number][],
      cx: number,
      cy: number,
      r: number,
      rotation: number,
      currentTilt: number,
      fillColor: string,
      strokeColor: string,
      lineWidth: number,
    ): boolean => {
      const projected: { x: number; y: number; z: number }[] = [];
      for (const [lng, lat] of polygon) {
        projected.push(project(lat, lng, cx, cy, r, rotation, currentTilt));
      }

      const anyVisible = projected.some((p) => p.z > -0.02);
      if (!anyVisible) return false;

      targetCtx.beginPath();
      let pen = false;
      for (const p of projected) {
        if (p.z < -0.02) { pen = false; continue; }
        if (!pen) { targetCtx.moveTo(p.x, p.y); pen = true; }
        else targetCtx.lineTo(p.x, p.y);
      }
      if (projected.every((p) => p.z > -0.02)) targetCtx.closePath();

      targetCtx.fillStyle = fillColor;
      targetCtx.fill();
      if (strokeColor !== 'none') {
        targetCtx.strokeStyle = strokeColor;
        targetCtx.lineWidth = lineWidth;
        targetCtx.stroke();
      }

      return true;
    };

    const drawLabel = (
      name: string,
      lat: number,
      lng: number,
      cx: number,
      cy: number,
      r: number,
      rotation: number,
      currentTilt: number,
      fontSize: number,
      isHovered: boolean,
    ) => {
      const p = project(lat, lng, cx, cy, r, rotation, currentTilt);
      if (p.z < 0.15) return;

      const alpha = Math.min(1, (p.z - 0.15) * 2) * (isHovered ? 1 : 0.7);

      ctx.font = `${isHovered ? 'bold ' : ''}${Math.round(fontSize * 10) / 10}px "Inter", system-ui, sans-serif`;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(name, p.x, p.y);
    };

    const bigCountries = new Set([
      'United States of America', 'Canada', 'Brazil', 'Russia', 'China',
      'Australia', 'India', 'Argentina', 'Kazakhstan', 'Algeria',
      'Saudi Arabia', 'Mexico', 'Indonesia', 'Sudan', 'Libya',
      'Iran', 'Mongolia', 'Peru', 'Colombia', 'South Africa',
      'Ethiopia', 'Egypt', 'Nigeria', 'Tanzania', 'Turkey',
      'France', 'Spain', 'Germany', 'Japan', 'United Kingdom',
      'Italy', 'Poland', 'Sweden', 'Norway', 'Finland',
      'Pakistan', 'Afghanistan', 'Thailand', 'Vietnam', 'Myanmar',
      'Chile', 'Venezuela', 'Bolivia', 'Angola', 'Mozambique',
      'Zambia', 'Kenya', 'Congo', 'Democratic Republic of the Congo',
      'Madagascar', 'Mali', 'Niger', 'Chad', 'Mauritania',
      'Morocco', 'Ukraine', 'Iraq', 'Somalia', 'Central African Republic',
      'Greenland', 'New Zealand', 'Papua New Guinea', 'Philippines',
      'Malaysia', 'Bangladesh', 'Nepal', 'South Korea', 'North Korea',
      'Cuba', 'Guatemala', 'Honduras', 'Nicaragua', 'Panama',
      'Ecuador', 'Paraguay', 'Uruguay', 'Guyana', 'Suriname',
      'Gabon', 'Cameroon', 'Ivory Coast', 'Ghana', 'Senegal',
      'Guinea', 'Burkina Faso', 'Benin', 'Togo',
      'Zimbabwe', 'Botswana', 'Namibia', 'Uganda', 'Malawi',
      'Tunisia', 'Portugal', 'Greece', 'Romania', 'Bulgaria',
      'Hungary', 'Czech Republic', 'Austria', 'Switzerland',
      'Ireland', 'Iceland', 'Denmark', 'Netherlands', 'Belgium',
      'Belarus', 'Lithuania', 'Latvia', 'Estonia',
      'Georgia', 'Armenia', 'Azerbaijan', 'Uzbekistan', 'Turkmenistan',
      'Kyrgyzstan', 'Tajikistan', 'Syria', 'Jordan', 'Israel',
      'Yemen', 'Oman', 'United Arab Emirates',
      'Sri Lanka', 'Cambodia', 'Laos',
    ]);

    const draw = () => {
      const { width: w, height: h } = canvas.getBoundingClientRect();
      if (w === 0 || h === 0) {
        raf = requestAnimationFrame(draw);
        return;
      }
      if (Math.abs(w - lastW) > 1 || Math.abs(h - lastH) > 1) {
        resize();
      }
      const cx = w / 2;
      const cy = h / 2;

      zoomRef.current += (targetZoomRef.current - zoomRef.current) * 0.08;

      const baseR = Math.min(w, h) * 0.48;
      const r = baseR * zoomRef.current;
      const rotation = rot.current;
      const currentTilt = tiltRef.current;
      const t = frame.current * 0.008;

      ctx.clearRect(0, 0, w, h);
      if (pickCtx) pickCtx.clearRect(0, 0, w, h);

      const glowG = ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 1.35);
      glowG.addColorStop(0, 'rgba(255, 165, 0, 0.03)');
      glowG.addColorStop(0.5, 'rgba(255, 165, 0, 0.01)');
      glowG.addColorStop(1, 'rgba(255, 165, 0, 0)');
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.35, 0, Math.PI * 2);
      ctx.fillStyle = glowG;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = '#000';
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r - 0.5, 0, Math.PI * 2);
      ctx.clip();

      if (pickCtx) {
        pickCtx.save();
        pickCtx.beginPath();
        pickCtx.arc(cx, cy, r - 0.5, 0, Math.PI * 2);
        pickCtx.clip();
      }

      drawGridLines(cx, cy, r, rotation, currentTilt);

      const countries = countriesRef.current;
      const visibleCountries: { name: string; lat: number; lng: number; fontSize: number; idx: number }[] = [];

      if (!isMobile && pickCtx) {
        for (let i = 0; i < countries.length; i++) {
          const country = countries[i];
          const pickColor = indexToColor(i);

          for (const polygon of country.polygons) {
            drawCountryPolygon(
              pickCtx,
              polygon,
              cx, cy, r, rotation, currentTilt,
              pickColor,
              pickColor,
              2,
            );
          }
        }

        if (mouseRef.current) {
          const px = mouseRef.current.x;
          const py = mouseRef.current.y;
          const pixel = pickCtx.getImageData(Math.round(px), Math.round(py), 1, 1).data;
          const idx = colorToIndex(pixel[0], pixel[1], pixel[2]);
          if (idx !== hoveredRef.current) {
            hoveredRef.current = idx;
            if (idx >= 0 && idx < countries.length) {
              setHoveredName(countries[idx].name);
              setIsHovering(true);
            } else {
              setHoveredName(null);
              setIsHovering(false);
            }
          }
        }
      }

      const alwaysHighlighted = new Set([
        'France', 'Canada', 'Spain', 'United Kingdom', 'United States of America',
      ]);

      const majorCountriesOnly = isMobile ? new Set([
        'United States of America', 'Canada', 'Brazil', 'Russia', 'China',
        'Australia', 'India', 'France', 'United Kingdom', 'Germany',
        'Japan', 'Mexico', 'South Africa', 'Argentina', 'Indonesia',
      ]) : null;

      for (let i = 0; i < countries.length; i++) {
        const country = countries[i];
        const isHov = !isMobile && i === hoveredRef.current;
        const isHighlighted = isHov || alwaysHighlighted.has(country.name);
        const isVioletCountry = isMars && alwaysHighlighted.has(country.name);

        for (const polygon of country.polygons) {
          drawCountryPolygon(
            ctx,
            polygon,
            cx, cy, r, rotation, currentTilt,
            isVioletCountry ? 'rgba(139, 92, 246, 0.35)' : (isHov ? 'rgba(255, 200, 100, 0.3)' : isHighlighted ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.035)'),
            isVioletCountry ? 'rgba(167, 139, 250, 0.8)' : (isHov ? 'rgba(255, 200, 100, 0.8)' : isHighlighted ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.12)'),
            isVioletCountry ? 1.5 : (isHov ? 1.5 : isHighlighted ? 1.2 : 0.6),
          );
        }

        const showLabel = isMobile
          ? majorCountriesOnly!.has(country.name)
          : bigCountries.has(country.name);

        if (showLabel) {
          const isBig = ['Russia', 'Canada', 'United States of America', 'China', 'Brazil', 'Australia', 'India', 'Argentina', 'Kazakhstan', 'Algeria'].includes(country.name);
          const fontSize = isBig
            ? Math.max(8, r * 0.038)
            : Math.max(6, r * 0.026);

          let displayName = country.name;
          if (displayName === 'United States of America') displayName = 'USA';
          if (displayName === 'Democratic Republic of the Congo') displayName = 'DR Congo';
          if (displayName === 'Central African Republic') displayName = 'C.A.R.';
          if (displayName === 'United Arab Emirates') displayName = 'UAE';
          if (displayName === 'United Kingdom') displayName = 'UK';
          if (displayName === 'South Korea') displayName = 'S. Korea';
          if (displayName === 'North Korea') displayName = 'N. Korea';
          if (displayName === 'New Zealand') displayName = 'NZ';
          if (displayName === 'Papua New Guinea') displayName = 'PNG';
          if (displayName === 'Czech Republic') displayName = 'Czechia';

          visibleCountries.push({
            name: displayName,
            lat: country.center[0],
            lng: country.center[1],
            fontSize,
            idx: i,
          });
        }
      }

      for (const vc of visibleCountries) {
        drawLabel(vc.name, vc.lat, vc.lng, cx, cy, r, rotation, currentTilt, vc.fontSize, vc.idx === hoveredRef.current);
      }

      const pulse = Math.sin(t * 0.5) * 0.15 + 0.85;
      const particleCount = isMobile ? 15 : 40;
      for (let i = 0; i < particleCount; i++) {
        const lat = Math.sin(i * 2.39996) * 70;
        const lng = (i * 137.508) % 360 - 180;
        const p = project(lat, lng, cx, cy, r, rotation, currentTilt);
        if (p.z < 0.1) continue;

        const a = p.z * 0.3 * pulse;
        const sz = 1.2 + p.z * 1.2;

        const g1 = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, sz * 4);
        g1.addColorStop(0, `rgba(255, 165, 0, ${a * 0.5})`);
        g1.addColorStop(0.5, `rgba(255, 165, 0, ${a * 0.1})`);
        g1.addColorStop(1, 'rgba(255, 165, 0, 0)');
        ctx.beginPath();
        ctx.arc(p.x, p.y, sz * 4, 0, Math.PI * 2);
        ctx.fillStyle = g1;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, sz * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 180, 50, ${a * 0.9})`;
        ctx.fill();
      }

      if (pickCtx) pickCtx.restore();
      ctx.restore();

      const edge = ctx.createRadialGradient(cx, cy, r * 0.82, cx, cy, r);
      edge.addColorStop(0, 'rgba(0, 0, 0, 0)');
      edge.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = edge;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      const rimG = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.5, cx, cy, r);
      rimG.addColorStop(0, 'rgba(255, 255, 255, 0.0)');
      rimG.addColorStop(0.8, 'rgba(255, 255, 255, 0.06)');
      rimG.addColorStop(1, 'rgba(255, 255, 255, 0.15)');
      ctx.strokeStyle = rimG;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      if (!draggingRef.current) {
        if (Math.abs(velocityXRef.current) > 0.0001) {
          rot.current += velocityXRef.current;
          velocityXRef.current *= 0.95;
        } else {
          velocityXRef.current = 0;
          autoSpeedRef.current += (0.0012 - autoSpeedRef.current) * 0.01;
          rot.current += autoSpeedRef.current;
        }

        if (Math.abs(velocityYRef.current) > 0.0001) {
          tiltRef.current += velocityYRef.current;
          tiltRef.current = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, tiltRef.current));
          velocityYRef.current *= 0.95;
        } else {
          velocityYRef.current = 0;
        }
      }
      frame.current++;
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener('resize', resize);
      if (!isMobile) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
        canvas.removeEventListener('wheel', handleWheel);
      }
      cancelAnimationFrame(raf);
    };
  }, [loaded]);

  const handleRetry = useCallback(() => {
    setLoadError(false);
    setLoaded(false);
    loadCountries().then((data) => {
      countriesRef.current = data;
      setLoaded(true);
      setLoadError(false);
    }).catch(() => {
      setLoadError(true);
      setLoaded(true);
    });
  }, []);

  if (loadError && countriesRef.current.length === 0) {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-400/20 to-orange-600/10 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400/30 to-orange-600/20 animate-pulse" />
          </div>
          <p className="text-white/60 text-sm mb-4">Connexion lente</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-orange-400/20 hover:bg-orange-400/30 text-orange-300 rounded-lg text-sm transition-colors"
          >
            Reessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-2 border-white/10 border-t-orange-400/50 rounded-full animate-spin" />
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          display: 'block',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 1s ease',
          cursor: isDragging ? 'grabbing' : isHovering ? 'pointer' : 'grab',
          touchAction: 'pan-y',
        }}
        onClick={handleClick}
      />
      {hoveredName && isHovering && (
        <div
          className="absolute pointer-events-none z-50 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium shadow-lg"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y - 40,
            transform: 'translateX(-50%)',
          }}
        >
          {hoveredName}
        </div>
      )}
    </div>
  );
}
