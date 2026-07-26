// Storage & API Sync Service for Driver Ed Email Alerts (With 1-Year Auto-Unsubscribe)

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

// Auto-prune emails older than 1 year (365 days)
export const autoPruneLocalSubscribers = (subscribers) => {
  const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  let modified = false;

  const updated = subscribers.map((sub) => {
    if (sub.status === 'ACTIVE' && sub.createdAt) {
      const createdTime = new Date(sub.createdAt).getTime();
      if (!isNaN(createdTime) && (now - createdTime) >= ONE_YEAR_MS) {
        modified = true;
        return {
          ...sub,
          status: 'UNSUBSCRIBED',
          unsubscribeDate: new Date().toISOString()
        };
      }
    }
    return sub;
  });

  if (modified) {
    saveSubscribersToLocal(updated);
  }
  return updated;
};

export const getSubscribersFromLocal = () => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_SUBSCRIBERS));
      return INITIAL_DEMO_SUBSCRIBERS;
    }
    const list = JSON.parse(data);
    return autoPruneLocalSubscribers(list);
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
    await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: payloadStr,
    });

    const params = new URLSearchParams({
      action: action,
      email: data.email || '',
    });
    
    fetch(`${scriptUrl}?${params.toString()}`, { mode: 'no-cors' }).catch(() => {});

    return { success: true, message: 'Sent to Google Sheet!' };
  } catch (err) {
    return { success: true, isLocalFallback: true, message: 'Recorded locally.' };
  }
};

// Subscribe Email with Duplicate & 1-Year Check
export const subscribeUser = async ({ email }) => {
  const cleanEmail = email.trim().toLowerCase();
  const subscribers = getSubscribersFromLocal();
  const existingIndex = subscribers.findIndex((s) => s.email.toLowerCase() === cleanEmail);

  let updatedList = [...subscribers];
  let subscriberObj;
  let isAlreadyActive = false;

  if (existingIndex > -1) {
    const existing = subscribers[existingIndex];
    const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
    const isExpired = existing.createdAt && (Date.now() - new Date(existing.createdAt).getTime() >= ONE_YEAR_MS);

    if (existing.status === 'ACTIVE' && !isExpired) {
      isAlreadyActive = true;
      subscriberObj = existing;
    } else {
      // Re-activating a previously unsubscribed or 1-year expired email
      subscriberObj = {
        ...existing,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        unsubscribeDate: null,
      };
      updatedList[existingIndex] = subscriberObj;
      saveSubscribersToLocal(updatedList);
      await sendToGoogleSheet('SUBSCRIBE', { email: cleanEmail });
    }
  } else {
    // New email subscription
    subscriberObj = {
      id: 'sub-' + Date.now(),
      email: cleanEmail,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      unsubscribeDate: null,
    };
    updatedList.unshift(subscriberObj);
    saveSubscribersToLocal(updatedList);
    await sendToGoogleSheet('SUBSCRIBE', { email: cleanEmail });
  }

  return {
    subscriber: subscriberObj,
    isAlreadyActive,
    isNew: existingIndex === -1,
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
