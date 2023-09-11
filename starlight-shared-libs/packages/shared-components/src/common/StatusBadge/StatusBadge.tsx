import React from 'react';

import { Badge } from '../Badge/Badge';

export const StatusBadge: React.FC<{ active?: boolean }> = ({ active = false }) => (
  <Badge color={active ? 'success' : 'alert'}>{active ? 'Active' : 'Inactive'}</Badge>
);
