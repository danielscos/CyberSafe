from fastapi import APIRouter, File, UploadFile, HTTPException
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from pydantic import BaseModel
import subprocess
import tempfile
import os
import json
import logging
import socket
import struct
import asyncio
from datetime import datetime
from rustlib import hash_sha256_bytes

logger = logging.getLogger(__name__)

router = APIRouter()

@dataclass
class ScanResult:
    """Structured scan result for type safety."""
    infected: bool
    threat_name: Optional[str] = None
    returncode: int = 0
    stdout: Optional[str] = None
    stderr: Optional[str] = None

@dataclass
class BatchScanResult:
    """Result for batch scanning operations."""
    total_files: int
    completed: int
    infected_count: int
    clean_count: int
    error_count: int
    scan_time: float
    results: List[Dict[str, Any]]
    errors: List[Dict[str, Any]]

class DirectoryScanRequest(BaseModel):
    """Request model for directory scanning by file types."""
    directory: str
    file_types: List[str]
    recursive: bool = True

class ClamAVError(Exception):
    """Base exception for ClamAV operations."""
    pass

class ClamAVNotAvailableError(ClamAVError):
    """Raised when ClamAV is not available."""
    pass

class ClamAVScanner:
    import json
    import os

    HISTORY_FILE = os.path.join(os.path.dirname(__file__), "clamav_scan_history.json")

    def __init__(self):
        self.status = self._check_clamav_availability()
        self.scan_history = []
        self.load_history_from_file()
        print("ClamAVScanner initialized. scan_history loaded:", self.scan_history)
        self.max_file_size = 50 * 1024 * 1024  # 50MB limit
        self.timeout = 30
        self.max_concurrent_scans = 5  # Limit concurrent scans to avoid resource exhaustion

    def save_history_to_file(self):
        print("Saving scan_history to file:", self.HISTORY_FILE)
        print("scan_history to save:", self.scan_history)
        try:
            with open(self.HISTORY_FILE, "w") as f:
                json.dump(self.scan_history, f)
        except Exception as e:
            print(f"Error saving scan history: {e}")

    def load_history_from_file(self):
        if os.path.exists(self.HISTORY_FILE):
            try:
                with open(self.HISTORY_FILE, "r") as f:
                    content = f.read().strip()
                    print("Loaded history file content:", content)
                    if not content:
                        self.scan_history = []
                    else:
                        self.scan_history = json.loads(content)
                print("Loaded scan_history:", self.scan_history)
            except Exception as e:
                print(f"Error loading scan history: {e}")
                self.scan_history = []

    def _check_clamav_availability(self) -> Dict[str, Any]:
        """Check if ClamAV is available and properly configured."""
        try:
            if not self._is_clamav_installed():
                return self._create_not_installed_response()

            if not self._check_virus_databases():
                return self._create_no_database_response()

            return self._check_daemon_status()

        except subprocess.TimeoutExpired:
            return {
                "available": False,
                "reason": "timeout",
                "message": "ClamAV check timed out",
                "troubleshooting": "ClamAV may be installed but not responding"
            }
        except FileNotFoundError:
            return {
                "available": False,
                "reason": "not_installed",
                "message": "ClamAV is not installed on this system",
                "installation_help": "Install ClamAV with your package manager"
            }
        except Exception as e:
            return {
                "available": False,
                "reason": "error",
                "message": f"Error checking ClamAV availability: {str(e)}",
                "troubleshooting": "Check system logs for more details"
            }

    def _is_clamav_installed(self) -> bool:
        """Check if ClamAV binaries exist."""
        clamscan_result = subprocess.run(['which', 'clamscan'],
                                       capture_output=True, text=True)
        return clamscan_result.returncode == 0

    def _create_not_installed_response(self) -> Dict[str, Any]:
        """Create response for when ClamAV is not installed."""
        return {
            "available": False,
            "reason": "not_installed",
            "message": "ClamAV is not installed on this system",
            "installation_help": "Install ClamAV with: sudo pacman -S clamav (Arch) or sudo apt install clamav (Ubuntu)"
        }

    def _check_virus_databases(self) -> bool:
        """Check if virus databases exist."""
        db_paths = ["/var/lib/clamav/", "/usr/share/clamav/"]
        for db_path in db_paths:
            if os.path.exists(db_path):
                db_files = [f for f in os.listdir(db_path) if f.endswith(('.cvd', '.cld', '.cdb'))]
                if db_files:
                    return True
        return False

    def _create_no_database_response(self) -> Dict[str, Any]:
        """Create response for when virus databases are missing."""
        return {
            "available": False,
            "reason": "no_database",
            "message": "ClamAV is installed but virus databases are missing",
            "installation_help": "Update virus databases with: sudo freshclam"
        }

    def _check_daemon_status(self) -> Dict[str, Any]:
        """Check daemon status and return appropriate configuration."""
        # check clamav version
        version_result = subprocess.run(['clamscan', '--version'],
                                      capture_output=True, text=True, timeout=5)

        if version_result.returncode != 0:
            return {
                "available": False,
                "reason": "not_working",
                "message": "ClamAV is installed but not functioning properly",
                "troubleshooting": "Try running 'clamscan --version' manually to check for errors"
            }

        # check if clamav daemon service is running
        daemon_result = subprocess.run(['systemctl', 'is-active', 'clamav-daemon.service'],
                                     capture_output=True, text=True)

        daemon_running = daemon_result.returncode == 0 and daemon_result.stdout.strip() == 'active'

        # also check if clamdscan is available and can connect to daemon
        daemon_functional = False
        if daemon_running:
            daemon_functional = self._test_daemon_connectivity()

        # if daemon is not running or not functional, clamav can still work with clamscan
        if not daemon_running or not daemon_functional:
            status_msg = "not running" if not daemon_running else "not responding"
            logger.info(f"Using ClamAV standalone mode - daemon {status_msg}")
            return {
                "available": True,
                "mode": "standalone",
                "version": version_result.stdout.strip(),
                "message": f"ClamAV is available in standalone mode (daemon {status_msg})",
                "note": "Scanning will be slower without the daemon. For better performance, start daemon with: sudo systemctl start clamav-daemon"
            }

        # everything is working perfectly
        logger.info("ClamAV daemon mode available and functional")
        return {
            "available": True,
            "mode": "daemon",
            "version": version_result.stdout.strip(),
            "message": "ClamAV is fully operational with daemon support"
        }

    def _test_daemon_connectivity(self) -> bool:
        """Test if daemon is actually responding."""
        try:
            test_result = subprocess.run(['clamdscan', '--ping=1'],
                                       capture_output=True, text=True, timeout=5)
            daemon_functional = test_result.returncode == 0 and "PONG" in test_result.stdout
            logger.info(f"ClamAV daemon ping test: {'success' if daemon_functional else 'failed'}")
            if not daemon_functional:
                logger.warning(f"Daemon ping failed - stdout: {test_result.stdout}, stderr: {test_result.stderr}")
            return daemon_functional
        except Exception as e:
            logger.warning(f"ClamAV daemon test failed: {e}")
            return False

    async def scan_file_content(self, file_content: bytes, filename: str, file_path: str = None) -> Dict[str, Any]:
        """Scan file content with ClamAV if available, with performance optimizations."""

        start_time = datetime.now()
        file_hash = hash_sha256_bytes(file_content)
        scan_time = 0.0

        # check if clamav is available
        if not self.status["available"]:
            return {
                "success": False,
                "error": "ClamAV not available",
                "reason": self.status["reason"],
                "message": self.status["message"],
                "installation_help": self.status.get("installation_help"),
                "troubleshooting": self.status.get("troubleshooting")
            }

        if not file_content:
            return {"success": False, "error": "Empty file"}

        if len(file_content) > self.max_file_size:
            return {
                "success": False,
                "error": "File too large",
                "message": f"File size ({len(file_content)} bytes) exceeds maximum ({self.max_file_size} bytes)"
            }

        try:
            result = await self._perform_scan(file_content, filename)
            scan_time = (datetime.now() - start_time).total_seconds()

            logger.info(f"Scan completed in {scan_time:.2f}s, return code: {result.returncode}")

            # extract scan results
            infected = result.infected
            threat_name = result.threat_name

            if infected and not threat_name and result.stdout:
                threat_name = self._extract_threat_name(result.stdout)
                if threat_name:
                    logger.warning(f"Threat detected: {threat_name}")

            # store in history
            scan_record = self._create_scan_record(
                filename, infected, threat_name, start_time, scan_time,
                len(file_content), file_hash, self.status["mode"]
            )

            self.scan_history.append(scan_record)
            self._trim_scan_history()
            self.save_history_to_file()

            return {
                "success": True,
                "infected": infected,
                "threat": threat_name,
                "scan_time": scan_time,
                "file_size": len(file_content),
                "hash": file_hash,
                "timestamp": start_time.isoformat(),
                "scan_mode": self.status["mode"],
                "message": "File scanned successfully",
                "filename": filename,
                "file_path": file_path or filename
            }

        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "error": "Scan timeout",
                "message": f"Scan timed out after {self.timeout} seconds"
            }
        except Exception as e:
            return await self._handle_scan_error(e, file_content, filename, start_time, file_hash, file_path)

    async def _perform_scan(self, file_content: bytes, filename: str) -> ScanResult:
        """Perform the actual scan with appropriate method."""
        if self.status["mode"] == "daemon":
            # try instream method first
            logger.info(f"Using ClamAV daemon INSTREAM mode to scan: {filename}")
            try:
                return self._scan_with_instream(file_content)
            except Exception as e:
                logger.warning(f"INSTREAM scan failed: {e}, trying clamdscan fallback")
                return self._scan_with_clamdscan(file_content, filename)
        else:
            # use standalone mode
            logger.info(f"Using ClamAV standalone mode to scan: {filename}")
            return self._scan_with_clamscan(file_content, filename)

    def _extract_threat_name(self, stdout: str) -> Optional[str]:
        """Extract threat name from scan output."""
        lines = stdout.strip().split('\n')
        for line in lines:
            if 'FOUND' in line:
                return line.split(':')[-1].strip().replace('FOUND', '').strip()
        return None

    def _create_scan_record(self, filename: str, infected: bool, threat_name: Optional[str],
                          start_time: datetime, scan_time: float, file_size: int,
                          file_hash: str, scan_mode: str) -> Dict[str, Any]:
        """Create a scan record for history."""
        return {
            "filename": filename,
            "infected": infected,
            "threat": threat_name,
            "timestamp": start_time.isoformat(),
            "scan_time": scan_time,
            "file_size": file_size,
            "hash": file_hash,
            "scan_mode": scan_mode
        }

    def _trim_scan_history(self):
        """Keep only last 100 scans."""
        if len(self.scan_history) > 100:
            self.scan_history = self.scan_history[-100:]

    async def _handle_scan_error(self, error: Exception, file_content: bytes,
                                filename: str, start_time: datetime, file_hash: str, file_path: str = None) -> Dict[str, Any]:
        """Handle scan errors with fallback logic."""
        if self.status["mode"] == "daemon":
            try:
                logger.info(f"Daemon scan failed, falling back to standalone mode for {filename}")
                result = self._scan_with_clamscan(file_content, filename)

                scan_time = (datetime.now() - start_time).total_seconds()
                infected = result.returncode == 1
                threat_name = None

                if infected and result.stdout:
                    threat_name = self._extract_threat_name(result.stdout)

                # history storing
                scan_record = self._create_scan_record(
                    filename, infected, threat_name, start_time, scan_time,
                    len(file_content), file_hash, "standalone_fallback"
                )
                self.scan_history.append(scan_record)
                self._trim_scan_history()
                self.save_history_to_file()

                return {
                    "success": True,
                    "infected": infected,
                    "threat": threat_name,
                    "scan_time": scan_time,
                    "file_size": len(file_content),
                    "hash": file_hash,
                    "timestamp": start_time.isoformat(),
                    "scan_mode": "standalone_fallback",
                    "message": "File scanned successfully (fallback mode)",
                    "filename": filename,
                    "file_path": file_path or filename
                }

            except Exception as fallback_error:
                logger.error(f"Both daemon and standalone scanning failed: {fallback_error}")
                return {
                    "success": False,
                    "error": "Scan failed",
                    "message": f"Both daemon and standalone scanning failed: {str(fallback_error)}",
                    "filename": filename,
                    "file_path": file_path or filename
                }
        else:
            return {
                "success": False,
                "error": "Scan error",
                "filename": filename,
                "file_path": file_path or filename,
                "message": f"Unexpected error during scan: {str(error)}"
            }

    def _scan_with_instream(self, file_content: bytes) -> ScanResult:
        """Scan file content using ClamAV INSTREAM command (fastest method)."""
        socket_paths = ['/var/run/clamav/clamd.ctl', '/tmp/clamd.socket', '/var/run/clamd.socket']

        with socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) as sock:
            sock.settimeout(self.timeout)

            # try common socket paths
            connected = False
            for socket_path in socket_paths:
                try:
                    sock.connect(socket_path)
                    connected = True
                    break
                except:
                    continue

            if not connected:
                raise ClamAVError("Could not connect to ClamAV daemon socket")

            # send instream command
            sock.send(b'zINSTREAM\0')

            # send in chunks
            chunk_size = 8192
            for i in range(0, len(file_content), chunk_size):
                chunk = file_content[i:i + chunk_size]
                size = struct.pack('!L', len(chunk))
                sock.send(size + chunk)

            # send zero length chunk to indicate end
            sock.send(struct.pack('!L', 0))

            # read response
            response = b''
            while True:
                data = sock.recv(1024)
                if not data:
                    break
                response += data
                if b'\0' in response:
                    break

            # parse response
            response_str = response.decode('utf-8', errors='ignore').rstrip('\0')

            if 'FOUND' in response_str:
                threat_name = response_str.split(':')[-1].strip().replace('FOUND', '').strip()
                return ScanResult(infected=True, threat_name=threat_name, returncode=1)
            elif 'OK' in response_str:
                return ScanResult(infected=False, threat_name=None, returncode=0)
            else:
                raise ClamAVError(f"Unexpected ClamAV response: {response_str}")

    def _scan_with_clamdscan(self, file_content: bytes, filename: str) -> ScanResult:
        """Fallback method using clamdscan with temporary file."""
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=f"_{filename}",
            mode='wb',
            prefix='clamav_scan_'
        ) as temp_file:
            temp_file.write(file_content)
            temp_file_path = temp_file.name

        # set restrictive file permissions
        os.chmod(temp_file_path, 0o600)

        try:
            result = subprocess.run([
                'clamdscan', '--no-summary', '--infected', '--quiet', temp_file_path
            ], capture_output=True, text=True, timeout=self.timeout)

            # check for daemon connection errors
            stderr_text = result.stderr or ""
            if ("Can't connect to clamd" in stderr_text or
                "ERROR: Can't get clamd status" in stderr_text or
                "Permission denied" in stderr_text):
                raise ClamAVError(f"ClamAV daemon access failed: {stderr_text}")

            infected = result.returncode == 1
            threat_name = None
            if infected and result.stdout:
                threat_name = self._extract_threat_name(result.stdout)

            return ScanResult(
                infected=infected,
                threat_name=threat_name,
                returncode=result.returncode,
                stdout=result.stdout,
                stderr=result.stderr
            )
        finally:
            try:
                os.unlink(temp_file_path)
            except OSError:
                logger.warning(f"Failed to delete temporary file: {temp_file_path}")

    def _scan_with_clamscan(self, file_content: bytes, filename: str) -> ScanResult:
        """Scan using standalone clamscan with optimizations."""
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=f"_{filename}",
            mode='wb',
            prefix='clamav_scan_'
        ) as temp_file:
            temp_file.write(file_content)
            temp_file_path = temp_file.name

        # set restrictive file permissions
        os.chmod(temp_file_path, 0o600)

        try:
            result = subprocess.run([
                'clamscan',
                '--no-summary',
                '--infected',
                '--quiet',
                '--scan-mail=no',
                '--scan-ole2=no',
                '--scan-pdf=no',
                '--scan-archive=no',
                temp_file_path
            ], capture_output=True, text=True, timeout=self.timeout)

            infected = result.returncode == 1
            threat_name = None
            if infected and result.stdout:
                threat_name = self._extract_threat_name(result.stdout)

            return ScanResult(
                infected=infected,
                threat_name=threat_name,
                returncode=result.returncode,
                stdout=result.stdout,
                stderr=result.stderr
            )
        finally:
            try:
                os.unlink(temp_file_path)
            except OSError:
                logger.warning(f"Failed to delete temporary file: {temp_file_path}")

    async def scan_multiple_files(self, files_data: List[tuple], progress_callback=None) -> BatchScanResult:
        """
        Scan multiple files concurrently with progress tracking.

        Args:
            files_data: List of tuples (file_content: bytes, filename: str) or (file_content: bytes, filename: str, file_path: str)
            progress_callback: Optional callback function for progress updates

        Returns:
            BatchScanResult with aggregated results
        """
        if not self.status["available"]:
            raise ClamAVNotAvailableError("ClamAV not available for batch scanning")

        start_time = datetime.now()
        total_files = len(files_data)
        results = []
        errors = []

        logger.info(f"Starting batch scan of {total_files} files")

        # create semaphore to limit concurrent scans
        semaphore = asyncio.Semaphore(self.max_concurrent_scans)

        async def scan_single_file(file_data, index):
            """Scan a single file with semaphore control."""
            if len(file_data) == 3:
                file_content, filename, file_path = file_data
            else:
                file_content, filename = file_data
                file_path = None

            async with semaphore:
                try:
                    result = await self.scan_file_content(file_content, filename, file_path)

                    if progress_callback:
                        progress = (index + 1) / total_files * 100
                        await progress_callback(progress, filename, result.get('infected', False))

                    return result
                except Exception as e:
                    error = {
                        "filename": filename,
                        "file_path": file_path or filename,
                        "error": str(e),
                        "timestamp": datetime.now().isoformat()
                    }
                    logger.error(f"Error scanning {filename}: {e}")
                    return error

        # execute all scans concurrently
        tasks = [scan_single_file(file_data, i) for i, file_data in enumerate(files_data)]
        scan_results = await asyncio.gather(*tasks, return_exceptions=True)

        # process results
        infected_count = 0
        clean_count = 0
        error_count = 0

        for result in scan_results:
            if isinstance(result, Exception):
                error_count += 1
                errors.append({
                    "error": str(result),
                    "timestamp": datetime.now().isoformat()
                })
            elif isinstance(result, dict):
                if "error" in result:
                    error_count += 1
                    errors.append(result)
                else:
                    results.append(result)
                    if result.get("infected", False):
                        infected_count += 1
                    else:
                        clean_count += 1

        scan_time = (datetime.now() - start_time).total_seconds()
        completed = len(results)

        logger.info(f"Batch scan completed: {completed}/{total_files} files, "
                   f"{infected_count} infected, {clean_count} clean, "
                   f"{error_count} errors in {scan_time:.2f}s")

        return BatchScanResult(
            total_files=total_files,
            completed=completed,
            infected_count=infected_count,
            clean_count=clean_count,
            error_count=error_count,
            scan_time=scan_time,
            results=results,
            errors=errors
        )

    async def scan_files_by_pattern(self, directory: str, pattern: str = "*") -> BatchScanResult:
        """
        Scan files in a directory matching a pattern.

        Args:
            directory: Directory path to scan
            pattern: File pattern (e.g., "*.pdf", "*.exe")

        Returns:
            BatchScanResult with scan results
        """
        import glob

        if not os.path.exists(directory):
            raise ValueError(f"Directory does not exist: {directory}")

        # find matching files
        search_pattern = os.path.join(directory, pattern)
        file_paths = glob.glob(search_pattern, recursive=True)

        if not file_paths:
            return BatchScanResult(
                total_files=0, completed=0, infected_count=0,
                clean_count=0, error_count=0, scan_time=0.0,
                results=[], errors=[]
            )

        # read file contents
        files_data = []
        for file_path in file_paths:
            try:
                if os.path.getsize(file_path) > self.max_file_size:
                    logger.warning(f"Skipping large file: {file_path}")
                    continue

                with open(file_path, 'rb') as f:
                    content = f.read()
                    filename = os.path.basename(file_path)
                    files_data.append((content, filename))
            except Exception as e:
                logger.error(f"Error reading file {file_path}: {e}")

        return await self.scan_multiple_files(files_data)

    async def scan_by_file_types(self, directory: str, file_types: List[str],
                               recursive: bool = True, fastapi_request=None) -> BatchScanResult:
        """
        Scan files in a directory by multiple file type categories.

        Args:
            directory: Directory path to scan
            file_types: List of file type categories to scan
            recursive: Whether to scan subdirectories

        Returns:
            BatchScanResult with scan results
        """
        import glob

        if not os.path.exists(directory):
            raise ValueError(f"Directory does not exist: {directory}")

        all_files = set()  # Use set to avoid duplicates

        for file_type in file_types:
            patterns = FileTypeCategories.get_patterns_for_category(file_type)

            for pattern in patterns:
                if recursive:
                    search_pattern = os.path.join(directory, "**", pattern)
                    files = glob.glob(search_pattern, recursive=True)
                else:
                    search_pattern = os.path.join(directory, pattern)
                    files = glob.glob(search_pattern)

                # Filter to only include actual files
                for file_path in files:
                    if os.path.isfile(file_path):
                        all_files.add(file_path)

        # Special handling for "no-extension" category
        if "no-extension" in file_types:
            # Filter to files without extensions
            all_files = {f for f in all_files if not os.path.splitext(f)[1]}

        if not all_files:
            return BatchScanResult(
                total_files=0, completed=0, infected_count=0,
                clean_count=0, error_count=0, scan_time=0.0,
                results=[], errors=[]
            )

        # Read file contents
        files_data = []
        for file_path in all_files:
            # Check for cancellation
            if fastapi_request and hasattr(fastapi_request, "is_disconnected") and await fastapi_request.is_disconnected():
                logger.warning("Scan aborted by client disconnect.")
                break
            try:
                if os.path.getsize(file_path) > self.max_file_size:
                    logger.warning(f"Skipping large file: {file_path}")
                    continue

                with open(file_path, 'rb') as f:
                    content = f.read()
                    filename = os.path.basename(file_path)
                    # Include file type info
                    file_ext = os.path.splitext(filename)[1].lower()
                    file_category = FileTypeCategories.get_category_for_extension(file_ext)
                    files_data.append((content, f"{filename} [{file_category}]", file_path))
            except Exception as e:
                logger.error(f"Error reading file {file_path}: {e}")

        return await self.scan_multiple_files(files_data)


class FileTypeCategories:
    """File type categories for comprehensive scanning"""

    EXECUTABLES = {
        'windows': ['.exe', '.msi', '.bat', '.cmd', '.com', '.scr', '.pif', '.dll', '.sys'],
        'linux': ['.sh', '.bin', '.run', '.AppImage', '.deb', '.rpm', '.snap'],
        'macos': ['.app', '.dmg', '.pkg', '.command'],
        'scripts': ['.py', '.pl', '.rb', '.php', '.js', '.vbs', '.ps1', '.bash', '.zsh', '.fish', '.csh']
    }

    ARCHIVES = ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz', '.tar.gz', '.tar.bz2', '.tar.xz', '.lz4', '.zst']

    DOCUMENTS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.odt', '.ods', '.odp', '.rtf', '.txt']

    MEDIA = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.svg', '.mp3', '.mp4', '.avi', '.mkv', '.wav', '.flac', '.webm', '.mov']

    SOURCE_CODE = ['.c', '.cpp', '.h', '.hpp', '.java', '.cs', '.go', '.rs', '.swift', '.kt', '.scala', '.html', '.css', '.xml', '.json', '.yaml', '.yml', '.ini', '.cfg', '.conf']

    SUSPICIOUS = ['.tmp', '.temp', '.log', '.bak', '.old', '.swp', '.~', '.cache', '.lock']

    @classmethod
    def get_patterns_for_category(cls, category: str) -> List[str]:
        """Get file patterns for a specific category"""
        patterns = []

        if category == "all":
            patterns = ["*"]
        elif category == "executables":
            for exec_types in cls.EXECUTABLES.values():
                patterns.extend([f"*{ext}" for ext in exec_types])
        elif category == "windows-executables":
            patterns = [f"*{ext}" for ext in cls.EXECUTABLES['windows']]
        elif category == "linux-executables":
            patterns = [f"*{ext}" for ext in cls.EXECUTABLES['linux']]
        elif category == "macos-executables":
            patterns = [f"*{ext}" for ext in cls.EXECUTABLES['macos']]
        elif category == "scripts":
            patterns = [f"*{ext}" for ext in cls.EXECUTABLES['scripts']]
        elif category == "archives":
            patterns = [f"*{ext}" for ext in cls.ARCHIVES]
        elif category == "documents":
            patterns = [f"*{ext}" for ext in cls.DOCUMENTS]
        elif category == "media":
            patterns = [f"*{ext}" for ext in cls.MEDIA]
        elif category == "source-code":
            patterns = [f"*{ext}" for ext in cls.SOURCE_CODE]
        elif category == "suspicious":
            patterns = [f"*{ext}" for ext in cls.SUSPICIOUS]
        elif category == "no-extension":
            patterns = ["*"]  # Will be filtered later
        else:
            patterns = [category]  # Custom pattern

        return patterns

    @classmethod
    def get_category_for_extension(cls, ext: str) -> str:
        """Get category name for a file extension"""
        ext = ext.lower()

        for exec_type, exts in cls.EXECUTABLES.items():
            if ext in exts:
                return f"executable-{exec_type}"

        if ext in cls.ARCHIVES:
            return "archive"
        elif ext in cls.DOCUMENTS:
            return "document"
        elif ext in cls.MEDIA:
            return "media"
        elif ext in cls.SOURCE_CODE:
            return "source-code"
        elif ext in cls.SUSPICIOUS:
            return "suspicious"
        elif not ext:
            return "no-extension"
        else:
            return "unknown"

    @classmethod
    def get_available_categories(cls) -> Dict[str, str]:
        """Get all available file type categories with descriptions"""
        return {
            "all": "All files in directory",
            "executables": "All executable files (Windows, Linux, macOS, Scripts)",
            "windows-executables": "Windows executables (.exe, .msi, .bat, .dll, etc.)",
            "linux-executables": "Linux executables (.sh, .bin, .run, .deb, etc.)",
            "macos-executables": "macOS executables (.app, .dmg, .pkg, etc.)",
            "scripts": "Script files (.py, .js, .sh, .ps1, etc.)",
            "archives": "Archive files (.zip, .rar, .7z, .tar, etc.)",
            "documents": "Document files (.pdf, .doc, .txt, etc.)",
            "media": "Media files (.jpg, .mp4, .mp3, etc.)",
            "source-code": "Source code files (.c, .java, .html, etc.)",
            "suspicious": "Suspicious files (.tmp, .bak, .cache, etc.)",
            "no-extension": "Files without extensions"
        }


# scanner instance
clamav_scanner = ClamAVScanner()

@router.get("/clamav/status")
async def get_clamav_status():
    """Get ClamAV availability status with user-friendly messages."""
    return {
        "clamav_status": clamav_scanner.status,
        "scanner_config": {
            "max_file_size_mb": clamav_scanner.max_file_size / (1024 * 1024),
            "timeout_seconds": clamav_scanner.timeout,
            "scans_in_history": len(clamav_scanner.scan_history)
        }
    }

@router.post("/clamav/scan")
async def scan_file_with_clamav(file: UploadFile = File(...)):
    """
    Scan a single file with ClamAV if available.
    Returns helpful error messages if ClamAV is not properly set up.
    """

    # check if clam is available first
    if not clamav_scanner.status["available"]:
        raise HTTPException(
            status_code=503,
            detail={
                "error": "ClamAV not available",
                "reason": clamav_scanner.status["reason"],
                "message": clamav_scanner.status["message"],
                "help": clamav_scanner.status.get("installation_help") or clamav_scanner.status.get("troubleshooting"),
                "feature_disabled": True
            }
        )

    try:
        # handle potential none filename
        filename = file.filename or "unknown_file"
        file_content = await file.read()

        # hashing
        file_hash = hash_sha256_bytes(file_content)

        result = await clamav_scanner.scan_file_content(file_content, filename)

        if not result["success"]:
            raise HTTPException(status_code=500, detail=result)

        return {
            "file_info": {
                "filename": filename,
                "size_bytes": len(file_content),
                "size_mb": round(len(file_content) / (1024 * 1024), 2),
                "sha256": file_hash
            },
            "scan_result": result,
            "recommendations": _generate_recommendations(result)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File processing error: {str(e)}")

@router.post("/clamav/scan-multiple")
async def scan_multiple_files_endpoint(files: List[UploadFile] = File(...)):
    """
    Scan multiple files with ClamAV concurrently.
    Returns batch scan results with individual file results.
    """

    # check if clamav is available first
    if not clamav_scanner.status["available"]:
        raise HTTPException(
            status_code=503,
            detail={
                "error": "ClamAV not available",
                "reason": clamav_scanner.status["reason"],
                "message": clamav_scanner.status["message"],
                "help": clamav_scanner.status.get("installation_help") or clamav_scanner.status.get("troubleshooting"),
                "feature_disabled": True
            }
        )

    if len(files) > 20:  # limit to prevent abuse
        raise HTTPException(
            status_code=400,
            detail="Too many files. Maximum 20 files per batch scan."
        )

    try:
        # prepare file data
        files_data = []
        file_info = []

        for file in files:
            filename = file.filename or "unknown_file"
            file_content = await file.read()

            # validate file size
            if len(file_content) > clamav_scanner.max_file_size:
                raise HTTPException(
                    status_code=413,
                    detail=f"File {filename} exceeds maximum size limit"
                )

            files_data.append((file_content, filename))
            file_info.append({
                "filename": filename,
                "size_bytes": len(file_content),
                "size_mb": round(len(file_content) / (1024 * 1024), 2),
                "sha256": hash_sha256_bytes(file_content)
            })

        # perform batch scan
        batch_result = await clamav_scanner.scan_multiple_files(files_data)

        return {
            "batch_summary": {
                "total_files": batch_result.total_files,
                "completed": batch_result.completed,
                "infected_count": batch_result.infected_count,
                "clean_count": batch_result.clean_count,
                "error_count": batch_result.error_count,
                "scan_time": round(batch_result.scan_time, 2),
                "average_time_per_file": round(batch_result.scan_time / max(batch_result.completed, 1), 3)
            },
            "files_info": file_info,
            "scan_results": batch_result.results,
            "errors": batch_result.errors,
            "recommendations": [
                _generate_recommendations(result) for result in batch_result.results
            ]
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch scan error: {str(e)}")

@router.post("/clamav/scan-directory")
async def scan_directory_endpoint(directory: str, pattern: str = "*"):
    """
    Scan files in a directory matching a pattern.
    """

    # check if clamav is available
    if not clamav_scanner.status["available"]:
        raise HTTPException(
            status_code=503,
            detail={
                "error": "ClamAV not available",
                "message": clamav_scanner.status["message"],
                "feature_disabled": True
            }
        )

    try:
        batch_result = await clamav_scanner.scan_files_by_pattern(directory, pattern)

        # Append each scan result to scan_history for dashboard/history
        for scan_record in batch_result.results:
            clamav_scanner.scan_history.append(scan_record)
        clamav_scanner._trim_scan_history()
        clamav_scanner.save_history_to_file()

        return {
            "directory": directory,
            "pattern": pattern,
            "batch_summary": {
                "total_files": batch_result.total_files,
                "completed": batch_result.completed,
                "infected_count": batch_result.infected_count,
                "clean_count": batch_result.clean_count,
                "error_count": batch_result.error_count,
                "scan_time": round(batch_result.scan_time, 2)
            },
            "scan_results": batch_result.results,
            "errors": batch_result.errors
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Directory scan error: {str(e)}")

@router.get("/clamav/file-types")
async def get_available_file_types():
    """Get all available file type categories for scanning."""
    return {
        "categories": FileTypeCategories.get_available_categories(),
        "examples": {
            "windows_executables": FileTypeCategories.EXECUTABLES['windows'][:5],
            "linux_executables": FileTypeCategories.EXECUTABLES['linux'][:5],
            "scripts": FileTypeCategories.EXECUTABLES['scripts'][:5],
            "archives": FileTypeCategories.ARCHIVES[:5],
            "documents": FileTypeCategories.DOCUMENTS[:5]
        }
    }

from fastapi import Request

@router.post("/clamav/scan-by-types")
async def scan_directory_by_file_types(request: DirectoryScanRequest, fastapi_request: Request):
    """
    Scan directory by specific file type categories.

    Args:
        request: DirectoryScanRequest containing directory, file_types, and recursive flag
        fastapi_request: FastAPI Request object for cancellation support
    """

    # Check if ClamAV is available
    if not clamav_scanner.status["available"]:
        raise HTTPException(
            status_code=503,
            detail={
                "error": "ClamAV not available",
                "reason": clamav_scanner.status["reason"],
                "message": clamav_scanner.status["message"],
                "help": clamav_scanner.status.get("installation_help") or clamav_scanner.status.get("troubleshooting"),
                "feature_disabled": True
            }
        )

    # Validate file types
    available_categories = FileTypeCategories.get_available_categories()
    invalid_types = [ft for ft in request.file_types if ft not in available_categories]
    if invalid_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file types: {invalid_types}. Available types: {list(available_categories.keys())}"
        )

    try:
        batch_result = await clamav_scanner.scan_by_file_types(
            request.directory, request.file_types, request.recursive, fastapi_request
        )

        return {
            "directory": request.directory,
            "file_types": request.file_types,
            "recursive": request.recursive,
            "batch_summary": {
                "total_files": batch_result.total_files,
                "completed": batch_result.completed,
                "infected_count": batch_result.infected_count,
                "clean_count": batch_result.clean_count,
                "error_count": batch_result.error_count,
                "scan_time": round(batch_result.scan_time, 2),
                "average_time_per_file": round(batch_result.scan_time / max(batch_result.completed, 1), 3)
            },
            "scan_results": batch_result.results,
            "errors": batch_result.errors,
            "file_type_breakdown": _get_file_type_breakdown(batch_result.results),
            "recommendations": [
                _generate_recommendations(result) for result in batch_result.results if result.get('infected')
            ]
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File type scan error: {str(e)}")

@router.get("/clamav/scan-history")
async def get_scan_history():
    """Get recent scan history if ClamAV is available."""
    if not clamav_scanner.status["available"]:
        raise HTTPException(
            status_code=503,
            detail={
                "error": "ClamAV not available",
                "message": clamav_scanner.status["message"],
                "feature_disabled": True
            }
        )

    return {"scan_history": clamav_scanner.scan_history[-20:]}  # Last 20 scans

@router.get("/clamav/debug")
async def debug_clamav():
    """Debug endpoint to check ClamAV daemon connectivity."""
    debug_info = {}

    # systemctl status
    try:
        systemctl_result = subprocess.run(['systemctl', 'is-active', 'clamav-daemon.service'],
                                        capture_output=True, text=True)
        debug_info["systemctl_status"] = {
            "returncode": systemctl_result.returncode,
            "stdout": systemctl_result.stdout.strip(),
            "stderr": systemctl_result.stderr.strip()
        }
    except Exception as e:
        debug_info["systemctl_status"] = {"error": str(e)}

    # clamdscan availability
    try:
        clamdscan_version = subprocess.run(['clamdscan', '--version'],
                                         capture_output=True, text=True, timeout=5)
        debug_info["clamdscan_version"] = {
            "returncode": clamdscan_version.returncode,
            "stdout": clamdscan_version.stdout.strip(),
            "stderr": clamdscan_version.stderr.strip()
        }
    except Exception as e:
        debug_info["clamdscan_version"] = {"error": str(e)}

    # daemon ping
    try:
        ping_result = subprocess.run(['clamdscan', '--ping=1'],
                                   capture_output=True, text=True, timeout=5)
        debug_info["daemon_ping"] = {
            "returncode": ping_result.returncode,
            "stdout": ping_result.stdout.strip(),
            "stderr": ping_result.stderr.strip()
        }
    except Exception as e:
        debug_info["daemon_ping"] = {"error": str(e)}

    # direct socket connection
    try:
        socket_test = subprocess.run(['clamdscan', '/dev/null'],
                                   capture_output=True, text=True, timeout=10)
        debug_info["socket_test"] = {
            "returncode": socket_test.returncode,
            "stdout": socket_test.stdout.strip(),
            "stderr": socket_test.stderr.strip()
        }
    except Exception as e:
        debug_info["socket_test"] = {"error": str(e)}

    return {
        "current_status": clamav_scanner.status,
        "debug_tests": debug_info
    }



def _generate_recommendations(result: Dict[str, Any]) -> Dict[str, Any]:
    """Generate recommendations based on scan results."""
    if result.get("infected"):
        return {
            "action": "quarantine",
            "severity": "high",
            "message": f"THREAT DETECTED: {result.get('threat', 'Unknown malware')}",
            "recommendations": [
                "Do not open or execute this file",
                "Move file to quarantine immediately",
                "Scan your system for additional threats",
                "Report to security team if in enterprise environment"
            ]
        }
    else:
        return {
            "action": "allow",
            "severity": "none",
            "message": "File appears clean",
            "recommendations": [
                "File passed malware scan",
                "Safe to process based on current signatures"
            ]
        }

def _get_file_type_breakdown(results: List[Dict[str, Any]]) -> Dict[str, Dict[str, int]]:
    """Get breakdown of scan results by file type."""
    breakdown = {}

    for result in results:
        filename = result.get('filename', 'unknown')
        # extract file type from filename if it includes category info [category]
        if '[' in filename and ']' in filename:
            file_type = filename.split('[')[-1].split(']')[0]
        else:
            # determine file type from extension
            ext = os.path.splitext(filename)[1].lower()
            file_type = FileTypeCategories.get_category_for_extension(ext)

        if file_type not in breakdown:
            breakdown[file_type] = {"total": 0, "clean": 0, "infected": 0}

        breakdown[file_type]["total"] += 1
        if result.get('infected'):
            breakdown[file_type]["infected"] += 1
        else:
            breakdown[file_type]["clean"] += 1

    return breakdown
