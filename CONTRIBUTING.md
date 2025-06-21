# Contributing to CyberSafe 🤝

Thank you for your interest in contributing to CyberSafe! We welcome contributions from the cybersecurity community and appreciate your help in making this tool better for everyone.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Security Considerations](#security-considerations)
- [Submitting Changes](#submitting-changes)
- [Issue Reporting](#issue-reporting)
- [Feature Requests](#feature-requests)
- [Community Guidelines](#community-guidelines)

## Code of Conduct

This project adheres to a code of conduct that we expect all contributors to follow. Please be respectful, inclusive, and professional in all interactions.

## Getting Started

### Prerequisites

Before contributing, ensure you have:
- Node.js 18+
- Python 3.12+
- Git
- Basic knowledge of React, Electron, and FastAPI
- Understanding of cybersecurity concepts (preferred)

### First Contribution

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Set up the development environment** (see below)
4. **Find a good first issue** labeled with `good-first-issue`
5. **Make your changes** and test thoroughly
6. **Submit a pull request**

## Development Setup

### 1. Clone and Setup
```bash
git clone https://github.com/YOUR-USERNAME/CyberSafe.git
cd CyberSafe
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
# Install development dependencies
pip install pytest black flake8 mypy
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

### 4. Run Development Environment
```bash
cd frontend
npm run dev:all
```

## How to Contribute

### Types of Contributions

We welcome various types of contributions:

- **🐛 Bug fixes** - Fix existing issues
- **✨ New features** - Add new cybersecurity tools
- **📖 Documentation** - Improve docs, README, or code comments
- **🎨 UI/UX improvements** - Enhance user interface
- **🔧 Performance optimizations** - Make the app faster
- **🧪 Tests** - Add or improve test coverage
- **🔒 Security enhancements** - Improve security measures

### Development Workflow

1. **Create a branch** for your feature/fix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

2. **Make your changes** following our coding standards

3. **Test your changes** thoroughly:
   ```bash
   # Frontend tests
   cd frontend
   npm run lint
   npm run test
   
   # Backend tests
   cd backend
   python -m pytest
   python -m black --check .
   python -m flake8 .
   ```

4. **Commit your changes** with descriptive messages:
   ```bash
   git commit -m "feat: add SHA-3 hashing algorithm support"
   # or
   git commit -m "fix: resolve file upload dialog on Windows"
   ```

5. **Push to your fork** and create a pull request

## Coding Standards

### Python Backend

- **Style**: Follow PEP 8 guidelines
- **Formatting**: Use Black for code formatting
- **Linting**: Use Flake8 for linting
- **Type hints**: Use MyPy for type checking
- **Documentation**: Use Google-style docstrings

```python
def calculate_file_hash(file_path: str, algorithm: str) -> str:
    """Calculate hash of a file using specified algorithm.
    
    Args:
        file_path: Path to the file to hash
        algorithm: Hash algorithm to use (md5, sha256, etc.)
        
    Returns:
        Hexadecimal hash string
        
    Raises:
        FileNotFoundError: If file doesn't exist
        ValueError: If algorithm is not supported
    """
```

### React Frontend

- **Style**: Use ESLint configuration
- **Formatting**: Use Prettier for consistent formatting
- **Components**: Use functional components with hooks
- **Naming**: Use PascalCase for components, camelCase for functions
- **Styling**: Use Material-UI components and emotion/styled

```jsx
const FileHashingTool = ({ onHashCalculated }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [hashResult, setHashResult] = useState('');
  
  const handleFileSelect = useCallback((file) => {
    setSelectedFile(file);
  }, []);
  
  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h6">File Hashing Tool</Typography>
      {/* Component content */}
    </Box>
  );
};
```

### Commit Message Convention

Use conventional commits format:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

## Testing

### Backend Testing
```bash
cd backend
python -m pytest tests/ -v
python -m pytest --cov=app tests/  # With coverage
```

### Frontend Testing
```bash
cd frontend
npm run test
npm run test:coverage
```

### Manual Testing
- Test all affected features
- Verify cross-platform compatibility
- Test with various file types and sizes
- Ensure security tools work correctly

## Security Considerations

Since CyberSafe is a cybersecurity tool, special attention to security is required:

### Security Guidelines

1. **Input Validation**: Always validate and sanitize inputs
2. **File Handling**: Be cautious with file operations and paths
3. **Dependency Security**: Keep dependencies updated
4. **Sensitive Data**: Never log or expose sensitive information
5. **Error Handling**: Avoid exposing system information in errors

### Reporting Security Issues

**DO NOT** report security vulnerabilities in public issues. Instead:
1. Email security@cybersafe.dev (or the maintainer)
2. Provide detailed description of the vulnerability
3. Include steps to reproduce
4. Allow time for assessment and fix before disclosure

## Submitting Changes

### Pull Request Process

1. **Ensure your PR**:
   - Has a clear, descriptive title
   - Includes a detailed description of changes
   - References related issues
   - Includes tests for new functionality
   - Updates documentation if needed

2. **PR Template**:
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Documentation update
   - [ ] Performance improvement
   
   ## Testing
   - [ ] Added/updated tests
   - [ ] All tests pass
   - [ ] Manual testing completed
   
   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Documentation updated
   ```

3. **Review Process**:
   - Maintainers will review your PR
   - Address feedback promptly
   - Keep discussions professional and constructive
   - Be patient - reviews take time

## Issue Reporting

### Bug Reports

Use the bug report template:
```markdown
**Bug Description**
Clear description of the bug

**To Reproduce**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**
What should happen

**Screenshots**
If applicable, add screenshots

**Environment**
- OS: [e.g., Windows 10, macOS 12]
- CyberSafe Version: [e.g., 0.1.0]
- Node.js Version: [e.g., 18.16.0]
```

### Performance Issues

Include:
- System specifications
- File sizes being processed
- Time measurements
- Memory usage information

## Feature Requests

When suggesting new features:
1. **Check existing issues** to avoid duplicates
2. **Provide clear use cases** and rationale
3. **Consider security implications**
4. **Think about user experience**
5. **Be open to discussion** and alternative approaches

### Feature Request Template
```markdown
**Feature Description**
Clear description of the proposed feature

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should this feature work?

**Alternatives Considered**
Other approaches you've considered

**Additional Context**
Screenshots, mockups, or examples
```

## Community Guidelines

### Communication

- **Be respectful** and professional
- **Stay on topic** in discussions
- **Provide constructive feedback**
- **Help others** when possible
- **Ask questions** when unclear

### Best Practices

- **Search before posting** to avoid duplicates
- **Provide context** in your questions
- **Follow up** on your issues and PRs
- **Be patient** with reviews and responses
- **Celebrate contributions** from others

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Special recognition for security improvements

## Getting Help

If you need help:
1. Check the [README.md](README.md) for basic setup
2. Look through existing issues and discussions
3. Ask questions in new issues with the `question` label
4. Reach out to maintainers if needed

## Resources

- [React Documentation](https://react.dev/)
- [Electron Documentation](https://www.electronjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Material-UI Documentation](https://mui.com/)
- [Cybersecurity Best Practices](https://www.cisa.gov/cybersecurity-best-practices)

---

Thank you for contributing to CyberSafe! Your contributions help make cybersecurity tools more accessible and effective for everyone. 🛡️

*For questions about contributing, please open an issue or reach out to the maintainers.*