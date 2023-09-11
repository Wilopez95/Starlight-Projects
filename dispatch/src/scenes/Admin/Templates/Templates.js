/* eslint-disable react/prop-types */

import { PureComponent } from 'react';
import { Helmet } from 'react-helmet';
import { AdminView, TemplatesTable } from '@root/scenes/Admin/components';

// type Props = {
//   isLoading: boolean,
//   loadTemplates: Function,
//   templates: $ReadOnlyArray<TemplateType>,
//   deleteTemplate: number => void,
// };

class Templates extends PureComponent {
  componentDidMount() {
    this.props.loadTemplates();
  }

  handleDeleteTemplate = (id) => {
    this.props.deleteTemplate(id);
  };

  render() {
    return (
      <AdminView
        title="Templates"
        createUrl="/configuration/templates/create"
        isLoading={this.props.isLoading}
      >
        <Helmet title="Templates" />
        <TemplatesTable data={this.props.templates} onDeleteTemplate={this.handleDeleteTemplate} />
      </AdminView>
    );
  }
}

export default Templates;
