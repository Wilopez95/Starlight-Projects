import {
  EditIcon as EditIconBase,
  Layouts,
  Navigation as NavigationBase,
} from '@starlightpro/shared-components';
import styled from 'styled-components';

export const Navigation = styled(NavigationBase)`
  padding: 0 3rem;

  & > div {
    flex: 1;
  }
`;

export const Link = styled.a`
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 20px;
  color: var(--secondary);
`;

export const LinkStyle = styled.div`
  font-size: 14px;
  line-height: 20px;
  color: var(--secondary);
`;

export const EditLabelWrapper = styled(Layouts.Box)`
  cursor: pointer;
`;

export const EditIcon = styled(EditIconBase)`
  transform: scale(0.8);
`;

export const MediaPreviewItem = styled.img`
  border-radius: 2px;
`;
