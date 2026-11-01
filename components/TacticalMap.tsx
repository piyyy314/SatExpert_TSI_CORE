import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { Coordinates, Satellite } from '../src/types.ts';
import { PDFExportButton } from './PDFExportButton.tsx';

interface Props {
  userLoc: Coordinates;
  satellite: Satellite;
  isTracking: boolean;
  isStealthMode: boolean;
  isJamming?: boolean;
  jammingPower?: number;
  telemetry?: {
    snr: string;
    rxPower: string;
    bucTemp: string;
    packetLoss: string;
    status: string;
  };
  onLocChange?: (loc: Coordinates) => void;
  onTrackingChange?: (val: boolean) => void;
}

export const TacticalMap: React.FC<Props> = ({
  userLoc,
  satellite,
  isTracking,
  isStealthMode,
  isJamming = false,
  jammingPower = 0,
  telemetry,
  onLocChange,
  onTrackingChange
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const d3SvgRef = useRef<SVGSVGElement>(null);
  const [heatmapMode, setHeatmapMode] = useState<'INTERFERENCE' | 'SNR_FIELD' | 'ATMOSPHERIC'>('INTERFERENCE');

  // Projection coordinate mappers
  const getX = (lng: number) => ((lng + 180) / 360) * 100;
  const getY = (lat: number) => ((90 - lat) / 180) * 100;

  const userX = getX(userLoc.lng);
  const userY = getY(userLoc.lat);
  const satX = getX(satellite.longitude);
  const satY = getY(0);

  // D3 Signal Interference & Dynamic Heatmap Renderer
  useEffect(() => {
    if (!d3SvgRef.current || !mapRef.current) return;

    const svg = d3.select(d3SvgRef.current);
    const width = mapRef.current.clientWidth || 400;
    const height = mapRef.current.clientHeight || 224;

    svg.attr('width', width).attr('height', height);

    // Clear previous D3 layers
    svg.selectAll('.d3-heatmap-group').remove();
    const g = svg.append('g').attr('class', 'd3-heatmap-group');

    // Convert % coordinates to canvas pixels
    const pxUserX = (userX / 100) * width;
    const pxUserY = (userY / 100) * height;
    const pxSatX = (satX / 100) * width;
    const pxSatY = (satY / 100) * height;

    const snrVal = telemetry ? parseFloat(telemetry.snr) : 16.0;
    const isCritical = telemetry?.status === 'CRITICAL' || snrVal < 5;

    // Interference Nodes Generation
    const nodes: Array<{ x: number; y: number; val: number; r: number }> = [];

    // Node 1: Jamming Emitter / User Interference center
    const jamFactor = isJamming ? (jammingPower / 100) : 0.05;
    const primaryRadius = Math.max(30, jamFactor * 140 + (isCritical ? 40 : 0));

    nodes.push({
      x: pxUserX,
      y: pxUserY,
      val: isJamming ? Math.min(1, 0.4 + jamFactor * 0.6) : (isCritical ? 0.7 : 0.2),
      r: primaryRadius
    });

    // Node 2: Secondary Satellite Interference Footprint
    nodes.push({
      x: pxSatX,
      y: pxSatY,
      val: isJamming ? jamFactor * 0.5 : 0.15,
      r: 80 + jamFactor * 40
    });

    // Random multipath interference nodes when jamming active
    if (isJamming && jammingPower > 20) {
      const extraCount = Math.floor(jammingPower / 25);
      for (let i = 0; i < extraCount; i++) {
        const angle = (i / extraCount) * Math.PI * 2;
        const dist = 30 + i * 15;
        nodes.push({
          x: pxUserX + Math.cos(angle) * dist,
          y: pxUserY + Math.sin(angle) * dist,
          val: jamFactor * 0.6,
          r: 25 + Math.random() * 20
        });
      }
    }

    // Color Scales using D3 Interpolators
    const colorScale = d3.scaleSequential()
      .domain([0, 1])
      .interpolator(
        isStealthMode
          ? d3.interpolatePurples
          : isJamming || isCritical
          ? d3.interpolateYlOrRd
          : d3.interpolateGnBu
      );

    // Create D3 SVG Radial Gradients dynamically
    const defs = (svg.select('defs').empty() ? svg.append('defs') : svg.select('defs')) as any;
    defs.selectAll('.d3-dyn-grad').remove();

    nodes.forEach((node, idx) => {
      const gradId = `d3-heat-grad-${idx}`;
      const grad = defs.append('radialGradient')
        .attr('id', gradId)
        .attr('class', 'd3-dyn-grad')
        .attr('cx', '50%')
        .attr('cy', '50%')
        .attr('r', '50%');

      const coreColor = colorScale(node.val);
      const outerColor = colorScale(Math.max(0, node.val - 0.4));

      grad.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', coreColor)
        .attr('stop-opacity', isJamming ? 0.7 : 0.35);

      grad.append('stop')
        .attr('offset', '60%')
        .attr('stop-color', outerColor)
        .attr('stop-opacity', isJamming ? 0.3 : 0.1);

      grad.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', outerColor)
        .attr('stop-opacity', 0);

      // Render D3 Heatmap Circles
      g.append('circle')
        .attr('cx', node.x)
        .attr('cy', node.y)
        .attr('r', node.r)
        .attr('fill', `url(#${gradId})`)
        .style('mix-blend-mode', 'screen');
    });

    // Render Dynamic D3 Wave Front Contours if Jamming
    if (isJamming) {
      const contourGroup = g.append('g').attr('class', 'd3-contours');
      const waveCount = Math.min(6, Math.floor(jammingPower / 15) + 2);

      for (let w = 1; w <= waveCount; w++) {
        const ringRadius = (w * 18) + ((Date.now() / 40) % 20);
        contourGroup.append('circle')
          .attr('cx', pxUserX)
          .attr('cy', pxUserY)
          .attr('r', ringRadius)
          .attr('fill', 'none')
          .attr('stroke', colorScale(0.8))
          .attr('stroke-width', 1.2)
          .attr('stroke-dasharray', `${w * 3} ${w * 2}`)
          .attr('opacity', Math.max(0.1, 0.9 - (ringRadius / (primaryRadius + 40))));
      }
    }

  }, [userX, userY, satX, satY, isJamming, jammingPower, telemetry, isStealthMode, heatmapMode]);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current || !onLocChange) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const lng = (x / 100) * 360 - 180;
    const lat = 90 - (y / 100) * 180;

    if (isTracking && onTrackingChange) {
      onTrackingChange(false);
    }

    onLocChange({ lat, lng });
  };

  const coverageColor = isStealthMode ? '#a855f7' : '#22d3ee';

  return (
    <div 
      ref={mapRef}
      onClick={handleMapClick}
      className={`glass rounded-[2.5rem] p-6 border-2 border-slate-800 bg-slate-950/50 overflow-hidden relative h-64 group cursor-crosshair hover:border-red-500/30 transition-all duration-1000 shadow-2xl ${isStealthMode ? 'border-purple-900/40 shadow-[0_0_40px_rgba(168,85,247,0.1)]' : ''}`}
    >
      <div className="absolute top-0 right-0 p-4 opacity-[0.02] pointer-events-none group-hover:opacity-5 transition-opacity">
         <div className="w-16 h-16 border-t-2 border-r-2 border-red-500 rounded-tr-3xl" />
      </div>
      
      {/* Grid Lines */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(${isStealthMode ? '#6366f1' : '#1e293b'} 1px, transparent 1px), linear-gradient(90deg, ${isStealthMode ? '#6366f1' : '#1e293b'} 1px, transparent 1px)`,
          backgroundSize: '10% 10%'
        }}></div>
      </div>

      {/* D3 Heatmap SVG Overlay */}
      <svg 
        ref={d3SvgRef} 
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Map Content */}
      <div className="relative w-full h-full pointer-events-none z-20">
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
          <defs>
            <radialGradient id="coverageHeatmap" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor={coverageColor} stopOpacity="0.3" />
              <stop offset="50%" stopColor={coverageColor} stopOpacity="0.05" />
              <stop offset="100%" stopColor={coverageColor} stopOpacity="0" />
            </radialGradient>
            <linearGradient id="beamGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={coverageColor} stopOpacity="0" />
              <stop offset="100%" stopColor={coverageColor} stopOpacity="0.2" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Signal Beam Footprint (Large) */}
          <circle 
            cx={`${satX}%`} 
            cy={`${satY}%`} 
            r="40%" 
            fill="url(#coverageHeatmap)"
            className="animate-pulse"
            style={{ transition: 'cx 1s ease-in-out' }}
          />

          {/* Focal Signal Beam (Targeting Line) */}
          <path
            d={`M ${userX} ${userY} L ${satX} ${satY}`}
            fill="none"
            stroke="url(#beamGradient)"
            strokeWidth="8"
            className="opacity-20"
            style={{ vectorEffect: 'non-scaling-stroke' }}
          />

          <line 
            x1={`${userX}%`} y1={`${userY}%`} 
            x2={`${satX}%`} y2={`${satY}%`} 
            stroke={isStealthMode ? 'rgba(168, 85, 247, 0.4)' : (isJamming ? 'rgba(239, 68, 68, 0.6)' : 'rgba(34, 211, 238, 0.4)')} 
            strokeWidth={isTracking || isJamming ? "2" : "0.5"} 
            strokeDasharray={isTracking ? "None" : "4 2"}
            filter="url(#glow)"
          />
        </svg>

        {/* Satellite Position (Target) */}
        <div 
          className="absolute w-4 h-4 -ml-2 -mt-2 transition-all duration-1000"
          style={{ left: `${satX}%`, top: `${satY}%` }}
        >
          <div className={`absolute inset-0 rounded-sm rotate-45 animate-pulse ${isStealthMode ? 'bg-purple-500/20' : 'bg-amber-500/20'}`}></div>
          <div className={`absolute inset-1 border rounded-sm rotate-45 ${isStealthMode ? 'border-purple-500' : 'border-amber-500'}`}></div>
          <span className={`absolute -top-4 left-1/2 -translate-x-1/2 text-[7px] font-bold uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity ${isStealthMode ? 'text-purple-400' : 'text-amber-500'}`}>
            {satellite.orbitalSlot}
          </span>
        </div>

        {/* User Position (The Pulsing Dot) */}
        <div 
          className="absolute w-3 h-3 -ml-1.5 -mt-1.5 transition-all duration-700"
          style={{ left: `${userX}%`, top: `${userY}%` }}
        >
          {isTracking && (
            <>
              <div className={`absolute inset-0 rounded-full animate-ping opacity-75 ${isStealthMode ? 'bg-purple-500' : (isJamming ? 'bg-red-500' : 'bg-cyan-500')}`}></div>
              <div className={`absolute -inset-2 border rounded-full animate-pulse ${isStealthMode ? 'border-purple-500/30' : (isJamming ? 'border-red-500/30' : 'border-cyan-500/30')}`}></div>
            </>
          )}
          <div className={`absolute inset-0.5 rounded-full border border-white/20 ${isStealthMode ? 'bg-purple-400 shadow-purple-500/80' : (isJamming ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.9)]' : 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]')}`}></div>
          <span className={`absolute -bottom-4 left-1/2 -translate-x-1/2 text-[7px] font-bold uppercase whitespace-nowrap ${isStealthMode ? 'text-purple-400' : (isJamming ? 'text-red-400' : 'text-cyan-400')}`}>
            {isJamming ? 'EW_JAMMED_NODE' : (isTracking ? 'LIVE_FIX' : 'LOCAL_NODE')}
          </span>
        </div>
      </div>

      {/* Top Header with D3 Heatmap Toggle & PDF Export Button */}
      <div className="absolute top-2 left-3 right-3 pointer-events-auto flex items-center justify-between z-30">
        <div className="flex items-center space-x-2">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">D3 Tactical Projection</span>
          <div className="h-px w-6 bg-slate-800"></div>
          <span className={`text-[7px] font-bold uppercase px-1.5 py-0.5 rounded ${isJamming ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'}`}>
            {isJamming ? `D3 EW JAMMING HEATMAP (${jammingPower}%)` : 'D3 INTERFERENCE FIELD'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <PDFExportButton
            moduleName="Tactical Map & Signal Interference"
            subtitle="D3.js Spatial Telemetry & EW Interference Plume Report"
            userLoc={userLoc}
            satelliteName={satellite.name}
            satLongitude={satellite.longitude}
            isJamming={isJamming}
            jammingPower={jammingPower}
            telemetry={telemetry}
            details={[
              { key: 'D3 Heatmap Engine', value: 'Active (Sequential Interpolation)' },
              { key: 'Primary Emitter Node', value: `${userLoc.lat.toFixed(4)}°N, ${userLoc.lng.toFixed(4)}°W` },
              { key: 'Target Orbital Slot', value: `${satellite.name} (${satellite.longitude}°E)` },
              { key: 'EW Jamming Status', value: isJamming ? `ACTIVE at ${jammingPower}% output power` : 'INACTIVE' },
              { key: 'SNR Quality Status', value: telemetry?.status || 'NOMINAL' }
            ]}
            size="sm"
          />
        </div>
      </div>

      {/* Coordinate HUD & D3 Telemetry Indicator */}
      <div className="absolute bottom-2 right-3 flex flex-col items-end pointer-events-none opacity-80 z-30">
        <span className="text-[8px] font-mono text-slate-400">USER: {userLoc.lat.toFixed(4)}, {userLoc.lng.toFixed(4)}</span>
        <span className="text-[8px] font-mono text-slate-400">SAT: 0.0000, {satellite.longitude.toFixed(4)}</span>
        {isJamming && (
          <span className="text-[8px] font-mono text-red-400 font-bold animate-pulse mt-0.5">
            INTERFERENCE NOISE FLOOR: +{(jammingPower * 0.45).toFixed(1)} dB
          </span>
        )}
      </div>
    </div>
  );
};
