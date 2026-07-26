import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, requireAuth, supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_dogs",
  title: "Listar cães cadastrados",
  description: "Lista os cães em situação de rua cadastrados no PataSegura.",
  inputSchema: {
    limit: z.number().int().min(1).max(100).default(20).describe("Quantidade máxima de registros."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    const unauth = requireAuth(ctx);
    if (unauth) return unauth;

    const { data, error } = await supabaseForUser(ctx)
      .from("dogs")
      .select("id, description, condition, address, lat, lng, triage, created_at")
      .order("created_at", { ascending: false })
      .limit(limit ?? 20);

    if (error) return errorResult(error.message);
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { dogs: data ?? [] },
    };
  },
});
