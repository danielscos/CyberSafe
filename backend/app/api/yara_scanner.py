from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from typing import List, Optional
import yara
import tempfile
import os
import asyncio
from pathlib import Path

router = APIRouter()

DEFAULT_RULES = """
rule Suspicious_Strings {
    meta:
        description = "Detects suspicious strings commonly found in malware"
        author = "CyberSafe"
        severity = "medium"

    strings:
        $s1 = "keylogger" nocase
        $s2 = "backdoor" nocase
        $s3 = "trojan" nocase
        $s4 = "payload" nocase
        $s5 = "exploit" nocase
        $s6 = "shellcode" nocase
        $s7 = "malware" nocase

    condition:
        any of ($s*)
}

rule Suspicious_URLs {
    meta:
        description = "Detects suspicious URLs and domains"
        author = "CyberSafe"
        severity = "high"

    strings:
        $u1 = ".onion"
        $u2 = "pastebin.com"
        $u3 = "bit.ly"
        $u4 = "tinyurl.com"

    condition:
        any of ($u*)
}

rule Suspicious_Registry {
    meta:
        description = "Detects suspicious Windows registry operations"
        author = "CyberSafe"
        severity = "high"

    strings:
        $r1 = "HKEY_LOCAL_MACHINE" nocase
        $r2 = "HKEY_CURRENT_USER" nocase
        $r3 = "CurrentVersion\\\\Run" nocase
        $r4 = "DisableTaskMgr" nocase
        $r5 = "DisableRegistryTools" nocase

    condition:
        any of ($r*)
}

rule Cryptographic_Constants {
    meta:
        description = "Detects cryptographic constants that might indicate encryption/packing"
        author = "CyberSafe"
        severity = "medium"

    strings:
        $c1 = { 67 45 23 01 }
        $c2 = { EF CD AB 89 }
        $c3 = { 98 BA DC FE }
        $c4 = { 10 32 54 76 }
        $c5 = { C3 D2 E1 F0 }
        $c6 = { 67 E6 09 6A }

    condition:
        any of ($c*)
}

rule Suspicious_Functions {
    meta:
        description = "Detects suspicious API calls and function names"
        author = "CyberSafe"
        severity = "high"

    strings:
        $f1 = "CreateRemoteThread" nocase
        $f2 = "VirtualAllocEx" nocase
        $f3 = "WriteProcessMemory" nocase
        $f4 = "SetWindowsHookEx" nocase
        $f5 = "GetAsyncKeyState" nocase
        $f6 = "RegSetValueEx" nocase
        $f7 = "CreateProcess" nocase
        $f8 = "ShellExecute" nocase
        $f9 = "WinExec" nocase

    condition:
        any of ($f*)
}
"""

def compile_rules(rules_content: str) -> yara.Rules:
    """Compile YARA rules from string content."""
    try:
        return yara.compile(source=rules_content)
    except yara.SyntaxError as e:
        raise HTTPException(status_code=400, detail=f"YARA syntax error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compile rules: {str(e)}")

def format_match_result(match, file_data: bytes) -> dict:
    """Format a YARA match result into a structured response."""
    strings_matches = []

    for string in match.strings:
        # Get context around the match (50 chars before and after)
        for instance in string.instances:
            start = max(0, instance.offset - 50)
            end = min(len(file_data), instance.offset + len(instance.matched_data) + 50)
            context = file_data[start:end]

            # Try to decode as UTF-8, fallback to latin-1 if that fails
            try:
                context_str = context.decode('utf-8', errors='replace')
            except:
                context_str = context.decode('latin-1', errors='replace')

            strings_matches.append({
                "identifier": string.identifier,
                "offset": instance.offset,
                "matched_data": instance.matched_data.decode('utf-8', errors='replace'),
                "context": context_str.strip(),
                "length": len(instance.matched_data)
            })

    return {
        "rule": match.rule,
        "namespace": match.namespace,
        "tags": list(match.tags),
        "meta": dict(match.meta),
        "strings": strings_matches
    }

@router.post("/yara/scan")
async def scan_file_with_yara(
    file: UploadFile = File(...),
    rules: Optional[str] = Form(None),
    use_default_rules: bool = Form(True)
):
    """
    Scan a file with YARA rules.

    Args:
        file: The file to scan
        rules: Custom YARA rules (optional)
        use_default_rules: Whether to use built-in rules (default: True)

    Returns:
        Scan results with matches and metadata
    """

    try:
        # Read file content
        file_content = await file.read()

        # Determine which rules to use
        rules_content = ""

        if use_default_rules:
            rules_content += DEFAULT_RULES

        if rules:
            rules_content += "\n" + rules

        if not rules_content.strip():
            raise HTTPException(status_code=400, detail="No rules provided for scanning")

        # Compile rules
        compiled_rules = compile_rules(rules_content)

        # Perform scan
        matches = compiled_rules.match(data=file_content)

        # Format results
        results = []
        for match in matches:
            results.append(format_match_result(match, file_content))

        # Calculate basic file stats
        file_size = len(file_content)

        return {
            "filename": file.filename,
            "file_size": file_size,
            "scan_time": "real-time",  # You could add timing if needed
            "rules_used": "default" if use_default_rules else "custom",
            "matches_found": len(results),
            "matches": results,
            "status": "clean" if len(results) == 0 else "suspicious"
        }

    except yara.Error as e:
        raise HTTPException(status_code=400, detail=f"YARA error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")

@router.post("/yara/validate-rules")
async def validate_yara_rules(rules: str = Form(...)):
    """
    Validate YARA rules syntax without scanning.

    Args:
        rules: YARA rules to validate

    Returns:
        Validation result
    """

    try:
        # Try to compile the rules
        compiled_rules = compile_rules(rules)

        # Count rules by parsing the source
        rule_count = len([line for line in rules.split('\n') if line.strip().startswith('rule ')])

        return {
            "valid": True,
            "rule_count": rule_count,
            "message": f"Successfully validated {rule_count} rule(s)"
        }

    except yara.SyntaxError as e:
        return {
            "valid": False,
            "error": str(e),
            "message": "YARA syntax error in rules"
        }
    except Exception as e:
        return {
            "valid": False,
            "error": str(e),
            "message": "Failed to validate rules"
        }

@router.get("/yara/default-rules")
async def get_default_rules():
    """
    Get the default YARA rules used by CyberSafe.

    Returns:
        Default YARA rules content
    """

    return {
        "rules": DEFAULT_RULES,
        "description": "Default YARA rules for common malware patterns",
        "rule_count": len([line for line in DEFAULT_RULES.split('\n') if line.strip().startswith('rule ')])
    }

@router.post("/yara/batch-scan")
async def batch_scan_files(
    files: List[UploadFile] = File(...),
    rules: Optional[str] = Form(None),
    use_default_rules: bool = Form(True)
):
    """
    Scan multiple files with YARA rules.

    Args:
        files: List of files to scan
        rules: Custom YARA rules (optional)
        use_default_rules: Whether to use built-in rules (default: True)

    Returns:
        Batch scan results
    """

    if len(files) > 10:  # Limit batch size
        raise HTTPException(status_code=400, detail="Maximum 10 files allowed in batch scan")

    try:
        # Prepare rules
        rules_content = ""

        if use_default_rules:
            rules_content += DEFAULT_RULES

        if rules:
            rules_content += "\n" + rules

        if not rules_content.strip():
            raise HTTPException(status_code=400, detail="No rules provided for scanning")

        # Compile rules once for all files
        compiled_rules = compile_rules(rules_content)

        # Process each file
        batch_results = []

        for file in files:
            try:
                file_content = await file.read()
                matches = compiled_rules.match(data=file_content)

                # Format results for this file
                file_matches = []
                for match in matches:
                    file_matches.append(format_match_result(match, file_content))

                batch_results.append({
                    "filename": file.filename,
                    "file_size": len(file_content),
                    "matches_found": len(file_matches),
                    "matches": file_matches,
                    "status": "clean" if len(file_matches) == 0 else "suspicious"
                })

            except Exception as e:
                batch_results.append({
                    "filename": file.filename,
                    "error": str(e),
                    "status": "error"
                })

        # Calculate summary
        total_files = len(batch_results)
        clean_files = len([r for r in batch_results if r.get("status") == "clean"])
        suspicious_files = len([r for r in batch_results if r.get("status") == "suspicious"])
        error_files = len([r for r in batch_results if r.get("status") == "error"])

        return {
            "batch_summary": {
                "total_files": total_files,
                "clean_files": clean_files,
                "suspicious_files": suspicious_files,
                "error_files": error_files
            },
            "rules_used": "default" if use_default_rules else "custom",
            "results": batch_results
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch scan failed: {str(e)}")
