from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, HttpUrl
from typing import Dict, Any, Optional, List, Union
import subprocess
import os
import shutil
import asyncio
import logging
from datetime import datetime
import uuid
import zipfile
import tarfile
from urllib.parse import urlparse

logger = logging.getLogger(__name__)
router = APIRouter()

class SandboxRequest(BaseModel):
    """Base model for sandbox requests"""
    sandbox_type: str
    source: Union[str, HttpUrl]
    execution_command: Optional[str] = None
    firejail_options: List[str] = []
    timeout_minutes: int = 10
    scan_before_execution: bool = True
    allow_network: bool = False
    resource_limits: Optional[Dict[str, Any]] = None

class SandboxSession:
    # manage a sandbox session

    def __init__(self, session_id: str, request: SandboxRequest):
        self.session_id = session_id
        self.request = request
        self.status = "initializing"
        self.sandbox_dir: Optional[str] = None
        self.process: Optional[asyncio.subprocess.Process] = None
        self.start_time = datetime.now()
        self.logs: List[Dict[str, str]] = []
        self.scan_results: Optional[List[Dict[str, Any]]] = None

    def log(self, message: str, level: str = "info"):
        # logs
        timestamp = datetime.now().isoformat()
        log_entry = {
            "timestamp": timestamp,
            "level": level,
            "message": message
        }
        self.logs.append(log_entry)
        logger.info(f"[{self.session_id}] {message}")

class SandboxManager:
    # manages sandbox sessions and operations

    def __init__(self):
        self.sessions: Dict[str, SandboxSession] = {}
        self.base_sandbox_dir = "/tmp/cybersafe_sandboxes"
        os.makedirs(self.base_sandbox_dir, exist_ok=True)

    def create_session(self, request: SandboxRequest) -> str:
        # new sandbox session
        session_id = str(uuid.uuid4())
        session = SandboxSession(session_id, request)
        self.sessions[session_id] = session
        return session_id

    def get_session(self, session_id: str) -> Optional[SandboxSession]:
        # fetch a session
        return self.sessions.get(session_id)

    def cleanup_session(self, session_id: str):
        # cleanup :3
        session = self.sessions.get(session_id)
        if session:
            if session.process and session.process.returncode is None:
                session.process.terminate()
            if session.sandbox_dir and os.path.exists(session.sandbox_dir):
                shutil.rmtree(session.sandbox_dir, ignore_errors=True)
            del self.sessions[session_id]

    def check_firejail_available(self) -> Dict[str, Any]:
        # check for firejail and classic --version
        try:
            result = subprocess.run(
                ["firejail", "--version"],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                return {
                    "available": True,
                    "version": result.stdout.strip(),
                    "message": "Firejail is available"
                }
            else:
                return {
                    "available": False,
                    "message": "Firejail command failed",
                    "error": result.stderr
                }
        except FileNotFoundError:
            return {
                "available": False,
                "message": "Firejail not installed",
                "installation_help": "Install with: sudo apt install firejail (Ubuntu/Debian) sudo dnf install firejail (Fedora), or sudo pacman -S firejail (Arch Linux)"
            }
        except Exception as e:
            return {
                "available": False,
                "message": f"Error checking firejail: {str(e)}"
            }

    async def download_content(self, session: SandboxSession) -> bool:
        # download content based on type
        try:
            sandbox_dir = os.path.join(self.base_sandbox_dir, session.session_id)
            os.makedirs(sandbox_dir, exist_ok=True)
            session.sandbox_dir = sandbox_dir

            source = str(session.request.source)
            sandbox_type = session.request.sandbox_type

            session.log(f"Downloading {sandbox_type} from {source}")

            if sandbox_type == "repository":
                return await self._download_repository(session, source)
            elif sandbox_type == "download":
                return await self._download_archive(session, source)
            elif sandbox_type == "program":
                return await self._download_program(session, source)
            elif sandbox_type == "app":
                return await self._download_app(session, source)
            else:
                session.log(f"Unknown sandbox type: {sandbox_type}", "error")
                return False

        except Exception as e:
            session.log(f"Download failed: {str(e)}", "error")
            return False

    async def _download_repository(self, session: SandboxSession, repo_url: str) -> bool:
        # download git repo
        try:
            # git?
            subprocess.run(["git", "--version"], capture_output=True, check=True)

            if not session.sandbox_dir:
                session.log("Sandbox directory not set", "error")
                return False

            session.log("Cloning repository...")
            result = await asyncio.create_subprocess_exec(
                "git", "clone", "--depth", "1", repo_url, "repo",
                cwd=session.sandbox_dir,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )

            stdout, stderr = await result.communicate()

            if result.returncode == 0:
                session.log("Repository cloned successfully")
                return True
            else:
                session.log(f"Git clone failed: {stderr.decode()}", "error")
                return False

        except subprocess.CalledProcessError:
            session.log("Git not available", "error")
            return False
        except Exception as e:
            session.log(f"Repository download failed: {str(e)}", "error")
            return False

    async def _download_program(self, session: SandboxSession, program_url: str) -> bool:
        # download program/script
        try:
            import aiohttp

            if not session.sandbox_dir:
                session.log("Sandbox directory not set", "error")
                return False

            async with aiohttp.ClientSession() as client_session:
                async with client_session.get(program_url) as response:
                    if response.status == 200:
                        content = await response.read()

                        # determine filename from URL or content type
                        parsed_url = urlparse(program_url)
                        filename = os.path.basename(parsed_url.path) or "downloaded_program"

                        filepath = os.path.join(session.sandbox_dir, filename)

                        with open(filepath, 'wb') as f:
                            f.write(content)

                        # exe if script
                        os.chmod(filepath, 0o755)

                        session.log(f"Program downloaded as {filename}")
                        return True
                    else:
                        session.log(f"Download failed: HTTP {response.status}", "error")
                        return False

        except Exception as e:
            session.log(f"Program download failed: {str(e)}", "error")
            return False

    async def _download_archive(self, session: SandboxSession, archive_url: str) -> bool:
        # download archive
        try:
            import aiohttp

            if not session.sandbox_dir:
                session.log("Sandbox directory not set", "error")
                return False

            async with aiohttp.ClientSession() as client_session:
                async with client_session.get(archive_url) as response:
                    if response.status == 200:
                        content = await response.read()

                        # determine archive type from URL
                        parsed_url = urlparse(archive_url)
                        filename = os.path.basename(parsed_url.path)

                        archive_path = os.path.join(session.sandbox_dir, filename)

                        with open(archive_path, 'wb') as f:
                            f.write(content)

                        # extract archive
                        extract_dir = os.path.join(session.sandbox_dir, "extracted")
                        os.makedirs(extract_dir, exist_ok=True)

                        if filename.endswith(('.zip', '.jar')):
                            with zipfile.ZipFile(archive_path, 'r') as zip_ref:
                                zip_ref.extractall(extract_dir)
                        elif filename.endswith(('.tar.gz', '.tgz', '.tar.bz2', '.tar.xz')):
                            with tarfile.open(archive_path, 'r:*') as tar_ref:
                                tar_ref.extractall(extract_dir)
                        else:
                            session.log(f"Unsupported archive format: {filename}", "error")
                            return False

                        session.log(f"Archive {filename} extracted successfully")
                        return True
                    else:
                        session.log(f"Download failed: HTTP {response.status}", "error")
                        return False

        except Exception as e:
            session.log(f"Archive download failed: {str(e)}", "error")
            return False

    async def _download_app(self, session: SandboxSession, app_url: str) -> bool:
        # download application
        try:
            import aiohttp

            if not session.sandbox_dir:
                session.log("Sandbox directory not set", "error")
                return False

            async with aiohttp.ClientSession() as client_session:
                async with client_session.get(app_url) as response:
                    if response.status == 200:
                        content = await response.read()

                        parsed_url = urlparse(app_url)
                        filename = os.path.basename(parsed_url.path) or "downloaded_app"

                        filepath = os.path.join(session.sandbox_dir, filename)

                        with open(filepath, 'wb') as f:
                            f.write(content)

                        # make exe for AppImage
                        if filename.endswith('.AppImage'):
                            os.chmod(filepath, 0o755)

                        session.log(f"App downloaded as {filename}")
                        return True
                    else:
                        session.log(f"Download failed: HTTP {response.status}", "error")
                        return False

        except Exception as e:
            session.log(f"App download failed: {str(e)}", "error")
            return False

    async def scan_content(self, session: SandboxSession) -> bool:
        # clamav doing its job
        if not session.request.scan_before_execution:
            session.log("Skipping malware scan (disabled by user)")
            return True

        try:
            # invite clamav to the party
            from .clamav_scanning import clamav_scanner

            if not clamav_scanner.status["available"]:
                session.log("ClamAV not available, skipping scan", "warning")
                return True

            if not session.sandbox_dir:
                session.log("Sandbox directory not set", "error")
                return False

            session.log("Starting malware scan...")

            # scan sandbox dir
            scan_results = []
            for root, dirs, files in os.walk(session.sandbox_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, 'rb') as f:
                            content = f.read()

                        result = await clamav_scanner.scan_file_content(content, file, file_path)
                        scan_results.append(result)

                        if result.get("infected"):
                            session.log(f"THREAT DETECTED: {file_path} - {result.get('threat')}", "error")
                            return False

                    except Exception as e:
                        session.log(f"Error scanning {file_path}: {str(e)}", "warning")

            session.scan_results = scan_results
            session.log(f"Malware scan completed: {len(scan_results)} files scanned, all clean")
            return True

        except Exception as e:
            session.log(f"Scan error: {str(e)}", "error")
            return False

    def build_firejail_command(self, session: SandboxSession) -> List[str]:
        # build firejail command
        if not session.sandbox_dir:
            raise ValueError("Sandbox directory not set")

        cmd = ["firejail"]

        cmd.extend([
            "--private",  # Private home directory
            "--private-tmp",  # Private /tmp
            "--private-dev",  # Private /dev
            "--noroot",  # No root privileges
            "--seccomp",  # System call filtering
            "--caps.drop=all",  # Drop all capabilities
        ])

        if not session.request.allow_network:
            cmd.append("--net=none")

        if session.request.resource_limits:
            limits = session.request.resource_limits
            if "memory" in limits:
                cmd.append(f"--rlimit-fsize={limits['memory']}")
            if "cpu" in limits:
                cmd.append(f"--cpu={limits['cpu']}")

        cmd.extend(session.request.firejail_options)

        cmd.extend(["--chdir", session.sandbox_dir])

        if session.request.execution_command:
            cmd.extend(["--", "bash", "-c", session.request.execution_command])
        else:
            auto_cmd = self._get_auto_command(session)
            if auto_cmd:
                cmd.extend(["--", "bash", "-c", auto_cmd])
            else:
                cmd.extend(["--", "bash"])  # only shell

        return cmd

    def _get_auto_command(self, session: SandboxSession) -> Optional[str]:
        # detect commad to run
        if not session.sandbox_dir:
            return None

        sandbox_type = session.request.sandbox_type

        if sandbox_type == "repository":
            return self._get_repository_command(session.sandbox_dir)
        elif sandbox_type == "program":
            return self._get_program_command(session.sandbox_dir)
        elif sandbox_type == "app":
            return self._get_app_command(session.sandbox_dir)
        elif sandbox_type == "download":
            return "cd extracted && echo 'Archive extracted. Use ls to explore.'"

        return None

    def _get_repository_command(self, sandbox_dir: str) -> str:
        # detect command to run
        repo_dir = os.path.join(sandbox_dir, "repo")
        if os.path.exists(os.path.join(repo_dir, "main.py")):
            return "cd repo && python3 main.py"
        elif os.path.exists(os.path.join(repo_dir, "app.py")):
            return "cd repo && python3 app.py"
        elif os.path.exists(os.path.join(repo_dir, "run.py")):
            return "cd repo && python3 run.py"
        elif os.path.exists(os.path.join(repo_dir, "Makefile")):
            return "cd repo && make && echo 'Build completed. Check the output.'"
        elif os.path.exists(os.path.join(repo_dir, "package.json")):
            return "cd repo && npm install && npm start"
        else:
            return "cd repo && echo 'Repository downloaded. Use ls to explore.'"

    def _get_program_command(self, sandbox_dir: str) -> Optional[str]:
        try:
            files = os.listdir(sandbox_dir)
            if files:
                program = files[0]
                if program.endswith('.py'):
                    return f"python3 {program}"
                elif program.endswith(('.sh', '.bash')):
                    return f"bash {program}"
                else:
                    return f"./{program}"
        except OSError:
            # dir refused to exist
            pass
        return None

    def _get_app_command(self, sandbox_dir: str) -> Optional[str]:
        # get command for app type
        files = os.listdir(sandbox_dir)
        for file in files:
            if file.endswith('.AppImage'):
                return f"./{file}"
            elif file.endswith('.deb'):
                return f"echo 'DEB package downloaded: {file}. Cannot install in sandbox.'"
        return None

sandbox_manager = SandboxManager()

# API Endpoints

@router.get("/sandbox/status")
async def get_sandbox_status():
    firejail_status = sandbox_manager.check_firejail_available()

    return {
        "firejail": firejail_status,
        "active_sessions": len(sandbox_manager.sessions),
        "base_directory": sandbox_manager.base_sandbox_dir,
        "supported_types": ["program", "repository", "download", "app"]
    }

@router.post("/sandbox/create")
async def create_sandbox(request: SandboxRequest, background_tasks: BackgroundTasks):
    firejail_status = sandbox_manager.check_firejail_available()
    if not firejail_status["available"]:
        raise HTTPException(
            status_code=503,
            detail={
                "error": "Firejail not available",
                "message": firejail_status["message"],
                "help": firejail_status.get("installation_help")
            }
        )

    session_id = sandbox_manager.create_session(request)
    session = sandbox_manager.get_session(session_id)

    if session:
        session.log("Sandbox session created")

        background_tasks.add_task(prepare_sandbox, session_id)

    return {
        "session_id": session_id,
        "status": "created",
        "message": "Sandbox session created, preparing content..."
    }

async def prepare_sandbox(session_id: str):
    session = sandbox_manager.get_session(session_id)
    if not session:
        return

    try:
        session.status = "downloading"

        if not await sandbox_manager.download_content(session):
            session.status = "failed"
            session.log("Content download failed", "error")
            return

        session.status = "scanning"

        if not await sandbox_manager.scan_content(session):
            session.status = "threat_detected"
            session.log("Threats detected, sandbox aborted", "error")
            return

        session.status = "ready"
        session.log("Sandbox prepared and ready for execution")

    except Exception as e:
        session.status = "failed"
        session.log(f"Preparation failed: {str(e)}", "error")

@router.post("/sandbox/{session_id}/execute")
async def execute_sandbox(session_id: str):
    session = sandbox_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.status != "ready":
        raise HTTPException(
            status_code=400,
            detail=f"Session not ready for execution. Status: {session.status}"
        )

    try:
        session.status = "running"
        session.log("Starting execution in sandbox")

        cmd = sandbox_manager.build_firejail_command(session)
        session.log(f"Executing: {' '.join(cmd)}")

        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        session.process = process

        return {
            "session_id": session_id,
            "status": "running",
            "pid": process.pid,
            "command": cmd,
            "message": "Execution started in sandbox"
        }

    except Exception as e:
        session.status = "failed"
        session.log(f"Execution failed: {str(e)}", "error")
        raise HTTPException(status_code=500, detail=f"Execution failed: {str(e)}")

@router.get("/sandbox/{session_id}/status")
async def get_session_status(session_id: str):
    session = sandbox_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    response = {
        "session_id": session_id,
        "status": session.status,
        "start_time": session.start_time.isoformat(),
        "logs": session.logs[-20:],
        "request": session.request.dict()
    }

    if session.process:
        response["process"] = {
            "pid": session.process.pid,
            "running": session.process.returncode is None
        }

    if session.scan_results:
        response["scan_results"] = {
            "files_scanned": len(session.scan_results),
            "threats_found": sum(1 for r in session.scan_results if r.get("infected"))
        }

    return response

@router.get("/sandbox/{session_id}/output")
async def get_session_output(session_id: str):
    session = sandbox_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if not session.process:
        raise HTTPException(status_code=400, detail="No process running")

    try:
        # check for processes
        if session.process.returncode is None:
            # process still running, return current status
            return {
                "session_id": session_id,
                "status": "running",
                "message": "Process still running"
            }
        else:
            # Process finished, get output
            stdout, stderr = await session.process.communicate()

            session.status = "completed"
            session.log("Execution completed")

            return {
                "session_id": session_id,
                "status": "completed",
                "return_code": session.process.returncode,
                "stdout": stdout.decode('utf-8', errors='replace'),
                "stderr": stderr.decode('utf-8', errors='replace')
            }

    except Exception as e:
        session.log(f"Error getting output: {str(e)}", "error")
        raise HTTPException(status_code=500, detail=f"Error getting output: {str(e)}")

@router.delete("/sandbox/{session_id}")
async def cleanup_sandbox(session_id: str):
    session = sandbox_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.log("Cleaning up sandbox session")
    sandbox_manager.cleanup_session(session_id)

    return {
        "session_id": session_id,
        "status": "cleaned_up",
        "message": "Sandbox session cleaned up successfully"
    }

@router.get("/sandbox/sessions")
async def list_sessions():
    sessions = []
    for session_id, session in sandbox_manager.sessions.items():
        sessions.append({
            "session_id": session_id,
            "status": session.status,
            "type": session.request.sandbox_type,
            "source": str(session.request.source),
            "start_time": session.start_time.isoformat(),
            "running": session.process.returncode is None if session.process else False
        })

    return sessions
