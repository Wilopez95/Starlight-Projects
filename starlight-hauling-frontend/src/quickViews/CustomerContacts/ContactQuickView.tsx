import React from 'react';

import { ICustomQuickView, QuickView, QuickViewPaths } from '@root/common/QuickView';
import { useStores } from '@root/hooks';

import ContactQuickViewContent from './ContactQuickViewContent';

const ContactQuickView: React.FC<ICustomQuickView & QuickViewPaths> = ({ ...quickViewProps }) => {
  const { contactStore } = useStores();

  return (
    <QuickView store={contactStore} size="half" {...quickViewProps}>
      <ContactQuickViewContent />
    </QuickView>
  );
};

export default ContactQuickView;
