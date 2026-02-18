import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';

/* ----------------------------- Types ----------------------------- */

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  refetch: () => Promise<void>;
}

export interface ApiMutation<TData, TVariables = void> {
  mutate: (variables: TVariables) => Promise<TData>;
  data: TData | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  reset: () => void;
}

/* -------------------------- Query Hook --------------------------- */

export function useApiQuery<T>(
  queryFn: () => Promise<T>,
  dependencies: any[] = [],
  enabled: boolean = true
): ApiState<T> {
  const [state, setState] = useState<Omit<ApiState<T>, 'refetch'>>({
    data: null,
    loading: false,
    error: null,
    success: false
  });

  const isMounted = useRef(true);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await queryFn();

      if (!isMounted.current) return;

      setState({
        data,
        loading: false,
        error: null,
        success: true
      });
    } catch (err) {
      if (!isMounted.current) return;

      const message =
        err instanceof Error ? err.message : 'Failed to fetch data';

      setState({
        data: null,
        loading: false,
        error: message,
        success: false
      });

      console.error('API QUERY ERROR:', err);
    }
  }, [enabled, ...dependencies]);

  useEffect(() => {
    isMounted.current = true;
    fetchData();

    return () => {
      isMounted.current = false;
    };
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}

/* ------------------------- Mutation Hook -------------------------- */

export function useApiMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData) => void;
    onError?: (error: string) => void;
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
    successMessage?: string;
  }
): ApiMutation<TData, TVariables> {
  const [state, setState] = useState({
    data: null as TData | null,
    loading: false,
    error: null as string | null,
    success: false
  });

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setState({
        data: null,
        loading: true,
        error: null,
        success: false
      });

      try {
        const data = await mutationFn(variables);

        setState({
          data,
          loading: false,
          error: null,
          success: true
        });

        if (options?.showSuccessToast !== false) {
          toast.success(
            options?.successMessage ?? 'Operation completed successfully'
          );
        }

        options?.onSuccess?.(data);
        return data;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Operation failed';

        setState({
          data: null,
          loading: false,
          error: message,
          success: false
        });

        if (options?.showErrorToast !== false) {
          toast.error(message);
        }

        options?.onError?.(message);
        throw err;
      }
    },
    [mutationFn, options]
  );

  const reset = () => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false
    });
  };

  return { ...state, mutate, reset };
}

/* ----------------------- Domain Hooks ----------------------------- */

export function useApplications(studentId?: number, status?: string) {
  return useApiQuery(
    async () => {
      const { api } = await import('@/lib/api');
      return api.getApplications(studentId, status);
    },
    [studentId, status],
    Boolean(studentId)
  );
}

export function useCreateApplication() {
  return useApiMutation(
    async (data: any) => {
      const { api } = await import('@/lib/api');
      return api.createApplication(data);
    },
    {
      successMessage: 'Application submitted successfully'
    }
  );
}

export function useUpdateApplication() {
  return useApiMutation(
    async ({ id, data }: { id: number; data: any }) => {
      const { api } = await import('@/lib/api');
      return api.updateApplication(id, data);
    },
    {
      successMessage: 'Application updated successfully'
    }
  );
}

export function useHostels() {
  return useApiQuery(async () => {
    const { api } = await import('@/lib/api');
    return api.getHostels();
  });
}

export function useRooms(hostelId?: number) {
  return useApiQuery(
    async () => {
      const { api } = await import('@/lib/api');
      return api.getRooms(hostelId);
    },
    [hostelId],
    Boolean(hostelId)
  );
}
