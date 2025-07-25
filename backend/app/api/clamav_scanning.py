from fastapi import APIRouter, File, UploadFile, HTTPException
from typing import Dict, Any, Optional
from dataclasses import dataclass
import subprocess
import tempfile
import os
import logging
import socket
import struct
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

class ClamAVError(Exception):
    """Base exception for ClamAV operations."""
    pass

class ClamAVNotAvailableError(ClamAVError):
    """Raised when ClamAV is not available."""
    pass

class ClamAVScanner:
    def __init__(self):
        self.status = self._check_clamav_availability()
        self.scan_history = []
        self.max_file_size = 50 * 1024 * 1024  # 50mb limit
        self.timeout = 30

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

    async def scan_file_content(self, file_content: bytes, filename: str) -> Dict[str, Any]:
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

            return {
                "success": True,
                "infected": infected,
                "threat": threat_name,
                "scan_time": scan_time,
                "file_size": len(file_content),
                "hash": file_hash,
                "timestamp": start_time.isoformat(),
                "scan_mode": self.status["mode"],
                "message": "File scanned successfully"
            }

        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "error": "Scan timeout",
                "message": f"Scan timed out after {self.timeout} seconds"
            }
        except Exception as e:
            return await self._handle_scan_error(e, file_content, filename, start_time, file_hash)

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
                                filename: str, start_time: datetime, file_hash: str) -> Dict[str, Any]:
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

                return {
                    "success": True,
                    "infected": infected,
                    "threat": threat_name,
                    "scan_time": scan_time,
                    "file_size": len(file_content),
                    "hash": file_hash,
                    "timestamp": start_time.isoformat(),
                    "scan_mode": "standalone_fallback",
                    "message": "File scanned successfully (fallback mode)"
                }

            except Exception as fallback_error:
                logger.error(f"Both daemon and standalone scanning failed: {fallback_error}")
                return {
                    "success": False,
                    "error": "Scan failed",
                    "message": f"Both daemon and standalone scanning failed: {str(fallback_error)}"
                }
        else:
            return {
                "success": False,
                "error": "Scan error",
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
