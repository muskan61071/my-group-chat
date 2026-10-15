import { useState, useEffect } from 'react';
import type { Group, GroupMember } from '../../../shared/types/index.js';

interface GroupState {
  groups: Group[];
  activeGroup: Group | null;
  members: GroupMember[];
  loading: boolean;
}

let globalGroupState: GroupState = {
  groups: [],
  activeGroup: null,
  members: [],
  loading: false,
};

const listeners = new Set<(state: GroupState) => void>();

function notify() {
  listeners.forEach((l) => l(globalGroupState));
}

export function useGroupStore() {
  const [state, setState] = useState<GroupState>(globalGroupState);

  useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  const setGroups = (groups: Group[]) => {
    globalGroupState = { ...globalGroupState, groups };
    notify();
  };

  const setActiveGroup = (activeGroup: Group | null) => {
    globalGroupState = { ...globalGroupState, activeGroup };
    notify();
  };

  const setMembers = (members: GroupMember[]) => {
    globalGroupState = { ...globalGroupState, members };
    notify();
  };

  return {
    ...state,
    setGroups,
    setActiveGroup,
    setMembers,
  };
}

export const groupStore = {
  getState: () => globalGroupState,
  setActiveGroup: (group: Group | null) => {
    globalGroupState = { ...globalGroupState, activeGroup: group };
    notify();
  },
};
