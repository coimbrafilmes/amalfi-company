import { Eyebrow } from '../atoms/Eyebrow';
import { Input } from '../atoms/Input';
import { Textarea } from '../atoms/Textarea';
import { Slider } from '../atoms/Slider';
import { ToggleGroup } from '../atoms/ToggleGroup';
import { Button } from '../atoms/Button';
import { Field } from '../molecules/Field';
import { Dropzone } from '../molecules/Dropzone';
import type { CriacaoForm, EstiloImagem } from '../../types/anuncio';
import { FORM_DEFAULTS } from '../../types/anuncio';

interface FormCriacaoProps {
  form: CriacaoForm;
  setField: <K extends keyof CriacaoForm>(k: K, v: CriacaoForm[K]) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const ESTILO_OPTIONS: { value: EstiloImagem; label: string }[] = [
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'infografico', label: 'Infográfico' },
  { value: 'misto', label: 'Misto' },
];

/** FormCriacao — coluna esquerda da tela de criação. Bg Areia.
 *  V4 (Gumpinho-style): 2 categorias (Anúncio, A+) com sliders + estilos próprios. */
export function FormCriacao({ form, setField, onSubmit, isSubmitting }: FormCriacaoProps) {
  // Validação mínima: nome + detalhes técnicos. Sem ambos, prompts geram análise vazia.
  const isValid = form.nomeProduto.trim().length >= 3 && form.detalhesTecnicos.trim().length >= 20;

  return (
    <div className="bg-areia px-12 py-section-lg pb-20 border-r border-tinta-15">
      <div className="flex items-center gap-3 mb-6">
        <span className="font-display text-sm text-terracota">01</span>
        <Eyebrow>O Produto</Eyebrow>
      </div>

      <h2 className="font-display text-[44px] leading-tight mb-3">
        Comece pelo <em className="font-editorial italic font-regular">essencial.</em>
      </h2>
      <p className="font-editorial italic text-lg leading-snug text-tinta-65 mb-10 pb-8 border-b border-tinta-15">
        Cole a foto, dê um nome, conte os detalhes que importam. Evitamos pressa.
      </p>

      <Field
        label="Nome do produto"
        hint='o nome simples — sem "incrível", sem "premium".'
      >
        <Input
          placeholder="Tomada NBR 14136 · branca · 10A"
          value={form.nomeProduto}
          onChange={(e) => setField('nomeProduto', e.target.value)}
        />
      </Field>

      <Field
        label="Fotos de referência"
        hint="até 3 fotos do produto · usadas como referência fiel pra todas as imagens geradas."
      >
        <Dropzone
          previews={form.fotosBase64 ?? []}
          onFiles={(fotos) => setField('fotosBase64', fotos)}
          maxFiles={3}
        />
      </Field>

      <Field label="Detalhes técnicos">
        <Textarea
          placeholder="Voltagem · material · dimensões · conteúdo da caixa · garantia"
          value={form.detalhesTecnicos}
          onChange={(e) => setField('detalhesTecnicos', e.target.value)}
        />
      </Field>

      <Field label="Título atual" optional>
        <Input
          placeholder="Cole se já existe — para evitarmos repetir palavras."
          value={form.tituloAtual ?? ''}
          onChange={(e) => setField('tituloAtual', e.target.value)}
        />
      </Field>

      {/* === Sub-seção: IMAGENS DE ANÚNCIO === */}
      <div className="mt-12 pt-10 border-t border-tinta-15">
        <div className="flex items-center gap-3 mb-3">
          <span className="font-display text-sm text-terracota">02</span>
          <Eyebrow>Imagens de Anúncio</Eyebrow>
        </div>
        <p className="font-editorial italic text-base leading-snug text-tinta-65 mb-6">
          As 2000×2000 que aparecem na galeria principal do produto na Amazon.
        </p>

        <Field label="Quantas imagens de anúncio" hint={`entre ${FORM_DEFAULTS.numeroAnuncioMin} e ${FORM_DEFAULTS.numeroAnuncioMax} · sete é o ponto-doce.`}>
          <div className="flex items-center justify-between mt-3 mb-2">
            <span className="font-ui text-[11px] opacity-50 tracking-wider">{FORM_DEFAULTS.numeroAnuncioMin}</span>
            <span className="font-display text-[28px] text-tinta">{form.numeroAnuncio}</span>
            <span className="font-ui text-[11px] opacity-50 tracking-wider">{FORM_DEFAULTS.numeroAnuncioMax}</span>
          </div>
          <Slider
            value={form.numeroAnuncio}
            min={FORM_DEFAULTS.numeroAnuncioMin}
            max={FORM_DEFAULTS.numeroAnuncioMax}
            onChange={(v) => setField('numeroAnuncio', v)}
          />
        </Field>

        <Field label="Estilo · Anúncio">
          <ToggleGroup<EstiloImagem>
            value={form.estiloAnuncio}
            onChange={(v) => setField('estiloAnuncio', v)}
            options={ESTILO_OPTIONS}
          />
        </Field>
      </div>

      {/* === Sub-seção: CONTEÚDO A+ === */}
      <div className="mt-12 pt-10 border-t border-tinta-15">
        <div className="flex items-center gap-3 mb-3">
          <span className="font-display text-sm text-terracota">03</span>
          <Eyebrow>Conteúdo A+</Eyebrow>
        </div>
        <p className="font-editorial italic text-base leading-snug text-tinta-65 mb-6">
          As 970×600 (e premium 1464×600) que enriquecem a página de descrição.
        </p>

        <Field label="Quantas imagens A+" hint={`entre ${FORM_DEFAULTS.numeroAplusMin} e ${FORM_DEFAULTS.numeroAplusMax} · cinco basta na maioria.`}>
          <div className="flex items-center justify-between mt-3 mb-2">
            <span className="font-ui text-[11px] opacity-50 tracking-wider">{FORM_DEFAULTS.numeroAplusMin}</span>
            <span className="font-display text-[28px] text-tinta">{form.numeroAplus}</span>
            <span className="font-ui text-[11px] opacity-50 tracking-wider">{FORM_DEFAULTS.numeroAplusMax}</span>
          </div>
          <Slider
            value={form.numeroAplus}
            min={FORM_DEFAULTS.numeroAplusMin}
            max={FORM_DEFAULTS.numeroAplusMax}
            onChange={(v) => setField('numeroAplus', v)}
          />
        </Field>

        <Field label="Estilo · A+">
          <ToggleGroup<EstiloImagem>
            value={form.estiloAplus}
            onChange={(v) => setField('estiloAplus', v)}
            options={ESTILO_OPTIONS}
          />
        </Field>
      </div>

      <div className="mt-10 pt-8 border-t border-tinta-15 flex flex-col gap-3">
        <Button variant="primary" fullWidth onClick={onSubmit} disabled={isSubmitting || !isValid}>
          {isSubmitting ? 'Gerando…' : 'Criar anúncio'}
        </Button>
        <Button variant="ghost" size="sm" fullWidth>
          Salvar rascunho
        </Button>
        {!isValid && !isSubmitting ? (
          <span className="font-editorial italic text-[13px] text-center text-tinta-65 mt-2">
            Para começar, preencha o nome do produto e os detalhes técnicos (ao menos 20 caracteres).
          </span>
        ) : (
          <span className="font-editorial italic text-[13px] text-center text-tinta-65 mt-2">
            Cada criação leva, em média, três minutos.
          </span>
        )}
      </div>
    </div>
  );
}
