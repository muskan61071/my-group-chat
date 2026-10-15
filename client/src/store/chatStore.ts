import { useState, useEffect } from 'react';
import type { Message } from '../../../shared/types/index.js';

interface ChatState {
  messages: Message[];
  activeGroupId: string | null;
  replyTarget: Message | null;
  typingUsers: string[];
}

let globalChatState: ChatState = {
  messages: [],
  activeGroupId: null,
  replyTarget: null,
  typingUsers: [],
};

const listeners = new Set<(state: ChatState) => void>();

function notify() {
  listeners.forEach((l) => l(globalChatState));
}

export function useChatStore() {
  const [state, setState] = useState<ChatState>(globalChatState);

  useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  const setMessages = (messages: Message[]) => {
    globalChatState = { ...globalChatState, messages };
    notify();
  };

  const addMessage = (message: Message) => {
    globalChatState = {
      ...globalChatState,
      messages: [...globalChatState.messages, message],
    };
    notify();
  };

  const setReplyTarget = (replyTarget: Message | null) => {
    globalChatState = { ...globalChatState, replyTarget };
    notify();
  };

  const setTypingUsers = (typingUsers: string[]) => {
    globalChatState = { ...globalChatState, typingUsers };
    notify();
  };

  return {
    ...state,
    setMessages,
    addMessage,
    setReplyTarget,
    setTypingUsers,
  };
}

export const chatStore = {
  getState: () => globalChatState,
  setReplyTarget: (msg: Message | null) => {
    globalChatState = { ...globalChatState, replyTarget: msg };
    notify();
  },
};
