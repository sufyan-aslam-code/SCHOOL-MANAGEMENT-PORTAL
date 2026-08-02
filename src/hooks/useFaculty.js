import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { facultyService } from '../services/facultyService';

export const useFaculty = () => {
  const queryClient = useQueryClient();

  const facultyQuery = useQuery({
    queryKey: ['faculty'],
    queryFn: facultyService.getFaculty,
  });

  const addFacultyMutation = useMutation({
    mutationFn: facultyService.addFaculty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty'] });
    },
  });

  const updateFacultyMutation = useMutation({
    mutationFn: ({ id, data }) => facultyService.updateFaculty(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty'] });
    },
  });

  const deleteFacultyMutation = useMutation({
    mutationFn: facultyService.deleteFaculty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty'] });
    },
  });

  return {
    faculty: facultyQuery.data || [],
    isLoading: facultyQuery.isLoading,
    isError: facultyQuery.isError,
    addFaculty: addFacultyMutation.mutateAsync,
    updateFaculty: updateFacultyMutation.mutateAsync,
    deleteFaculty: deleteFacultyMutation.mutateAsync,
  };
};

export default useFaculty;