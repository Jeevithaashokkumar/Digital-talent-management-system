import { create } from 'zustand';

interface CallState {
  isCalling: boolean;
  isReceivingCall: boolean;
  isInCall: boolean;
  callAccepted: boolean;
  caller: any; // { id, name }
  callType: 'voice' | 'video' | null;
  remoteSignal: any;
  
  // Actions
  setCalling: (isCalling: boolean, caller?: any, type?: 'voice' | 'video') => void;
  setReceivingCall: (isReceivingCall: boolean, caller?: any, signal?: any, type?: 'voice' | 'video') => void;
  setCallAccepted: (accepted: boolean, signal?: any) => void;
  setInCall: (isInCall: boolean) => void;
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

  setCalling: (isCalling, caller = null, type = 'voice') => 
    set({ isCalling, caller, callType: type }),
    
  setReceivingCall: (isReceivingCall, caller = null, signal = null, type = 'voice') => 
    set({ isReceivingCall, caller, remoteSignal: signal, callType: type }),

  setCallAccepted: (accepted, signal = null) => 
    set({ callAccepted: accepted, remoteSignal: signal || useCallStore.getState().remoteSignal }),
    
  setInCall: (isInCall) => 
    set({ isInCall, isCalling: false, isReceivingCall: false, callAccepted: true }),
    
  resetCall: () => 
    set({ isCalling: false, isReceivingCall: false, isInCall: false, caller: null, remoteSignal: null, callType: null }),
}));
