import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, requireAuth, supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_report",
  title: "Registrar denúncia",
  description: "Cria uma denúncia de maus-tratos em nome do usuário autenticado.",
  inputSchema: {
    description: z.string().trim().min(1).describe("Descrição da situação observada."),
    address: z.string().trim().optional().describe("Endereço ou referência do local."),
    lat: z.number().optional().describe("Latitude do local."),
    lng: z.number().optional().describe("Longitude do local."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ description, address, lat, lng }, ctx) => {
    const unauth = requireAuth(ctx);
    if (unauth) return unauth;

    const { data, error } = await supabaseForUser(ctx)
      .from("reports")
      .insert({
        description,
        address: address ?? null,
        lat: lat ?? null,
        lng: lng ?? null,
        created_by: ctx.getUserId(),
      })
      .select("id, description, address, created_at");

    if (error) return errorResult(error.message);
    return {
      content: [{ type: "text", text: `Denúncia registrada: ${JSON.stringify(data?.[0] ?? {})}` }],
      structuredContent: { report: data?.[0] ?? null },
    };
  },
});
