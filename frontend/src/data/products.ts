import type { Product, Category } from '../types'

export const categories: Category[] = [
  { id: 'consoles', name: 'Consoles' },
  { id: 'games', name: 'Games' },
  { id: 'accessories', name: 'Accessories' },
  { id: 'mobile', name: 'Mobile' },
  { id: 'audio', name: 'Audio' },
]

export const latestProducts: Product[] = [
  {
    id: '1',
    name: 'Neo-Vortex Mech Keyboard',
    price: 189.0,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAtZ4CQaCdtQ9t9jXf2IBcYgjnFPS9MYOzzRzll6nmj2665VUU5dKaoP98FEFiMHEazKPhX2J2oBb6OUHjfU9X8Uvcr4uKRzs4EYKof751DdNhCaO89w7QQXr5c933PmNsef54mhvRnh4VIVgqxpE2Ux0MFDRuqt_FCX_vPt99KKWkd8TxMS7mnf4RG4Z7vlyAxXeiCJq43tMm2OH9jUvb3g79rVBULvRNp18STpLKczkgvKnDN6jo1HcUrb5hzzJviBwEWPPNs6dU',
    category: 'accessories',
    subcategory: 'joysticks-pc',
    badge: 'NEW',
    badgeColor: 'secondary',
    rating: 4,
    description: 'Minimalist wireless gaming keyboard with RGB backlight showing electric blue hues.',
    inStock: true,
  },
  {
    id: '2',
    name: 'Pulse OLED 32" Monitor',
    price: 849.0,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCsyg5IDHGQBuOn_pNM2Ap4L1qIw-BdNmnoEdWSiTBnJhRJCKU1opVOd52oISLHEdT-wv06-UZZ_-w7e8_4Xh7wSKMBct8q-T0T-rm4wOw6SxlAbuCmCqr6KYhuxPCEJyJ_ut-EweQEmdPLKfy1epZCGvw27UXP8ynye7p153Udl9rP4niNIo17DxS69CxpwgrDZvQImS9gR9JyWXXPtmnUFwvpTK6Ui7r4wDSKKCilh_malY2_46KEbUCBCYx8x4LkgvHQvo5xKZQ',
    category: 'accessories',
    subcategory: 'cables',
    rating: 5,
    description: 'Sleek dual monitors showing a cosmic space nebula with high-tech gaming room setup.',
    inStock: true,
  },
  {
    id: '3',
    name: 'Sonic-Link Spatial Headset',
    price: 299.0,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD2IakxvZeOxtrQrTJa4PN12VsSyuTvLWe9LTc7G4YNfMX66T7RrPfjgnxuAlbIcJeSw4K3f2olqtg8cZEIwDH2f_AbncpUzUVLXmR5ZlnnVHfmvackxRJddkmcI7z32yPLy8HBhBcN2WtsAU6TNsT6D64zOTUqCgjr6dlgIchuwnjB1_FgqDjAqjrfuWZz3PBTWA7fIkPagVC6uXkV14PhvE76UEBq43Kw79dMNsycM0jpxj0ZNF2RprL7hnZjegr81SguybxQb4s',
    category: 'audio',
    subcategory: 'headsets',
    rating: 4,
    description: 'Premium gaming headset with glowing green LEDs and soft ear cushions.',
    inStock: true,
  },
  {
    id: '4',
    name: 'Neon Night Limited Controller',
    price: 79.0,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuChQHoKJNJcANh2acAG9-yCbZeqXsY4EUhiXB7NJcoHPUOy_32l8An0CZ7jIWGreZS9SgwV423u1JmZN-JS9rTNlU2ziwo9Twbsh4JuUOvG9dSy6FZH8FnQylTPyCGGmedmEhG-F9HJcXVTv5XQd2R7SFBsk6FKbO6W1CEk6MArVCGNFKAIiW3wloSID7SoCilfJI-ioXa_zoHdGyLikArfQO6QRt0yN1mWGm5P-pHeTZ4eZfjnvCsJ4h_O0i58xmCYuiGNWIATAXc',
    category: 'accessories',
    subcategory: 'joysticks-ps',
    badge: 'HOT',
    badgeColor: 'primary',
    rating: 5,
    description: 'Futuristic neon light installation shaped like a gaming controller.',
    inStock: true,
  },
]

export const allProducts: Product[] = [
  {
    id: '5',
    name: 'Neon Station V2',
    price: 499.0,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB365hk5GZuoLBoorn_BKWHEp1817uwv2pNzmWesoJZgHqakyid6TZj4Ub7LUqS7hj6bHtzMCjGy-YqU9h6880DMWlB7JEYfnfu5xFC9rKR0gE8J0aUqJuu_EBn586mN3BqBlFbh13mFvEtVJvZWOXaFdZ0e9HpztWZHqdY5JP5Tqkuot7fhzClgE-Jg_TsJuzuFIEl9RtOJt1V3FUIvPC_GkTqEqiT-3TbNUCkpCNaUCSGD10mPQbbScG12LFTR-T3fl5LhrCqoBw',
    category: 'consoles',
    subcategory: 'ps',
    badge: 'NEW',
    badgeColor: 'primary',
    rating: 5,
    description:
      'Advanced ray-tracing and ultra-high-speed SSD for instantaneous loading and hyper-realistic visuals.',
    inStock: true,
  },
  {
    id: '6',
    name: 'CyberKeys Pro',
    price: 159.0,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCVy3q7mWtJ6NFkzrk2Fd8bxEeSQ5iO53FvXSaCIOifKEQxzfec2fc7jaSJLkVjv5hBFBUegnqOKRPwrl-fpSmjMZE6FydtLwLMh27M2q4KGMYmMBoIBZAAd8LZq_Qp-l-SHOHHGW24f2Ovqv7UyqNJPLP5BKqY9sKqgk6MHcVtBK-kF8MCu099fg_OoHSrFMtPiDbRWK6dx6zuuy0HyKa0tvV5YnHxCFHcrh9PmJHtUic5InGBTg4gWy6yN9DduJVTADvvj92axFI',
    category: 'accessories',
    subcategory: 'joysticks-pc',
    badge: 'BEST SELLER',
    badgeColor: 'secondary',
    rating: 5,
    description:
      'Mechanical haptic feedback with per-key RGB customization and zero-latency wireless connectivity.',
    inStock: true,
  },
  {
    id: '7',
    name: 'Void Audio X',
    price: 299.0,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDNSYxOJ_bIZDcQGuLAWWZskAvDO4CXpZB_cnC4v49qFnnB8zSBYlNc0r4lV_EWFWSnnyuKEKhdGoiwjamumpJWbMvglhKzpTrSIoCA4xZNFi6ydx6vhVWk1V3Eszpow4QorIN1q29v2sWloPdr0-KeIUr8mxR3hs79Jlzsx0bf2Go1BIrihFM87Vg8-rpvwPRv0yXamAG-i-UTsI8C52OCRcqeh3PuKpcAfEcq5UsHdtskeULJICmxhGuUdh48Ha-UiT1UNoed7mY',
    category: 'audio',
    subcategory: 'headsets',
    rating: 4,
    description:
      'Spatial audio immersion with active noise cancellation and 40-hour battery life for long raids.',
    inStock: true,
  },
  {
    id: '8',
    name: 'Shadow Blade Mouse',
    price: 89.0,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuANwgbSXUiXlCht-wa3xxajTdq5OIXvYV0knpiySnl5IjRFaotB58Fa8KY7uO6fnPBg2HofC47caiKKibXxPenceEr1x41tIN6wYkcBnvHwyhSFYTNO6F6Zenu4YxiqLptthgRlsol2VVlnP7AIRdtWlNvlNqSIuhvKJwzyumfQsuWvhn4Jyj0hKMpUlz4mOtU3WWAE29-ZgnaXcEQUYt1vUsCdLOmCSoop-5WQshZ7hZhhURlTdALPCScHZTQvLCUOJAjPBK8exwc',
    category: 'accessories',
    subcategory: 'joysticks-pc',
    rating: 4,
    description:
      '25,000 DPI optical sensor for precision tracking and customizable weight system for perfect balance.',
    inStock: true,
  },
  {
    id: '9',
    name: 'Retro Pocket Z',
    price: 129.0,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAzhN9SrXa_MMvvznZDjLpWY3T4FnH_C8r2oX7f2oJv5zuhun-lqF9baxcFHFr7OzsnLVQ3WlPEh0uzZX2gJKLZsEd5wJVJtMBgMRfX3ZvhxZFawF9NU0vRSm_oEJcdJDMMoPAyp6zYCniTryh14nN5HEGslbGCTIitKsXaOk2G3FIdJ5KIgwNgvg-0Gs-9VkLLTzvTiT-5GehrFbmriIzV6VgDKzXomzWYiIf6HabjDGneAOGzVfEG_jZC95J6rawRfPDnV3z0BHs',
    category: 'mobile',
    subcategory: 'mobile',
    badge: 'RETRO',
    badgeColor: 'secondary',
    rating: 4,
    description: 'Classic gaming rebuilt. 4K upscaling for retro titles with a modern OLED handheld display.',
    inStock: true,
  },
  {
    id: '10',
    name: 'Horizon Ultra 34"',
    price: 899.0,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB4brQ2vi3-rkZgahoKdoqWvwvwwq9XKd028Kg0h76F7DZlmQJtdzc8EQ9GQsNrI9eu2m_ojGqgQzxGcgFR35l1vtI_N7lYPb8-5yXx_gvhq4pOhtzdc7E3DwzHhEyhwFgKw2PEyTHLTwD6UmLBvkGeE0vPo1xMOM2t2j7jfl5utccZI05MOsJBxqxr8umTHiHyTU0zZnEXpenjSAdr-whnV_vqawMMPHYo7DXLoQsdL4XsnBJX30bYhJ91862YQ6cYlCpmI4cao-s',
    category: 'accessories',
    subcategory: 'cables',
    rating: 5,
    description: '3440 x 1440 resolution with 175Hz refresh rate and HDR1000 for unmatched visual fidelity.',
    inStock: true,
  },
]

export const featuredProduct: Product = {
  id: 'ps5',
  name: 'PlayStation 5 Digital Edition',
  price: 399.99,
  originalPrice: 449.99,
  image:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAbQmuTY6d3aFthRRoRfFNUxqdXdEByIZwUZ5nCUoHOoyJ1ri5gbe9h-mHYrOvmDHKW1Jp2xc4X7JWKgGdi2-U62oryGCK3gVDLZgweKlS4HBg1S0xswyWBh5wjBAC11FlaKMEseLrLFoMaSCuQRoWlRHLzvcJW-_QDHNjnxPFRjmWMtzAPEEmUW24DtSHTcECl6cK44lrnbdCDhkZtI3ENF92Yc3DADs4zR2fZ_ba2VvjupJwb3xfoPFzGgc1m0omBRnMVxLxzrsY',
  images: [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAmjcYr1Q3Z6ano5oNXPNFasSqr6HOc04FpdUQ_F-r2xmpaZ4XKFg1KXUXlAcDzXzdm0FwMolFdMIpCEd47UZ5Ve9DKHha1IG5ft84x2vFEYr7zncXmEgL2CDiWgHdJI4X926Ul2-O1SJCxpmP1BNoOXHDrniywSGmLVoXiuhuwcFsbbB1nWS5Tr7ioxWCL0h78DLv2a9OsN5RzmCzWTKoLXEb2ZvXMbLL2WWx67im61pIH74ZBtP5yc0vn7muqRIWnostPXdP8tz8',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCyssUaJU9TLkQVajdngVVNaPzTX960L2YHgf8T5P0xSKcxHeHBOlfzys-IEK7QARnWuEA6xbHhT_AWgIpEqhZuchcYldyvknY9DxtI145rIVIfWccHqp1yF-ozWvW5Df4bsxtw25c2RczVlqeuJDOq2PHIGW2rzGgC4_0yzi5jkOUIb3VIxjib8CWo7FQaYyeDyRSSX-YV9pclDxF-oUCnlpTz7EM-TZro6O4YPbZ-Q8aA3b-Fu8dVyAig2HKTpd-2AfSMOa2bFm4',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA3Iv1bo7swsSXRJ6Kk5x-ZugVpcyGek09ulo9wVQcQxM1PY3iHoE4E7TkU7Zm9EfFmRq63Tz7lr6Ihq0yDmE_XarU-gZPYnOP0UGolane2iO9ZRFJjmgyjDugTldhNu9TMyXtVhr6Kh4Nj2lD1iFvMXU3WN4dJOdklTTmlTHmw3BvErFc3WXQKnty7lgTNqwpMw8kYoiCaIX1Qf9C3irn8azRcHrADo3e3WdMK8EYxRQ9YKjxzrNHVga4vcvM8wxQkjLAnXooCzIc',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC8MwEfY2VlpWLlQUI38vie-OjOU_5ag02FWHvS1QV_m5RzUFY1dpsUtjjPu43EPnVodriLOQ-QU7SUIkw8kW6EtdsKK0t10VERUgeXZWnAAuh9mxPsz25xHb48ah91Q8s8EfHaoXHRsuUgd7H9bnMTthURhJFkzbqTP927b4H_7eJg-fAdcd8VvmiQsif0pqVrFkVp1rpCAa3X_W7hElkhNOmfN_ULM7WWE_k0OEJ52sIBmorZ5tVnzN9U6yOr0tGEh2q4gDMlIf0',
  ],
  category: 'consoles',
  rating: 5,
  reviewCount: 324,
  description:
    'Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with support for haptic feedback, adaptive triggers, and 3D Audio.',
  inStock: true,
  condition: 'excellent',
  conditionScore: 85,
  conditionDescription:
    'Esta unidad fue totalmente inspeccionada y certificada por nuestros técnicos. Desgaste cosmético mínimo. Incluye el mando DualSense original, cable HDMI y cable de alimentación. Caja original no incluida.',
  conditionTags: ['Limpiado', 'Probado', 'Actualizado'],
  specs: [
    { icon: 'memory', label: 'PROCESSOR', value: 'AMD Ryzen Zen 2', color: 'text-purple-400' },
    { icon: 'bolt', label: 'GRAPHICS', value: '10.3 TFLOPS RDNA 2', color: 'text-cyan-400' },
    { icon: 'speed', label: 'SSD STORAGE', value: '825GB Custom NVMe', color: 'text-primary-container' },
    { icon: 'videocam', label: 'VIDEO OUT', value: 'Support for 4K 120Hz', color: 'text-yellow-400' },
  ],
}

export const relatedProducts: Product[] = [
  {
    id: 'r1',
    name: 'DualSense™ - Midnight Black',
    price: 69.99,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuByWnfPSwrmOF4u199MkQo9AFYfRW_n42xNQSU4Ip03cO06um1m7xccjgnbHuOg6axKcJjGgoOaYo4IFDk3G9ZzYxgaCQlzjb7QHsbrzkpRpV9uJszU7KQj05klGyBzkBWGLQO8cze-njZKptbxa6YQxNYbp6ceUNnDdNZOpBB9hdW9kbTWiXQraRYGYuacaibZwRrbX2-coIeECg_uSwqqP833aNOUOU2sQfpnGjrmT60Zy-LWM37M-Ap5CjoWGfmC9690WKzSbps',
    category: 'accessories',
    rating: 5,
    description: 'Midnight Black DualSense wireless controller for PS5.',
    inStock: true,
  },
  {
    id: 'r2',
    name: 'PULSE 3D™ Wireless Headset',
    price: 99.99,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC2qY37DDrQHMAAouqM0NUMslfTML0gOO-bCVanKGLvxuQTPhLetPB6EBhtvSV4ITzZ3fa5Hj1ClDTVcISrjyLG84sBfiO_6Ml7AKod_QC-uBI0_uYvewEWPoGjDVFMkYeMdvwi4Lb_WqbbRpBHhFyshAWIxUXsQ-sB1crdjUVp70GzGkA1RwZ7nqKOIQumFv_URJIhn2HvFjkwceZm9UH86utgVv8eHdF5ceZ5FXWcdGhFM4lurhg_uB5kHY4vJa0dh6y-UBr1hbI',
    category: 'audio',
    rating: 5,
    description: 'Sleek wireless gaming headset with black earcups.',
    inStock: true,
  },
  {
    id: 'r3',
    name: 'DualSense Charging Station',
    price: 29.99,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCSYMs-zod0wYlxwruxY9NOc3gdtDzk0QFomiuLtaL9A6mR1fb_vBvvAhK8PlsWIAgMQzonH_MeVyZdXy6bZRZLGJSCZ4gtJvw8bSiqnYImhmu0PSG22S3c_fu1E2drsrezqd-1-xrGI0zq5EoL2tBuu1ld5EKIQMxUtlHTWbdK9H6xSQWrCERr8a5rwqgb6zb3taiZEA1fnD5Z2kvJMKhw4sCT9JkacmCkDpeVm7g6M_CQE2Qp-AqdE8DrdbYE9B3UlA4yHwICTJw',
    category: 'accessories',
    rating: 4,
    description: 'Charging station dock for two PS5 DualSense controllers.',
    inStock: true,
  },
  {
    id: 'r4',
    name: 'PS5 Media Remote',
    price: 29.99,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCiHS0WuuspGMz2uwpUZr6sMwASFkVMkHmkynclGPMuttXQg7aYmCByH92FH1pkPznLzcDF3HB5poKRkVazOvzr0Tpl3xKEUNKjv4v_h8TegK5LedTnUSiPsW9ZpwgHP8c1PSsV-8uATRdm59u4v7T4CAQIU4ApgN8h6nioa7gO6jrlX68wLm4gVrWA5GEpRMabem1_vO4svKA0nOifMmXmj1B8mk_eV3kfiiJCAS4he2s23WOrtk5JoPJBlbFkkI',
    category: 'accessories',
    rating: 4,
    description: 'Modern media remote with intuitive button layout.',
    inStock: true,
  },
]
