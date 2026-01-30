import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface ApiMutation<TData, TVariables = void> {
  mutate: (variables: TVariables) => Promise<TData>;
  data: TData | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  reset: () => void;
}

// Hook for fetching data
export function useApiQuery<T>(
  queryFn: () => Promise<T>,
  dependencies: any[] = []
): ApiState<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    error: null,
    success: false
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await queryFn();
      setState({
        data,
        loading: false,
        error: null,
        success: true
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        success: false
      });
      console.error('API Query Error:', error);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return state;
}

// Hook for mutations (create, update, delete)
export function useApiMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    onSuccess?: (data: TData) => void;
    onError?: (error: string) => void;
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
    successMessage?: string;
  } = {}
): ApiMutation<TData, TVariables> {
  const [state, setState] = useState<{
    data: TData | null;
    loading: boolean;
    error: string | null;
    success: boolean;
  }>({
    data: null,
    loading: false,
    error: null,
    success: false
  });

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const mutate = useCallback(async (variables: TVariables): Promise<TData> => {
    setState(prev => ({ ...prev, loading: true, error: null, success: false }));
    const opts = optionsRef.current;
    try {
      const data = await mutationFn(variables);
      setState({
        data,
        loading: false,
        error: null,
        success: true
      });

      if (opts.showSuccessToast !== false) {
        toast.success(opts.successMessage || 'Operation completed successfully');
      }

      opts.onSuccess?.(data);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        success: false
      });

      if (opts.showErrorToast !== false) {
        toast.error(errorMessage);
      }

      opts.onError?.(errorMessage);
      throw error;
    }
  }, [mutationFn]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false
    });
  }, []);

  return {
    mutate,
    data: state.data,
    loading: state.loading,
    error: state.error,
    success: state.success,
    reset
  };
}

// Specific hooks for common operations
export function useApplications(studentId?: number, status?: string) {
  return useApiQuery(async () => {
    const { api } = await import('@/lib/api');
    return api.getApplications(studentId, status);
  }, [studentId, status]);
}

export function useCreateApplication() {
  return useApiMutation(async (data: any) => {
    const { api } = await import('@/lib/api');
    return api.createApplication(data);
  }, {
    successMessage: 'Application submitted successfully!'
  });
}

export function useUpdateApplication() {
  return useApiMutation(async ({ id, data }: { id: number; data: any }) => {
    const { api } = await import('@/lib/api');
    return api.updateApplication(id, data);
  }, {
    successMessage: 'Application updated successfully!'
  });
}

export function useHostels() {
  return useApiQuery(async () => {
    const { api } = await import('@/lib/api');
    return api.getHostels();
  });
}

export function useRooms(hostelId?: number) {
  return useApiQuery(async () => {
    const { api } = await import('@/lib/api');
    return api.getRooms(hostelId);
  }, [hostelId]);
}