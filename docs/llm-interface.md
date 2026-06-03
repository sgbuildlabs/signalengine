# LLM Interface and Numeric Safety (Sprint 0, Design Only)

## Provider-Agnostic Interface
```ts
export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  text: string;
  json?: unknown;
  usage?: { inputTokens: number; outputTokens: number };
  model: string;
}

export interface LLMClient {
  complete(input: {
    system: string;
    messages: LLMMessage[];
    jsonSchema?: Record<string, unknown> | null;
  }): Promise<LLMResponse>;
}
```

## Adapters (Vercel AI SDK)
- `GeminiClient`: wraps Gemini provider with structured output enforcement.
- `OpenAIClient`: wraps OpenAI provider with structured output enforcement.
- Adapter selected by `LLM_PROVIDER=gemini|openai`.

## Role-Based Model Routing
- Environment variables:
  - `LLM_PROVIDER`
  - `LLM_AGENT_MODEL`
  - `LLM_ORCHESTRATOR_MODEL`
- Runtime selector:
  - agents always use `LLM_AGENT_MODEL`
  - orchestrator uses `LLM_ORCHESTRATOR_MODEL`
- Rule: no model string literals in logic.

## Structured Output Enforcement
- Every agent extraction/classification call includes strict JSON schema.
- Orchestrator mission-plan and synthesis helper calls also schema-validated.
- Invalid JSON/schema mismatch is treated as agent error (`partial`/`failed`) and routed through missing-data penalty behavior.

## Numeric Hallucination Gate (Spec §18)

### Inputs
- Deterministic `model_outputs` object with canonical numbers.
- Candidate LLM narrative text.

### Steps
1. Build `allowed_numbers` from deterministic fields:
   - score, previous score, range bounds, confidence, contributions, penalties, counts emitted by deterministic code.
2. Normalize both allowed and emitted numbers to canonical decimal strings.
3. Extract emitted numbers from prose with regex.
4. Validate subset relation.

```ts
function extractNumbers(text: string): string[];
function normalizeNumberString(s: string): string;
function validateLlmNumbers(llmText: string, allowed: Set<string>): boolean;
```

### Failure Policy
If validation fails:
1. Reject generated text.
2. Retry once with stricter system instruction.
3. If still invalid, render deterministic template narrative from model output JSON.

### Required Synthesis Guardrail Prompt
`You may only use numeric values present in model_output_json.allowed_numbers. Do not create, infer, or round new numeric values.`

## Caching LLM Calls
- Cache key: hash(provider + model + system + messages + schema).
- Persist in `cache` table with TTL.
- Cache failures briefly to avoid retry storms.

## Non-Negotiable Boundary
- LLM output is never accepted as score/weight/confidence source.
- LLM can narrate and structure only; all numbers come from model stack outputs.
