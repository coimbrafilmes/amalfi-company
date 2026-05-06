import { Eyebrow } from '../atoms/Eyebrow';
import { Input } from '../atoms/Input';
import { Textarea } from '../atoms/Textarea';
import { Slider } from '../atoms/Slider';
import { ToggleGroup } from '../atoms/ToggleGroup';
import { Button } from '../atoms/Button';
import { Field } from '../molecules/Field';
import { Dropzone } from '../molecules/Dropzone';
import type { CriacaoForm, EstiloImagem } from '../../types/anuncio';

interface FormCriacaoProps {
  form: CriacaoForm;
  setField: <K extends keyof CriacaoForm>(k: K, v: CriacaoForm[K]) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

/** FormCriacao — coluna esquerda da tela de criação. Bg Areia. */
export function FormCriacao({ form, setField, onSubmit, isSubmitting }: FormCriacaoProps) {
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

      <Field label="Foto crua do produto">
        <Dropzone
          preview={form.fotoBase64}
          onFile={(_, base64) => setField('fotoBase64', base64)}
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

      <Field label="Quantas imagens" hint="nove é a média para uma página que respira.">
        <div className="flex items-center justify-between mt-3 mb-2">
          <span className="font-ui text-[11px] opacity-50 tracking-wider">7</span>
          <span className="font-display text-[28px] text-tinta">{form.numeroImagens}</span>
          <span className="font-ui text-[11px] opacity-50 tracking-wider">12</span>
        </div>
        <Slider
          value={form.numeroImagens}
          min={7}
          max={12}
          onChange={(v) => setField('numeroImagens', v)}
        />
      </Field>

      <Field label="Estilo das imagens">
        <ToggleGroup<EstiloImagem>
          value={form.estiloImagem}
          onChange={(v) => setField('estiloImagem', v)}
          options={[
            { value: 'lifestyle', label: 'Lifestyle' },
            { value: 'infografico', label: 'Infográfico' },
            { value: 'misto', label: 'Misto' },
          ]}
        />
      </Field>

      <div className="mt-10 pt-8 border-t border-tinta-15 flex flex-col gap-3">
        <Button variant="primary" fullWidth onClick={onSubmit} disabled={isSubmitting || !form.nomeProduto}>
          {isSubmitting ? 'Gerando…' : 'Criar anúncio'}
        </Button>
        <Button variant="ghost" size="sm" fullWidth>
          Salvar rascunho
        </Button>
        <span className="font-editorial italic text-[13px] text-center text-tinta-65 mt-2">
          Cada criação leva, em média, três minutos.
        </span>
      </div>
    </div>
  );
}
