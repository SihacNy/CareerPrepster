"use client";

import { useGoogleOneTapLogin } from "@react-oauth/google";
import { useAuth } from "@/lib/auth";

export function GoogleOneTapPrompt() {
  const { user, isLoading, loginWithGoogleCredential } = useAuth();

  useGoogleOneTapLogin({
    disabled: isLoading || Boolean(user),
    auto_select: false,
    cancel_on_tap_outside: true,
    use_fedcm_for_prompt: true,
    onSuccess: (credentialResponse) => {
      if (credentialResponse.credential) {
        loginWithGoogleCredential(credentialResponse.credential);
      }
    },
    onError: () => {
      // Silently catch dismissals or browser restrictions
      console.debug("Google One Tap prompt dismissed or unavailable");
    },
  });

  return null;
}
