#!/usr/bin/env python3
"""
CyberSafe Backend Build Script

This script builds the FastAPI backend into a standalone executable using PyInstaller.
The executable will be placed in the frontend/backend directory for Electron packaging.
"""

import os
import subprocess
import sys
import shutil
import platform
from pathlib import Path


def get_executable_name():
    """Get the appropriate executable name for the current platform."""
    if platform.system() == "Windows":
        return "CyberSafeBackend.exe"
    return "CyberSafeBackend"


def clean_build_artifacts():
    """Clean previous build artifacts."""
    artifacts = ["dist", "build", "__pycache__", "*.spec"]

    for artifact in artifacts:
        if artifact == "*.spec":
            # Remove any existing spec files
            for spec_file in Path(".").glob("*.spec"):
                print(f"🗑️  Removing old spec file: {spec_file}")
                spec_file.unlink()
        else:
            if os.path.exists(artifact):
                print(f"🗑️  Cleaning {artifact}/")
                shutil.rmtree(artifact)


def ensure_dependencies():
    """Ensure PyInstaller is installed."""
    try:
        import PyInstaller
        print(f"✅ PyInstaller {PyInstaller.__version__} is available")
    except ImportError:
        print("❌ PyInstaller not found. Installing...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pyinstaller"])
        print("✅ PyInstaller installed successfully")


def create_output_directory():
    """Create the output directory for the executable."""
    output_dir = Path("../frontend/backend")
    output_dir.mkdir(parents=True, exist_ok=True)
    print(f"📁 Output directory: {output_dir.absolute()}")
    return output_dir


def build_executable():
    """Build the backend executable using PyInstaller."""
    print("🏗️  Building CyberSafe Backend...")

    output_dir = create_output_directory()
    executable_name = get_executable_name()

    # PyInstaller command with comprehensive options
    cmd = [
        "pyinstaller",
        "--onefile",                                # Single executable file
        "--name", "CyberSafeBackend",              # Output name
        "--distpath", str(output_dir),             # Output directory
        "--workpath", "./build",                   # Work directory
        "--specpath", ".",                         # Spec file location
        "--clean",                                 # Clean cache
        "--noconfirm",                            # Overwrite existing files
        "--console",                              # Console application
        "--optimize", "2",                        # Python optimization level

        # Hidden imports for FastAPI and uvicorn
        "--hidden-import", "uvicorn.lifespan.on",
        "--hidden-import", "uvicorn.lifespan.off",
        "--hidden-import", "uvicorn.protocols.websockets.auto",
        "--hidden-import", "uvicorn.protocols.http.auto",
        "--hidden-import", "uvicorn.protocols.websockets.websockets_impl",
        "--hidden-import", "uvicorn.protocols.http.h11_impl",
        "--hidden-import", "uvicorn.protocols.http.httptools_impl",
        "--hidden-import", "uvicorn.loops.auto",
        "--hidden-import", "uvicorn.loops.asyncio",
        "--hidden-import", "uvicorn.loops.uvloop",
        "--hidden-import", "fastapi.openapi.utils",
        "--hidden-import", "fastapi.openapi.docs",
        "--hidden-import", "fastapi.openapi.models",

        # Entry point
        "app/serve.py"
    ]

    # Add platform-specific options
    if platform.system() == "Windows":
        cmd.extend([
            "--version-file", "version_info.txt"  # If you have a version file
        ])
    elif platform.system() == "Darwin":  # macOS
        cmd.extend([
            "--target-arch", "universal2"  # Support both Intel and Apple Silicon
        ])

    try:
        print(f"🔨 Running: {' '.join(cmd)}")
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)

        # Check if executable was created successfully
        executable_path = output_dir / executable_name
        if executable_path.exists():
            file_size = executable_path.stat().st_size / (1024 * 1024)  # Size in MB
            print(f"✅ Backend built successfully!")
            print(f"📦 Executable: {executable_path}")
            print(f"📏 Size: {file_size:.1f} MB")

            # Make executable on Unix-like systems
            if platform.system() != "Windows":
                os.chmod(executable_path, 0o755)
                print("🔐 Set executable permissions")

            return True
        else:
            print(f"❌ Executable not found at expected location: {executable_path}")
            return False

    except subprocess.CalledProcessError as e:
        print(f"❌ Build failed with exit code {e.returncode}")
        print(f"Error output:\n{e.stderr}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error during build: {e}")
        return False


def test_executable():
    """Test the built executable."""
    output_dir = Path("../frontend/backend")
    executable_name = get_executable_name()
    executable_path = output_dir / executable_name

    if not executable_path.exists():
        print("❌ Executable not found for testing")
        return False

    print("🧪 Testing executable...")

    try:
        # Start the executable and check if it responds
        import signal
        import time

        # Start the process
        process = subprocess.Popen([str(executable_path)],
                                 stdout=subprocess.PIPE,
                                 stderr=subprocess.PIPE)

        # Give it time to start
        time.sleep(3)

        if process.poll() is None:  # Process is still running
            print("✅ Executable started successfully")

            # Try to make a simple request to verify it's working
            try:
                import requests
                response = requests.get("http://127.0.0.1:8000/docs", timeout=5)
                if response.status_code == 200:
                    print("✅ Backend API is responding correctly")
                else:
                    print(f"⚠️  Backend started but returned status code: {response.status_code}")
            except ImportError:
                print("ℹ️  requests not available for API testing, but executable started")
            except Exception as e:
                print(f"⚠️  Could not verify API response: {e}")

            # Terminate the test process
            process.terminate()
            process.wait(timeout=5)
            return True
        else:
            stdout, stderr = process.communicate()
            print(f"❌ Executable failed to start")
            print(f"stdout: {stdout.decode()}")
            print(f"stderr: {stderr.decode()}")
            return False

    except Exception as e:
        print(f"❌ Error testing executable: {e}")
        return False


def main():
    """Main build process."""
    print("🚀 CyberSafe Backend Build Process Starting...")
    print(f"🖥️  Platform: {platform.system()} {platform.machine()}")
    print(f"🐍 Python: {sys.version}")

    # Ensure we're in the backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    print(f"📂 Working directory: {backend_dir.absolute()}")

    try:
        # Step 1: Clean previous builds
        print("\n📋 Step 1: Cleaning previous builds...")
        clean_build_artifacts()

        # Step 2: Ensure dependencies
        print("\n📋 Step 2: Checking dependencies...")
        ensure_dependencies()

        # Step 3: Build executable
        print("\n📋 Step 3: Building executable...")
        success = build_executable()

        if not success:
            print("\n❌ Build process failed!")
            sys.exit(1)

        # Step 4: Test executable
        print("\n📋 Step 4: Testing executable...")
        test_success = test_executable()

        if test_success:
            print("\n🎉 Build process completed successfully!")
            print("\nNext steps:")
            print("1. Run 'npm run build' in the frontend directory")
            print("2. Run 'npm run dist' to create the distributable package")
        else:
            print("\n⚠️  Build completed but executable test failed")
            print("The executable was created but may not work correctly")

    except KeyboardInterrupt:
        print("\n\n⏹️  Build process interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
