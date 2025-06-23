import { useSupabaseMusic } from './useSupabaseMusic';

export const useMusicStorage = () => {
  const supabaseHook = useSupabaseMusic();

  return {
    ...supabaseHook,
    storageType: 'supabase' as const,
  };
};
