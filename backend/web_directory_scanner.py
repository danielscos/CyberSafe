#!/usr/bin/env python3
"""
Web-based Directory Scanner Interface
Simple web UI for directory scanning
"""

import sys
import os
import asyncio
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading
from datetime import datetime
import socket

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app.api.clamav_scanning import (
        DirectoryScanRequest,
        scan_directory_by_file_types,
        FileTypeCategories,
        clamav_scanner,
        get_available_file_types
    )
except ImportError as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)

class SilentHTTPServer(HTTPServer):
    """HTTP Server that handles connection errors gracefully"""

    def handle_error(self, request, client_address):
        """Override to handle errors silently for common connection issues"""
        import sys
        import traceback

        # exception info
        exc_type, exc_value, exc_traceback = sys.exc_info()

        if exc_type in (ConnectionAbortedError, BrokenPipeError, ConnectionResetError):
            return

        print(f"Error handling request from {client_address}: {exc_value}")

    def server_bind(self):
        """Override to set socket options for better connection handling"""
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        super().server_bind()

class DirectoryScannerWebHandler(BaseHTTPRequestHandler):
    """Web handler for directory scanner"""

    def do_GET(self):
        """Handle GET requests"""
        try:
            parsed_path = urlparse(self.path)

            if parsed_path.path == '/':
                self.serve_main_page()
            elif parsed_path.path == '/api/status':
                self.handle_status()
            elif parsed_path.path == '/api/file-types':
                self.handle_file_types()
            elif parsed_path.path == '/api/common-directories':
                self.handle_common_directories()
            else:
                self.safe_send_error(404, "Not Found")
        except (ConnectionAbortedError, BrokenPipeError):
            # client disconnected silent ignore
            pass
        except Exception as e:
            print(f"Error in do_GET: {e}")

    def do_POST(self):
        """Handle POST requests"""
        try:
            parsed_path = urlparse(self.path)

            if parsed_path.path == '/api/scan':
                self.handle_scan()
            else:
                self.safe_send_error(404, "Not Found")
        except (ConnectionAbortedError, BrokenPipeError):
            # client disconnected silent ignore
            pass
        except Exception as e:
            print(f"Error in do_POST: {e}")

    # web page made with ai cuz me lazy

    def serve_main_page(self):
        """Serve the main HTML page"""
        html = '''
<!DOCTYPE html>
<html>
<head>
    <title>CyberSafe Directory Scanner</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; margin-bottom: 20px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .form-group { margin: 10px 0; }
        label { display: block; font-weight: bold; margin-bottom: 5px; }
        input, select, button { padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; }
        input[type="text"] { width: 100%; }
        button { background: #007bff; color: white; border: none; cursor: pointer; padding: 10px 20px; }
        button:hover { background: #0056b3; }
        .status { padding: 10px; border-radius: 4px; margin: 10px 0; }
        .status.success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .status.error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .status.info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
        .results { margin-top: 20px; }
        .file-item { padding: 8px; margin: 3px 0; border-radius: 3px; font-family: monospace; font-size: 12px; }
        .file-clean { background: #d4edda; color: #155724; }
        .file-infected { background: #f8d7da; color: #721c24; border-left: 4px solid #dc3545; }
        .checkbox-group { display: flex; flex-wrap: wrap; gap: 10px; }
        .checkbox-item { display: flex; align-items: center; margin-right: 15px; }
        .checkbox-item input { margin-right: 5px; }
        .loading { text-align: center; padding: 20px; }
        .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 CyberSafe Directory Scanner</h1>
            <p>Interactive Directory Scanning with ClamAV</p>
        </div>

        <div id="status-section" class="section">
            <h3>📊 System Status</h3>
            <div id="system-status">Loading...</div>
        </div>

        <div class="section">
            <h3>📂 Directory Selection</h3>
            <div class="form-group">
                <label for="directory">Directory Path:</label>
                <input type="text" id="directory" placeholder="Enter directory path or select from common directories">
            </div>
            <div class="form-group">
                <label>Common Directories:</label>
                <div id="common-directories">Loading...</div>
            </div>
        </div>

        <div class="section">
            <h3>📋 File Type Selection</h3>
            <div class="form-group">
                <label>Quick Presets:</label>
                <button onclick="selectPreset(['executables', 'scripts', 'suspicious', 'no-extension'])">🔒 Security Focused</button>
                <button onclick="selectPreset(['all'])">📁 All Files</button>
                <button onclick="selectPreset(['windows-executables', 'linux-executables', 'scripts'])">⚙️ Executables</button>
                <button onclick="selectPreset(['scripts', 'archives'])">📦 Scripts & Archives</button>
            </div>
            <div class="form-group">
                <label>Individual File Types:</label>
                <div id="file-types" class="checkbox-group">Loading...</div>
            </div>
        </div>

        <div class="section">
            <h3>⚙️ Scan Options</h3>
            <div class="form-group">
                <div class="checkbox-item">
                    <input type="checkbox" id="recursive" checked>
                    <label for="recursive">Scan subdirectories recursively</label>
                </div>
            </div>
        </div>

        <div class="section">
            <button onclick="startScan()" id="scan-button">🔍 Start Scan</button>
        </div>

        <div id="results-section" class="results" style="display: none;">
            <h3>📊 Scan Results</h3>
            <div id="scan-results"></div>
        </div>
    </div>

    <script>
        let fileTypes = {};

        // Load initial data
        async function loadData() {
            try {
                // Load system status
                const statusResponse = await fetch('/api/status');
                const status = await statusResponse.json();
                updateSystemStatus(status);

                // Load file types
                const typesResponse = await fetch('/api/file-types');
                fileTypes = await typesResponse.json();
                updateFileTypes(fileTypes);

                // Load common directories
                const dirsResponse = await fetch('/api/common-directories');
                const dirs = await dirsResponse.json();
                updateCommonDirectories(dirs);

            } catch (error) {
                console.error('Error loading data:', error);
            }
        }

        function updateSystemStatus(status) {
            const statusDiv = document.getElementById('system-status');

            if (status.available) {
                statusDiv.innerHTML = `
                    <div class="status success">
                        ✅ ClamAV Available (${status.mode} mode)<br>
                        Version: ${status.version || 'Unknown'}<br>
                        Max file size: ${status.max_file_size_mb}MB, Timeout: ${status.timeout}s
                    </div>
                `;
            } else {
                statusDiv.innerHTML = `
                    <div class="status error">
                        ❌ ClamAV Not Available: ${status.message}<br>
                        ${status.help ? 'Help: ' + status.help : ''}
                    </div>
                `;
                document.getElementById('scan-button').disabled = true;
            }
        }

        function updateFileTypes(types) {
            const container = document.getElementById('file-types');
            container.innerHTML = '';

            Object.keys(types.categories).forEach(category => {
                const div = document.createElement('div');
                div.className = 'checkbox-item';
                div.innerHTML = `
                    <input type="checkbox" id="type-${category}" value="${category}">
                    <label for="type-${category}" title="${types.categories[category]}">${category}</label>
                `;
                container.appendChild(div);
            });
        }

        function updateCommonDirectories(dirs) {
            const container = document.getElementById('common-directories');
            container.innerHTML = '';

            dirs.directories.forEach(dir => {
                const button = document.createElement('button');
                button.textContent = `${dir.name} (${dir.path})`;
                button.onclick = () => {
                    document.getElementById('directory').value = dir.path;
                };
                button.style.margin = '2px';
                button.style.fontSize = '12px';
                container.appendChild(button);
            });
        }

        function selectPreset(types) {
            // Clear all checkboxes
            document.querySelectorAll('#file-types input[type="checkbox"]').forEach(cb => {
                cb.checked = false;
            });

            // Select preset types
            types.forEach(type => {
                const checkbox = document.getElementById(`type-${type}`);
                if (checkbox) checkbox.checked = true;
            });
        }

        async function startScan() {
            const directory = document.getElementById('directory').value.trim();
            if (!directory) {
                alert('Please enter a directory path');
                return;
            }

            const selectedTypes = Array.from(document.querySelectorAll('#file-types input[type="checkbox"]:checked'))
                .map(cb => cb.value);

            if (selectedTypes.length === 0) {
                alert('Please select at least one file type');
                return;
            }

            const recursive = document.getElementById('recursive').checked;

            // Show loading
            const resultsSection = document.getElementById('results-section');
            resultsSection.style.display = 'block';
            resultsSection.innerHTML = `
                <h3>📊 Scan in Progress</h3>
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Scanning ${directory}...</p>
                    <p>File types: ${selectedTypes.join(', ')}</p>
                    <p>Recursive: ${recursive ? 'Yes' : 'No'}</p>
                </div>
            `;

            try {
                const response = await fetch('/api/scan', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        directory: directory,
                        file_types: selectedTypes,
                        recursive: recursive
                    })
                });

                const result = await response.json();
                displayResults(result);

            } catch (error) {
                resultsSection.innerHTML = `
                    <h3>📊 Scan Results</h3>
                    <div class="status error">❌ Scan failed: ${error.message}</div>
                `;
            }
        }

        function displayResults(result) {
            const resultsSection = document.getElementById('results-section');
            const summary = result.batch_summary;

            let html = `<h3>📊 Scan Results</h3>`;

            // Summary
            html += `
                <div class="status ${summary.infected_count > 0 ? 'error' : 'success'}">
                    <strong>Directory:</strong> ${result.directory}<br>
                    <strong>File Types:</strong> ${result.file_types.join(', ')}<br>
                    <strong>Total Files:</strong> ${summary.total_files}<br>
                    <strong>Scanned:</strong> ${summary.completed}<br>
                    <strong>Clean:</strong> ${summary.clean_count}<br>
                    <strong>Infected:</strong> ${summary.infected_count}<br>
                    <strong>Errors:</strong> ${summary.error_count}<br>
                    <strong>Scan Time:</strong> ${summary.scan_time}s
                </div>
            `;

            // Infected files
            if (summary.infected_count > 0) {
                html += `<h4>🚨 Infected Files:</h4>`;
                result.scan_results.forEach(file => {
                    if (file.infected) {
                        const filePath = file.file_path || file.filename;
                        html += `<div class="file-item file-infected">⚠️ <strong>File:</strong> ${filePath}<br>&nbsp;&nbsp;&nbsp;&nbsp;<strong>Threat:</strong> ${file.threat}</div>`;
                    }
                });
            }

            // Clean files summary (only show if there are some clean files)
            if (summary.clean_count > 0) {
                html += `<h4>✅ Clean Files Summary:</h4>`;
                const cleanFiles = result.scan_results.filter(file => !file.infected);
                if (cleanFiles.length <= 10) {
                    // Show all clean files if 10 or fewer
                    cleanFiles.forEach(file => {
                        const filePath = file.file_path || file.filename;
                        html += `<div class="file-item file-clean">✅ ${filePath}</div>`;
                    });
                } else {
                    // Show first 5 and last 5 with summary
                    cleanFiles.slice(0, 5).forEach(file => {
                        const filePath = file.file_path || file.filename;
                        html += `<div class="file-item file-clean">✅ ${filePath}</div>`;
                    });
                    html += `<div class="file-item">... ${cleanFiles.length - 10} more clean files ...</div>`;
                    cleanFiles.slice(-5).forEach(file => {
                        const filePath = file.file_path || file.filename;
                        html += `<div class="file-item file-clean">✅ ${filePath}</div>`;
                    });
                }
            }

            // File type breakdown
            if (result.file_type_breakdown) {
                html += `<h4>📈 File Type Breakdown:</h4>`;
                Object.entries(result.file_type_breakdown).forEach(([type, counts]) => {
                    const status = counts.infected > 0 ? '🚨' : '✅';
                    html += `<div class="file-item">${status} ${type}: ${counts.total} files (${counts.clean} clean, ${counts.infected} infected)</div>`;
                });
            }

            // Overall status
            if (summary.infected_count > 0) {
                html += `<div class="status error"><strong>🚨 SECURITY ALERT:</strong> ${summary.infected_count} threats detected! Quarantine infected files immediately.</div>`;
            } else {
                html += `<div class="status success"><strong>✅ ALL CLEAN:</strong> No threats detected.</div>`;
            }

            resultsSection.innerHTML = html;
        }

        // Load data when page loads
        window.onload = loadData;
    </script>
</body>
</html>
        '''

        try:
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.send_header('Content-Length', str(len(html)))
            self.end_headers()
            self.wfile.write(html.encode('utf-8'))
        except (ConnectionAbortedError, BrokenPipeError):
            # client disconnected silent ignore
            pass

    def handle_status(self):
        """Handle status endpoint"""
        try:
            status = clamav_scanner.status
            response = {
                "available": status["available"],
                "mode": status.get("mode", "unknown"),
                "version": status.get("version", "unknown"),
                "message": status.get("message", ""),
                "help": status.get("installation_help") or status.get("troubleshooting"),
                "max_file_size_mb": clamav_scanner.max_file_size / (1024 * 1024),
                "timeout": clamav_scanner.timeout
            }
            self.send_json_response(response)
        except Exception as e:
            self.safe_send_error(500, f"Status error: {str(e)}")

    def handle_file_types(self):
        """Handle file types endpoint"""
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(get_available_file_types())
            loop.close()

            self.send_json_response(result)
        except Exception as e:
            self.safe_send_error(500, f"File types error: {str(e)}")

    def handle_common_directories(self):
        """Handle common directories endpoint"""
        common_dirs = [
            {"name": "Home", "path": os.path.expanduser("~")},
            {"name": "Downloads", "path": os.path.expanduser("~/Downloads")},
            {"name": "Documents", "path": os.path.expanduser("~/Documents")},
            {"name": "Desktop", "path": os.path.expanduser("~/Desktop")},
            {"name": "Temp", "path": "/tmp"},
            {"name": "Current", "path": os.getcwd()}
        ]

        # filter to existing directories
        existing_dirs = [d for d in common_dirs if os.path.exists(d["path"])]

        self.send_json_response({"directories": existing_dirs})

    def handle_scan(self):
        """Handle scan endpoint"""
        try:
            # parse json body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            request = DirectoryScanRequest(**data)

            # async scan
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(scan_directory_by_file_types(request))
            loop.close()

            self.send_json_response(result)

        except json.JSONDecodeError:
            self.safe_send_error(400, "Invalid JSON")
        except Exception as e:
            self.safe_send_error(500, f"Scan error: {str(e)}")

    def send_json_response(self, data):
        """Send JSON response"""
        try:
            response = json.dumps(data, indent=2)

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(response)))
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            self.wfile.write(response.encode('utf-8'))
        except (ConnectionAbortedError, BrokenPipeError):
            # silent ignore on disconnect
            pass
        except Exception as e:
            print(f"Error sending response: {e}")

    def safe_send_error(self, code, message):
        """Send error response with connection error handling"""
        try:
            self.send_error(code, message)
        except (ConnectionAbortedError, BrokenPipeError, ConnectionResetError):
            # same thing as above
            pass
        except Exception as e:
            print(f"Error sending error response: {e}")

    def log_message(self, format, *args):
        """Custom log format - suppress 404 and broken pipe errors"""
        # suppress common client disconnection errors
        if "broken pipe" in (format % args).lower() or "connection aborted" in (format % args).lower():
            return
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] {format % args}")

def run_web_server(port=8002):
    """Run the web server"""
    server_address = ('', port)
    httpd = SilentHTTPServer(server_address, DirectoryScannerWebHandler)

    print(f"CyberSafe Directory Scanner Web Interface")
    print(f"Starting on http://localhost:{port}")
    print(f"Press Ctrl+C to stop")
    print("=" * 60)

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print(f"\nServer stopped")
        httpd.shutdown()

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="CyberSafe Directory Scanner Web Interface")
    parser.add_argument('--port', type=int, default=8002, help='Port to run server on (default: 8002)')
    args = parser.parse_args()

    run_web_server(args.port)
