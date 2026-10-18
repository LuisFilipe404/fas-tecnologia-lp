import { LogoMark, Wordmark } from "@/components/brand/logo-mark";
import { Hero } from "@/components/hero/hero";
import { Faq } from "@/components/sections/faq";
import { Nav } from "@/components/sections/nav";
import { Showcase } from "@/components/sections/showcase";
import { WhatsAppButton } from "@/components/sections/whatsapp-button";
import CountUp from "@/components/ui/count-up";
import Magnet from "@/components/ui/magnet";
import { Reveal, RevealItem, STAGGER_NORMAL } from "@/components/ui/reveal";
import {
	chefx,
	company,
	faq,
	flow,
	nav,
	SITE_URL,
	screens,
	solutions,
} from "@/lib/site";

const contactCta = { href: company.whatsapp, label: "Falar com especialista" };
const playCta = { href: chefx.playStore, label: "Baixar na Google Play" };

const CURRENT_YEAR = 2026;
const yearsActive = CURRENT_YEAR - company.foundingYear;

type Stat = { value: number; label: string; prefix?: string; suffix?: string };
const stats: Stat[] = [
	{ value: yearsActive, suffix: " anos", label: "de experiência em tecnologia" },
	{ value: chefx.downloads, prefix: "+", label: "downloads do ChefX na Google Play" },
	{ value: 3, label: "soluções para o seu salão" },
	{ value: 100, suffix: "%", label: "digital, do pedido ao fechamento da conta" },
	{ value: 1, suffix: " toque", label: "para enviar a comanda" },
	{ value: 0, label: "comandas de papel" },
];

function jsonLd() {
	const org = {
		"@type": "Organization",
		"@id": `${SITE_URL}/#org`,
		name: company.name,
		legalName: company.legalName,
		taxID: company.cnpj,
		url: SITE_URL,
		logo: `${SITE_URL}/icon`,
		foundingDate: company.foundingDate,
		email: company.email,
		telephone: company.phone,
		slogan: company.tagline,
		address: {
			"@type": "PostalAddress",
			streetAddress: company.address.street,
			addressLocality: company.address.city,
			addressRegion: company.address.state,
			postalCode: company.address.postalCode,
			addressCountry: "BR",
		},
		areaServed: { "@type": "Country", name: "Brasil" },
		sameAs: Object.values(company.social),
	};
	const app = {
		"@type": "SoftwareApplication",
		name: chefx.name,
		description: chefx.description,
		applicationCategory: "BusinessApplication",
		operatingSystem: "Android",
		installUrl: chefx.playStore,
		image: `${SITE_URL}/images/app/mesas.png`,
		screenshot: screens.map((s) => `${SITE_URL}${s.src}`),
		publisher: { "@id": `${SITE_URL}/#org` },
	};
	const faqPage = {
		"@type": "FAQPage",
		mainEntity: faq.map((f) => ({
			"@type": "Question",
			name: f.q,
			acceptedAnswer: { "@type": "Answer", text: f.a },
		})),
	};
	return JSON.stringify({
		"@context": "https://schema.org",
		"@graph": [org, app, faqPage],
	}).replace(/</g, "\\u003c");
}

function SectionLabel({ children }: { children: React.ReactNode }) {
	return <p className="text-sm font-medium text-brand">{children}</p>;
}

export default function Home() {
	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: jsonLd() }}
			/>
			<Nav links={nav} cta={contactCta} />

			<main>
				<Hero steps={flow} primary={contactCta} secondary={playCta} />

				{/* Stats — compact card sheet: 1px gaps over the border colour draw the dividers */}
				<section aria-label="Números" className="border-y border-border">
					<Reveal
						stagger={STAGGER_NORMAL}
						as="dl"
						className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-border md:grid-cols-3 md:border-x md:border-border"
					>
						{stats.map((s, i) => (
							<RevealItem
								key={s.label}
								index={i}
								className="flex flex-col-reverse gap-2 bg-background px-4 py-8 sm:px-6 sm:py-10 md:py-14"
							>
								<dt className="text-sm text-muted-foreground">{s.label}</dt>
								<dd className="text-[clamp(1.75rem,9vw,2.25rem)] font-semibold tracking-tighter md:text-5xl">
									{s.prefix}
									<CountUp to={s.value} separator="." duration={1.6} />
									{s.suffix && (
										<span className="text-muted-foreground">{s.suffix}</span>
									)}
								</dd>
							</RevealItem>
						))}
					</Reveal>
				</section>

				{/* Showcase — the app, screen by screen */}
				<section aria-labelledby="telas" className="py-16 md:py-24">
					<Reveal className="mx-auto mb-12 max-w-6xl px-6 text-center md:px-12">
						<h2
							id="telas"
							className="text-3xl font-semibold tracking-tight md:text-4xl"
						>
							O salão inteiro na palma da mão.
						</h2>
						<p className="mx-auto mt-4 max-w-xl text-muted-foreground">
							Mapa de mesas, pedido com observação, comanda e fechamento da
							conta: o fluxo inteiro do ChefX.
						</p>
					</Reveal>
					<Showcase />
				</section>

				{/* Solutions — the ChefX platform */}
				<section
					id="solucoes"
					className="scroll-mt-24 border-t border-border px-6 py-16 md:px-12 md:py-24"
				>
					<div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.4fr]">
						<Reveal>
							<SectionLabel>Soluções</SectionLabel>
							<h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
								Tecnologia com gestão para o seu restaurante.
							</h2>
							<p className="mt-6 max-w-md text-muted-foreground leading-relaxed">
								Mais rápido, eficaz e lucrativo. Do salão ao balcão, o ChefX
								atende restaurantes, bares, lanchonetes e pizzarias de todo o
								Brasil.
							</p>
						</Reveal>
						<Reveal
							stagger={STAGGER_NORMAL}
							as="ul"
							className="divide-y divide-border border-y border-border"
						>
							{solutions.map((s, i) => (
								<RevealItem
									as="li"
									key={s.name}
									index={i}
									className="group grid grid-cols-[3rem_1fr] items-baseline gap-4 py-8"
								>
									<span className="text-sm text-muted-foreground">{i + 1}</span>
									<div>
										<h3 className="text-2xl font-semibold tracking-tight transition-colors group-hover:text-brand md:text-3xl">
											{s.name}
										</h3>
										<p className="mt-2 text-muted-foreground">{s.text}</p>
									</div>
								</RevealItem>
							))}
						</Reveal>
					</div>
				</section>

				{/* FAQ */}
				<section id="faq" className="scroll-mt-24 px-6 py-20 md:px-12 md:py-28">
					<div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_2fr]">
						<Reveal>
							<SectionLabel>FAQ</SectionLabel>
							<h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
								Perguntas frequentes
							</h2>
						</Reveal>
						<Reveal>
							<Faq items={faq} />
						</Reveal>
					</div>
				</section>

				{/* Final CTA — the dramatic closing moment */}
				<section className="relative overflow-hidden px-6 py-28 text-center md:px-12 md:py-44">
					<div
						aria-hidden
						className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(224,44,38,0.18),transparent_45%)]"
					/>
					<Reveal className="relative mx-auto max-w-3xl">
						<LogoMark
							tile
							className="mx-auto mb-10 size-20 drop-shadow-[0_12px_40px_rgba(224,44,38,0.45)]"
						/>
						<h2 className="text-4xl font-semibold tracking-tighter sm:text-6xl">
							Pronto para aposentar{" "}
							<span className="whitespace-nowrap text-brand">o bloquinho?</span>
						</h2>
						<p className="mx-auto mt-6 max-w-md text-lg text-muted-foreground">
							Fale com a nossa equipe e coloque o ChefX para rodar no seu
							salão, esteja onde estiver.
						</p>
						<div className="mt-10 flex flex-wrap justify-center gap-4">
							<Magnet padding={60} magnetStrength={4}>
								<a
									href={contactCta.href}
									target="_blank"
									rel="noopener"
									className="inline-flex rounded-full bg-brand px-8 py-4 text-sm font-semibold text-brand-foreground shadow-[0_0_40px_-8px_var(--brand)] transition-colors hover:bg-brand-soft"
								>
									Chamar no WhatsApp
								</a>
							</Magnet>
							<a
								href={`mailto:${company.email}`}
								className="rounded-full border border-white/10 px-8 py-4 text-sm font-medium text-white/70 transition-colors hover:text-white"
							>
								Enviar e-mail
							</a>
						</div>
					</Reveal>
				</section>
			</main>

			<footer className="border-t border-border px-6 py-12 text-sm text-muted-foreground md:px-12">
				<div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
					<div>
						<Wordmark tile={false} className="text-foreground" />
						<p className="mt-4 max-w-xs">{company.tagline}</p>
					</div>
					<address className="not-italic leading-relaxed">
						<p className="mb-2 font-medium text-foreground">Contato</p>
						<a href={company.phoneHref} className="focus-text block py-1.5 hover:text-foreground">
							{company.phone}
						</a>
						<a
							href={`mailto:${company.email}`}
							className="focus-text block py-1.5 hover:text-foreground"
						>
							{company.email}
						</a>
					</address>
					<div>
						<p className="mb-2 font-medium text-foreground">Redes</p>
						<ul className="space-y-1">
							{(
								[
									["Instagram", company.social.instagram],
									["Facebook", company.social.facebook],
								] as const
							).map(([name, href]) => (
								<li key={name}>
									<a
										href={href}
										target="_blank"
										rel="noopener"
										className="focus-text hover:text-foreground"
									>
										{name}
									</a>
								</li>
							))}
							<li>
								<a
									href={`${SITE_URL}/privacidade`}
									className="focus-text hover:text-foreground"
								>
									Política de privacidade
								</a>
							</li>
						</ul>
					</div>
				</div>
				<p className="mx-auto mt-12 max-w-6xl border-t border-border pt-6 text-xs">
					© {company.foundingYear}–{CURRENT_YEAR} {company.legalName} · CNPJ{" "}
					{company.cnpj}
				</p>
			</footer>

			<WhatsAppButton href={company.whatsapp} />
		</>
	);
}
