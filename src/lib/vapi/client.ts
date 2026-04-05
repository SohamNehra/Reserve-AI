const VAPI_BASE = "https://api.vapi.ai";

function vapiHeaders() {
  return {
    Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
    "Content-Type": "application/json",
  };
}

function buildTools(webhookUrl: string, webhookSecret: string) {
  return [
    {
      type: "function",
      function: {
        name: "check_availability",
        description: "Check available reservation slots for a given date. Always call this before creating a reservation.",
        parameters: {
          type: "object",
          properties: {
            date: { type: "string", description: "The date to check in YYYY-MM-DD format, e.g. 2026-04-07" },
          },
          required: ["date"],
        },
      },
      server: { url: webhookUrl, secret: webhookSecret },
    },
    {
      type: "function",
      function: {
        name: "create_reservation",
        description: "Create a reservation for a customer after confirming availability.",
        parameters: {
          type: "object",
          properties: {
            date:           { type: "string", description: "Date in YYYY-MM-DD format" },
            time_slot:      { type: "string", description: "Time slot in HH:MM format, e.g. 19:00" },
            customer_name:  { type: "string", description: "Full name of the customer" },
            customer_phone: { type: "string", description: "Customer phone number" },
            party_size:     { type: "number", description: "Number of people in the party" },
            notes:          { type: "string", description: "Any special requests or notes" },
          },
          required: ["date", "time_slot", "customer_name"],
        },
      },
      server: { url: webhookUrl, secret: webhookSecret },
    },
  ];
}

export type VapiAssistantConfig = {
  name: string;
  systemPrompt: string;
  webhookUrl: string;
  webhookSecret: string;
};

export async function createVapiAssistant(config: VapiAssistantConfig): Promise<string> {
  const body = {
    name: config.name,
    model: {
      provider: "openai",
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: config.systemPrompt,
        },
      ],
      tools: buildTools(config.webhookUrl, config.webhookSecret),
    },
    voice: {
      provider: "openai",
      voiceId: "alloy",
    },
    firstMessage: `Thank you for calling ${config.name}. How can I help you today?`,
    endCallMessage: "Thank you for calling. Have a great day!",
  };

  const res = await fetch(`${VAPI_BASE}/assistant`, {
    method: "POST",
    headers: vapiHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Vapi assistant creation failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.id as string;
}

export async function deleteVapiAssistant(assistantId: string): Promise<void> {
  await fetch(`${VAPI_BASE}/assistant/${assistantId}`, {
    method: "DELETE",
    headers: vapiHeaders(),
  });
}

/** Update tool server URLs on an existing assistant (useful when webhook URL changes).
 *  Uses PUT to avoid Vapi stripping tool definitions on PATCH. */
export async function updateVapiAssistantWebhook(
  assistantId: string,
  webhookUrl: string,
  webhookSecret: string
): Promise<void> {
  // Fetch current assistant to preserve system prompt + other fields
  const current = await fetch(`${VAPI_BASE}/assistant/${assistantId}`, {
    headers: vapiHeaders(),
  }).then((r) => r.json());

  const tools = buildTools(webhookUrl, webhookSecret);

  const res = await fetch(`${VAPI_BASE}/assistant/${assistantId}`, {
    method: "PUT",
    headers: vapiHeaders(),
    body: JSON.stringify({
      ...current,
      model: { ...current.model, tools },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to update assistant webhook: ${res.status} ${text}`);
  }
}
