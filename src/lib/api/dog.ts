/**
 * 반려견 API — CRUD + 환경 데이터
 * Parity: APP-001
 */
import { supabase } from './supabase';
import type { Dog, DogEnv, SurveyData } from 'types/dog';

/** 반려견 목록 조회 */
export async function getDogs(userId: string): Promise<Dog[]> {
  const { data, error } = await supabase
    .from('dogs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as Dog[];
}

/** 반려견 상세 조회 */
export async function getDog(dogId: string): Promise<Dog> {
  const { data, error } = await supabase.from('dogs').select('*').eq('id', dogId).single();
  if (error) throw error;
  return data as Dog;
}

/** 반려견 환경 조회 */
export async function getDogEnv(dogId: string): Promise<DogEnv | null> {
  const { data, error } = await supabase.from('dog_envs').select('*').eq('dog_id', dogId).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data as DogEnv | null;
}

/** 설문 기반 반려견 등록 */
export async function createDogFromSurvey(userId: string, survey: SurveyData): Promise<Dog> {
  const { data, error } = await supabase
    .from('dogs')
    .insert({
      user_id: userId,
      name: survey.step1_basic.name,
      breed: survey.step1_basic.breed,
      sex: survey.step1_basic.sex,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Dog;
}

/** 반려견 수정 */
export async function updateDog(dogId: string, updates: Partial<Dog>): Promise<Dog> {
  const { data, error } = await supabase
    .from('dogs')
    .update(updates)
    .eq('id', dogId)
    .select()
    .single();
  if (error) throw error;
  return data as Dog;
}

/** 반려견 삭제 */
export async function deleteDog(dogId: string): Promise<void> {
  const { error } = await supabase.from('dogs').delete().eq('id', dogId);
  if (error) throw error;
}
