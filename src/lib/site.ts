/**
 * Public facts about ChefX. The site speaks for the product; the company behind it (FAS Tecnologia)
 * only appears where the law asks for it — legal name and CNPJ in the footer.
 * Sources: Google Play (br.com.chefx), fastecnologia.com.br/privacidade,
 * Instagram/Facebook @fastecnologia and the public CNPJ registry.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fastecnologia.com.br';

export const company = {
  name: 'ChefX',
  legalName: 'FAS TECNOLOGIA LTDA',
  cnpj: '15.457.458/0001-41',
  foundingDate: '2012-04-19',
  foundingYear: 2012,
  tagline: 'A comanda digital para restaurantes de todo o Brasil.',
  email: 'suporte@fastecnologia.com.br',
  phone: '+55 81 99736-7368',
  phoneHref: 'tel:+5581997367368',
  whatsapp: 'https://wa.me/5581997367368',
  address: {
    street: 'Rua Deputado Souto Filho, 108, Sala 101',
    district: 'Maurício de Nassau',
    city: 'Caruaru',
    state: 'PE',
    postalCode: '55012-310',
  },
  social: {
    instagram: 'https://www.instagram.com/fastecnologia/',
    facebook: 'https://www.facebook.com/fastecnologia',
  },
};

export const chefx = {
  name: 'ChefX',
  short: 'Comanda digital para atendentes',
  description: 'Controle de pedidos por mesas e comandas de forma ágil e prática.',
  playStore: 'https://play.google.com/store/apps/details?id=br.com.chefx&hl=pt_BR',
  downloads: 1000,
};

export const nav = [
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#solucoes', label: 'Soluções' },
  { href: '#faq', label: 'FAQ' },
];

/** The hero headline doubles as the steps of the service cycle. */
export const flow = [
  {
    word: 'Pediu.',
    screen: 'pedido',
    text: 'O atendente abre a mesa no mapa, escolhe os itens no cardápio por categoria e anota a observação de cada um.',
    short: 'Abre a mesa, escolhe os itens e anota a observação.',
  },
  {
    word: 'Enviou.',
    screen: 'comanda',
    text: 'Revisa a comanda, marca se é para viagem e envia com um toque. Sem bloquinho, sem letra ilegível.',
    short: 'Revisa a comanda e envia com um toque.',
  },
  {
    word: 'Fechou.',
    screen: 'conta',
    text: 'Total na tela, valor dividido por pessoa e conta impressa direto do app.',
    short: 'Total na tela, dividido por pessoa e impresso no app.',
  },
] as const;

export const screens = [
  { src: '/images/app/login.png', alt: 'Tela de login do app ChefX com usuário e senha' },
  { src: '/images/app/mesas.png', alt: 'Mapa de mesas do ChefX com mesas livres em verde e ocupadas em vermelho' },
  { src: '/images/app/categorias.png', alt: 'Cardápio do ChefX organizado por categorias' },
  { src: '/images/app/bebidas.png', alt: 'Lista de bebidas com preços no ChefX' },
  { src: '/images/app/produto.png', alt: 'Tela de produto com quantidade e botão de observação' },
  { src: '/images/app/comanda.png', alt: 'Revisão da comanda com opção viagem e subtotal' },
  { src: '/images/app/fechar-conta.png', alt: 'Fechamento de conta com total e valor por pessoa' },
];

export const solutions = [
  {
    name: 'Comanda digital',
    text: 'O app que coloca o pedido nas mãos do atendente, da mesa ao fechamento.',
  },
  {
    name: 'Cardápio digital',
    text: 'Seu cardápio no celular do cliente, sempre atualizado.',
  },
  {
    name: 'Totem de autoatendimento',
    text: 'O cliente faz o próprio pedido e a fila anda mais rápido.',
  },
];

export const faq = [
  {
    q: 'O que é o ChefX?',
    a: 'O ChefX é uma comanda digital para restaurantes, bares, lanchonetes e pizzarias de todo o Brasil. Ele substitui a comanda de papel por uma digital no celular do atendente: controle de pedidos por mesas e comandas de forma ágil e prática.',
  },
  {
    q: 'Em quais aparelhos o ChefX funciona?',
    a: 'O app ChefX está disponível para Android na Google Play.',
  },
  {
    q: 'Quanto custa?',
    a: 'Os valores são passados sob consulta. Fale com a nossa equipe pelo WhatsApp ou e-mail e receba uma proposta para o seu estabelecimento.',
  },
  {
    q: 'O ChefX tem outras soluções além da comanda?',
    a: 'Sim. Além da comanda digital, o ChefX conta com cardápio digital e totem de autoatendimento.',
  },
  {
    q: 'O ChefX atende a minha cidade?',
    a: 'Sim. O ChefX atende estabelecimentos de todo o Brasil. Fale com a nossa equipe pelo WhatsApp para começar.',
  },
];
