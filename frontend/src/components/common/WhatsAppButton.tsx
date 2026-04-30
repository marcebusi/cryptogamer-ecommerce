export default function WhatsAppButton() {
  const phoneNumber = '5491112345678' // Reemplazá con tu número real
  const message = '¡Hola! Quisiera hacer una consulta.'
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-[0_4px_20px_rgba(37,211,102,0.5)] hover:scale-110 hover:shadow-[0_4px_30px_rgba(37,211,102,0.7)] transition-all duration-300 group"
      aria-label="Contactar por WhatsApp"
    >
      <i className="fa-brands fa-whatsapp text-3xl" />
      <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-[#111318] text-white px-4 py-2 rounded-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-lg border border-white/10">
        ¡Consultanos por WhatsApp!
      </span>
    </a>
  )
}
