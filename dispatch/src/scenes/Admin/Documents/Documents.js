import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';

import injectReducer from '@root/utils/injectReducer';
import { documents } from '@root/state/modules/documents';
import AdminView from '@root/scenes/Admin/components/Layout/AdminView';
import { DocumentsTable } from '@root/scenes/Admin/components';

// type Props = {
//   fetchDocsIfNeeded: () => void,
//   timezone: string,
//   documents: DocumentsType,
// };

// eslint-disable-next-line
export class Documents extends PureComponent {
  componentDidMount() {
    this.props.fetchDocsIfNeeded();
  }

  render() {
    return (
      <>
        <Helmet title="Documents" />
        <AdminView title="Documents">
          <DocumentsTable
            data={this.props.documents}
            timezone={Intl.DateTimeFormat().resolvedOptions().timeZone}
          />
        </AdminView>
      </>
    );
  }
}

Documents.propTypes = {
  fetchDocsIfNeeded: PropTypes.func.isRequired,
  documents: PropTypes.array.isRequired,
};
const DocsWithReducer = injectReducer({ key: 'documents', reducer: documents })(Documents);
export default DocsWithReducer;
