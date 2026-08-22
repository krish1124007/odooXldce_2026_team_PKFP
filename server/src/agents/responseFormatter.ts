export const formatAgentResponse = (params: {
  message: string;
  requiresConfirmation?: boolean;
  actions?: any[];
  toolsUsed?: string[];
}) => {
  // Ensure no internal chain-of-thought, system prompt, or hidden Groq keys/reasoning leak out
  let cleanMessage = params.message || "";
  cleanMessage = cleanMessage.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  return {
    success: true,
    data: {
      message: cleanMessage,
      requiresConfirmation: params.requiresConfirmation || false,
      actions: params.actions || [],
      metadata: {
        toolsUsed: params.toolsUsed || [],
        timestamp: new Date().toISOString(),
      },
    },
  };
};
