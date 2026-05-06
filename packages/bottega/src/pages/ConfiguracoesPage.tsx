import { useState } from 'react';
import { Brandbar } from '../components/organisms/Brandbar';
import { GlobalFooter } from '../components/organisms/GlobalFooter';
import { Editorial } from '../components/atoms/Editorial';
import { Eyebrow } from '../components/atoms/Eyebrow';
import { Button } from '../components/atoms/Button';
import { USE_MOCK } from '../lib/utils/env';

export function ConfiguracoesPage() {
  const [smokeStatus, setSmokeStatus] = useState<'idle' | 'rodando' | 'ok' | 'erro'>('idle');
  const [smokeOutput, setSmokeOutput] = useState<string>('');

  const onSmokeTest = async () => {
    setSmokeStatus('rodando');
    setSmokeOutput('');
    try {
      const { smokeTestGeminiViaFn } = await import('../lib/gemini/orchestrator');
      const r = await smokeTestGeminiViaFn();
      setSmokeStatus(r.ok ? 'ok' : 'erro');
      setSmokeOutput(
        r.ok
          ? `Conexão validada em ${r.latencyMs}ms. Resposta: "${r.sample.trim()}"`
          : `Falhou: ${r.error ?? 'resposta inesperada'}`,
      );
    } catch (err) {
      setSmokeStatus('erro');
      setSmokeOutput(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="min-h-screen bg-osso">
      <Brandbar />
      <div className="px-12 pt-section-xl pb-section-lg max-w-content">
        <span className="font-ui text-[11px] uppercase tracking-widest opacity-60">Ajustes da casa</span>
        <h1 className="font-display text-[88px] leading-tight mt-4 mb-3">
          Configurações <em className="font-editorial italic font-regular">simples.</em>
        </h1>
        <Editorial size="l" className="opacity-75 mb-section-lg max-w-prose">
          Tudo o que controla a Bottega — em dois cliques.
        </Editorial>

        <section className="bg-areia px-10 py-10 mb-8 max-w-3xl">
          <Eyebrow className="block mb-4">Modo de geração</Eyebrow>
          <h2 className="font-display text-3xl mb-3">
            Você está em modo <em className="font-editorial italic font-regular">{USE_MOCK ? 'curadoria' : 'produção'}</em>.
          </h2>
          <p className="font-ui font-light leading-loose mb-5">
            {USE_MOCK
              ? 'A Bottega está usando dados de exemplo (mock). Nenhuma chamada à API Gemini ou Imagen é feita. Para ativar geração real, edite VITE_USE_MOCK=false em .env e reinicie o servidor.'
              : 'A Bottega está conectada ao Gemini real via Netlify Functions (key segura, server-side). Cada criação consome créditos. Imagens via Imagen 4 custam ~$0.04 por foto.'}
          </p>
          <div className="font-ui text-sm space-y-2 opacity-80">
            <div>
              <strong className="font-medium">Arquitetura:</strong>{' '}
              <span className="text-mar">Server-side proxy (Netlify Functions) — key nunca exposta no client.</span>
            </div>
          </div>
        </section>

        <section className="bg-osso border border-tinta-15 px-10 py-10 max-w-3xl">
          <Eyebrow className="block mb-4">Verificação de conexão</Eyebrow>
          <h2 className="font-display text-3xl mb-3">
            Testar a chave <em className="font-editorial italic font-regular">do Gemini.</em>
          </h2>
          <p className="font-ui font-light leading-loose mb-5">
            Faz uma chamada mínima ao Gemini 2.5 Flash (via Netlify Function) pra confirmar que a chave do servidor responde.
            Não custa nada.
          </p>
          <Button
            variant="primary"
            onClick={onSmokeTest}
            disabled={smokeStatus === 'rodando'}
          >
            {smokeStatus === 'rodando' ? 'Verificando…' : 'Verificar agora'}
          </Button>

          {smokeOutput && (
            <div
              className={`mt-6 px-5 py-4 font-editorial italic text-[16px] leading-snug ${
                smokeStatus === 'ok' ? 'bg-ceu/30 text-tinta' : 'bg-terracota/20 text-tinta'
              }`}
            >
              {smokeOutput}
            </div>
          )}
        </section>
      </div>
      <GlobalFooter />
    </div>
  );
}
