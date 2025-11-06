import { create } from 'zustand';

export interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  isLocal?: boolean;
  stream: MediaStream | null;
}

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
}

interface PartyStore {
  roomCode: string;
  participants: Participant[];
  messages: Message[];
  setRoomCode: (code: string) => void;
  addParticipant: (participant: Participant) => void;
  removeParticipant: (id: string) => void;
  updateParticipantStream: (id: string, stream: MediaStream) => void;
  addMessage: (message: Message) => void;
  clearParticipants: () => void;
}

export const usePartyStore = create<PartyStore>((set) => ({
  roomCode: '',
  participants: [],
  messages: [],
  
  setRoomCode: (code) => set({ roomCode: code }),
  
  addParticipant: (participant) => set((state) => {
    // Check if participant already exists
    const exists = state.participants.some(p => p.id === participant.id);
    if (exists) {
      return state;
    }
    return {
      participants: [...state.participants, participant]
    };
  }),
  
  removeParticipant: (id) => set((state) => ({
    participants: state.participants.filter(p => p.id !== id)
  })),
  
  updateParticipantStream: (id, stream) => set((state) => ({
    participants: state.participants.map(p => 
      p.id === id ? { ...p, stream } : p
    )
  })),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  
  clearParticipants: () => set({ participants: [] }),
}));
