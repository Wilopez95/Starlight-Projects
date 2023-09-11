import React from 'react';
import { Layouts, Button } from '@starlightpro/shared-components';

import { SaveButton } from './ButtonStyles';
import { IButtonContainer } from './types';

const ButtonContainer: React.FC<IButtonContainer> = ({
  isCreating,
  customCreateActions,
  customEditActions,
  isDuplicating,
  onDuplicate,
  onSave,
  onCancel,
  onDelete,
  submitButtonText,
  disabled = false,
}) => (
  <Layouts.Box as={Layouts.Flex} width='100%' justifyContent='space-between'>
    {isCreating || isDuplicating ? (
      <>
        <Button onClick={onCancel}>Cancel</Button>
        <div>
          {customCreateActions?.map((action) => (
            <Layouts.Margin right='2' key={action.buttonText}>
              <Button onClick={action.handler}>{action.buttonText}</Button>
            </Layouts.Margin>
          ))}
          <Button variant='success' onClick={onSave} disabled={disabled}>
            Create New {submitButtonText}
          </Button>
        </div>
      </>
    ) : (
      <>
        <div>
          {onDelete ? (
            <Layouts.Margin left={isCreating || isDuplicating ? '2' : '0'}>
              <Button variant='converseAlert' onClick={onDelete} disabled={disabled}>
                Delete
              </Button>
            </Layouts.Margin>
          ) : (
            <Button onClick={onCancel}>Cancel</Button>
          )}
        </div>
        <div>
          {onDuplicate && (
            <Layouts.Margin right='2'>
              <Button onClick={onDuplicate}>Duplicate</Button>
            </Layouts.Margin>
          )}
          {customEditActions?.map((action) => (
            <Layouts.Margin right='2' key={action.buttonText}>
              <Button onClick={action.handler}>{action.buttonText}</Button>
            </Layouts.Margin>
          ))}
          <SaveButton
            variant='primary'
            onClick={onSave}
            className={onDuplicate && 'flexEnd'}
            disabled={disabled}
          >
            Save Changes
          </SaveButton>
        </div>
      </>
    )}
  </Layouts.Box>
);

export default ButtonContainer;
