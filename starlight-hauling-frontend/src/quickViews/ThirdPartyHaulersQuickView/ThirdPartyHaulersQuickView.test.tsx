import '@tests/__mocks__/intersectionObserver';

import React, { createRef } from 'react';
import ReactModal from 'react-modal';
import { fireEvent, RenderResult, waitFor } from '@testing-library/react';
import fetchMock from 'jest-fetch-mock';

import { ThirdPartyHauler } from '@root/stores/entities';
import GlobalStore from '@root/stores/GlobalStore';
import { renderWrapped } from '@tests/renderWrapped';
import { CustomQueries } from '@tests/types';

import ThirdPartyHaulersQuickView from './ThirdPartyHaulersQuickView';

fetchMock.enableMocks();

describe('ThirdPartyHaulersQuickView', () => {
  let view: RenderResult<CustomQueries>;
  const store = new GlobalStore();
  const haulerResponse = {
    id: 1,
    active: false,
    description: 'Hauler',
    createdAt: '2020-06-18T08:13:53.175Z',
    updatedAt: '2020-06-18T08:13:53.175Z',
    originalId: 1,
  };

  const hauler = new ThirdPartyHauler(store.thirdPartyHaulerStore, haulerResponse);

  beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.mockResponse(JSON.stringify(haulerResponse), {
      headers: { 'content-type': 'application/json' },
    });
    store.thirdPartyHaulerStore.cleanup();
    view = renderWrapped(<ThirdPartyHaulersQuickView isOpen clickOutContainers={createRef()} />, {
      globalStore: store,
    });
  });

  it('should create 3rd party hauler', async () => {
    const { getByText, getByName } = view;

    store.systemConfigurationStore.toggleCreating(true);

    await waitFor(() => fireEvent.click(getByText('Create New')));
    expect(getByText('Description is required')).toBeInTheDocument();

    const description = getByName('description') as HTMLInputElement;

    fireEvent.change(description, {
      target: {
        value: 'desc',
      },
    });

    fireEvent.click(getByText('Create New'));

    await waitFor(() => {
      expect(fetchMock.mock.calls.length).toBe(1);
      expect(fetchMock.mock.calls[0][1]?.method).toBe('POST');
    });
  });

  it('should edit 3rd party hauler', async () => {
    const { getByText, getByName } = view;

    await waitFor(() => {
      store.thirdPartyHaulerStore.selectEntity(hauler);
    });

    const description = getByName('description') as HTMLInputElement;

    expect(description.value).toBe('Hauler');

    fireEvent.click(getByText('Save Changes'));

    await waitFor(() => {
      expect(fetchMock.mock.calls.length).toBe(1);
      expect(fetchMock.mock.calls[0][1]?.method).toBe('PUT');
    });
  });

  it('should remove 3rd party hauler', async () => {
    ReactModal.setAppElement(view.container);
    const { getByText, getAllByText } = view;

    await waitFor(() => {
      store.thirdPartyHaulerStore.selectEntity(hauler);
    });

    fireEvent.click(getByText('Delete'));

    fireEvent.click(getAllByText('Delete 3rd Party Hauler')[1]);

    await waitFor(() => {
      expect(fetchMock.mock.calls.length).toBe(1);
      expect(fetchMock.mock.calls[0][1]?.method).toBe('DELETE');
    });
  });
});
