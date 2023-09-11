import { FileUpload as FileUploadBase, Layouts } from '@starlightpro/shared-components';
import styled from 'styled-components';

export const CrossIconCircle = styled.div`
  width: 14px;
  height: 14px;
  background-color: var(--primary-gray-dark);
  border-radius: 50%;
  cursor: pointer;

  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 0;

  & > {
    svg {
      width: 10px;
      height: 10px;
      transform: translate3d(1px, 1px, 0);

      & > path {
        fill: var(--white);
      }
    }
  }
`;

export const UploadedFileInfoWrapper = styled.div`
  position: relative;
  padding-right: 3rem;
`;

export const MediaInfoWrapper = styled(Layouts.Flex)`
  min-height: 36px;
  height: 100%;
  position: relative;
`;

export const FacilityNameWrapper = styled.div`
  grid-column: 1/3;
`;

export const FileUpload = styled(FileUploadBase)`
  position: absolute;
  width: 100%;
  opacity: 0;
`;
