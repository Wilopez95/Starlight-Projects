import { Redirect } from 'react-router-dom';
import { Paths } from './routing';

export const SystemConfigurationRedirect = () => {
  return <Redirect to={Paths.Configuration} />;
};
