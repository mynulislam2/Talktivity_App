export interface UseConnectionReturn {
  isConnected: boolean;
  connectionQuality: string;
  isConnectionActive: boolean;
  connect: () => void;
  disconnect: () => void;
}

export function useConnection(): UseConnectionReturn {
  return {
    isConnected: true,
    connectionQuality: 'good',
    isConnectionActive: true,
    connect: () => {},
    disconnect: () => {},
  };
}
