interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: { theme: string; size: string; width: string; shape: string },
  ) => void;
}

// The Google Identity Services script (accounts.google.com/gsi/client)
// attaches itself here at runtime - read as the plain identifier `google`
// (not `window.google`, which this repo's lint config forbids outright).
declare global {
  var google: { accounts: { id: GoogleAccountsId } } | undefined;
}

export {};
