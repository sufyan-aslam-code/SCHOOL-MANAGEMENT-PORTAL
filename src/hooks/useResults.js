import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resultService } from '../services/resultService';

export const useResults = () => {

  const queryClient = useQueryClient();


  const resultsQuery = useQuery({
    queryKey: ['results'],
    queryFn: resultService.getResults,
  });


  const searchResultMutation = useMutation({
    mutationFn: (searchParams) =>
      resultService.searchResult(searchParams),
  });


  const batchUploadMutation = useMutation({
    mutationFn: (rows) =>
      resultService.batchUpsertResults(rows),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['results'],
      });
    },
  });


  return {

    results: resultsQuery.data || [],
    isLoadingResults: resultsQuery.isLoading,
    isResultsError: resultsQuery.isError,


    searchResult:
      searchResultMutation.mutateAsync,

    isSearching:
      searchResultMutation.isPending,


    batchUpload:
      batchUploadMutation.mutateAsync,

    isUploading:
      batchUploadMutation.isPending,
  };
};


export default useResults;