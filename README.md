# CyberSafe - Your Cyber Security Swiss Knife

![hackatime stats](https://github-readme-stats.hackclub.dev/api/wakatime?username=2324&api_domain=hackatime.hackclub.com&theme=darcula&custom_title=Hackatime+Stats&layout=compact&cache_seconds=0&langs_count=8)

CyberSafe is a versatile, all-in-one desktop platform for cybersecurity professionals, malware analysts, and security enthusiasts. Built with modern technologies, it provides essential tools for file analysis, malware detection, and security research in an intuitive interface.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.12-3670A0.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-19.1.0-61DAFB.svg)](https://react.dev/)
[![Electron](https://img.shields.io/badge/Electron-36.2.0-47848F.svg)](https://www.electronjs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 📋 Table of Contents

- [Features](#features)
- [Installation](#-installation)
- [Development Setup](#development-setup)
- [Usage](#-usage)
- [Project Status](#project-status)
- [Contributing](#-contributing)
- [Security](#security)
- [Tech Stack](#tech-stack)
- [License](#-license)
- [Support](#-support-the-project)
- [Owner](#owner)

## Features

### File Hashing & Integrity
Calculate and verify file integrity using multiple cryptographic algorithms including MD5, SHA-1, SHA-256, SHA-512, and BLAKE3. Perfect for malware analysis and forensic investigations.

### Encoding/Decoding Tools
Comprehensive support for various encoding formats:
- Base64
- URL encoding/decoding
- HTML entity encoding
- Hexadecimal conversion
- Binary conversion

### YARA Rule Scanner
Integrated YARA rule engine for:
- Malware detection and classification
- Custom rule creation and testing
- File and process scanning
- Suspicious pattern identification

### Entropy Analysis
Advanced entropy calculation for:
- Identifying packed or encrypted content
- Detecting obfuscated malware
- Analyzing file randomness
- Cryptographic analysis

### String Extraction
Extract human-readable strings from binary files:
- ASCII and Unicode string detection
- Configurable minimum string length
- Export results to various formats
- Metadata extraction

### Live Hash Monitoring
Real-time file integrity monitoring:
- Directory monitoring for changes
- Automated hash verification
- Alert system for modifications
- Forensic timeline generation

### Coming Soon
- Network traffic analysis
- Memory dump analysis
- Cryptographic key analysis
- Automated report generation

## 🚀 Installation

### Option 1: Download Release (Recommended)

Download the latest release for your platform from the [GitHub Releases](https://github.com/danielscos/CyberSafe/releases) page.

**Supported Platforms:**
- Linux (Ubuntu 20.04+, Debian 11+)

### Option 2: Build from Source

**Prerequisites:**
- Node.js 18+
- Python 3.12+
- npm or yarn
- Git

**Build Steps:**
```bash
# Clone the repository
git clone https://github.com/danielscos/CyberSafe.git
cd CyberSafe

# Install frontend dependencies
cd frontend
npm install

# Build the backend executable
cd ../backend
pip install -r requirements.txt
pip install pyinstaller
python build.py

# Build the frontend and create distributable
cd ../frontend
npm run build
npm run dist
```

The executable will be created in `frontend/dist/` directory.

## Development Setup

### Prerequisites
- Node.js 18+
- Python 3.12+
- Git

### Setup Instructions

1. **Clone and Setup:**
   ```bash
   git clone https://github.com/danielscos/CyberSafe.git
   cd CyberSafe
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   ```

### Development Commands

**Run everything (recommended):**
```bash
cd frontend
npm run dev:all
```

**Run components separately:**
```bash
# Terminal 1 - Backend
cd frontend
npm run backend

# Terminal 2 - Frontend dev server
npm run dev

# Terminal 3 - Electron app
npm run dev:electron
```

**Build for production:**
```bash
cd frontend
npm run build        # Build frontend + backend
npm run dist         # Create distributable package
```

## 📖 Usage

### Getting Started
1. Launch CyberSafe
2. Select the tool you need from the main interface
3. Follow the on-screen instructions for each tool

### File Hashing Example
1. Navigate to "File Hashing" tool
2. Select or drag-and-drop your file
3. Choose hash algorithms (MD5, SHA-256, etc.)
4. View results and export if needed

### YARA Scanning Example
1. Open "YARA Scanner" tool
2. Load your YARA rules or use built-in ones
3. Select target files or directories
4. Review scan results and threat classifications

## Project Status

**Current Version:** v0.1.0-alpha
**Status:** Active Development

### Roadmap

#### Phase 1 (In Progress)
- [x] Project setup and architecture
- [x] Basic Electron + React frontend
- [x] FastAPI backend foundation
- [x] File hashing implementation
- [x] Basic encoding/decoding tools

#### Phase 2 (Planned)
- [ ] YARA rule integration
- [x] Entropy calculator
- [ ] String extractor
- [ ] Live hash monitoring

#### Phase 3 (Future)
- [ ] Advanced malware analysis
- [ ] Network traffic analysis
- [ ] Automated reporting
- [ ] Plugin system

## 🤝 Contributing

We welcome contributions from the cybersecurity community!

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and patterns
- Add tests for new features
- Update documentation as needed
- Ensure cross-platform compatibility

### Bug Reports
Please use the [GitHub Issues](https://github.com/danielscos/CyberSafe/issues) page to report bugs or request features.

## Security

### Reporting Security Issues
If you discover a security vulnerability, please send an email to [security@cybersafe.dev] instead of using the public issue tracker.

### Security Best Practices
- Always verify file hashes from trusted sources
- Keep CyberSafe updated to the latest version
- Review YARA rules before execution
- Use in isolated environments for malware analysis

## Tech Stack

### Frontend
- **Electron** - Cross-platform desktop framework
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Material-UI** - Component library
- **Framer Motion** - Animations

### Backend
- **Python 3.12** - Core backend language
- **FastAPI** - High-performance API framework
- **Uvicorn** - ASGI server
- **PyInstaller** - Python executable packaging

### Future Integrations
- **Rust** - Performance-critical components
- **YARA** - Pattern matching engine

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ❤️ Support the Project

If you find CyberSafe useful, please consider supporting its development:

- ⭐ **Star this repository** to show your support
- 🍴 **Fork and contribute** with new features or bug fixes
- 📢 **Share** with your cybersecurity colleagues and friends
- 💬 **Provide feedback** through issues and discussions
- 📝 **Write blog posts** or tutorials about CyberSafe

## Owner

This project is developed and maintained by **danielscos**.

![Gravatar](https://www.gravatar.com/avatar/2bc553781cecd02a316c59729e84e33e?s=150)

- 🌐 **Website:** [danielscos.github.io/about_me](https://danielscos.github.io/about_me)
- 🐙 **GitHub:** [github.com/danielscos](https://github.com/danielscos)
- 💼 **LinkedIn:** [Connect with me](https://linkedin.com/in/danielscos)

---

<div align="center">

**CyberSafe** - Empowering cybersecurity professionals with modern tools 🛡️

*Built with ❤️ for the cybersecurity community*

</div>
