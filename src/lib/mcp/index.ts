import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listDogs from "./tools/list-dogs";
import listReports from "./tools/list-reports";
import createReport from "./tools/create-report";
import listNotices from "./tools/list-notices";
import listCastrations from "./tools/list-castrations";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "patasegura-mcp",
  title: "PataSegura",
  version: "0.1.0",
  instructions:
    "Ferramentas do PataSegura, app municipal de controle de cães em situação de rua. " +
    "Use list_dogs para os cães cadastrados, list_reports e create_report para denúncias de maus-tratos, " +
    "list_notices para avisos da prefeitura e list_castrations para mutirões de castração. " +
    "Todos os dados respeitam as permissões do usuário autenticado.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listDogs, listReports, createReport, listNotices, listCastrations],
});
