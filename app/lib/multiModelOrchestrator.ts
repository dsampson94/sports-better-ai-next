// lib/multiModelOrchestrator.ts
import { modelRegistry, ModelDefinition } from "./modelRegistry";

/**
 * Calls all *enabled* models in parallel for a given prompt.
 * Returns an object: { [modelId]: response }
 */
export async function callEnabledModels(prompt: string) {
    // Filter only the enabled models
    const enabledModels = modelRegistry.filter((m) => m.enabled);

    // Create an array of promise calls
    const calls = enabledModels.map((model) => model.call(prompt));

    // Execute in parallel
    const results = await Promise.all(calls);

    // Build a response map from modelId -> string
    const responseMap: Record<string, string> = {};
    for (let i = 0; i < enabledModels.length; i++) {
        responseMap[enabledModels[i].id] = results[i];
    }
    return responseMap;
}
