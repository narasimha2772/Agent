export type AgentContext = {
  agentSlug: string;
  mode: "preview" | "publish";
  correlationId: string;
  config: Record<string, any>;
  logger: { info: Function; warn: Function; error: Function };
  http: typeof fetch;
};

export type PlanOutput = { planId: string; items: any[] };
export type ProduceOutput = { artifacts: string[]; meta?: any };
export type QualityReport = { ok: boolean; issues?: string[]; risk?: "low" | "medium" | "high" };
export type PublishResult = { published: boolean; urls?: string[]; reason?: string };
export type AgentReport = { summary: string; earningsPreviewUsd?: number; artifacts?: string[] };

export abstract class BaseAgent {
  abstract slug: string;
  abstract displayName: string;
  capabilities = ["plan", "produce", "qualityCheck", "publish"] as const;

  constructor(protected context: AgentContext) {}

  async plan(_input: any): Promise<PlanOutput> {
    return { planId: (globalThis as any).crypto?.randomUUID?.() || String(Date.now()), items: [] };
  }
  async produce(_plan: PlanOutput): Promise<ProduceOutput> {
    return { artifacts: [], meta: {} };
  }
  async qualityCheck(_produce: ProduceOutput): Promise<QualityReport> {
    return { ok: true, risk: "low" };
  }
  async publish(_produce: ProduceOutput, _qc: QualityReport): Promise<PublishResult> {
    if (this.context.mode === "preview") {
      return { published: false, urls: [], reason: "preview-mode" };
    }
    return { published: true, urls: [] };
  }
  async report(result: PublishResult): Promise<AgentReport> {
    return { summary: "completed", earningsPreviewUsd: 0, artifacts: result.urls || [] };
  }
}

