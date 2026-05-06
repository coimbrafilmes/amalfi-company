#!/usr/bin/env node
/**
 * Smoke test direto à API Gemini — útil pra validar a key fora do contexto Netlify.
 * Custo: $0 (Gemini 2.5 Flash, prompt mínimo, free tier).
 *
 * Lê GEMINI_API_KEY (server-side, sem prefixo VITE_) do .env.
 *
 * Usar: node scripts/smoke-test.mjs
 */

import { GoogleGenAI } from '@google/genai';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '..', '.env');

// Carrega .env manualmente (sem dotenv pra evitar dep)
const env = {};
if (fs.existsSync(envPath)) {
  const txt = fs.readFileSync(envPath, 'utf-8');
  for (const line of txt.split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.+)$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const apiKey = env.GEMINI_API_KEY ?? process.env.GEMINI_API_KEY;
const model = env.GEMINI_TEXT_MODEL ?? 'gemini-2.5-flash';

if (!apiKey) {
  console.error('✗ GEMINI_API_KEY não encontrada em .env (sem prefixo VITE_)');
  process.exit(1);
}

console.log(`→ Smoke test Gemini`);
console.log(`  Modelo: ${model}`);
console.log(`  Key: ${apiKey.slice(0, 10)}…${apiKey.slice(-4)}`);

const start = Date.now();

try {
  const client = new GoogleGenAI({ apiKey });
  const result = await client.models.generateContent({
    model,
    contents: 'Responda apenas com a palavra "ok".',
  });
  const text = result.text ?? '(sem texto)';
  const elapsed = Date.now() - start;

  if (text.toLowerCase().includes('ok')) {
    console.log(`✓ OK — latência ${elapsed}ms`);
    console.log(`  resposta: "${text.trim()}"`);
    process.exit(0);
  } else {
    console.warn(`⚠ Resposta inesperada (${elapsed}ms): "${text.trim()}"`);
    process.exit(0);
  }
} catch (err) {
  const elapsed = Date.now() - start;
  console.error(`✗ FALHOU (${elapsed}ms)`);
  console.error(`  ${err instanceof Error ? err.message : String(err)}`);
  process.exit(2);
}
