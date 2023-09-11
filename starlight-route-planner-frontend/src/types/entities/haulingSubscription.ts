export interface IHaulingSubscription {
  id: number;
  status: string;
  customerId: number;
  customerJobSiteId: number;
  jobSiteNote: string;
  jobSiteContactId: number;
  driverInstructions: string;
  bestTimeToComeFrom: Date | string;
  bestTimeToComeTo: Date | string;
  startDate: Date | string;
  endDate: Date | string;
  equipmentType: string;
  reason: string;
  reasonDescription: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}
