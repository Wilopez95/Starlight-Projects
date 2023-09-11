/* eslint-disable react/prop-types */

import { Component } from 'react';

import Loader from '@root/components/Loader';
import AdminHeader from '@root/scenes/Admin/components/Layout/AdminHeader';
import Container from '@root/components/Container';
import AdminInner from '@root/scenes/Admin/components/Layout/AdminInner';

import TemplateForm from '@root/scenes/Admin/components/TemplateForm';

// type Props = {
//   uploadLogo: Function,
//   templates: Object,
//   isLoading: boolean,
//   template: TemplateType,
//   routeParams: Params,
//   getTemplate: (?string) => TemplateType,
//   match: Match,
//   updateTemplate: Function,
// };

// eslint-disable-next-line
export class ModifyTemplate extends Component {
  componentDidMount() {
    this.props.getTemplate(this.props.match.params.id);
  }

  handleUpdateTemplate = (values) => {
    const templateId = this.props.match.params.id;
    const payload = {
      ...values,
      logo: this.props.templates.logo.path,
    };
    this.props.updateTemplate(templateId, payload);
  };

  render() {
    return (
      <>
        <AdminHeader title="Template Editor" isCenter />
        <Container>
          <AdminInner isWide>
            {this.props.isLoading ? (
              <Loader />
            ) : (
              <TemplateForm
                template={this.props.template}
                updateTemplate={this.handleUpdateTemplate}
                uploadLogo={this.props.uploadLogo}
                templates={this.props.templates}
                routeParams={this.props.routeParams}
              />
            )}
          </AdminInner>
        </Container>
      </>
    );
  }
}

export default ModifyTemplate;
