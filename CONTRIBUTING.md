# Contributing to SatExpert Tactical SatCom Intelligence (TSI)

Thank you for your interest in contributing to SatExpert Tactical SatCom Intelligence! We welcome contributions from satellite engineers, cybersecurity researchers, and developers worldwide.

---

## Code of Conduct

All contributors and participants are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please treat fellow engineers with respect and professionalism.

---

## Development Setup

### Prerequisites
- **Node.js**: `>= 18.0.0`
- **npm**: `>= 9.0.0`
- **Rust & Cargo** *(Optional, for Tauri Desktop app)*: `>= 1.77.0`

### Setup Instructions
1. **Fork and clone the repository**:
   ```bash
   git clone https://github.com/your-username/satexpert-tsi.git
   cd satexpert-tsi
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Add your GEMINI_API_KEY if testing AI capabilities
   ```

4. **Launch the development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

5. **Run desktop environment via Tauri** *(Optional)*:
   ```bash
   npm run tauri dev
   ```

---

## Quality & Validation Gates

Before submitting code, ensure all quality checks pass cleanly:

```bash
# 1. Type-check with TypeScript
npm run lint

# 2. Production build verification
npm run build
```

---

## Branching & Commit Conventions

### Branch Naming
- `feature/<feature-name>` (e.g., `feature/pqc-kyber-handshake`)
- `fix/<bug-description>` (e.g., `fix/apache-waf-rule-parser`)
- `docs/<doc-update>` (e.g., `docs/threat-dossier-hardening`)

### Conventional Commits
Please use Conventional Commits format:
- `feat: add automated Squid proxy ACL audit generator`
- `fix: resolve look-angle azimuth calculation boundary wrap`
- `sec: update Apache HTTPD baseline to 2.4.58 with mod_proxy_uwsgi disabled`
- `docs: update deployment and Tauri cross-compilation instructions`
- `chore: bump dependencies for release v1.0.0`

---

## Pull Request Checklist

When submitting a pull request:
- [ ] Title clearly summarizes the change.
- [ ] PR description describes the purpose, architecture decisions, and testing steps.
- [ ] `npm run lint` passes without any TypeScript errors.
- [ ] `npm run build` succeeds cleanly.
- [ ] Any new UI modules integrate gracefully with the dark tactical theme.
- [ ] Sensitive keys and tokens are never committed.
