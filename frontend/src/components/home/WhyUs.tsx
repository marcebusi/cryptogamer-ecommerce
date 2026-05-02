import './WhyUs.css'

const CARDS = [
  {
    icon: 'inventory_2',  accent: 'why-accent-green',
    title: '+5.000 Productos',
    desc: 'La mayor variedad de consolas, juegos y accesorios gaming de Argentina, con stock actualizado en tiempo real.',
    tag: 'Catálogo',
  },
  {
    icon: 'verified',     accent: 'why-accent-red',
    title: 'Calidad Certificada',
    desc: 'Todos nuestros productos pre-owned pasan por un proceso de revisión y certificación antes de ser publicados.',
    tag: 'Confianza',
  },
  {
    icon: 'support_agent',accent: 'why-accent-cyan',
    title: 'Soporte Real',
    desc: 'Atención personalizada por WhatsApp, email y chat en vivo. Respondemos en menos de 2 horas hábiles.',
    tag: 'Servicio',
  },
  {
    icon: 'local_offer',  accent: 'why-accent-yellow',
    title: 'Mejores Precios',
    desc: 'Comparamos precios del mercado constantemente para ofrecerte siempre la mejor relación calidad-precio.',
    tag: 'Ahorro',
  },
]

export default function WhyUs() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 md:px-margin py-xl">
      <div className="text-center mb-10 md:mb-12">
        <p className="text-xs font-bold tracking-widest uppercase why-eyebrow mb-3">¿Por qué elegirnos?</p>
        <h2 className="text-2xl sm:text-[2rem] font-black text-on-background font-['Plus_Jakarta_Sans'] leading-tight">
          La experiencia gaming que merecés
        </h2>
        <p className="text-on-surface-variant text-sm sm:text-base mt-3 max-w-xl mx-auto leading-relaxed">
          Más de 5 años siendo la referencia en equipamiento gamer en Argentina.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {CARDS.map((card) => (
          <div key={card.title} className="why-card rounded-2xl p-6 space-y-4">
            <div className={`why-icon-wrapper ${card.accent} w-11 h-11 rounded-xl flex items-center justify-center`}>
              <span className="material-symbols-outlined text-xl">{card.icon}</span>
            </div>
            <span className={`why-tag ${card.accent} inline-block text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full`}>
              {card.tag}
            </span>
            <div>
              <h3 className="font-bold text-base text-on-background leading-tight mb-2">{card.title}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
