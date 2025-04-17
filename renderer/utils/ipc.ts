// src/utils/ipc.ts
// IPC communication utilities for the renderer process

/**
 * Send a message to the main process and wait for a response
 * @param channel The channel to send the message on
 * @param data Optional data to send with the message
 * @returns A promise that resolves with the response from the main process
 */
export const sendToMain = async (channel: string, data?: any): Promise<any> => {
  if (!window.electron?.ipcRenderer) {
    throw new Error('IPC renderer not available');
  }
  return window.electron.ipcRenderer.invoke(channel, data);
};

/**
 * Listen for messages from the main process
 * @param channel The channel to listen on
 * @param callback The callback to call when a message is received
 * @returns A function that can be called to remove the listener
 */
export const listenToMain = (channel: string, callback: (data: any) => void): () => void => {
  if (!window.electron?.ipcRenderer) {
    console.error('IPC renderer not available');
    return () => {}; // Return a no-op cleanup function
  }
  
  const handler = (_event: any, data: any) => callback(data);
  window.electron.ipcRenderer.on(channel, handler);
  
  return () => {
    window.electron.ipcRenderer.removeListener(channel, handler);
  };
};

/**
 * Send a one-time message to the main process and listen for a response on a specific channel
 * @param sendChannel The channel to send the message on
 * @param listenChannel The channel to listen for the response on
 * @param data Optional data to send with the message
 * @returns A promise that resolves with the response from the main process
 */
export const sendToMainAndListen = (
  sendChannel: string, 
  listenChannel: string, 
  data?: any
): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!window.electron?.ipcRenderer) {
      reject(new Error('IPC renderer not available'));
      return;
    }
    
    // Set up a one-time listener for the response
    const cleanup = listenToMain(listenChannel, (response) => {
      cleanup(); // Remove the listener once we get a response
      resolve(response);
    });
    
    // Send the message
    try {
      window.electron.ipcRenderer.send(sendChannel, data);
    } catch (error) {
      cleanup(); // Clean up the listener if sending fails
      reject(error);
    }
    
    // Optional: Set up a timeout to prevent hanging
    setTimeout(() => {
      cleanup();
      reject(new Error(`Timeout waiting for response on channel ${listenChannel}`));
    }, 30000); // 30 second timeout
  });
};
