import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, requireAuth, supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_reports",
  title: "Listar denúncias",
  description: "Lista as denúncias de maus-tratos visíveis para o usuário autenticado.",
  inputSchema: {
    limit: z.number().int().min(1).max(100).default(20).describe("Quantidade máxima de denúncias."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    const unauth = requireAuth(ctx);
    if (unauth) return unauth;

    const { data, error } = await supabaseForUser(ctx)
      .from("reports")
      .select("id, description, address, lat, lng, created_at")
      .order("created_at", { ascending: false })
      .limit(limit ?? 20);

    if (error) return errorResult(error.message);
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { reports: data ?? [] },
    };
  },
});
