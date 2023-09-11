import { connect } from 'react-redux';
import { fetchDocsIfNeeded, selectDocuments } from '@root/state/modules/documents';
import DocsWithReducer from './Documents';

const mapStateToProps = (state) => ({
  setting: state.state,
  documents: selectDocuments(state),
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
});

export default connect(mapStateToProps, { fetchDocsIfNeeded })(DocsWithReducer);
