import { create } from 'zustand';

interface CallState {
  isCalling: boolean;
  isReceivingCall: boolean;
  isInCall: boolean;
  callAccepted: boolean;
  caller: { id: string, name: string } | null;
  callType: 'voice' | 'video' | null;
  remoteSignal: any | null;
  setCalling: (isCalling: boolean, caller: { id: string, name: string } | null, type?: 'voice' | 'video') => void;
  setReceivingCall: (isReceivingCall: boolean, caller: { id: string, name: string } | null, signal: any, type: 'voice' | 'video') => void;
  setInCall: (isInCall: boolean) => void;
  setCallAccepted: (callAccepted: boolean) => void;
  resetCall: () => void;
}

export const useCallStore = create<CallState>((set) => ({
  isCalling: false,
  isReceivingCall: false,
  isInCall: false,
  callAccepted: false,
  caller: null,
  callType: null,
  remoteSignal: null,

  setCalling: (isCalling, caller, type = 'voice') => set({ 
    isCalling, 
    caller, 
    callType: type,
    isReceivingCall: false,
    isInCall: false,
    callAccepted: false
  }),

  setReceivingCall: (isReceivingCall, caller, signal, type) => set({
    isReceivingCall,
    caller,
    remoteSignal: signal,
    callType: type,
    isCalling: false,
    isInCall: false,
    callAccepted: false
  }),

  setInCall: (isInCall) => set({ isInCall }),
  
  setCallAccepted: (callAccepted: boolean, signal?: any) => set((state) => ({ 
    callAccepted, 
    remoteSignal: signal !== undefined ? signal : state.remoteSignal 
  })),

  resetCall: () => set({
    isCalling: false,
    isReceivingCall: false,
    isInCall: false,
    callAccepted: false,
    caller: null,
    callType: null,
    remoteSignal: null
  })
}));
