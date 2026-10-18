'use client';

import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';

/**
 * ChefX screens redrawn with the real app's palette (Google Play screenshots): wine-red app bar
 * and actions #960000, free tables outlined and occupied tables filled in #D32F2F (the site has no green), text #383838 on white.
 * Content mirrors the real app: table map, product with note, order review, bill split.
 * Everything is sized in cqw so the phone scales as one piece.
 */

export type ScreenId = 'mesas' | 'pedido' | 'comanda' | 'conta';

const OCCUPIED = new Set([1, 4, 9, 10, 12, 18, 21]);

function Header({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-[4cqw] flex items-center gap-[4cqw] bg-[#960000] px-[5cqw] py-[3.4cqw] text-white shadow-md">
      <span className="text-[5cqw]">←</span>
      <div className="min-w-0">
        <p className="truncate text-[4.4cqw] font-semibold uppercase leading-tight">{title}</p>
        {sub && <p className="text-[3cqw] uppercase text-white/70">{sub}</p>}
      </div>
    </div>
  );
}

function Button({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-[5cqw] mb-[6cqw] rounded-[2cqw] bg-[#960000] py-[3.8cqw] text-center text-[3.8cqw] font-semibold uppercase text-white">
      {children}
    </div>
  );
}

function Mesas() {
  return (
    <>
      <Header title="Selecionar mesa" sub="Salão principal" />
      <div className="flex gap-[4cqw] px-[5cqw] pb-[3cqw] text-[3.2cqw] text-[#555]">
        <span className="flex items-center gap-[1.5cqw]">
          <i className="size-[2.4cqw] rounded-full border border-[#D32F2F]" /> Livre
        </span>
        <span className="flex items-center gap-[1.5cqw]">
          <i className="size-[2.4cqw] rounded-full bg-[#D32F2F]" /> Ocupada
        </span>
      </div>
      <div className="grid flex-1 grid-cols-3 content-start gap-[2.4cqw] px-[5cqw]">
        {Array.from({ length: 21 }, (_, i) => i + 1).map((n) => (
          <div
            key={n}
            className={cn(
              'grid aspect-[4/3] place-items-center rounded-[1.2cqw] text-[4cqw] font-semibold text-white',
              OCCUPIED.has(n) ? 'bg-[#D32F2F]' : 'border border-[#D32F2F]/40 bg-[#D32F2F]/[0.06] text-[#D32F2F]',
              n === 12 && 'ring-[0.8cqw] ring-[#383838] ring-offset-[0.6cqw] ring-offset-white',
            )}
          >
            {String(n).padStart(2, '0')}
          </div>
        ))}
      </div>
      <Button>Abrir mesa 12</Button>
    </>
  );
}

function Pedido() {
  return (
    <>
      <Header title="Burguer" sub="Mesa 12" />
      <div className="flex gap-[2cqw] overflow-hidden px-[5cqw] pb-[4cqw] text-[3.4cqw]">
        {['Batata', 'Bebidas', 'Burguer', 'Pizzas'].map((c) => (
          <span
            key={c}
            className={cn(
              'shrink-0 rounded-full px-[3.4cqw] py-[1.4cqw]',
              c === 'Burguer' ? 'bg-[#960000] text-white font-semibold' : 'bg-black/[0.05] text-[#555]',
            )}
          >
            {c}
          </span>
        ))}
      </div>
      <div className="mx-[5cqw] rounded-[4cqw] border border-black/[0.07] bg-[#F4F5F4] p-[5cqw]">
        <p className="text-[5.6cqw] font-semibold">X-Burguer</p>
        <p className="mt-[1cqw] text-[4.4cqw] font-semibold text-[#960000]">R$ 15,00</p>
        <div className="mt-[5cqw] flex items-center justify-between rounded-[3cqw] bg-white p-[1.6cqw] text-[5cqw] shadow-sm">
          <span className="grid size-[9cqw] place-items-center rounded-[2cqw] bg-[#960000] text-white">−</span>
          <span className="font-semibold">1</span>
          <span className="grid size-[9cqw] place-items-center rounded-[2cqw] bg-[#960000] text-white">+</span>
        </div>
      </div>
      <div className="mx-[5cqw] mt-[4cqw] rounded-[4cqw] border border-[#960000]/25 bg-[#960000]/[0.05] p-[4cqw]">
        <p className="text-[3.2cqw] font-semibold uppercase text-[#960000]">Observação</p>
        <p className="mt-[1cqw] text-[4.2cqw]">Sem cebola</p>
      </div>
      <div className="flex-1" />
      <Button>Confirmar produto</Button>
    </>
  );
}

const ITEMS = [
  { q: 2, name: 'Água c/ gás', price: '12,00' },
  { q: 1, name: 'X-Burguer', price: '15,00', note: 'Sem cebola' },
  { q: 1, name: 'Batata frita', price: '8,00' },
];

function Comanda() {
  return (
    <>
      <Header title="Comanda" sub="Mesa 12" />
      <ul className="mx-[5cqw] divide-y divide-black/[0.07] rounded-[4cqw] border border-black/[0.07] bg-[#F4F5F4] px-[4cqw]">
        {ITEMS.map((it) => (
          <li key={it.name} className="flex items-start justify-between py-[3.4cqw] text-[3.9cqw]">
            <span>
              <span className="font-semibold text-[#960000]">{it.q}×</span> {it.name}
              {it.note && <span className="block text-[3.2cqw] text-[#5c5c5c]">{it.note}</span>}
            </span>
            <span className="text-[#383838]">R$ {it.price}</span>
          </li>
        ))}
      </ul>
      <div className="mx-[5cqw] mt-[4cqw] flex items-center justify-between text-[3.9cqw]">
        <span className="text-[#383838]">Viagem</span>
        <span className="flex h-[5.6cqw] w-[10cqw] items-center rounded-full bg-black/10 p-[0.8cqw]">
          <i className="size-[4cqw] rounded-full bg-white shadow-sm" />
        </span>
      </div>
      <div className="flex-1" />
      <div className="mx-[5cqw] mb-[4cqw] flex items-baseline justify-between">
        <span className="text-[3.9cqw] text-[#555]">Subtotal</span>
        <span className="text-[6cqw] font-semibold">R$ 35,00</span>
      </div>
      <Button>Enviar comanda</Button>
    </>
  );
}

function Conta() {
  return (
    <>
      <Header title="Conta" sub="Mesa 12" />
      <div className="mx-[5cqw] rounded-[4cqw] border border-black/[0.07] bg-[#F4F5F4] p-[5cqw] text-center">
        <p className="text-[3.6cqw] text-[#555]">Total</p>
        <p className="mt-[1cqw] text-[11cqw] font-semibold tracking-tight">R$ 35,00</p>
      </div>
      <div className="mx-[5cqw] mt-[4cqw] flex items-center justify-between rounded-[4cqw] border border-black/[0.07] bg-[#F4F5F4] p-[4cqw] text-[3.9cqw]">
        <span className="text-[#383838]">Pessoas</span>
        <span className="flex items-center gap-[3cqw]">
          <span className="grid size-[7cqw] place-items-center rounded-[2cqw] bg-white shadow-sm">−</span>
          <span className="font-semibold">2</span>
          <span className="grid size-[7cqw] place-items-center rounded-[2cqw] bg-white shadow-sm">+</span>
        </span>
      </div>
      <div className="mx-[5cqw] mt-[4cqw] rounded-[4cqw] bg-[#960000] p-[4cqw]">
        <p className="text-[3.4cqw] text-white/75">Valor por pessoa</p>
        <p className="text-[7cqw] font-semibold text-white">R$ 17,50</p>
      </div>
      <p className="mx-[5cqw] mt-[4cqw] text-center text-[3.6cqw] text-[#555]">⎙ Imprimir conta</p>
      <div className="flex-1" />
      <Button>Fechar conta</Button>
    </>
  );
}

const SCREENS: Record<ScreenId, () => React.JSX.Element> = { mesas: Mesas, pedido: Pedido, comanda: Comanda, conta: Conta };

const ENTRANCE = { type: 'spring', stiffness: 200, damping: 25 } as const;

function Current({ screen }: { screen: ScreenId }) {
  const Screen = SCREENS[screen];
  return <Screen />;
}

export function Phone({ screen, className }: { screen: ScreenId; className?: string }) {
  return (
    <div
      role="img"
      aria-label="Ilustração do app ChefX: mapa de mesas, pedido, comanda e fechamento de conta"
      className={cn('relative aspect-[9/19.5] [container-type:inline-size]', className)}
    >
      {/* cqw units resolve against the wrapper above, so the frame lives one level down */}
      <div className="absolute inset-0 rounded-[9cqw] bg-[#202022] p-[1.8cqw] shadow-[0_40px_120px_-30px_rgba(0,0,0,1),inset_0_0_0_1px_rgba(255,255,255,0.14)]">
      <div className="relative size-full overflow-hidden rounded-[7.4cqw] bg-white text-[#383838]">
        {/* Android status bar with a punch-hole camera */}
        <div className="flex h-[10cqw] items-center justify-between bg-[#7A0000] px-[6cqw] text-[3.3cqw] font-medium text-white">
          <span>9:41</span>
          <span className="absolute left-1/2 top-[2.8cqw] size-[4.4cqw] -translate-x-1/2 rounded-full bg-black ring-[0.6cqw] ring-black/40" />
          <span className="tracking-tight text-white/85">▾ ◢ ▮ 82%</span>
        </div>
        {/* gesture bar */}
        <span className="absolute bottom-[1.8cqw] left-1/2 z-10 h-[1.1cqw] w-[24cqw] -translate-x-1/2 rounded-full bg-[#383838]/50" />
        {/* only the visible screen is mounted; the outgoing one fades out over the incoming one */}
        <AnimatePresence initial={false}>
          <motion.div
            key={screen}
            aria-hidden
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={ENTRANCE}
            className="absolute inset-x-0 top-[10cqw] bottom-[3cqw] flex flex-col"
          >
            <Current screen={screen} />
          </motion.div>
        </AnimatePresence>
      </div>
      </div>
    </div>
  );
}
