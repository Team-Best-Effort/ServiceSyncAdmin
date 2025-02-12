
import * as React from 'react';
import { SignInPage } from '@toolpad/core/SignInPage';

import { providerMap } from '../../../auth';

import signIn from './actions';
import { AppProvider } from '@toolpad/core/AppProvider';
import theme from '@/theme';

const BRANDING = {
    logo: (
      <img
        src="https://i.imgur.com/Qb4GvFV.png"
        alt="Roroman logo"
        style={{ height: 24 }}
      />
    ),
    title: 'ServiceSync',
  };

export default function SignIn() {

  return (
    <AppProvider branding={BRANDING} theme={theme}>
      <SignInPage
        signIn={signIn}
        providers={providerMap}
        slotProps={{ emailField: { autoFocus: false } }}
      />
    </AppProvider>
  );
}