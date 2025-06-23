#!/usr/bin/env python3
"""
Test script for CyberSafe YARA Scanner

This script tests the YARA scanner functionality by making HTTP requests
to the FastAPI backend endpoints.
"""

import requests
import json
import tempfile
import os
from pathlib import Path

# Backend URL
BASE_URL = "http://127.0.0.1:8000"

def test_server_connection():
    """Test if the server is running."""
    print("🔗 Testing server connection...")
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            print("✅ Server is running!")
            return True
        else:
            print(f"❌ Server returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Make sure it's running on http://127.0.0.1:8000")
        return False

def test_default_rules():
    """Test getting default YARA rules."""
    print("\n📋 Testing default rules endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/yara/default-rules")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Retrieved default rules successfully!")
            print(f"   Rules count: {data.get('rule_count', 'unknown')}")
            print(f"   Description: {data.get('description', 'N/A')}")
            return True
        else:
            print(f"❌ Failed to get default rules: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error getting default rules: {e}")
        return False

def test_rule_validation():
    """Test YARA rule validation."""
    print("\n🔍 Testing rule validation...")

    # Test valid rule
    valid_rule = """
rule Test_Rule {
    strings:
        $test = "hello world"
    condition:
        $test
}
"""

    try:
        response = requests.post(
            f"{BASE_URL}/yara/validate-rules",
            data={"rules": valid_rule}
        )

        if response.status_code == 200:
            data = response.json()
            if data.get("valid"):
                print("✅ Valid rule validation successful!")
                print(f"   Rule count: {data.get('rule_count', 'unknown')}")
            else:
                print(f"❌ Valid rule marked as invalid: {data.get('error')}")
                return False
        else:
            print(f"❌ Rule validation failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error validating rules: {e}")
        return False

    # Test invalid rule
    invalid_rule = "rule Invalid { this is not valid YARA }"

    try:
        response = requests.post(
            f"{BASE_URL}/yara/validate-rules",
            data={"rules": invalid_rule}
        )

        if response.status_code == 200:
            data = response.json()
            if not data.get("valid"):
                print("✅ Invalid rule correctly rejected!")
            else:
                print("❌ Invalid rule incorrectly accepted")
                return False
        else:
            print(f"❌ Invalid rule validation failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error validating invalid rules: {e}")
        return False

    return True

def test_file_scanning():
    """Test scanning files with YARA rules."""
    print("\n🔍 Testing file scanning...")

    # Create test files
    test_files = {
        "clean_file.txt": "This is a clean file with normal content.",
        "suspicious_file.txt": "This file contains keylogger and backdoor functionality for testing.",
        "registry_file.txt": "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run malicious entry",
        "crypto_file.bin": b"\x67\x45\x23\x01\xEF\xCD\xAB\x89 some crypto constants here"
    }

    results = []

    for filename, content in test_files.items():
        print(f"   Testing {filename}...")

        try:
            # Create temporary file
            with tempfile.NamedTemporaryFile(mode='wb', delete=False, suffix='.tmp') as tmp_file:
                if isinstance(content, str):
                    tmp_file.write(content.encode('utf-8'))
                else:
                    tmp_file.write(content)
                tmp_path = tmp_file.name

            # Scan the file
            with open(tmp_path, 'rb') as f:
                files = {'file': (filename, f, 'application/octet-stream')}
                data = {'use_default_rules': 'true'}

                response = requests.post(
                    f"{BASE_URL}/yara/scan",
                    files=files,
                    data=data
                )

            # Clean up temporary file
            os.unlink(tmp_path)

            if response.status_code == 200:
                scan_result = response.json()
                matches_found = scan_result.get('matches_found', 0)
                status = scan_result.get('status', 'unknown')

                print(f"      ✅ Scan successful: {matches_found} matches, status: {status}")

                if matches_found > 0:
                    print("      📝 Matches found:")
                    for match in scan_result.get('matches', []):
                        rule_name = match.get('rule', 'unknown')
                        strings_count = len(match.get('strings', []))
                        print(f"         - Rule: {rule_name} ({strings_count} string matches)")

                results.append({
                    'filename': filename,
                    'success': True,
                    'matches': matches_found,
                    'status': status
                })
            else:
                print(f"      ❌ Scan failed: {response.status_code}")
                print(f"         Error: {response.text}")
                results.append({
                    'filename': filename,
                    'success': False,
                    'error': response.text
                })

        except Exception as e:
            print(f"      ❌ Error scanning {filename}: {e}")
            results.append({
                'filename': filename,
                'success': False,
                'error': str(e)
            })

    # Summary
    successful_scans = len([r for r in results if r.get('success')])
    total_scans = len(results)

    print(f"\n📊 Scan Summary: {successful_scans}/{total_scans} successful")

    return successful_scans == total_scans

def test_batch_scanning():
    """Test batch file scanning."""
    print("\n📦 Testing batch scanning...")

    # Create multiple test files
    test_files = [
        ("file1.txt", "Clean content here"),
        ("file2.txt", "This has keylogger in it"),
        ("file3.txt", "Another clean file")
    ]

    try:
        # Prepare files for upload
        files = []
        temp_paths = []

        for filename, content in test_files:
            # Create temporary file
            with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.tmp') as tmp_file:
                tmp_file.write(content)
                temp_paths.append(tmp_file.name)
                files.append(('files', (filename, open(tmp_file.name, 'rb'), 'text/plain')))

        # Add form data
        data = {'use_default_rules': 'true'}

        # Make batch scan request
        response = requests.post(
            f"{BASE_URL}/yara/batch-scan",
            files=files,
            data=data
        )

        # Close file handles
        for _, (_, file_handle, _) in files:
            file_handle.close()

        # Clean up temporary files
        for temp_path in temp_paths:
            os.unlink(temp_path)

        if response.status_code == 200:
            batch_result = response.json()
            summary = batch_result.get('batch_summary', {})

            print("✅ Batch scan successful!")
            print(f"   Total files: {summary.get('total_files', 0)}")
            print(f"   Clean files: {summary.get('clean_files', 0)}")
            print(f"   Suspicious files: {summary.get('suspicious_files', 0)}")
            print(f"   Error files: {summary.get('error_files', 0)}")

            return True
        else:
            print(f"❌ Batch scan failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False

    except Exception as e:
        print(f"❌ Error in batch scanning: {e}")
        return False

def main():
    """Run all tests."""
    print("🧪 CyberSafe YARA Scanner Test Suite")
    print("=" * 50)

    tests = [
        ("Server Connection", test_server_connection),
        ("Default Rules", test_default_rules),
        ("Rule Validation", test_rule_validation),
        ("File Scanning", test_file_scanning),
        ("Batch Scanning", test_batch_scanning)
    ]

    passed = 0
    total = len(tests)

    for test_name, test_func in tests:
        print(f"\n🧪 Running: {test_name}")
        try:
            if test_func():
                passed += 1
                print(f"✅ {test_name} PASSED")
            else:
                print(f"❌ {test_name} FAILED")
        except Exception as e:
            print(f"❌ {test_name} FAILED with exception: {e}")

    print("\n" + "=" * 50)
    print(f"🎯 Test Results: {passed}/{total} tests passed")

    if passed == total:
        print("🎉 All tests passed! YARA scanner is working correctly.")
        return True
    else:
        print("⚠️  Some tests failed. Check the output above for details.")
        return False

if __name__ == "__main__":
    main()
