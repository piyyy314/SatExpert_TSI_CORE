# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-18

### Added
- **Tactical SATCOM Operations Center**:
  - Real-time Look-Angle calculator (Azimuth, Elevation, Polarisation/Tilt, Range to Geostationary Satellites).
  - Geostationary satellite orbit constellation catalog (Astra, Eutelsat, Inmarsat, Intelsat, Viasat, Starlink, etc.).
  - Link Budget analysis with atmospheric attenuation, C/N0, Eb/N0, and EIRP modeling.
  - Interactive 3D orbital visualization and real-time antenna tracking.
- **Automated GPS Terminal Tracking**:
  - Browser Geolocation API integration with continuous orbital look-angle re-calculation.
  - Hardware GPS lock status indicators and fallback drift simulator for testing.
- **SIGINT & Spectrum Warfare Suite**:
  - Live RF Spectrum Analyzer with real-time waterfall visualization.
  - Signal Interceptor with carrier frequency demodulation and constellation diagrams.
  - Packet Sniffer with hex inspection and DVB-S2 / BBFRAME protocol decoders.
  - YARA Malware Scanner with heuristics for VSAT firmware exploits.
- **Post-Quantum Cryptography (PQC)**:
  - NIST-standardized ML-DSA (Dilithium) and ML-KEM (Kyber) quantum-safe cryptographic routines.
  - Quantum entropy generation and Grover algorithm quantum attack visualizer.
- **Strategic Threat Dossier & Hardening**:
  - Comprehensive threat catalog (TR-1029, TR-1030, TR-1031, TR-1032).
  - One-click **Strategic Hardening** workflow with real-time telemetry streaming.
  - Exportable Tactical After Action Report (AAR) with full PDF generation.
- **Cross-Platform Deployment**:
  - Tauri v2 integration for ultra-secure, memory-efficient native desktop builds (Linux, macOS, Windows).
  - Progressive Web App (PWA) manifest and service worker for offline operations.

### Security & Hardening
- **Apache HTTPD Patching**:
  - Updated baseline requirement to Apache HTTPD `2.4.58` or higher to eliminate CVE-2021-41773 and CVE-2021-42013 directory traversal/RCE vulnerabilities.
  - Disabled risky and unneeded modules (`mod_proxy_uwsgi`).
- **Squid Proxy Auditing**:
  - Upgraded forward/reverse proxy requirements to Squid `5.x` or latest `4.15+` security release.
  - Remediated CVE-2020-15049 (HTTP Request Smuggling) and CVE-2020-25097 (HTTP Header Smuggling).
  - Enforced strict ACLs to eliminate unauthorized internal network bypasses.
- **Web Application Firewall (WAF)**:
  - Implemented WAF inspection matrix to neutralize HTTP Header Injection and Request Smuggling attempts.
  - Hardened header parsing and request normalization across SATCOM edge gateways.
