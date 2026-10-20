# SatExpert Tactical SatCom Intelligence (TSI)

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Security Policy](https://img.shields.io/badge/Security-Policy-red.svg)](SECURITY.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-cyan?logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.3-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-FFC131?logo=tauri)](https://tauri.app/)
[![PQC NIST](https://img.shields.io/badge/Cryptography-ML--KEM%20%2F%20ML--DSA-purple)](https://csrc.nist.gov/projects/post-quantum-cryptography)

**Professional military-grade tactical ground station, SIGINT analyzer, and SATCOM intelligence suite.**

[Live Applet](https://ai.studio/apps/5d88a24e-31f4-4a95-ba36-222ed3f17b4c) • [Security Policy](SECURITY.md) • [Changelog](CHANGELOG.md) • [Contributing](CONTRIBUTING.md)

</div>

---

## 🛰️ Overview

**SatExpert Tactical SatCom Intelligence (TSI)** is a mission-critical platform engineered for satellite communication engineers, field operators, and electronic warfare specialists. It combines high-precision orbital orbital dynamics, RF link budget calculations, real-time RF signal processing, post-quantum cryptographic defenses, and threat intelligence.

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

### 3. Post-Quantum Cryptography (PQC) & Security
* **NIST-Standardized PQC**: Implementation of ML-KEM (Kyber) key encapsulation and ML-DSA (Dilithium) digital signatures.
* **Quantum Attack Simulation**: Grover algorithm simulator illustrating search space degradation against symmetric ciphers.
* **YARA Firmware Scanner**: Heuristic malware scanning against VSAT terminal firmware and modems.
* **Threat Dossier & Hardening Engine**: Real-time status, CVE remediation tracking, and one-click strategic hardening workflows.

### 4. Edge Proxy & WAF Hardening
* **Apache HTTPD Baseline**: Enforces Apache HTTPD `2.4.58+` to eradicate CVE-2021-41773 & CVE-2021-42013 directory traversal vulnerabilities. Disables extraneous modules (`mod_proxy_uwsgi`).
* **Squid Proxy Auditing**: Enforces Squid `5.x` or latest `4.15+` security release, resolving CVE-2020-15049 (Request Smuggling) and CVE-2020-25097 (Header Smuggling) with strict ACL verification.
* **Web Application Firewall (WAF)**: Active header injection protection, request normalization, and proxy boundary defense.

---

## 🚀 Quick Start

### Prerequisites
* **Node.js**: v18.0.0 or higher
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
├── services/               # Cryptography (PQC), PDF generation, audio, satellite feeds
├── utils/                  # Coordinate look angles, RF math, security checks
├── src/                    # App root, styles, layout, global state
├── src-tauri/              # Native cross-platform desktop bindings
├── public/                 # Static assets, PWA manifest, service worker
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
