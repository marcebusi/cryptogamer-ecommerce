import { useNavigate } from 'react-router-dom'
import './BentoCategories.css'

export default function BentoCategories() {
  const navigate = useNavigate()

  return (
    <section className="max-w-7xl mx-auto px-margin py-xl">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter h-auto md:h-[600px]">

        {/* Main featured — Consolas */}
        <div
          onClick={() => navigate('/products?cat=consoles')}
          className="bento-card md:col-span-8 relative rounded-xl overflow-hidden group cursor-pointer border border-white/5 bg-surface-container-low transition-all hover:border-primary-container/30"
        >
          <img
            className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-700"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzq048NNKTsZD-8uxPtS09zdOupyQ8K3WzUnJXkfYgsOyRvUxe7QQmvX2Ut5588Q6yUUs2LW6fkueqm1wgkOH816lZppO4AvzD1IwRxmef86J4NuCvN7Oxizr0otxbFzBDJgvPRqEuI35Yx33iJfLJUmq6MBQ4EeVYzfv_Hz0NmuyNvQtsV7tMmLO43d8xJnc65H9ORwr7_8YW6cnMOBZ-gcF7D_ZI5az2XhaaAq8yZus1v-DRY2R-jQ72Kz7d1IMU9hvBiBbvdFk"
            alt="High-end gaming battle station with neon lighting"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          <div className="absolute bottom-0 left-0 p-lg">
            <h3 className="font-h2-headline text-h2-headline text-on-background mb-xs">
              Consolas Next-Gen
            </h3>
            <p className="text-on-surface-variant max-w-md font-body-md mb-sm">
              PS5, Xbox Series X, Nintendo Switch y ediciones limitadas. El futuro del gaming.
            </p>
            <span className="text-primary-container font-button-text text-button-text flex items-center gap-xs group-hover:gap-md transition-all">
              VER COLECCIÓN
              <span className="material-symbols-outlined">arrow_forward</span>
            </span>
          </div>
        </div>

        {/* Right column */}
        <div className="md:col-span-4 flex flex-col gap-gutter h-full">
          {/* Juegos */}
          <div
            onClick={() => navigate('/products?cat=games')}
            className="bento-card flex-1 relative rounded-xl overflow-hidden group cursor-pointer border border-white/5 bg-surface-container-low transition-all hover:border-secondary-container/30"
          >
            <img
              className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoKHs6QcOQIsU2jl0DCUDuHQD3hOs4sbFQu1_I-98e7XhxcQ4hUA3X7tl4DjHEwiwhN2R_YPiJa31nQx2_Cp_Hsq9Hs2n-9VJdmmYJnP7z5ANRChD-im4vUXrPZ8J8mDB5EU2Jov9-zoHNh3aadGwlZj_MpoVV5KJLlAHgTX3mLTYUj3UD9a6OqjjqmDdz4owtBLoVg5ng4qPnelfjOfpBfMCAAIURUl8x49fsKcs5f3PqJ3M7MYXbvJQBG51divnmMKF7TZINkm0"
              alt="Videojuegos"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 p-sm">
              <h3 className="font-h3-title text-h3-title text-on-background">Juegos</h3>
              <span className="text-secondary font-button-text text-button-text text-sm">PS5, XBOX & SWITCH</span>
            </div>
          </div>

          {/* Accesorios */}
          <div
            onClick={() => navigate('/products?cat=accessories')}
            className="bento-card flex-1 relative rounded-xl overflow-hidden group cursor-pointer border border-white/5 bg-surface-container-low transition-all hover:border-tertiary-container/30"
          >
            <img
              className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuByrNkEEqFQBU-4PYlxQdktEEt10ecoR8tnu8OqVQ1c7oao6cHcsR_sJmW3JN7782jgvkNZCT2afi0QTmnJBMJm7LCbNh1n8MXkUYbnTU6KuImGjkXCjv91LSXsagk_Ry0DTfIoQuPsthPo04OaE29C2W7tsE-7CKISQH-YPU3wrpQQ-aZgVV-wmcB8Y9DsKv5jL1W9Nn1d5wpuN4zk97-AmoJ8R0CrbV6PWItyiUWUUL_Nmfs8xEGqrnlO5a9Pt6sR4KU0799yJYs"
              alt="Gaming controller with glowing triggers"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 p-sm">
              <h3 className="font-h3-title text-h3-title text-on-background">Accesorios</h3>
              <span className="text-tertiary-fixed font-button-text text-button-text text-sm">
                JOYSTICKS, HEADSETS & MÁS
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
