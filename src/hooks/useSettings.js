import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingService } from '../services/settingService';

export const useSettings = () => {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: settingService.getSettings,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: settingService.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  return {
    settings: settingsQuery.data || {},
    isLoading: settingsQuery.isLoading,
    updateSettings: updateSettingsMutation.mutateAsync,
  };
};

export default useSettings;
