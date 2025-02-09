import { FormattedMessage } from 'react-intl';
import { Redirect } from 'react-router-dom';

import { openModal } from 'soapbox/actions/modals.ts';
import { BigCard } from 'soapbox/components/big-card.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useFeatures } from 'soapbox/hooks/useFeatures.ts';
import { useInstance } from 'soapbox/hooks/useInstance.ts';
import { useRegistrationStatus } from 'soapbox/hooks/useRegistrationStatus.ts';

import RegistrationForm from './registration-form.tsx';

const RegistrationPage: React.FC = () => {
  const { instance } = useInstance();
  const { isOpen } = useRegistrationStatus();
  const { nostrSignup } = useFeatures();
  const dispatch = useAppDispatch();

  if (nostrSignup) {
    setTimeout(() => dispatch(openModal('NOSTR_SIGNUP')), 100);
    return <Redirect to='/' />;
  }

  if (!isOpen) {
    return (
      <BigCard title={<FormattedMessage id='registration.closed_title' defaultMessage='Registrations Closed' />}>
        <Text theme='muted' align='center'>
          <FormattedMessage
            id='registration.closed_message'
            defaultMessage='{instance} is not accepting new members'
            values={{ instance: instance.title }}
          />
        </Text>
      </BigCard>
    );
  }

  return (
    <BigCard title={<FormattedMessage id='column.registration' defaultMessage='Sign Up' />}>
      <RegistrationForm />
    </BigCard>
  );
};

export default RegistrationPage;