import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, requireAuth, supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_castrations",
  title: "Listar mutirões de castração",
  description: "Lista as datas de castração com vagas totais e ocupadas.",
  inputSchema: {
    limit: z.number().int().min(1).max(100).default(20).describe("Quantidade máxima de mutirões."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    const unauth = requireAuth(ctx);
    if (unauth) return unauth;

    const { data, error } = await supabaseForUser(ctx)
      .from("castrations")
      .select("id, date, location, slots, taken, created_at")
      .order("date", { ascending: true })
      .limit(limit ?? 20);

    if (error) return errorResult(error.message);
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { castrations: data ?? [] },
    };
  },
});
