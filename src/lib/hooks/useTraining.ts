/**
 * useTraining 훅 — 훈련 진행 상태 관리
 * Parity: UI-001
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from 'lib/api/queryKeys';
import * as trainingApi from 'lib/api/training';
import type { CurriculumId, PlanVariant } from 'types/training';

export function useTrainingProgress(dogId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.training.progress(dogId ?? ''),
    queryFn: () => trainingApi.getTrainingProgress(dogId!),
    enabled: !!dogId,
  });
}

export function useStartTraining() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      dogId,
      curriculumId,
      variant,
    }: {
      dogId: string;
      curriculumId: CurriculumId;
      variant?: PlanVariant;
    }) => trainingApi.startTraining(dogId, curriculumId, variant),
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: queryKeys.training.progress(variables.dogId) });
    },
  });
}

export function useCompleteStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      progressId,
      stepId,
      currentSteps,
      dogId,
    }: {
      progressId: string;
      stepId: string;
      currentSteps: string[];
      dogId: string;
    }) => trainingApi.completeStep(progressId, stepId, currentSteps, dogId),
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: queryKeys.training.progress(variables.dogId) });
    },
  });
}
