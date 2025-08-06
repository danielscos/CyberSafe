import { useState, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS, API_BASE_URL } from "../constants";

// Simple backend connection check
const isBackendAvailable = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/`, { timeout: 1000 });
    return response.data && response.data.status === "up";
  } catch (error) {
    return false;
  }
};

// Generic API hook for common patterns
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeRequest = useCallback(async (requestFn) => {
    setLoading(true);
    setError(null);
    try {
      const result = await requestFn();
      return result;
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.message ||
        "An unexpected error occurred";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { loading, error, executeRequest, clearError };
};

// Hash generation hook
export const useHash = () => {
  const [hashResult, setHashResult] = useState(null);
  const { loading, error, executeRequest, clearError } = useApi();

  const generateHash = useCallback(
    async (text, hashType) => {
      if (!text.trim()) {
        throw new Error("Please enter text to hash");
      }

      const result = await executeRequest(async () => {
        const response = await axios.get(API_ENDPOINTS.HASH(hashType, text));
        return response.data;
      });

      setHashResult(result);
      return result;
    },
    [executeRequest],
  );

  const clearHash = useCallback(() => {
    setHashResult(null);
    clearError();
  }, [clearError]);

  return {
    hashResult,
    loading,
    error,
    generateHash,
    clearHash,
  };
};

// File type detection hook
export const useFileType = () => {
  const [fileTypeResult, setFileTypeResult] = useState(null);
  const { loading, error, executeRequest, clearError } = useApi();

  const detectFileType = useCallback(
    async (file) => {
      if (!file) {
        throw new Error("Please select a file");
      }

      const result = await executeRequest(async () => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post(API_ENDPOINTS.FILETYPE, formData);
        return response.data;
      });

      setFileTypeResult(result);
      return result;
    },
    [executeRequest],
  );

  const clearFileType = useCallback(() => {
    setFileTypeResult(null);
    clearError();
  }, [clearError]);

  return {
    fileTypeResult,
    loading,
    error,
    detectFileType,
    clearFileType,
  };
};

// Copy to clipboard hook
export const useCopyToClipboard = () => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyError, setCopyError] = useState(null);

  const copyToClipboard = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setCopyError(null);

      // Reset success state after 2 seconds
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      setCopyError("Failed to copy to clipboard");
      console.error("Copy failed:", err);
    }
  }, []);

  const clearCopyState = useCallback(() => {
    setCopySuccess(false);
    setCopyError(null);
  }, []);

  return {
    copySuccess,
    copyError,
    copyToClipboard,
    clearCopyState,
  };
};

// File upload hook
export const useFileUpload = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = useCallback((event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  }, []);

  const clearFile = useCallback(() => {
    setFile(null);
  }, []);

  return {
    file,
    handleFileChange,
    clearFile,
  };
};

// YARA scanner hook
export const useYaraScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [defaultRules, setDefaultRules] = useState(null);
  const [batchScanResult, setBatchScanResult] = useState(null);
  const { loading, error, executeRequest, clearError } = useApi();

  const scanFile = useCallback(
    async (file, customRules = null, useDefaultRules = true) => {
      if (!file) {
        throw new Error("Please select a file to scan");
      }

      const result = await executeRequest(async () => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("use_default_rules", useDefaultRules.toString());
        if (customRules) {
          formData.append("rules", customRules);
        }

        const response = await axios.post(API_ENDPOINTS.YARA.SCAN, formData);
        return response.data;
      });

      setScanResult(result);
      return result;
    },
    [executeRequest],
  );

  const batchScanFiles = useCallback(
    async (files, customRules = null, useDefaultRules = true) => {
      if (!files || files.length === 0) {
        throw new Error("Please select files to scan");
      }

      if (files.length > 10) {
        throw new Error("Maximum 10 files allowed for batch scanning");
      }

      const result = await executeRequest(async () => {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("files", file);
        });
        formData.append("use_default_rules", useDefaultRules.toString());
        if (customRules) {
          formData.append("rules", customRules);
        }

        const response = await axios.post(
          API_ENDPOINTS.YARA.BATCH_SCAN,
          formData,
        );
        return response.data;
      });

      setBatchScanResult(result);
      return result;
    },
    [executeRequest],
  );

  const validateRules = useCallback(
    async (rules) => {
      if (!rules || !rules.trim()) {
        throw new Error("Please enter YARA rules to validate");
      }

      const result = await executeRequest(async () => {
        const formData = new FormData();
        formData.append("rules", rules);

        const response = await axios.post(
          API_ENDPOINTS.YARA.VALIDATE,
          formData,
        );
        return response.data;
      });

      setValidationResult(result);
      return result;
    },
    [executeRequest],
  );

  const loadDefaultRules = useCallback(async () => {
    const result = await executeRequest(async () => {
      const response = await axios.get(API_ENDPOINTS.YARA.DEFAULT_RULES);
      return response.data;
    });

    setDefaultRules(result);
    return result;
  }, [executeRequest]);

  const clearScanResult = useCallback(() => {
    setScanResult(null);
    clearError();
  }, [clearError]);

  const clearValidationResult = useCallback(() => {
    setValidationResult(null);
    clearError();
  }, [clearError]);

  const clearBatchScanResult = useCallback(() => {
    setBatchScanResult(null);
    clearError();
  }, [clearError]);

  const clearAllResults = useCallback(() => {
    setScanResult(null);
    setValidationResult(null);
    setBatchScanResult(null);
    clearError();
  }, [clearError]);

  return {
    scanResult,
    validationResult,
    defaultRules,
    batchScanResult,
    loading,
    error,
    scanFile,
    batchScanFiles,
    validateRules,
    loadDefaultRules,
    clearScanResult,
    clearValidationResult,
    clearBatchScanResult,
    clearAllResults,
  };
};

// Multiple file upload hook for batch operations
export const useMultiFileUpload = () => {
  const [files, setFiles] = useState([]);

  const handleFilesChange = useCallback((event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);
  }, []);

  const removeFile = useCallback((index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const addFiles = useCallback((newFiles) => {
    setFiles((prevFiles) => [...prevFiles, ...Array.from(newFiles)]);
  }, []);

  return {
    files,
    handleFilesChange,
    removeFile,
    clearFiles,
    addFiles,
  };
};

// Local storage hook for persisting user preferences
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue],
  );

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};
