import { Group } from "../../server/src/types/api";

export const groups: Group[] = (window as any)?.splitwiseHelper?.metadata?.groups || [];

export function getGroupForId(id: number): Group | undefined {
  return groups.find(group => group.id === id)
}