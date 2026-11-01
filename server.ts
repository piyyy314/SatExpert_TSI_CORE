import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Type, FunctionDeclaration, Content, Modality, ThinkingLevel, LiveServerMessage } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini Client server-side with required User-Agent
const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyPlaceholderKeyForContainerHealthCheck';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

// Hardware Sensor Tool Definition
const terminalSensorTool: FunctionDeclaration = {
  name: "read_terminal_sensors",
  description: "Reads live sensor telemetry from the local VSAT terminal hardware. Returns SNR, power levels, temperature, and packet stats.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      status: { type: Type.STRING, description: "Current hardware status" }
    },
  },
};

const app = express();
app.use(express.json({ limit: '50mb' }));

// REST API ROUTES
app.post('/api/gemini/troubleshoot', async (req, res) => {
  try {
    const { issue, context, telemetry, options = {} } = req.body;
    const modelId = options.thinking ? 'gemini-4-argon' : 'gemini-3.8-flash';
    
    const systemInstruction = `
      You are the 'SatExpert Tactical Intelligence Agent' (STIA).
      MISSION: Provide high-level technical SatCom intelligence and cyber defense maneuvers.
      
      ENVIRONMENT:
      - LAT: ${context?.lat ?? 'N/A'}, LNG: ${context?.lng ?? 'N/A'}
      - TARGET_ASSET: ${context?.satName ?? 'N/A'}
      - DEFCON: ${context?.defcon ?? 5}
      - EW_JAMMING: ${context?.isJamming ? 'YES' : 'NO'}
      - STEALTH_PROTOCOL: ${context?.isStealthMode ? 'ACTIVE' : 'INACTIVE'}
      
      INSTRUCTIONS:
      - If thinking mode is active, provide deep technical reasoning for VSAT infrastructure.
      - If search/maps are enabled, ground your response in the latest satellite launches and security CVEs.
      - NEVER pass raw coordinates (latitude, longitude) as a text 'query' to search or maps tools. Use descriptive location names instead.
      - Rely on the automatically provided ENVIRONMENT context (LAT/LNG) for location-aware grounding.
      - ALWAYS return helpful metadata if grounding chunks are present.
      
      TONE: Clinical, authoritative, military-grade. Use tactical jargon (e.g., 'EIRP saturation', 'FEC degradation').
    `;

    const tools: any[] = [];
    if (options.useSearch) tools.push({ googleSearch: {} });
    tools.push({ functionDeclarations: [terminalSensorTool] });

    const parts: any[] = [{ text: "STIA_COMMAND: " + issue }];
    if (options.mediaData && Array.isArray(options.mediaData)) {
      options.mediaData.forEach((m: { data: string; mimeType: string }) => {
        parts.push({ inlineData: m });
      });
    }

    const contents: Content[] = [{ role: 'user', parts }];
    const config: any = {
      systemInstruction,
      tools: tools.length > 0 ? tools : undefined,
    };

    if (options.thinking) {
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
    }

    if (options.useSearch) {
      config.toolConfig = {
        includeServerSideToolInvocations: true
      };
    }

    let response;
    try {
      response = await ai.models.generateContent({
        model: modelId,
        contents,
        config,
      });
    } catch (toolError: any) {
      if (toolError.message?.includes("PERMISSION_DENIED") && options.useSearch) {
        console.warn("[STIA] Retrying generation without search tool.");
        const fallbackConfig = { ...config, tools: undefined, toolConfig: undefined };
        response = await ai.models.generateContent({
          model: modelId,
          contents,
          config: fallbackConfig,
        });
      } else {
        throw toolError;
      }
    }

    const functionCalls = response.functionCalls;
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      if (call.name === 'read_terminal_sensors') {
        contents.push(response.candidates![0].content);
        contents.push({
          role: 'tool',
          parts: [{
            functionResponse: {
              name: 'read_terminal_sensors',
              response: { result: telemetry }
            }
          }]
        });
        
        response = await ai.models.generateContent({
          model: modelId,
          contents,
          config
        });
      }
    }

    const output = response.text || "";
    return res.json({
      text: output,
      grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    });
  } catch (error: any) {
    console.error("STIA_TROUBLESHOOT_ERROR", error);
    return res.status(500).json({ 
      error: "GENERAL_API_ERROR", 
      text: `SYSTEM_HALT: INTEL_UPLINK_FAILURE. REASON: ${error.message || 'UNKNOWN_ERROR'}` 
    });
  }
});

app.post('/api/gemini/generate-image', async (req, res) => {
  try {
    const { prompt, aspectRatio = "16:9", size = "1K" } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: { parts: [{ text: `High-fidelity tactical satellite visualization: ${prompt}. Professional technical military style.` }] },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: size as any
        }
      }
    });

    for (const part of response.candidates![0].content.parts) {
      if (part.inlineData) {
        return res.json({ imageUrl: `data:image/png;base64,${part.inlineData.data}` });
      }
    }
    return res.json({ imageUrl: null });
  } catch (err: any) {
    console.error("IMAGE_GEN_ERROR", err);
    return res.status(500).json({ error: err.message || "IMAGE_GEN_FAILED" });
  }
});

app.post('/api/gemini/edit-image', async (req, res) => {
  try {
    const { base64Image, prompt } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } },
          { text: `Apply tactical overlay: ${prompt}. Maintain technical accuracy.` }
        ]
      }
    });

    for (const part of response.candidates![0].content.parts) {
      if (part.inlineData) {
        return res.json({ imageUrl: `data:image/png;base64,${part.inlineData.data}` });
      }
    }
    return res.json({ imageUrl: null });
  } catch (err: any) {
    console.error("IMAGE_EDIT_ERROR", err);
    return res.status(500).json({ error: err.message || "IMAGE_EDIT_FAILED" });
  }
});

app.post('/api/gemini/generate-video', async (req, res) => {
  try {
    const { prompt } = req.body;
    // Serve video simulation sequence powered by Gemini omni/flash
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Describe a 5-second cinematic satellite maneuver sequence: ${prompt}`,
    });
    return res.json({ status: 'queued', description: response.text });
  } catch (err: any) {
    console.error("VIDEO_GEN_ERROR", err);
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/gemini/transcribe', async (req, res) => {
  try {
    const { base64Audio } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          { inlineData: { data: base64Audio, mimeType: 'audio/pcm;rate=16000' } },
          { text: "Transcribe the tactical comms precisely." }
        ]
      }
    });
    return res.json({ text: response.text || "" });
  } catch (err: any) {
    console.error("TRANSCRIPTION_ERROR", err);
    return res.json({ text: "[COMM_INTERFERENCE]" });
  }
});

app.post('/api/gemini/wargames-turn', async (req, res) => {
  try {
    const { history, objective } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: `SIM_HISTORY: ${JSON.stringify(history)}. OBJECTIVE: ${objective}` }] }],
      config: {
        systemInstruction: "You are a 'War Games Cyber-Orchestrator'. Simulate turns in a conflict for a SatCom link. RED: Targeted Strike Team. BLUE: Network Hardening Team. Respond strictly in JSON schema.",
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            redTeamAction: { type: Type.OBJECT, properties: { action: { type: Type.STRING }, rationale: { type: Type.STRING } }, required: ['action', 'rationale'] },
            blueTeamAction: { type: Type.OBJECT, properties: { action: { type: Type.STRING }, rationale: { type: Type.STRING } }, required: ['action', 'rationale'] },
            systemStateChange: { type: Type.OBJECT, properties: { narrative: { type: Type.STRING }, link_integrity_delta: { type: Type.NUMBER }, threat_level: { type: Type.STRING } }, required: ['narrative', 'link_integrity_delta', 'threat_level'] },
            isObjectiveMet: { type: Type.BOOLEAN }
          },
          required: ['redTeamAction', 'blueTeamAction', 'systemStateChange', 'isObjectiveMet']
        },
      },
    });
    return res.json(JSON.parse((response.text || '{}').trim()));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/gemini/wargames-report', async (req, res) => {
  try {
    const { history } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-4-argon',
      contents: [{ role: 'user', parts: [{ text: `Final Combat Log: ${JSON.stringify(history)}` }] }],
      config: {
        systemInstruction: "Generate a professional Post-Action Report (AAR) for this SatCom cyber engagement simulation.",
      },
    });
    return res.json({ text: response.text });
  } catch (error: any) {
    return res.json({ text: "ERROR: REPORT_COMPILATION_FAILED." });
  }
});

app.post('/api/gemini/sitrep', async (req, res) => {
  try {
    const { satellite, defcon } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ 
        role: 'user', 
        parts: [{ text: `Generate a 3-sentence tactical SITREP for satellite ${satellite.name} (${satellite.operator}). Telemetry: Apogee=${satellite.apogee}km, Velocity=${satellite.velocity}km/s, Status=${satellite.status}. DEFCON=${defcon}.` }] 
      }],
      config: {
        systemInstruction: "You are a Senior Intelligence Officer. Provide a concise, clinical, military-grade mission report. Focus on operational readiness and orbital stability.",
      },
    });
    return res.json({ text: response.text });
  } catch (error: any) {
    return res.json({ text: "INTEL_LINK_DEGRADED. MANUALLY_AUDIT_TELEMETRY." });
  }
});

app.post('/api/gemini/weather-impact', async (req, res) => {
  try {
    const { weather, loc, satName } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ 
        role: 'user', 
        parts: [{ text: `Analyze impact of ${weather} weather at LAT:${loc.lat}, LNG:${loc.lng} for communication with ${satName}. Provide specific Ka/Ku band rain fade estimates and mission readiness status.` }] 
      }],
      config: {
        systemInstruction: "You are a SatCom Meteorology Specialist. Provide a tactical atmospheric impact report. Use dB loss figures and specific signal degradation terminology.",
      },
    });
    return res.json({ text: response.text });
  } catch (error: any) {
    return res.json({ text: "MET_DATA_UNAVAILABLE. PROCEED_WITH_MANUAL_FADE_CALCULATION." });
  }
});

app.post('/api/gemini/analyze-signal', async (req, res) => {
  try {
    const { params } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: "Analyze Intercept: " + JSON.stringify(params) }] }],
      config: {
        systemInstruction: "You are a SIGINT analyst. Provide a tactical assessment of the radio signal provided.",
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            probableOrigin: { type: Type.STRING },
            suspectedPurpose: { type: Type.STRING },
            threatLevel: { type: Type.STRING },
            encryptionType: { type: Type.STRING },
            suggestedKeyFragment: { type: Type.STRING },
          },
          required: ['probableOrigin', 'suspectedPurpose', 'threatLevel', 'encryptionType', 'suggestedKeyFragment']
        },
      },
    });
    return res.json(JSON.parse((response.text || '{}').trim()));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/gemini/decrypted-message', async (req, res) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: "Decrypt payload based on analysis." }] }],
      config: { systemInstruction: "Generate a tactical decrypted text message based on the SIGINT analysis. Military tone." },
    });
    return res.json({ text: response.text });
  } catch (error: any) {
    return res.json({ text: " // ...PACKET_LOSS_CRITICAL... //" });
  }
});

app.post('/api/gemini/ip-recon', async (req, res) => {
  try {
    const { ip } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: `Perform STIA_IP_INTEL lookup for IP: ${ip}` }] }],
      config: {
        systemInstruction: "You are a Cyber-Intelligence Strategist. Analyze the provided IP address and provide clinical tactical intelligence. Include suspected geolocation (City, Country, Lat, Lng), ISP, and threat profile.",
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            city: { type: Type.STRING },
            country: { type: Type.STRING },
            lat: { type: Type.NUMBER },
            lng: { type: Type.NUMBER },
            isp: { type: Type.STRING },
            threatProfile: { type: Type.STRING },
            riskScore: { type: Type.NUMBER },
            recommendedAction: { type: Type.STRING },
          },
          required: ['city', 'country', 'lat', 'lng', 'isp', 'threatProfile', 'riskScore', 'recommendedAction']
        },
      },
    });
    return res.json(JSON.parse((response.text || '{}').trim()));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/gemini/port-scan', async (req, res) => {
  try {
    const { target, ports } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: `Analyze STIA_PORT_SCAN for TARGET: ${target}. PORTS: ${JSON.stringify(ports)}` }] }],
      config: {
        systemInstruction: "You are a Senior Penetration Tester. Analyze the provided port scan results.",
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            riskLevel: { type: Type.STRING },
            vulnerabilities: { type: Type.ARRAY, items: { type: Type.STRING } },
            suspectedOS: { type: Type.STRING },
            tacticalAdvice: { type: Type.STRING },
          },
          required: ['summary', 'riskLevel', 'vulnerabilities', 'suspectedOS', 'tacticalAdvice']
        },
      },
    });
    return res.json(JSON.parse((response.text || '{}').trim()));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/gemini/spoofing-url', async (req, res) => {
  try {
    const { url, content } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: `Analyze suspicious URL for spoofing/phishing indicators. URL: ${url}. CONTENT_SNIPPET: ${content || 'No content provided'}` }] }],
      config: {
        systemInstruction: "You are a Digital Forensics Analyst. Analyze the provided URL and content for spoofing, phishing, and domain hijacking indicators.",
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            impersonatedBrand: { type: Type.STRING },
            threatScore: { type: Type.NUMBER },
            redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
            forensicSummary: { type: Type.STRING },
            originEstimation: { type: Type.STRING },
            mitigationSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['impersonatedBrand', 'threatScore', 'redFlags', 'forensicSummary', 'originEstimation', 'mitigationSteps']
        },
      },
    });
    return res.json(JSON.parse((response.text || '{}').trim()));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// CREATE HTTP SERVER
const server = http.createServer(app);

// WEBSOCKET SERVER FOR GEMINI LIVE API
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  const { pathname } = new URL(request.url || '', `http://${request.headers.host}`);
  if (pathname === '/live') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

wss.on('connection', async (clientWs) => {
  console.log('[LiveAPI] Client connected via WebSocket');
  try {
    const session = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
        systemInstruction: 'You are the STIA AI agent. Respond via voice with technical precision.',
        outputAudioTranscription: {},
        inputAudioTranscription: {}
      },
      callbacks: {
        onmessage: (msg: LiveServerMessage) => {
          const parts = msg.serverContent?.modelTurn?.parts ?? [];
          for (const part of parts) {
            if (part.inlineData?.data && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ audio: part.inlineData.data }));
            }
          }
          if (msg.serverContent?.outputTranscription?.text && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ outputTranscription: msg.serverContent.outputTranscription.text }));
          }
          if (msg.serverContent?.inputTranscription?.text && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ inputTranscription: msg.serverContent.inputTranscription.text }));
          }
          if (msg.serverContent?.interrupted && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ interrupted: true }));
          }
        },
        onclose: () => {
          console.log('[LiveAPI] Session closed by Gemini');
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ closed: true }));
          }
        },
        onerror: (err: any) => {
          console.error('[LiveAPI] Session error:', err);
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ error: err.message || 'Live session error' }));
          }
        }
      }
    });

    clientWs.on('message', (data: any) => {
      try {
        const payload = JSON.parse(data.toString());
        if (payload.audio) {
          session.sendRealtimeInput({
            audio: { data: payload.audio, mimeType: 'audio/pcm;rate=16000' }
          });
        }
      } catch (err) {
        console.error('[LiveAPI] Client parse error:', err);
      }
    });

    clientWs.on('close', () => {
      console.log('[LiveAPI] Client WebSocket closed');
      try {
        session.close();
      } catch (e) {
        // session cleanup
      }
    });
  } catch (err: any) {
    console.error('[LiveAPI] Failed to connect to Gemini Live API:', err);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({ error: `Connection failed: ${err.message}` }));
      clientWs.close();
    }
  }
});

// VITE SERVING (DEV VS PROD)
async function startServer() {
  const PORT = process.env.PORT || 3000;

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('{*splat}', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[SatExpert TSI Server] Operational on http://0.0.0.0:${PORT}`);
  });
}

startServer();
