import { LandfillOperation } from '@root/stores/entities';

export interface ILandfillOperationsTable {
  onSelect(landfill: LandfillOperation): void;
}
