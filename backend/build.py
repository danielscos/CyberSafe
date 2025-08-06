#!/usr/bin/env python3
"""
CyberSafe Backend Build Script

This script builds the FastAPI backend into a standalone executable using PyInstaller.
It dynamically finds the required Google library path to ensure the build is portable
and works on any machine. The final executable is placed in the
../frontend/backend directory for Electron packaging.
"""

import os
import subprocess
import sys
import shutil
import platform
from pathlib import Path

# A list of packages required for the project to run and build.
REQUIRED_PACKAGES = [
    "pyinstaller",
    "google-generativeai",
    "python-magic",
    "fastapi",
    "uvicorn",
    "python-dotenv", # Good practice for managing environment variables
    "requests",
    "maturin"  # Required for building Rust extensions
]


def get_executable_name():
    """Gets the appropriate executable name for the current platform."""
    if platform.system() == "Windows":
        return "CyberSafeBackend.exe"
    return "CyberSafeBackend"


def clean_build_artifacts():
    """Cleans previous build artifacts to ensure a fresh build."""
    print("\n📋 Step 1: Cleaning previous builds...")
    # List of directories and file patterns to remove.
    artifacts = ["dist", "build", "__pycache__"]
    spec_files = list(Path(".").glob("*.spec"))

    for artifact in artifacts:
        if os.path.isdir(artifact):
            print(f"🗑️  Cleaning directory: {artifact}/")
            shutil.rmtree(artifact)

    for spec_file in spec_files:
        print(f"🗑️  Removing old spec file: {spec_file}")
        spec_file.unlink()


def ensure_dependencies():
    """Ensures all required dependencies are installed via pip."""
    print("\n📋 Step 2: Checking dependencies...")
    try:
        # Use pkg_resources to check for installed packages.
        import pkg_resources
        installed = {pkg.key for pkg in pkg_resources.working_set}
        missing = [pkg for pkg in REQUIRED_PACKAGES if pkg.lower() not in installed]

        if missing:
            print(f"❌ Missing packages: {', '.join(missing)}. Installing...")
            # Use sys.executable to ensure pip from the correct venv is used.
            subprocess.check_call([sys.executable, "-m", "pip", "install", *missing])
            print("✅ All required packages installed successfully.")
        else:
            print("✅ All required packages are available.")
    except ImportError:
        print("⚠️  'pkg_resources' not found. Please install 'setuptools'.")
        sys.exit(1)


def create_output_directory():
    """Creates the output directory for the final executable."""
    # The output is placed relative to the script location.
    output_dir = Path(__file__).parent / "../frontend/backend"
    output_dir.mkdir(parents=True, exist_ok=True)
    print(f"📁 Output directory ready: {output_dir.resolve()}")
    return output_dir


def find_google_package_path():
    """
    Dynamically finds the path to the 'google' package.
    This is crucial for making the --add-data flag work on any machine.
    """
    print("🔍 Finding 'google' package path for data bundling...")
    try:
        # We find a known sub-package that has a __file__ attribute.
        import google.auth
        # The path we need is the parent of the 'google' directory itself.
        google_auth_path = Path(google.auth.__file__).parent
        google_package_path = google_auth_path.parent

        if google_package_path.name == 'google':
            print(f"✅ Found 'google' package at: {google_package_path}")
            return google_package_path
        else:
            raise FileNotFoundError("Could not resolve the top-level 'google' package directory.")

    except (ImportError, FileNotFoundError, Exception) as e:
        print(f"❌ Critical Error: Could not find the Google package path. {e}")
        print("   Please ensure 'google-auth' is installed correctly in your environment.")
        sys.exit(1)


def build_rust_library():
    """Builds the Rust library using maturin."""
    print("\n📋 Step 3: Building Rust library...")

    # Path to the rustlib directory
    rustlib_path = Path(__file__).parent / "../rustlib"

    if not rustlib_path.exists():
        print("❌ Rust library directory not found!")
        return False

    try:
        # Save current directory
        original_dir = os.getcwd()

        # Change to rustlib directory
        os.chdir(rustlib_path)
        print(f"📁 Changed to rustlib directory: {rustlib_path.resolve()}")

        # Build the Rust library in development mode
        print("🔨 Building Rust library with maturin...")
        result = subprocess.run([
            sys.executable, "-m", "maturin", "develop", "--release"
        ], check=True, capture_output=True, text=True)

        print("✅ Rust library built successfully!")
        return True

    except subprocess.CalledProcessError as e:
        print(f"❌ Rust library build failed with exit code {e.returncode}")
        print(f"   stdout: {e.stdout}")
        print(f"   stderr: {e.stderr}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error building Rust library: {e}")
        return False
    finally:
        # Always return to original directory
        os.chdir(original_dir)


def build_executable():
    """Builds the backend executable using PyInstaller."""
    print("\n📋 Step 4: Building executable...")

    output_dir = create_output_directory()
    google_path = find_google_package_path()

    # The separator for --add-data is platform-dependent (':' for Unix, ';' for Windows)
    add_data_arg = f"{google_path}{os.pathsep}google"

    # PyInstaller command with comprehensive, portable options
    cmd = [
        "pyinstaller",
        "--name", get_executable_name(),
        "--onefile",  # Bundle everything into a single executable
        "--noconfirm",
        "--clean",
        "--distpath", str(output_dir),

        # --- Critical Data and Imports ---
        "--add-data", add_data_arg,
        "--hidden-import", "google.api_core",
        "--hidden-import", "google.api",
        "--hidden-import", "google.rpc",
        "--hidden-import", "google.auth",
        "--hidden-import", "google.protobuf",
        "--hidden-import", "uvicorn.lifespan.on",
        "--hidden-import", "uvicorn.protocols.http.h11_impl",
        "--hidden-import", "uvicorn.protocols.websockets.websockets_impl",

        # Entry point to your application
        "app/serve.py"
    ]

    try:
        print(f"\n🔨 Running PyInstaller...")
        # We join the command for printing, but run it as a list for robustness.
        print(f"   Command: {' '.join(cmd)}")
        subprocess.run(cmd, check=True, capture_output=False, text=True)

        executable_path = output_dir / get_executable_name()
        if executable_path.exists():
            print(f"\n✅ Build successful!")
            print(f"   Executable is located in: {executable_path.resolve()}")
            # Make executable on Unix-like systems
            if platform.system() != "Windows":
                os.chmod(executable_path, 0o755)
                print("   🔐 Set executable permissions for Unix.")
            return True
        else:
            print("❌ Build command finished, but executable not found!")
            return False

    except subprocess.CalledProcessError as e:
        print(f"❌ Build failed with exit code {e.returncode}")
        # The output is not captured, so it will appear in the console directly.
        return False
    except Exception as e:
        print(f"❌ An unexpected error occurred during the build: {e}")
        return False


def main():
    """Main build process orchestrator."""
    print("🚀 CyberSafe Backend Build Process Starting...")
    print(f"   Platform: {platform.system()} {platform.machine()}")
    print(f"   Python: {sys.version.split()[0]}")

    # Ensure the script is running from its own directory
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    print(f"   Working directory: {script_dir.resolve()}")

    try:
        clean_build_artifacts()
        ensure_dependencies()

        # Build Rust library first
        rust_success = build_rust_library()
        if not rust_success:
            print("❌ Rust library build failed. Cannot proceed with executable build.")
            sys.exit(1)

        success = build_executable()

        if success:
            print("\n🎉 Build process completed successfully!")
        else:
            print("\n❌ Build process failed.")
            sys.exit(1)

    except KeyboardInterrupt:
        print("\n\n⏹️  Build process interrupted by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ A critical error stopped the build process: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
