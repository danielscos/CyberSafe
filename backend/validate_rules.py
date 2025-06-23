#!/usr/bin/env python3
"""
Simple YARA rules validation script for CyberSafe

This script validates the YARA rules to ensure they compile correctly
before being used in the main application.
"""

import yara
import sys

# Import the rules from our API module
try:
    from app.api.yara_scanner import DEFAULT_RULES
    print("✅ Successfully imported DEFAULT_RULES")
except ImportError as e:
    print(f"❌ Failed to import DEFAULT_RULES: {e}")
    sys.exit(1)

def validate_rules():
    """Validate the YARA rules."""
    print("🔍 Validating YARA rules...")
    print("=" * 50)

    try:
        # Try to compile the rules
        compiled_rules = yara.compile(source=DEFAULT_RULES)

        # Count the rules by parsing the source
        rule_count = len([line for line in DEFAULT_RULES.split('\n') if line.strip().startswith('rule ')])

        print(f"✅ Rules compiled successfully!")
        print(f"📊 Total rules: {rule_count}")

        # List the rules
        print("\n📋 Rules found:")
        lines = DEFAULT_RULES.split('\n')
        for line in lines:
            if line.strip().startswith('rule '):
                rule_name = line.strip().split()[1].split('{')[0]
                print(f"   - {rule_name}")

        return True

    except yara.SyntaxError as e:
        print(f"❌ YARA syntax error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_rules_with_sample_data():
    """Test the rules with sample malicious content."""
    print("\n🧪 Testing rules with sample data...")
    print("=" * 50)

    try:
        # Compile rules
        compiled_rules = yara.compile(source=DEFAULT_RULES)

        # Test samples
        test_samples = [
            ("Clean sample", b"This is a normal clean file with regular content."),
            ("Keylogger sample", b"This file contains keylogger functionality for testing."),
            ("Backdoor sample", b"This file has backdoor capabilities built in."),
            ("Registry sample", b"HKEY_LOCAL_MACHINE registry modification detected."),
            ("API sample", b"CreateRemoteThread and VirtualAllocEx calls detected."),
            ("Crypto sample", b"\x67\x45\x23\x01\xEF\xCD\xAB\x89")
        ]

        for sample_name, sample_data in test_samples:
            matches = compiled_rules.match(data=sample_data)
            match_count = len(matches)

            if match_count > 0:
                print(f"🔴 {sample_name}: {match_count} matches")
                for match in matches:
                    print(f"     - {match.rule}")
            else:
                print(f"🟢 {sample_name}: Clean")

        return True

    except Exception as e:
        print(f"❌ Error testing rules: {e}")
        return False

def main():
    """Main validation function."""
    print("🛡️  CyberSafe YARA Rules Validation")
    print("=" * 50)

    # Step 1: Validate syntax
    if not validate_rules():
        print("\n❌ Rule validation failed!")
        sys.exit(1)

    # Step 2: Test with sample data
    if not test_rules_with_sample_data():
        print("\n❌ Rule testing failed!")
        sys.exit(1)

    print("\n🎉 All validations passed!")
    print("✅ YARA rules are ready to use in CyberSafe")

if __name__ == "__main__":
    main()
