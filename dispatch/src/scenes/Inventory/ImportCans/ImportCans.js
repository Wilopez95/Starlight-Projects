import { importCans } from '@root/state/modules/cans';
import ModalRoute from '@root/components/ModalRoute';
import FormImport from '@root/forms/Import';

// type Props = {
//   history: BrowserHistory,
// };
function ImportCans(props) {
  const close = () => {
    // eslint-disable-next-line react/prop-types
    props.history.goBack();
  };

  return (
    // eslint-disable-next-line react/prop-types
    <ModalRoute title="Import" history={props.history}>
      <FormImport
        linkToExample="/inventory/map/export"
        onSubmit={(type, csv) => importCans(type, { csv })}
        onSuccessSubmit={close}
        onDismiss={close}
      />
    </ModalRoute>
  );
}

export default ImportCans;
