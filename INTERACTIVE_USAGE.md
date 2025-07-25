# CyberSafe Interactive Sandbox - Usage Guide

## 🛡️ Overview

The CyberSafe Interactive Sandbox provides a secure, isolated environment for analyzing suspicious files, malware, and applications. This guide covers how to use the interactive features to safely examine potentially dangerous content.

## 🚀 Quick Start

### 1. Start the Server
```bash
cd CyberSafe
python3 start_sandbox.py
```

The server will automatically open your browser to the test page. If not, manually navigate to:
- **Test Page**: http://127.0.0.1:8000/static/test.html
- **Interactive UI**: http://127.0.0.1:8000/static/sandbox_interactive.html

### 2. Create a Sandbox Session

Before you can interact with a sandbox, you need to create a session. Use the API to create one:

```bash
curl -X POST "http://127.0.0.1:8000/sandbox/create" \
  -H "Content-Type: application/json" \
  -d '{
    "sandbox_type": "program",
    "source": "https://example.com/suspicious-file.zip",
    "execution_command": "python main.py",
    "timeout_minutes": 10,
    "scan_before_execution": true,
    "allow_network": false,
    "resource_limits": {},
    "firejail_options": []
  }'
```

Or use the web interface at http://127.0.0.1:8000/docs to create sessions through the Swagger UI.

## 📋 Interactive Features

### 🖥️ Terminal Access

The terminal provides real-time command execution within the sandboxed environment.

#### Basic Usage:
1. **Select a Session**: Click on a session in the sidebar
2. **Connect**: The terminal will automatically connect when you start typing
3. **Execute Commands**: Type commands and press Enter
4. **View Output**: See real-time output as commands execute

#### Example Commands:
```bash
# Basic file operations
ls -la                    # List files
cd /tmp/sandbox          # Navigate directories
pwd                      # Show current directory

# File analysis
file suspicious.exe      # Determine file type
strings suspicious.exe   # Extract strings
hexdump -C file.bin     # View hex dump
head -20 logfile.txt    # View first 20 lines

# Process monitoring
ps aux                  # List running processes
netstat -tulpn         # Check network connections
lsof                   # List open files

# Security analysis
grep -r "password" .   # Search for sensitive data
find . -name "*.exe"   # Find executable files
```

#### Terminal Features:
- **Auto-completion**: Standard bash completion
- **Command history**: Use arrow keys to navigate history
- **Signal handling**: Ctrl+C, Ctrl+Z work as expected
- **Real-time output**: See command output as it happens

### 📁 File Manager

The file manager provides a graphical interface for file operations within the sandbox.

#### Navigation:
- **Click folders** to navigate into them
- **Use "Up" button** to go to parent directory
- **Current path** shows your location

#### File Operations:

##### Upload Files:
1. Click **"📤 Upload"** button
2. Select files from your computer
3. Files are uploaded to current directory

##### Download Files:
1. **Double-click** any file to download it
2. File will be saved to your browser's download folder

##### Create Directory:
1. Click **"📁 New Folder"** button
2. Enter directory name
3. Directory is created in current location

##### File Information:
- **Name**: File or directory name
- **Size**: File size in bytes/KB/MB
- **Modified**: Last modification time
- **Icons**: Different icons for file types

### 📊 Session Information

The Session Info tab provides detailed information about your sandbox session.

#### Available Information:
- **Session ID**: Unique identifier
- **Status**: Current session state (ready, running, completed, failed)
- **Start Time**: When the session was created
- **Sandbox Directory**: Path to isolated environment
- **Recent Logs**: Last 20 log entries with timestamps

## 🔒 Security Features

### Isolation
- **Firejail Sandboxing**: All operations run in isolated containers
- **No Root Access**: Processes run with limited privileges
- **Private Filesystem**: Sandbox has its own isolated filesystem
- **Network Isolation**: Optional network access control

### Resource Limits
- **Memory Limits**: Configurable memory usage limits
- **CPU Limits**: Prevent resource exhaustion
- **Timeout Controls**: Automatic session termination

### File System Security
- **Path Validation**: All file operations are validated
- **Sandbox Boundaries**: Cannot access files outside sandbox
- **Permission Checks**: Proper file permission handling

## 🎯 Common Use Cases

### 1. Malware Analysis

```bash
# Upload suspicious file via file manager
# Then in terminal:
file malware.exe              # Check file type
strings malware.exe | less    # Extract readable strings
objdump -p malware.exe       # Analyze PE structure (if available)
md5sum malware.exe           # Generate hash
```

### 2. Script Analysis

```bash
# Upload script files via file manager
# Then analyze:
cat script.py                # View source code
python -m py_compile script.py  # Check syntax
grep -n "import\|exec\|eval" script.py  # Look for dangerous functions
```

### 3. Archive Investigation

```bash
# Upload archive via file manager
# Then extract and analyze:
unzip suspicious.zip         # Extract archive
ls -la                      # List contents
find . -type f -exec file {} \;  # Identify all file types
```

### 4. Network Behavior Analysis

```bash
# If network access is enabled:
netstat -tulpn              # Check listening ports
ss -tulpn                   # Alternative network status
tcpdump -i any              # Monitor network traffic (if available)
```

## 🛠️ Troubleshooting

### Terminal Not Connecting
1. **Check Session Status**: Ensure session is in "ready" or "completed" state
2. **Refresh Session List**: Click the refresh button in sidebar
3. **Try Reconnecting**: Click disconnect then type a command to reconnect

### File Manager Not Loading
1. **Check Session Selection**: Ensure you have selected a session
2. **Verify Sandbox Directory**: Check that session has a sandbox directory set
3. **Refresh Files**: Click the refresh button in file toolbar

### Session Creation Fails
1. **Check Firejail**: Ensure firejail is installed and available
2. **Verify Source URL**: Make sure the source URL is accessible
3. **Check Logs**: Look at session logs in the Session Info tab

### API Errors
1. **Server Status**: Verify server is running on http://127.0.0.1:8000
2. **CORS Issues**: Try refreshing the page
3. **Network Connectivity**: Check browser developer console for errors

## 📝 Best Practices

### Security
1. **Always use sandbox**: Never run suspicious files outside the sandbox
2. **Limited network access**: Disable network unless specifically needed
3. **Regular cleanup**: Delete sessions after analysis
4. **Monitor resources**: Keep an eye on CPU and memory usage

### Analysis Workflow
1. **Create session** with appropriate settings
2. **Upload files** using file manager
3. **Initial reconnaissance** with basic commands (file, strings, ls)
4. **Deep analysis** using specialized tools
5. **Document findings** by downloading analysis results
6. **Clean up** by deleting the session

### Performance
1. **Reasonable timeouts**: Set appropriate timeout values
2. **Resource limits**: Configure memory and CPU limits
3. **Batch operations**: Upload multiple files at once if analyzing related files

## 🔧 Advanced Configuration

### Custom Firejail Options
When creating sessions, you can specify custom firejail options:

```json
{
  "firejail_options": [
    "--private-etc",
    "--disable-mnt",
    "--nosound"
  ]
}
```

### Resource Limits
Configure resource constraints:

```json
{
  "resource_limits": {
    "memory": "512M",
    "cpu": "50"
  }
}
```

### Network Configuration
Control network access:

```json
{
  "allow_network": false,
  "timeout_minutes": 15
}
```

## 📚 Additional Resources

- **API Documentation**: http://127.0.0.1:8000/docs
- **Firejail Manual**: `man firejail`
- **Session Logs**: Available in Session Info tab
- **Browser Developer Tools**: F12 for debugging frontend issues

## 🆘 Support

If you encounter issues:

1. **Check the test page** first: http://127.0.0.1:8000/static/test.html
2. **Review browser console** for JavaScript errors
3. **Check server logs** in the terminal where you started the server
4. **Verify firejail installation**: `firejail --version`
5. **Test API endpoints** using curl or the Swagger UI

---

**⚠️ Warning**: Always treat files in the sandbox as potentially malicious. The sandbox provides strong isolation, but you should still follow security best practices when analyzing suspicious content.