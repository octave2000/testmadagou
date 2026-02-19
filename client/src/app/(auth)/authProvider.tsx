"use client";

import React, { useEffect } from "react";
import { Amplify } from "aws-amplify";
import {
  Authenticator,
  Heading,
  Radio,
  RadioGroupField,
  useAuthenticator,
  View,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "@/lib/i18n-client";

// https://docs.amplify.aws/gen1/javascript/tools/libraries/configure-categories/
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID!,
      userPoolClientId:
        process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID!,
    },
  },
});

const Auth = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthenticator((context) => [context.user]);
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslations();

  const components = {
    Header() {
      return (
        <View className="mt-4 mb-7">
          <Heading level={3} className="!text-2xl !font-bold">
            <Link href={"/"} className="flex items-center">
              <span className=" font-bold text-2xl ">
                <span className="text-4xl text-blue-700 font-bold">M</span>
                adagou
              </span>
            </Link>
          </Heading>
          <p className="text-muted-foreground mt-2">
            <span className="font-bold">{t("auth.welcome")}</span>{" "}
            {t("auth.signInToContinue")}
          </p>
        </View>
      );
    },
    SignIn: {
      Footer() {
        const { toSignUp } = useAuthenticator();
        const { toForgotPassword } = useAuthenticator();
        return (
          <View className="text-center mt-4">
            <>
              <p>
                {t("auth.noAccount")}{" "}
                <button
                  onClick={toForgotPassword}
                  className="text-primary hover:underline bg-transparent border-none p-0"
                >
                  {t("auth.forgotPassword")}
                </button>
              </p>
              <p className="text-muted-foreground">
                {t("auth.noAccount")}{" "}
                <button
                  onClick={toSignUp}
                  className="text-primary hover:underline bg-transparent border-none p-0"
                >
                  {t("auth.signUpHere")}
                </button>
              </p>
            </>
          </View>
        );
      },
    },
    SignUp: {
      FormFields() {
        const { validationErrors } = useAuthenticator();

        return (
          <>
            <Authenticator.SignUp.FormFields />
            <RadioGroupField
              legend={t("auth.role")}
              name="custom:role"
              errorMessage={validationErrors?.["custom:role"]}
              hasError={!!validationErrors?.["custom:role"]}
              isRequired
            >
              <Radio value="tenant">{t("auth.tenant")}</Radio>
              <Radio value="manager">{t("auth.manager")}</Radio>
            </RadioGroupField>
          </>
        );
      },

      Footer() {
        const { toSignIn } = useAuthenticator();
        return (
          <View className="text-center mt-4">
            <p className="text-muted-foreground">
              {t("auth.alreadyHaveAccount")}{" "}
              <button
                onClick={toSignIn}
                className="text-primary hover:underline bg-transparent border-none p-0"
              >
                {t("auth.signIn")}
              </button>
            </p>
          </View>
        );
      },
    },
  };

  const formFields = {
    signIn: {
      username: {
        placeholder: t("auth.enterEmail"),
        label: t("auth.email"),
        isRequired: true,
      },
      password: {
        placeholder: t("auth.enterPassword"),
        label: t("auth.password"),
        isRequired: true,
      },
    },
    signUp: {
      username: {
        order: 1,
        placeholder: t("auth.chooseUsername"),
        label: t("auth.username"),
        isRequired: true,
      },
      email: {
        order: 2,
        placeholder: t("auth.enterEmailAddress"),
        label: t("auth.email"),
        isRequired: true,
      },
      password: {
        order: 3,
        placeholder: t("auth.createPassword"),
        label: t("auth.password"),
        isRequired: true,
      },
      confirm_password: {
        order: 4,
        placeholder: t("auth.confirmPasswordPlaceholder"),
        label: t("auth.confirmPassword"),
        isRequired: true,
      },
    },
  };

  const isAuthPage = pathname.match(/^\/(signin|signup)$/);
  const isDashboardPage =
    pathname.startsWith("/manager") ||
    pathname.startsWith("/tenants") ||
    pathname.startsWith("/admin");

  // Redirect authenticated users away from auth pages
  useEffect(() => {
    if (user && isAuthPage) {
      router.push("/");
    }
  }, [user, isAuthPage, router]);

  // Allow access to public pages without authentication
  if (!isAuthPage && !isDashboardPage) {
    return <>{children}</>;
  }

  return (
    <div className="h-full">
      <Authenticator
        initialState={pathname.includes("signup") ? "signUp" : "signIn"}
        components={components}
        formFields={formFields}
      >
        {() => <>{children}</>}
      </Authenticator>
    </div>
  );
};

export default Auth;
