/* eslint-disable react/prop-types */

import { Link } from 'react-router-dom';
import { faPlus } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Loading from '@root/components/Loader/Loading';
import AdminHeader from './AdminHeader';

// type Props = {
//   children: React.Node,
//   header?: ?React.Node,
//   title: string,
//   createUrl?: string,
//   isLoading: boolean,
// };

export default function AdminView(props) {
  return (
    <>
      <AdminHeader title={props.title}>
        {props.createUrl ? (
          <Link to={props.createUrl} className="button button__primary btn__lg">
            <FontAwesomeIcon icon={faPlus} /> Create
          </Link>
        ) : null}
        {props.header}
      </AdminHeader>
      {props.isLoading ? (
        <Loading isLoading={props.isLoading} error={false} />
      ) : (
        <div className="flex-col">{props.children}</div>
      )}
    </>
  );
}
