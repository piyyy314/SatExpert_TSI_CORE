# SatExpert Tactical SatCom Intelligence (TSI)

<div align="center">

[![Google Cloud](https://img.shields.io/badge/Google_Cloud-Ready-4285F4?logo=googlecloud&logoColor=white)](https://cloud.google.com/)
[![Google Cloud Run](https://img.shields.io/badge/Cloud_Run-Production-4285F4?logo=googlecloud&logoColor=white)](https://cloud.google.com/run)
[![Cloud Build](https://img.shields.io/badge/Cloud_Build-Passing-34A853?logo=googlecloud&logoColor=white)](https://cloud.google.com/build)
[![Artifact Registry](https://img.shields.io/badge/Artifact_Registry-OCI_v1-4285F4?logo=googlecloud&logoColor=white)](https://cloud.google.com/artifact-registry)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![CI / CD](https://img.shields.io/badge/CI%2FCD-Passing-success?logo=githubactions&logoColor=white)](https://github.com/)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.3-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-FFC131?logo=tauri&logoColor=black)](https://tauri.app/)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Security Policy](https://img.shields.io/badge/Security-Policy_Enforced-red.svg)](SECURITY.md)
[![NIST PQC](https://img.shields.io/badge/NIST_PQC-ML--KEM_%2F_ML--DSA-9333ea)](https://csrc.nist.gov/projects/post-quantum-cryptography)
[![DEFCON](https://img.shields.io/badge/DEFCON_Readiness-LEVEL_1_VERIFIED-ff0055)](SECURITY.md)
[![Zero Trust](https://img.shields.io/badge/Zero_Trust-Architecture-10b981)](SECURITY.md)
[![WAF Baseline](https://img.shields.io/badge/WAF-Apache_HTTPD_2.4.58+-orange)](SECURITY.md)
[![Tactical Alerts](https://img.shields.io/badge/Tactical_Alerts-Acoustic_Cues-cyan)](services/audioService.ts)

**Professional military-grade tactical ground station, SIGINT analyzer, and SATCOM intelligence suite.**

[Documentation](README.md) • [Security Policy](SECURITY.md) • [Changelog](CHANGELOG.md) • [Contributing](CONTRIBUTING.md) • [Google Cloud Deployment](#-google-cloud-deployment)

</div>

---

## 🛰️ Overview

**SatExpert Tactical SatCom Intelligence (TSI)** is a mission-critical platform engineered for satellite communication engineers, field operators, and electronic warfare specialists. It combines high-precision orbital dynamics, RF link budget calculations, real-time RF signal processing, post-quantum cryptographic defenses, and threat intelligence.

---

## ⚡ Key Capabilities

### 1. Tactical SATCOM Operations
* **Real-Time Look-Angle Engine**: Computes exact Azimuth, Elevation, Polarisation/Tilt angles, and slant range distance to geostationary satellites.
* **Constellation Tracking**: Integrated catalog covering global orbital slots (Astra, Eutelsat, Inmarsat, Intelsat, Viasat, Starlink, and custom military feeds).
* **Link Budget Calculator**: Accurate Eb/N0, C/N0, free-space path loss (FSPL), rain fade attenuation, and EIRP modeling.
* **GPS Terminal Tracking**: Continuous terminal lock via Geolocation API with automatic dynamic look-angle recalibration.

### 2. Signal Intelligence (SIGINT) & Electronic Warfare
* **RF Spectrum Analyzer**: Real-time FFT waterfall visualizer with carrier peak detection.
* **Signal Interceptor & Demodulation**: Carrier tracking, constellation diagrams, and spectral power distribution.
* **Traffic Sniffer & Protocol Decoder**: Deep-packet inspection for DVB-S2, BBFRAME, GSE, and MPE encapsulations.
* **Electronic Warfare & Countermeasures**: Signal jamming emulator, decoy carrier injection, and zero-point telemetry protection.

### 3. Tactical Alert Service & Acoustic Warning Engine
* **Critical Telemetry Cue**: Web Audio dual-tone alternating military klaxon (940Hz / 700Hz with sub-bass transient punch) triggered automatically when telemetry SNR/health drops into `CRITICAL`.
* **Electronic Jamming RF Sweep**: Frequency-modulated oscillator sweep (280Hz -> 2600Hz -> 650Hz with 32Hz LFO vibrato) accompanied by bandpass RF static noise burst upon ECM engagement.
* **De-escalation & Recovery Tones**: Smooth descending frequency slide when electronic jamming ceases, and double chirp upon carrier lock telemetry recovery.
* **Voice Alert Integration**: Automatic speech synthesized tactical status announcements with intelligent cooldown gating.

### 4. Post-Quantum Cryptography (PQC) & Security
* **NIST-Standardized PQC**: Implementation of ML-KEM (Kyber) key encapsulation and ML-DSA (Dilithium) digital signatures.
* **Quantum Attack Simulation**: Grover algorithm simulator illustrating search space degradation against symmetric ciphers.
* **YARA Firmware Scanner**: Heuristic malware scanning against VSAT terminal firmware and modems.
* **Threat Dossier & Hardening Engine**: Real-time status, CVE remediation tracking, and one-click strategic hardening workflows.

### 5. System Diagnostics & Hardware Verification
* **Hardware & SDR Bus Monitor**: Live status, latency, and loopback verification across bladeRF 2.0 micro, HackRF One, and STM32 BUC controllers.
* **Cryptographic Co-Processor Diagnostics**: In-memory test vectors and lattice validation for NIST ML-DSA-65 (Dilithium) crypto engines.
* **Interactive Loopback Self-Test**: 1-click comprehensive system self-test verifying all 8 critical communication channels, FIFO buffers, and phase-lock clocks.
* **Acoustic Diagnostic Panel**: Direct in-dashboard verification of tactical alert warbles and jamming sweeps.

### 6. Edge Proxy & WAF Hardening
* **Apache HTTPD Baseline**: Enforces Apache HTTPD `2.4.58+` to eradicate CVE-2021-41773 & CVE-2021-42013 directory traversal vulnerabilities. Disables extraneous modules (`mod_proxy_uwsgi`).
* **Squid Proxy Auditing**: Enforces Squid `5.x` or latest `4.15+` security release, resolving CVE-2020-15049 (Request Smuggling) and CVE-2020-25097 (Header Smuggling) with strict ACL verification.
* **Web Application Firewall (WAF)**: Active header injection protection, request normalization, and proxy boundary defense.

---

## ☁️ Google Cloud Deployment

SatExpert TSI is containerized and optimized for high-performance serverless deployment on **Google Cloud Run**.

### Option A: Direct Deploy via Google Cloud CLI (Recommended)

1. **Set your active project**:
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **Deploy directly to Cloud Run from source**:
   ```bash
   gcloud run deploy satexpert-tsi \
     --source . \
     --region us-central1 \
     --platform managed \
     --allow-unauthenticated \
     --port 8080
   ```

### Option B: Build & Deploy via Google Cloud Build

Use the bundled `cloudbuild.yaml` pipeline:

```bash
# Submit build to Google Cloud Build
gcloud builds submit --config cloudbuild.yaml
```

### Option C: Container Build with Docker

```bash
# Build production Docker container
docker build -t gcr.io/YOUR_PROJECT_ID/satexpert-tsi:latest .

# Run locally to test
docker run -p 8080:8080 gcr.io/YOUR_PROJECT_ID/satexpert-tsi:latest
```

---

## 🚀 Local Quick Start

### Prerequisites
* **Node.js**: v18.0.0 or higher (v20+ recommended)
* **npm** or **bun** / **yarn** / **pnpm**
* *(Optional for native desktop)*: Rust toolchain for Tauri v2

### 1. Clone & Install
```bash
git clone https://github.com/your-username/satexpert-tactical-satcom-intelligence.git
cd satexpert-tactical-satcom-intelligence
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate `.env` with your API credentials (e.g. `GEMINI_API_KEY` for AI technician functionality).

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` (or the port specified in terminal).

### 4. Build for Production (Web)
```bash
npm run build
npm run preview
```

### 5. Build Desktop Application (Tauri v2)
```bash
npm run tauri dev      # Desktop dev mode
npm run tauri build    # Compile native binary (Linux, macOS, Windows)
```

---

## 🛡️ Security & Hardening Protocols

All gateway nodes and reverse proxies must adhere to the standards outlined in [SECURITY.md](SECURITY.md):

| Component | Target Version | Primary Remediation |
|---|---|---|
| **Apache HTTPD** | `>= 2.4.58` | Mitigate CVE-2021-41773, CVE-2021-42013 |
| **Squid Proxy** | `>= 5.0` or `>= 4.15+` | Mitigate CVE-2020-15049, CVE-2020-25097 |
| **Apache Modules**| `mod_proxy_uwsgi` disabled | Eliminate attack surface on unneeded handlers |
| **WAF Defense** | Header Smuggling Matrix | Block multi-value `Transfer-Encoding`, CRLF injection |

---

## 📦 Project Structure

```
├── .github/
│   ├── ISSUE_TEMPLATE/     # Standardized bug, feature, and security reports
│   ├── workflows/          # GitHub Actions CI & automated releases
│   └── PULL_REQUEST_TEMPLATE.md
├── components/             # React tactical interface modules & sub-systems
├── services/               # Cryptography (PQC), PDF generation, audio, alerts, satellite feeds
├── utils/                  # Coordinate look angles, RF math, security checks
├── src/                    # App root, styles, layout, global state
├── src-tauri/              # Native cross-platform desktop bindings
├── public/                 # Static assets, PWA manifest, service worker
├── Dockerfile              # Multi-stage production container for Google Cloud Run
├── cloudbuild.yaml         # Automated Google Cloud Build deployment pipeline
├── CHANGELOG.md            # Version release records
├── SECURITY.md             # Responsible disclosure & proxy hardening standards
└── package.json            # Dependencies and build scripts
```

---

## 🧪 Verification & Quality Checks

Run full linting and TypeScript checks:
```bash
npm run lint
```

Run production bundle build verification:
```bash
npm run build
```

---

## 📄 License & Conduct

* Released under the [MIT License](LICENSE).
* Community standards follow the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).
* For security disclosures, please follow our [Security Policy](SECURITY.md).
