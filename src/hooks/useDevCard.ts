import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * Custom hook to fetch the authenticated user's DevCard
 * Provides consistent data fetching across the app
 */
export function useDevCard() {
  const { data, error, isLoading, mutate } = useSWR('/api/cards/me', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return {
    devcard: data,
    isLoading,
    isError: error,
    mutate,
  };
}
