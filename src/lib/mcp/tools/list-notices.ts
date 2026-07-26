import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, requireAuth, supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_notices",
  title: "Listar avisos da prefeitura",
  description: "Lista os avisos e campanhas publicados pela prefeitura no PataSegura.",
  inputSchema: {
    limit: z.number().int().min(1).max(100).default(20).describe("Quantidade máxima de avisos."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    const unauth = requireAuth(ctx);
    if (unauth) return unauth;

    const { data, error } = await supabaseForUser(ctx)
      .from("notices")
      .select("id, title, message, date, type, created_at")
      .order("created_at", { ascending: false })
      .limit(limit ?? 20);

    if (error) return errorResult(error.message);
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { notices: data ?? [] },
    };
  },
});
