import { Layouts } from '@starlightpro/shared-components';
import styled from 'styled-components';

import { FormContainer } from '@root/components';

export const JobSiteSectionLayout = styled(Layouts.Grid)`
  grid-area: 1 / 2 / 5 / 3;
  align-content: start;
  overflow-wrap: anywhere;
`;

export const FormContainerLayout = styled(FormContainer)`
  display: grid;
  grid-template-columns: 3fr 1fr;
  column-gap: 32px;
`;
