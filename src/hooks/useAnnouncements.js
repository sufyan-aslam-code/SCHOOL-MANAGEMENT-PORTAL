import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { announcementService } from '../services/announcementService';

export const useAnnouncements = (publicOnly = false) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['announcements', publicOnly],
    queryFn: () => announcementService.getAnnouncements(publicOnly),
  });

  const addMutation = useMutation({
    mutationFn: announcementService.addAnnouncement,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => announcementService.updateAnnouncement(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: announcementService.deleteAnnouncement,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] }),
  });

  return {
    announcements: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    addAnnouncement: addMutation.mutateAsync,
    updateAnnouncement: updateMutation.mutateAsync,
    deleteAnnouncement: deleteMutation.mutateAsync,
  };
};