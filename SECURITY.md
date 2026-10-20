# Security Policy

## Supported Versions

SatExpert Tactical SatCom Intelligence (TSI) follows strict security standards for all edge proxies, web servers, reverse proxies, and cryptographic infrastructure.

| Component / Layer | Supported Versions | Security Status |
| ----------------- | ------------------ | --------------- |
| SatExpert TSI Core | `>= 1.0.0` | :white_check_mark: Supported |
| Apache HTTPD Gateway | `>= 2.4.58` | :white_check_mark: Secure (CVE-2021-41773/42013 Mitigated) |
| Apache HTTPD | `< 2.4.58` | :x: Vulnerable / Deprecated |
| Squid Edge Proxy | `>= 5.0.0` / `>= 4.15` | :white_check_mark: Secure (CVE-2020-15049/25097 Patched) |
| Squid Edge Proxy | `< 4.15` | :x: Vulnerable / Deprecated |
| Web Application Firewall | OWASP Core Rule Set / Active WAF | :white_check_mark: Enforced |
| Post-Quantum Algorithms | ML-DSA (Dilithium) & ML-KEM (Kyber) | :white_check_mark: Enforced |

---

## Tactical Hardening Standards

### 1. Web Server Hardening (Apache HTTPD)
- **Minimum Version**: Ensure Apache HTTPD is patched to version `2.4.58` or higher.
- **Module Auditing**: Disable unneeded or risky modules:
  ```apache
  # Ensure disabled in httpd.conf / mods-enabled
  # LoadModule proxy_uwsgi_module modules/mod_proxy_uwsgi.so
  ```
- **Directory Traversal Protection**: Enforce strict `<Directory />` permissions:
  ```apache
  <Directory />
      AllowOverride None
      Require all denied
  </Directory>
  ```

### 2. Forward & Reverse Proxy Hardening (Squid Proxy)
- **Minimum Version**: Squid `5.x` or latest security release `4.15+`.
- **ACL Bypass Auditing**: Explicitly audit `squid.conf` to prevent unauthorized origin routing or internal network scanning:
  ```squid
  # Restrict manager access
  http_access allow localhost manager
  http_access deny manager

  # Deny requests to unapproved destination ports
  http_access deny !Safe_ports
  http_access deny CONNECT !SSL_ports

  # Strict default deny
  http_access deny all
  ```

### 3. Web Application Firewall (WAF) & Request Smuggling Protection
- Enforce strict HTTP header parsing to defeat HTTP Request Smuggling (CL.TE / TE.CL) and HTTP Header Injection:
  - Normalize and validate incoming headers before proxying.
  - Drop requests containing ambiguous `Transfer-Encoding` or duplicate `Content-Length` headers.
  - Enforce HTTP/2 or HTTP/3 binary framing on public edge terminators.

### 4. Post-Quantum Cryptographic Defense (PQC)
- Critical SATCOM telemetry and C2 uplinks must enforce NIST-standardized Post-Quantum Cryptography:
  - **ML-DSA (Dilithium)**: Quantum-resistant digital signatures.
  - **ML-KEM (Kyber)**: Quantum-resistant key encapsulation.

---

## Reporting a Vulnerability

We prioritize the security of tactical satellite networks and defense communications. If you discover a vulnerability or security flaw, please report it confidentially.

### Reporting Procedure
1. Do **NOT** open a public issue on GitHub.
2. Draft an email to the security team at `security@satcom-tsi.mil` or submit a private report via **GitHub Security Advisories**.
3. Include the following details:
   - Target component (e.g., Apache HTTPD, Squid Proxy, WAF, PQC engine, look-angle math).
   - Severity and attack vector.
   - Step-by-step reproduction instructions or Proof of Concept (PoC).
   - Recommended remediation or patch if known.

### Response Timeline
- **Initial Response**: Within 24 hours.
- **Triage & Assessment**: Within 48 hours.
- **Patch Deployment**: High and Critical vulnerabilities are patched within 7 business days.
- **Public Disclosure**: Coordinated after fixes are published in an official security release.
