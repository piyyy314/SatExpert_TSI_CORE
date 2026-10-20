
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { BugReportEvent, Satellite, TacticalEvent, WeatherCondition } from '../src/types.ts';

export const generateBugReportPDF = (events: BugReportEvent[], systemInfo: any) => {
  const doc = new jsPDF();
  const timestamp = new Date().toISOString();

  // Dark Tactical Theme Base
  doc.setFillColor(5, 8, 16);
  doc.rect(0, 0, 210, 297, 'F');

  // Header
  doc.setTextColor(239, 68, 68); // Red
  doc.setFont('courier', 'bold');
  doc.setFontSize(22);
  doc.text('STIA TACTICAL ANOMALY REPORT', 15, 25);
  
  doc.setDrawColor(239, 68, 68);
  doc.setLineWidth(1);
  doc.line(15, 30, 195, 30);

  // Metadata
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(10);
  doc.text(`REPORT_ID: BUG_ANOMALY_${Date.now()}`, 15, 40);
  doc.text(`TIMESTAMP: ${timestamp}`, 15, 45);
  doc.text(`SOURCE: TSI_ORCHESTRATOR_V5.4`, 15, 50);
  doc.text(`CLASSIFICATION: TOP SECRET // NOFORN`, 15, 55);

  // System Status Summary
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text('SYSTEM_HEALTH_INDEX', 15, 70);
  
  const systemData = [
    ['PARAMETER', 'VALUE', 'STATUS'],
    ['CURRENT_DEFCON', systemInfo.defcon?.toString() || 'N/A', (systemInfo.defcon || 5) <= 2 ? 'CRITICAL' : 'STABLE'],
    ['BUC_THERMAL', `${parseFloat(systemInfo.bucTemp)?.toFixed(1)}C` || 'N/A', parseFloat(systemInfo.bucTemp) > 60 ? 'WARNING' : 'NOMINAL'],
    ['PACKET_LOSS_INDEX', `${parseFloat(systemInfo.packetLoss)?.toFixed(2)}%` || 'N/A', parseFloat(systemInfo.packetLoss) > 5 ? 'DEGRADED' : 'OPTIMAL'],
    ['SIGNAL_NOISE_RATIO', `${parseFloat(systemInfo.snr)?.toFixed(1)}dB` || 'N/A', parseFloat(systemInfo.snr) < 10 ? 'LOW' : 'HIGH'],
  ];

  (doc as any).autoTable({
    startY: 75,
    head: [systemData[0]],
    body: systemData.slice(1),
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], font: 'courier' },
    bodyStyles: { fillColor: [5, 5, 10], textColor: [200, 200, 200], font: 'courier' },
    alternateRowStyles: { fillColor: [15, 23, 42] },
    margin: { left: 15 },
  });

  // Real-time Anomaly Analysis
  const analysisY = (doc as any).lastAutoTable.finalY + 15;
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text('REAL-TIME_ANOMALY_ANALYSIS', 15, analysisY);

  const criticalLogs = events.filter(e => e.team === 'RED' || e.type === 'ATTACK');
  const systemHealth = parseFloat(systemInfo.snr) > 10 && parseFloat(systemInfo.packetLoss) < 5 ? 'STABLE' : 'COMPROMISED';

  const analysisData = [
    ['METRIC', 'LOG_COUNT', 'SEVERITY_INDEX'],
    ['RED_TEAM_INCURSIONS', criticalLogs.length.toString(), criticalLogs.length > 0 ? 'HIGH' : 'ZERO'],
    ['TOTAL_SESSION_ANOMALIES', events.length.toString(), events.length > 20 ? 'ELEVATED' : 'NOMINAL'],
    ['OVERALL_SECURITY_POSTURE', systemHealth, systemHealth === 'STABLE' ? 'N/A' : 'CRITICAL']
  ];

  (doc as any).autoTable({
    startY: analysisY + 5,
    head: [analysisData[0]],
    body: analysisData.slice(1),
    theme: 'grid',
    headStyles: { fillColor: [71, 85, 105], textColor: [255, 255, 255], font: 'courier' },
    bodyStyles: { fillColor: [5, 5, 10], textColor: [200, 200, 200], font: 'courier' },
    alternateRowStyles: { fillColor: [15, 23, 42] },
    margin: { left: 15 },
  });

  // Historic Known Bugs Section
  const historicY = (doc as any).lastAutoTable.finalY + 15;
  doc.setTextColor(251, 191, 36); // Amber
  doc.setFontSize(14);
  doc.text('HISTORIC_SYSTEM_DEVIATIONS (DEBT_REGISTRY)', 15, historicY);

  const historicBugs = [
    ['ID', 'ANOMALY_TYPE', 'DISCOVERY', 'MITIGATION_STATUS'],
    ['BUG_001', 'KA_BAND_RAIN_FADE', 'DEPLOYMENT', 'ACTIVE_COMPENSATION'],
    ['BUG_002', 'BUC_THERMAL_DRIFT', 'H1_2026', 'ZPE_COOLING_PATCH'],
    ['BUG_003', 'NEURAL_STRETCH_LAG', 'SITREP_GEN', 'QUANTUM_PRUNING'],
    ['BUG_004', 'PHASE_SHIFT_GHOSTS', 'JAMMING_TEST', 'AETHER_DECOY_MODULE'],
    ['BUG_005', 'STEALTH_SIGNATURE_LEAK', 'V0.9', 'REDACTED_BY_CMD'],
  ];

  (doc as any).autoTable({
    startY: historicY + 5,
    head: [historicBugs[0]],
    body: historicBugs.slice(1),
    theme: 'grid',
    headStyles: { fillColor: [251, 191, 36], textColor: [0, 0, 0], font: 'courier' },
    bodyStyles: { fillColor: [5, 5, 10], textColor: [200, 200, 200], font: 'courier' },
    alternateRowStyles: { fillColor: [15, 15, 5] },
    margin: { left: 15 },
  });

  // Anomaly Logs
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setTextColor(239, 68, 68);
  doc.setFontSize(14);
  doc.text('ANOMALY_EVENT_LOG (SINCE_INITIALIZATION)', 15, finalY);

  const logData = events.map(e => [
    e.timestamp,
    e.team,
    e.action.length > 50 ? e.action.substring(0, 47) + '...' : e.action,
    e.team === 'RED' ? 'MALICIOUS' : e.team === 'SYSTEM' ? 'DIAGNOSTIC' : 'NEUTRAL'
  ]);

  (doc as any).autoTable({
    startY: finalY + 5,
    head: [['TIMESTAMP', 'ORIGIN', 'ANOMALY_DESCRIPTION', 'CLASSIFICATION']],
    body: logData,
    theme: 'grid',
    headStyles: { fillColor: [239, 68, 68], textColor: [255, 255, 255], font: 'courier' },
    bodyStyles: { fillColor: [5, 5, 10], textColor: [200, 200, 200], font: 'courier' },
    alternateRowStyles: { fillColor: [20, 10, 10] },
    margin: { left: 15 },
  });

  // Footer / Seal
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text(`STIA_FOOTPRINT: ${Math.random().toString(36).substring(2, 15).toUpperCase()}`, 15, 290);
    doc.text(`PAGE ${i} OF ${pageCount}`, 180, 290);
  }

  doc.save(`STIA_BUG_REPORT_${Date.now()}.pdf`);
};

export const generateTacticalAARPDF = (
  eventLogs: TacticalEvent[],
  sat: Satellite,
  satellites: Satellite[],
  weather: WeatherCondition,
  isStealthMode: boolean,
  isJamming: boolean,
  jammingPower: number,
  isDecoyActive: boolean,
  isZPEActive: boolean,
  isQuantumDefenseActive: boolean,
  telemetry: any
) => {
  const doc = new jsPDF();
  const timestamp = new Date().toISOString();
  const docFingerprint = Array.from({ length: 4 }, () => 
    Math.random().toString(36).substring(2, 6).toUpperCase()
  ).join('-');

  // Top Dark Header Banner
  doc.setFillColor(15, 23, 42); // slate-900 / navy-black
  doc.rect(15, 15, 180, 22, 'F');

  // Cyan bottom border for banner
  doc.setFillColor(6, 182, 212); // cyan-500
  doc.rect(15, 37, 180, 1.5, 'F');

  // Header Typography
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('TACTICAL AFTER-ACTION REPORT (AAR)', 20, 24);
  
  doc.setTextColor(165, 243, 252); // cyan-200
  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.text('SATCOM INTELLIGENCE DIVISION // SIGNAL TELEMETRY & INTEL ANALYTICS (STIA)', 20, 31);

  // Security Classification Stamp (Red Border Warning Box)
  doc.setDrawColor(220, 38, 38); // red-600
  doc.setLineWidth(1);
  doc.rect(125, 45, 70, 15);
  
  doc.setTextColor(220, 38, 38);
  doc.setFont('courier', 'bold');
  doc.setFontSize(7.5);
  doc.text('AAR SECURITY PROTOCOL', 128, 50);
  doc.setFontSize(9);
  doc.text('CONFIDENTIAL // ORCON', 128, 56);

  // General Metadata Section
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('GENERAL OPERATIONAL METADATA', 15, 49);

  doc.setTextColor(71, 85, 105); // slate-600
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.text(`REPORT REFERENCE : ${docFingerprint}-AAR`, 15, 54);
  doc.text(`OPERATING ID     : baalbek.313@gmail.com`, 15, 58);
  doc.text(`ZULU TIMESTAMP   : ${timestamp}`, 15, 62);

  // Slate Horizontal thin line
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.line(15, 66, 195, 66);

  // Section 1: Tracked Asset Description
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('1. ASSET SPECIFICATION & TRACKING PROFILE', 15, 73);

  const assetDetails = [
    ['SAT DESIGNATION', sat.name.toUpperCase()],
    ['REGISTRY SLOT', sat.orbitalSlot],
    ['IDENTIFIER HASH', sat.id],
    ['OPERATIONAL CONTROL', (sat.operator || 'UNSPECIFIED COMMAND').toUpperCase()],
    ['CONSTELLATION STATUS', (sat.status || 'active').toUpperCase()]
  ];

  (doc as any).autoTable({
    startY: 76,
    body: assetDetails,
    theme: 'plain',
    bodyStyles: { font: 'courier', fontSize: 8.5, textColor: [51, 65, 85] },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [100, 116, 139], width: 50 }
    },
    margin: { left: 15, right: 15 }
  });

  let currentY = (doc as any).lastAutoTable.finalY + 8;

  // Section 2: Environment Factors
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('2. ENVIRONMENT PROFILE AND WARFARE PRESETS', 15, currentY);

  const defconActive = satellites.some(s => s.status === 'offline') ? 'DEFCON 2 (ELEVATED ALERT)' : 'DEFCON 4 (STANDBY)';
  const rainFadeEst = weather === 'CLEAR' ? '0.5dB (OPTIMAL)' : weather === 'OVERCAST' ? '2.0dB (SLIGHT ATTENUATION)' : '8.0dB+ (CRITICAL RAIN FADE)';

  const envFactors = [
    ['PRESET METRIC', 'OPERATIONAL VALUE', 'STRATEGIC POSTURE'],
    ['GLOBAL SECURITY STATE', defconActive, satellites.some(s => s.status === 'offline') ? 'CRITICAL LINK LOSS DETECTED' : 'NOMINAL GUARD CONTROLS'],
    ['ATMOSPHERIC RATING', `${weather} CONDITIONS`, `ESTIMATED ATTENUATION: ${rainFadeEst}`],
    ['STEALTH SHIELD STATE', isStealthMode ? 'ENABLED' : 'DISABLED', isStealthMode ? 'MAX THERMAL SCAN REDUCTION' : 'PASSIVE INTERCEPT CHANNELS OPEN'],
    ['ELECTRONIC JAMMING', isJamming ? `ACTIVE (${jammingPower}% INTENSITY)` : 'INACTIVE', isJamming ? 'SIGNAL INTERFERENCE ACTIVE' : 'PASSIVE SPECTRAL HARVESTING'],
    ['COUNTER-MEASURES', isDecoyActive ? 'ACTIVE (AETHER DECOYS)' : 'STANDBY', isDecoyActive ? 'LINK TRANSPONDERS EMULATING' : 'NO SPOOFED NOISE SIGNATURES'],
    ['ZERO-POINT ENGINE', isZPEActive ? 'ENGAGED' : 'NOMINAL ONBOARD', isZPEActive ? 'THERMAL SIGNATURE CONTROL SECURED' : 'STANDARD FLUID RE-CIRCULATION']
  ];

  (doc as any).autoTable({
    startY: currentY + 3,
    head: [envFactors[0]],
    body: envFactors.slice(1),
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], font: 'helvetica', fontSize: 8.5 },
    bodyStyles: { font: 'courier', fontSize: 8, textColor: [51, 65, 85] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 15, right: 15 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Section 3: RF Path Diagnostic Telemetry
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('3. RF SIGNAL AND SYSTEM TELEMETRY MARGINS', 15, currentY);

  const telemetryRows = [
    ['TELEMETRY SENSOR', 'LIVE DATA METRIC', 'DIAGNOSTIC TOLERANCE INDEX'],
    ['SIGNAL-TO-NOISE RATIO (SNR)', `${telemetry.snr || '0.0'} dB`, parseFloat(telemetry.snr) >= 12 ? 'OPTIMAL GAIN MARGIN' : 'ELEVATED LINK ATTENUATION'],
    ['RECEIVE SIGNAL INDICATOR (RX)', `${telemetry.rxPower || '-0.0'} dBm`, parseFloat(telemetry.rxPower) >= -80 ? 'NOMINAL SIGNAL LOCK' : 'CRITICAL THRESHOLD LEVEL'],
    ['BLOCK UPCONVERTER THERMAL', `${telemetry.bucTemp || '0.0'} °C`, parseFloat(telemetry.bucTemp) > 60 ? 'CRITICAL THERMAL GRADIENT' : 'STABLE HEAT DISSIPATION'],
    ['PACKET LOSS RATE', `${telemetry.packetLoss || '0.0'}%`, parseFloat(telemetry.packetLoss) <= 0.1 ? 'ZERO INTERMITTENT DROPS' : 'LINK EXPERIENCE LOSS INCIDENTS'],
    ['LINK INTEGRATION LAYER', (telemetry.status || 'active').toUpperCase(), (telemetry.status === 'secure' || telemetry.status === 'nominal') ? 'NOMINAL PACKET STREAMING' : 'LINK SUSCEPTIBLE TO PARITY JITTER']
  ];

  (doc as any).autoTable({
    startY: currentY + 3,
    head: [telemetryRows[0]],
    body: telemetryRows.slice(1),
    theme: 'grid',
    headStyles: { fillColor: [71, 85, 105], textColor: [255, 255, 255], font: 'helvetica', fontSize: 8.5 },
    bodyStyles: { font: 'courier', fontSize: 8, textColor: [51, 65, 85] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 15, right: 15 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 9;

  // Section 4: Event Logs / Chronology
  if (currentY > 195) {
    doc.addPage();
    currentY = 20;
  }

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('4. CHRONOLOGICAL TACTICAL SITUATION INTEL FEED', 15, currentY);

  const logRows = eventLogs.map((log, index) => [
    String(index + 1).padStart(2, '0'),
    log.timestamp,
    log.satName.toUpperCase(),
    log.status.toUpperCase(),
    log.detail
  ]);

  (doc as any).autoTable({
    startY: currentY + 3,
    head: [['ID', 'TIMESTAMP', 'TARGET ASSET', 'LEVEL', 'TACTICAL LOG EVENT DETAILS']],
    body: logRows.length > 0 ? logRows : [['--', '--', '--', 'NO LOGS', 'No situational satellite events captured during this monitoring period.']],
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], font: 'helvetica', fontSize: 8.5 },
    bodyStyles: { font: 'courier', fontSize: 7.5, textColor: [15, 23, 42] },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 25 },
      2: { cellWidth: 35 },
      3: { cellWidth: 20 },
      4: { cellWidth: 'auto' }
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 15, right: 15 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 12;

  // Sign-off / Verification section
  if (currentY > 230) {
    doc.addPage();
    currentY = 25;
  }

  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.line(15, currentY, 195, currentY);

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('TACTICAL VAL-CHECKS & SIGN-OFF PROCEDURES', 15, currentY + 6);

  // Signature Block left
  doc.setDrawColor(203, 213, 225);
  doc.line(15, currentY + 22, 90, currentY + 22);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('TACTICAL SECURITY OFFICER', 15, currentY + 26);
  doc.setFont('courier', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('baalbek.313@gmail.com // COMPLIANCE AUTH', 15, currentY + 30);

  // Signature Block right
  doc.setDrawColor(203, 213, 225);
  doc.line(120, currentY + 22, 195, currentY + 22);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('SATCOM COMMAND CONTROLLER', 120, currentY + 26);
  doc.setFont('courier', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('STIA_ORCHESTRATOR_DECRYPT_OK', 120, currentY + 30);

  // Page Framing & Page Counter Decoration on all pages
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Thin outer aesthetic border
    doc.setDrawColor(241, 245, 249); // slate-100
    doc.setLineWidth(0.5);
    doc.rect(10, 10, 190, 277);

    // Footer lines
    doc.setTextColor(148, 163, 184);
    doc.setFont('courier', 'bold');
    doc.setFontSize(7);
    doc.text(`AAR REF: ${docFingerprint}-${i}`, 15, 290);
    doc.setFont('helvetica', 'bold');
    doc.text(`CONFIDENTIAL // STIA TACTICAL INTEL REPORT`, 70, 290);
    doc.setFont('courier', 'bold');
    doc.text(`PAGE ${i} OF ${pageCount}`, 175, 290);
  }

  doc.save(`TSI_AAR_${sat.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
};

