import {
  DeleteIcon as DeleteIconBase,
  PlusIcon as PlusIconBase,
} from '@starlightpro/shared-components';
import styled from 'styled-components';

export const TimePickerWrapper = styled.div`
  position: relative;
  margin-top: 1rem;

  & > div > label {
    display: block;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }

  input {
    padding-right: 34px;
    width: 100%;
  }
  svg {
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translateY(-50%);
  }
`;

export const DeleteIcon = styled(DeleteIconBase)`
  path {
    fill: var(--caption-desaturated);
  }
`;

export const PlusIcon = styled(PlusIconBase)`
  path {
    fill: var(--secondary);
  }
`;
