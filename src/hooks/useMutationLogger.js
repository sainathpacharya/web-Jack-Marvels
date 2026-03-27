import { trackMutationEvent } from '../lib/observability';

function compactMutationName(mutation) {
  const mutationKey = mutation?.options?.mutationKey;
  if (Array.isArray(mutationKey) && mutationKey.length) return mutationKey.join(':');
  if (typeof mutationKey === 'string') return mutationKey;
  return mutation?.options?.meta?.name || 'anonymous-mutation';
}

export function createMutationLogger() {
  return {
    onError: (error, _variables, context, mutation) => {
      trackMutationEvent({
        event: 'mutation_error',
        name: compactMutationName(mutation),
        retries: mutation?.state?.failureCount || 0,
        rollback: Boolean(context),
        message: error?.message || 'Mutation failed',
      });
    },
    onSuccess: (_data, _variables, _context, mutation) => {
      trackMutationEvent({
        event: 'mutation_success',
        name: compactMutationName(mutation),
        retries: mutation?.state?.failureCount || 0,
      });
    },
    onSettled: (_data, _error, _variables, context, mutation) => {
      const retries = mutation?.state?.failureCount || 0;
      if (retries > 0) {
        trackMutationEvent({
          event: 'mutation_retried',
          name: compactMutationName(mutation),
          retries,
        });
      }
      if (context) {
        trackMutationEvent({
          event: 'mutation_rollback_context',
          name: compactMutationName(mutation),
        });
      }
    },
  };
}
