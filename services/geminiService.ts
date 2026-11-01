// Client-Side Gemini Service Proxy (Communicates exclusively via Server-Side API)

export const getTroubleshootingAdvice = async (
  issue: string, 
  context?: any, 
  telemetry?: any, 
  options: { thinking?: boolean, useSearch?: boolean, useMaps?: boolean, mediaData?: { data: string, mimeType: string }[] } = {}
) => {
  try {
    const res = await fetch('/api/gemini/troubleshoot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issue, context, telemetry, options })
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: 'GENERAL_API_ERROR', text: data.text || 'SYSTEM_HALT: INTEL_UPLINK_FAILURE.' };
    }
    return data;
  } catch (error: any) {
    console.error("STIA_CRITICAL_ERROR", error);
    return { 
      error: "GENERAL_API_ERROR", 
      text: `SYSTEM_HALT: INTEL_UPLINK_FAILURE. REASON: ${error.message || 'UNKNOWN_ERROR'}` 
    };
  }
};

export const generateTacticalImage = async (prompt: string, aspectRatio: string = "16:9", size: string = "1K") => {
  try {
    const res = await fetch('/api/gemini/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, aspectRatio, size })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.imageUrl || null;
  } catch (err) {
    console.error("IMAGE_GEN_ERROR", err);
    return null;
  }
};

export const editTacticalImage = async (base64Image: string, prompt: string) => {
  try {
    const res = await fetch('/api/gemini/edit-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Image, prompt })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.imageUrl || null;
  } catch (err) {
    console.error("IMAGE_EDIT_ERROR", err);
    return null;
  }
};

export const generateTacticalVideo = async (prompt: string, orientation: '16:9' | '9:16' = '16:9', startImage?: string) => {
  try {
    const res = await fetch('/api/gemini/generate-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, orientation, startImage })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.videoUrl || null;
  } catch (err) {
    console.error("VIDEO_GEN_ERROR", err);
    return null;
  }
};

export const transcribeAudio = async (base64Audio: string) => {
  try {
    const res = await fetch('/api/gemini/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Audio })
    });
    if (!res.ok) return "[COMM_INTERFERENCE]";
    const data = await res.json();
    return data.text || "[COMM_INTERFERENCE]";
  } catch (err) {
    console.error("TRANSCRIPTION_ERROR", err);
    return "[COMM_INTERFERENCE]";
  }
};

export const getWarGamesTurn = async (history: any[], objective: string) => {
  try {
    const res = await fetch('/api/gemini/wargames-turn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, objective })
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) { return null; }
};

export const generateWarGamesReport = async (history: any[], objective: string) => {
  try {
    const res = await fetch('/api/gemini/wargames-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, objective })
    });
    if (!res.ok) return "ERROR: REPORT_COMPILATION_FAILED.";
    const data = await res.json();
    return data.text || "ERROR: REPORT_COMPILATION_FAILED.";
  } catch (error) { return "ERROR: REPORT_COMPILATION_FAILED."; }
};

export const generateSatelliteSitrep = async (satellite: any, defcon: number) => {
  try {
    const res = await fetch('/api/gemini/sitrep', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ satellite, defcon })
    });
    if (!res.ok) return "INTEL_LINK_DEGRADED. MANUALLY_AUDIT_TELEMETRY.";
    const data = await res.json();
    return data.text || "INTEL_LINK_DEGRADED. MANUALLY_AUDIT_TELEMETRY.";
  } catch (error) {
    return "INTEL_LINK_DEGRADED. MANUALLY_AUDIT_TELEMETRY.";
  }
};

export const generateWeatherImpactAssessment = async (weather: string, loc: any, satName: string) => {
  try {
    const res = await fetch('/api/gemini/weather-impact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weather, loc, satName })
    });
    if (!res.ok) return "MET_DATA_UNAVAILABLE. PROCEED_WITH_MANUAL_FADE_CALCULATION.";
    const data = await res.json();
    return data.text || "MET_DATA_UNAVAILABLE. PROCEED_WITH_MANUAL_FADE_CALCULATION.";
  } catch (error) {
    return "MET_DATA_UNAVAILABLE. PROCEED_WITH_MANUAL_FADE_CALCULATION.";
  }
};

export const analyzeInterceptedSignal = async (params: any) => {
  try {
    const res = await fetch('/api/gemini/analyze-signal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ params })
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) { return null; }
};

export const generateDecryptedMessage = async (analysis: any) => {
  try {
    const res = await fetch('/api/gemini/decrypted-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysis })
    });
    if (!res.ok) return " // ...PACKET_LOSS_CRITICAL... //";
    const data = await res.json();
    return data.text || " // ...PACKET_LOSS_CRITICAL... //";
  } catch (error) { return " // ...PACKET_LOSS_CRITICAL... //"; }
};

export const analyzeIPRecon = async (ip: string) => {
  try {
    const res = await fetch('/api/gemini/ip-recon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip })
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) { return null; }
};

export const analyzePortScan = async (target: string, ports: any[]) => {
  try {
    const res = await fetch('/api/gemini/port-scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, ports })
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) { return null; }
};

export const analyzeSpoofingURL = async (url: string, content?: string) => {
  try {
    const res = await fetch('/api/gemini/spoofing-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, content })
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) { return null; }
};
