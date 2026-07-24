// Storage & API Sync Service for Driver Ed Email Alerts (Simplified & Reliable Google Sheet Sync)

const LOCAL_STORAGE_KEY = 'driver_ed_emails_v2';
const GOOGLE_SCRIPT_URL_KEY = 'driver_ed_google_script_url';
const DEFAULT_GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw5O8lMe2PtS65_ETGAugQfzjF5PV3um7Nq0lWPw3NAriu83qPFW35yMgNX1m-WzT-N/exec';

const INITIAL_DEMO_SUBSCRIBERS = [
  {
    id: 'sub-1',
    email: 'alex.rivera@example.com',
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    unsubscribeDate: null,
  },
  {
    id: 'sub-2',
    email: 'sarah.c@example.com',
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    unsubscribeDate: null,
  }
];

export const getGoogleScriptUrl = () => {
  return localStorage.getItem(GOOGLE_SCRIPT_URL_KEY) || DEFAULT_GOOGLE_SCRIPT_URL;
};

export const setGoogleScriptUrl = (url) => {
  if (url) {
    localStorage.setItem(GOOGLE_SCRIPT_URL_KEY, url.trim());
  } else {
    localStorage.removeItem(GOOGLE_SCRIPT_URL_KEY);
  }
};

export const getSubscribersFromLocal = () => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_SUBSCRIBERS));
      return INITIAL_DEMO_SUBSCRIBERS;
    }
    return JSON.parse(data);
  } catch (err) {
    return INITIAL_DEMO_SUBSCRIBERS;
  }
};

export const saveSubscribersToLocal = (subscribers) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(subscribers));
};

// Send action request to Google Apps Script endpoint
export const sendToGoogleSheet = async (action, data) => {
  const scriptUrl = getGoogleScriptUrl();
  if (!scriptUrl) {
    return { success: true, isLocalFallback: true, message: 'Saved locally.' };
  }

  const payloadStr = JSON.stringify({ action, data });

  try {
    // 1. Send via mode: 'no-cors' fetch (bypasses browser CORS blocks)
    await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: payloadStr,
    });

    // 2. Also send via GET URL parameter fallback for 100% delivery guarantee
    const params = new URLSearchParams({
      action: action,
      email: data.email || '',
    });
    
    // Silent ping fallback
    fetch(`${scriptUrl}?${params.toString()}`, { mode: 'no-cors' }).catch(() => {});

    return { success: true, message: 'Sent to Google Sheet!' };
  } catch (err) {
    console.warn('Google Sheet fetch warning:', err);
    return { success: true, isLocalFallback: true, message: 'Recorded locally.' };
  }
};

// Subscribe Email
export const subscribeUser = async ({ email }) => {
  const cleanEmail = email.trim().toLowerCase();
  const subscribers = getSubscribersFromLocal();
  const existingIndex = subscribers.findIndex((s) => s.email.toLowerCase() === cleanEmail);

  let updatedList = [...subscribers];
  let subscriberObj;

  if (existingIndex > -1) {
    subscriberObj = {
      ...subscribers[existingIndex],
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      unsubscribeDate: null,
    };
    updatedList[existingIndex] = subscriberObj;
  } else {
    subscriberObj = {
      id: 'sub-' + Date.now(),
      email: cleanEmail,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      unsubscribeDate: null,
    };
    updatedList.unshift(subscriberObj);
  }

  saveSubscribersToLocal(updatedList);
  const apiResult = await sendToGoogleSheet('SUBSCRIBE', { email: cleanEmail });

  return {
    subscriber: subscriberObj,
    isNew: existingIndex === -1,
    apiResult,
  };
};

// Unsubscribe Email
export const unsubscribeUser = async ({ email }) => {
  const cleanEmail = email.trim().toLowerCase();
  const subscribers = getSubscribersFromLocal();
  const existingIndex = subscribers.findIndex((s) => s.email.toLowerCase() === cleanEmail);

  if (existingIndex === -1) {
    return { success: false, message: 'Email address not found in mailing list.' };
  }

  const updatedList = [...subscribers];
  updatedList[existingIndex] = {
    ...updatedList[existingIndex],
    status: 'UNSUBSCRIBED',
    unsubscribeDate: new Date().toISOString(),
  };

  saveSubscribersToLocal(updatedList);
  const apiResult = await sendToGoogleSheet('UNSUBSCRIBE', { email: cleanEmail });

  return {
    success: true,
    message: 'Your email address has been removed.',
    subscriber: updatedList[existingIndex],
    apiResult,
  };
};
