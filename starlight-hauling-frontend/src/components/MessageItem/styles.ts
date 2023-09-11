import styled from 'styled-components';

type IMessage = {
  isMyMessage?: boolean;
};

export const Message = styled.div<IMessage>`
  background: ${p => (p.isMyMessage ? p.theme.colors.grey.standard : p.theme.colors.grey.light)};
  padding: 14px;
  border-radius: 6px;
  margin-top: 8px;
  word-break: break-word;
`;
