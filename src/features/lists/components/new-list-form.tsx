import { defineMessages, useIntl } from 'react-intl';

import { changeListEditorTitle, submitListEditor } from 'soapbox/actions/lists.ts';
import Button from 'soapbox/components/ui/button.tsx';
import Form from 'soapbox/components/ui/form.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Input from 'soapbox/components/ui/input.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';

const messages = defineMessages({
  label: { id: 'lists.new.title_placeholder', defaultMessage: 'New list title' },
  title: { id: 'lists.new.create', defaultMessage: 'Add list' },
  create: { id: 'lists.new.create_title', defaultMessage: 'Add list' },
});

const NewListForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const value = useAppSelector((state) => state.listEditor.get('title'));
  const disabled = useAppSelector((state) => !!state.listEditor.get('isSubmitting'));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(changeListEditorTitle(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent<Element>) => {
    e.preventDefault();
    dispatch(submitListEditor(true));
  };

  const label = intl.formatMessage(messages.label);
  const create = intl.formatMessage(messages.create);

  return (
    <Form onSubmit={handleSubmit}>
      <HStack space={2}>
        <label className='grow'>
          <span style={{ display: 'none' }}>{label}</span>

          <Input
            type='text'
            value={value}
            disabled={disabled}
            onChange={handleChange}
            placeholder={label}
          />
        </label>

        <Button
          disabled={disabled}
          onClick={handleSubmit}
          theme='primary'
        >
          {create}
        </Button>
      </HStack>
    </Form>
  );
};

export default NewListForm;
