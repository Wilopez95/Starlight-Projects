/* eslint-disable react/prop-types */

import styled from 'styled-components';
import { Wrapper } from '@root/components/Layout';
import ResetForm from './ResetForm';

// type Props = {
//   onSubmit: Function,
//   match: Match,
//   history: BrowserHistory,
// };

const ResetWrapper = styled.div`
  max-width: 480px;
  height: 800px;
  margin: 0 auto;
  padding-top: 10em;
  text-align: center;

  form {
    margin-bottom: 14px;
  }
`;

const LogoArea = styled.div`
  text-align: center;
  margin-bottom: 10px;
`;

const LogoImg = styled.img`
  display: inline-block;
  vertical-align: top;
  max-width: 200px;
`;
const Flex = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;
const ResetPassword = (props) => {
  function submitResetPw(formInput) {
    const { resetToken } = props.match.params;
    props.onSubmit(resetToken, formInput);
  }
  function pushLogin() {
    props.history.push('/login');
  }
  return (
    <Wrapper>
      <Flex>
        <ResetWrapper>
          <LogoArea>
            <LogoImg
              src="https://cdn.starlightpro.com/starlight-logo-plain.png"
              alt="starlight logo"
            />
          </LogoArea>
          <ResetForm handleResetPassword={submitResetPw} pushToLogin={pushLogin} />
        </ResetWrapper>
      </Flex>
    </Wrapper>
  );
};

export default ResetPassword;
