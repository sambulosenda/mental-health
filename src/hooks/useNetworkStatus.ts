import { useEffect, useState } from 'react';
import * as Network from 'expo-network';

interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: Network.NetworkStateType | null;
}

export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true, // Assume connected initially
    isInternetReachable: true,
    type: null,
  });

  useEffect(() => {
    let mounted = true;

    // Check initial status
    const checkStatus = async () => {
      try {
        const state = await Network.getNetworkStateAsync();
        if (mounted) {
          setStatus({
            isConnected: state.isConnected ?? false,
            isInternetReachable: state.isInternetReachable ?? false,
            type: state.type ?? null,
          });
        }
      } catch {
        // Assume connected if we can't check
      }
    };

    checkStatus();

    // Poll for network changes (expo-network doesn't have subscription API)
    const interval = setInterval(checkStatus, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return {
    isOnline: status.isConnected && status.isInternetReachable,
    isConnected: status.isConnected,
    networkType: status.type,
  };
}
