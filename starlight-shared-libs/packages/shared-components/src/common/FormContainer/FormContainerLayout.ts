import styled from 'styled-components';

import FormContainer from '../../common/FormContainer/FormContainer';

export const FormContainerLayout = styled(FormContainer)`
  height: 100%;

  & > div {
    height: 100%;
    overflow-y: auto;
  }
`;
