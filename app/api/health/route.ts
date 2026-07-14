import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/health
 *
 * Endpoint de diagnóstico. No devuelve secretos ni tokens.
 * Útil para verificar que Next.js y las rutas API funcionan
 * correctamente tras el despliegue en Azure App Service.
 */
export async function GET() {
  const copilotEndpoint = process.env.COPILOT_TOKEN_ENDPOINT ?? "";
  const directLineDomain = process.env.NEXT_PUBLIC_DIRECT_LINE_DOMAIN ?? "";
  // El transporte usa un dominio europeo por defecto si la variable no está definida
  const DEFAULT_DOMAIN = "https://europe.directline.botframework.com/v3/directline";

  return NextResponse.json({
    status: "ok",
    runtime: "node",
    copilotTokenEndpointConfigured: copilotEndpoint.length > 0,
    agentTransport: process.env.NEXT_PUBLIC_AGENT_TRANSPORT ?? "mock",
    directLineDomain: directLineDomain.length > 0 ? "(custom)" : `(default: ${DEFAULT_DOMAIN})`,
    directLineDomainConfigured: true, // siempre disponible: custom o default
  });
}
