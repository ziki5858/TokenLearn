const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
let scriptPromise;

/**
 * Google Identity Services integration.
 *
 * The client asks Google for an ID token, then forwards that token to the
 * backend, which exchanges it for the application's own JWT.
 */
function buildPromptError(notification) {
  const notDisplayedReason = notification.getNotDisplayedReason?.();
  const skippedReason = notification.getSkippedReason?.();
  const dismissedReason = notification.getDismissedReason?.();

  const reason = notDisplayedReason || skippedReason || dismissedReason;
  if (!reason) {
    return new Error('Google sign-in was cancelled.');
  }

  if (reason.includes('fedcm') || reason.includes('browser_not_supported')) {
    return new Error('Google sign-in is blocked by browser FedCM settings. Enable third-party sign-in for this site and try again.');
  }

  if (reason.includes('invalid_client') || reason.includes('unregistered_origin')) {
    return new Error('Google OAuth configuration mismatch. Check Authorized JavaScript origins and client ID.');
  }

  return new Error(`Google sign-in could not start (${reason}).`);
}

function loadGoogleScript() {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`);
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', () => reject(new Error('Failed to load Google script')));
        return;
      }

      const script = document.createElement('script');
      script.src = GOOGLE_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google script'));
      document.head.appendChild(script);
    });
  }

  return scriptPromise;
}

export async function getGoogleIdToken(clientId) {
  if (!clientId) {
    throw new Error('Missing Google client ID');
  }

  await loadGoogleScript();

  return new Promise((resolve, reject) => {
    let settled = false;

    window.google.accounts.id.initialize({
      client_id: clientId,
      use_fedcm_for_prompt: true,
      callback: (response) => {
        if (!response?.credential) {
          if (!settled) {
            settled = true;
            reject(new Error('Google did not return an ID token'));
          }
          return;
        }

        if (!settled) {
          settled = true;
          resolve(response.credential);
        }
      }
    });

    window.google.accounts.id.prompt((notification) => {
      if (settled) {
        return;
      }

      const notDisplayed = notification.isNotDisplayed?.();
      const skipped = notification.isSkippedMoment?.();
      const dismissed = notification.isDismissedMoment?.();

      if (notDisplayed || skipped || dismissed) {
        settled = true;
        reject(buildPromptError(notification));
      }
    });
  });
}
