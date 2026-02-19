"use client";

import StoreProvider from "@/state/redux";
import { Authenticator } from "@aws-amplify/ui-react";
import Auth from "./(auth)/authProvider";
import { LanguageProvider } from "@/lib/i18n-client";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <Authenticator.Provider>
        <LanguageProvider>
          <Auth>{children}</Auth>
        </LanguageProvider>
      </Authenticator.Provider>
    </StoreProvider>
  );
};

export default Providers;
