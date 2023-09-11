import { Customer, JobSite } from '@root/stores/entities';

export const logicalXOR = (a: JobSite | null, b: Customer | null) => Boolean(a) !== Boolean(b);
