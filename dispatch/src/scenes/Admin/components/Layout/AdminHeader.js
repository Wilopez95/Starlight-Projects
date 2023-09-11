/* eslint-disable react/prop-types */
/* eslint-disable react/no-unused-prop-types, no-unused-vars */
import styled from 'styled-components';
import PageTitle from '@root/components/PageTitle';

// export type Props = {
//   className?: string,
//   children?: Node,
//   title: string,
//   isCenter?: boolean,
// };
const AdminHeaderComponent = styled.header`
  display: flex;
  width: 100%;
  margin-bottom: 1.2em;
`;
const PageActions = styled.div`
  display: inline-block;
  vertical-align: middle;
`;

const AdminHeader = ({ className, children, title, isCenter }) => (
  <AdminHeaderComponent className={`sui-admin-header ${className}`}>
    <PageTitle>{title}</PageTitle>
    <PageActions>{children}</PageActions>
  </AdminHeaderComponent>
);

AdminHeader.defaultProps = {
  isCenter: false,
  className: '',
};
export default AdminHeader;
