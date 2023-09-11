import React from 'react';

import { Badge } from '@root/common';

export const StatusBadge: React.FC<{ active?: boolean }> = ({ active = false }) => (
  <Badge color={active ? 'success' : 'alert'}>{active ? 'Active' : 'Inactive'}</Badge>
);
