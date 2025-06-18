import { useState, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../constants';

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
      setError(err.message);
      throw err;
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

  const generateHash = useCallback(async (text, hashType) => {
    if (!text.trim()) {
      throw new Error('Please enter text to hash');
    }

    const result = await executeRequest(async () => {
      const response = await axios.get(API_ENDPOINTS.HASH(hashType, text));
      return response.data;
    });

    setHashResult(result);
    return result;
  }, [executeRequest]);

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

  const detectFileType = useCallback(async (file) => {
    if (!file) {
      throw new Error('Please select a file');
    }

    const result = await executeRequest(async () => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(API_ENDPOINTS.FILETYPE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    });

    setFileTypeResult(result);
    return result;
  }, [executeRequest]);

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
      setCopyError('Failed to copy to clipboard');
      console.error('Copy failed:', err);
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

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

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
