export interface PendingAction {
  actionId: string;
  userId: string;
  toolName: string;
  args: any;
  summary: string;
  changes: any[];
  createdAt: number;
  expiresAt: number;
}

const actionStore = new Map<string, PendingAction>();

// TTL: 10 minutes
const ACTION_EXPIRATION_MS = 10 * 60 * 1000;

export const createPendingAction = (params: {
  userId: string;
  toolName: string;
  args: any;
  summary: string;
  changes?: any[];
}): PendingAction => {
  const actionId = `act_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = Date.now();
  const expiresAt = now + ACTION_EXPIRATION_MS;

  const action: PendingAction = {
    actionId,
    userId: params.userId,
    toolName: params.toolName,
    args: params.args,
    summary: params.summary,
    changes: params.changes || [],
    createdAt: now,
    expiresAt,
  };

  actionStore.set(actionId, action);
  return action;
};

export const getPendingAction = (actionId: string, userId: string): PendingAction | null => {
  const action = actionStore.get(actionId);
  if (!action) return null;

  if (action.userId !== userId) return null;

  if (Date.now() > action.expiresAt) {
    actionStore.delete(actionId);
    return null;
  }

  return action;
};

export const removePendingAction = (actionId: string): void => {
  actionStore.delete(actionId);
};
