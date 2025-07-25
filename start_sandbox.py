#!/usr/bin/env python3
"""
Simple startup script for CyberSafe Interactive Sandbox
"""

import os
import sys
import subprocess
import webbrowser
import time
from pathlib import Path

def main():
    print("🛡️  Starting CyberSafe Interactive Sandbox...")

    # Change to the backend/app directory
    backend_dir = Path(__file__).parent / "backend"
    app_dir = backend_dir / "app"

    if not app_dir.exists():
        print(f"❌ App directory not found: {app_dir}")
        return 1

    print(f"📁 Working directory: {app_dir}")

    # Start the server
    try:
        cmd = [
            sys.executable, "-m", "uvicorn",
            "main:app",
            "--host=127.0.0.1",
            "--port=8000",
            "--reload"
        ]

        print("🚀 Starting server...")
        print(f"   Command: {' '.join(cmd)}")
        print(f"   API: http://127.0.0.1:8000/docs")
        print(f"   Test Page: http://127.0.0.1:8000/static/test.html")
        print(f"   Interactive UI: http://127.0.0.1:8000/static/sandbox_interactive.html")
        print()
        print("Press Ctrl+C to stop the server")
        print("-" * 50)

        # Open browser after a delay
        def open_browser():
            time.sleep(3)
            webbrowser.open("http://127.0.0.1:8000/static/test.html")

        import threading
        threading.Thread(target=open_browser, daemon=True).start()

        # Start server
        subprocess.run(cmd, cwd=str(app_dir))

    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1

    return 0

if __name__ == "__main__":
    sys.exit(main())
