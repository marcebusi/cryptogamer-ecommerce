import { Request, Response } from 'express'

/* ════════════════════════════════════════════════════════════════
   Shipping Rate Calculator
   – Tries real APIs first (Andreani & Correo Argentino MiCorreo)
   – Falls back to zone-based calculation when credentials missing
   ════════════════════════════════════════════════════════════════ */

export interface ShippingRate {
  carrierId:    'andreani' | 'correo-argentino'
  carrierName:  string
  serviceId:    string
  serviceName:  string
  deliveryType: 'D' | 'S'   // D = a domicilio, S = a sucursal
  price:        number
  daysMin:      number
  daysMax:      number
}

/* ── Postal-code → shipping zone ─────────────────────────────── */
function getZone(postalCode: string): number {
  const cp = parseInt(postalCode.replace(/\D/g, ''), 10)
  if (isNaN(cp)) return 4
  if (cp >= 1000 && cp <= 1499) return 1   // CABA
  if (cp >= 1500 && cp <= 2999) return 2   // GBA
  if (cp >= 6000 && cp <= 7999) return 3   // Provincia BA interior
  if ((cp >= 3000 && cp <= 3999) || (cp >= 5000 && cp <= 5999)) return 4  // Litoral + Cuyo + Córdoba
  if (cp >= 4000 && cp <= 4999) return 5   // NOA / NEA
  if (cp >= 8000 && cp <= 8499) return 6   // Neuquén / Río Negro
  if (cp >= 8500 && cp <= 9999) return 7   // Patagonia sur
  return 4
}

/* ── Zone configuration ──────────────────────────────────────── */
const ZONE: Record<number, { factor: number; daysMin: number; daysMax: number }> = {
  1: { factor: 1.00, daysMin: 1, daysMax: 2  },
  2: { factor: 1.15, daysMin: 2, daysMax: 3  },
  3: { factor: 1.30, daysMin: 3, daysMax: 5  },
  4: { factor: 1.50, daysMin: 4, daysMax: 6  },
  5: { factor: 1.80, daysMin: 5, daysMax: 8  },
  6: { factor: 2.00, daysMin: 6, daysMax: 9  },
  7: { factor: 2.40, daysMin: 8, daysMax: 12 },
}

/* ── Weight factor ───────────────────────────────────────────── */
function weightFactor(kg: number): number {
  if (kg <= 1)  return 1.00
  if (kg <= 2)  return 1.25
  if (kg <= 5)  return 1.55
  if (kg <= 10) return 1.90
  return 2.30
}

/* ── Zone-based fallback rates (precios reales Argentina 2025) ── */
// Precios base para 1 kg desde CABA (Zona 1)
// Actualizados a tarifas vigentes — revisar ante actualizaciones de cada transportista
function calcFallbackRates(postalCode: string, kg: number): ShippingRate[] {
  const z  = getZone(postalCode)
  const zc = ZONE[z] ?? ZONE[4]
  const wf = weightFactor(kg)
  const f  = zc.factor * wf

  const round500 = (n: number) => Math.round(n / 500) * 500

  return [
    // ── Andreani ───────────────────────────────────────────────
    {
      carrierId:    'andreani',
      carrierName:  'Andreani',
      serviceId:    'AND-SUC',
      serviceName:  'Retiro en Sucursal',
      deliveryType: 'S',
      price:        round500(10_500 * f),
      daysMin:      zc.daysMin,
      daysMax:      zc.daysMax + 1,
    },
    {
      carrierId:    'andreani',
      carrierName:  'Andreani',
      serviceId:    'AND-DOM',
      serviceName:  'Envío a Domicilio',
      deliveryType: 'D',
      price:        round500(12_500 * f),
      daysMin:      zc.daysMin,
      daysMax:      zc.daysMax,
    },
    {
      carrierId:    'andreani',
      carrierName:  'Andreani',
      serviceId:    'AND-EXP',
      serviceName:  'Envío Express',
      deliveryType: 'D',
      price:        round500(18_000 * f),
      daysMin:      Math.max(1, zc.daysMin - 1),
      daysMax:      Math.max(2, zc.daysMax - 2),
    },
    // ── Correo Argentino ───────────────────────────────────────
    {
      carrierId:    'correo-argentino',
      carrierName:  'Correo Argentino',
      serviceId:    'CA-CLA',
      serviceName:  'Encomienda Clásica',
      deliveryType: 'D',
      price:        round500(8_500 * f),
      daysMin:      zc.daysMin + 1,
      daysMax:      zc.daysMax + 2,
    },
    {
      carrierId:    'correo-argentino',
      carrierName:  'Correo Argentino',
      serviceId:    'CA-PLU',
      serviceName:  'Encomienda Plus',
      deliveryType: 'D',
      price:        round500(13_500 * f),
      daysMin:      zc.daysMin,
      daysMax:      zc.daysMax,
    },
    {
      carrierId:    'correo-argentino',
      carrierName:  'Correo Argentino',
      serviceId:    'CA-EXN',
      serviceName:  'Express Nacional',
      deliveryType: 'D',
      price:        round500(19_500 * f),
      daysMin:      Math.max(1, zc.daysMin - 1),
      daysMax:      Math.max(2, zc.daysMax - 2),
    },
  ]
}

/* ── Andreani real API ───────────────────────────────────────── */
async function getAndreaniRates(
  destCP: string, kg: number, declaredValue: number
): Promise<ShippingRate[] | null> {
  const user     = process.env.ANDREANI_USER
  const pass     = process.env.ANDREANI_PASS
  const contrato = process.env.ANDREANI_CONTRATO

  if (!user || !pass || !contrato) return null

  try {
    const loginRes = await fetch('https://apis.andreani.com/v1/usuarios/login', {
      method:  'POST',
      headers: { Authorization: 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64') },
    })
    const token = loginRes.headers.get('x-authorization-token')
    if (!token) return null

    const ratesRes = await fetch('https://apis.andreani.com/v1/tarifas', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'x-authorization-token': token },
      body: JSON.stringify({
        cpDestino:  destCP,
        contrato,
        bultos: [{ kilos: kg, valorDeclarado: declaredValue }],
      }),
    })
    if (!ratesRes.ok) return null
    const data = await ratesRes.json() as Array<{
      contrato: string; tarifa: number; plazoEntrega?: number
    }>
    if (!Array.isArray(data) || !data.length) return null

    const z   = getZone(destCP)
    const zc  = ZONE[z] ?? ZONE[4]
    return data.map((d, i) => ({
      carrierId:    'andreani' as const,
      carrierName:  'Andreani',
      serviceId:    `AND-${i}`,
      serviceName:  d.contrato.includes('EXP') ? 'Envío Express' : 'Envío a Domicilio',
      deliveryType: 'D' as const,
      price:        Math.round(d.tarifa),
      daysMin:      d.plazoEntrega ?? zc.daysMin,
      daysMax:      (d.plazoEntrega ?? zc.daysMin) + 2,
    }))
  } catch {
    return null
  }
}

/* ── Correo Argentino real API ───────────────────────────────── */
async function getCorreoArgentinoRates(
  destCP: string, kg: number
): Promise<ShippingRate[] | null> {
  const userToken   = process.env.CA_USER_TOKEN
  const passToken   = process.env.CA_PASS_TOKEN
  const customerId  = process.env.CA_CUSTOMER_ID
  const originCP    = process.env.SHIPPING_ORIGIN_CP ?? '1414'

  if (!userToken || !passToken || !customerId) return null

  try {
    const tokenRes = await fetch(
      'https://api.correoargentino.com.ar/micorreo/v1/token',
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userToken, passwordToken: passToken }),
      }
    )
    if (!tokenRes.ok) return null
    const { access_token } = await tokenRes.json() as { access_token: string }

    const ratesRes = await fetch(
      'https://api.correoargentino.com.ar/micorreo/v1/rates',
      {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          customerId,
          postalCodeOrigin:      originCP,
          postalCodeDestination: destCP,
          deliveredType: 'D',
          dimensions: [{
            weight:   Math.round(kg * 1000),
            height:   20, width: 15, length: 10, quantity: 1,
          }],
        }),
      }
    )
    if (!ratesRes.ok) return null
    const data = await ratesRes.json() as Array<{
      productName: string; productType: string; price: number
      deliveryTimeMin: number; deliveryTimeMax: number; deliveredType: string
    }>
    if (!Array.isArray(data) || !data.length) return null

    return data.map((d, i) => ({
      carrierId:    'correo-argentino' as const,
      carrierName:  'Correo Argentino',
      serviceId:    `CA-${i}`,
      serviceName:  d.productName,
      deliveryType: (d.deliveredType === 'S' ? 'S' : 'D') as 'D' | 'S',
      price:        Math.round(d.price),
      daysMin:      d.deliveryTimeMin,
      daysMax:      d.deliveryTimeMax,
    }))
  } catch {
    return null
  }
}

/* ════════════════════════════════════════════════════════════════
   POST /api/shipping/rates
   Body: { postalCode: string; totalItems: number; declaredValue: number }
   ════════════════════════════════════════════════════════════════ */
export const getShippingRates = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postalCode, totalItems = 1, declaredValue = 10000 } = req.body as {
      postalCode:    string
      totalItems?:   number
      declaredValue?: number
    }

    if (!postalCode || postalCode.replace(/\D/g, '').length < 4) {
      res.status(400).json({ message: 'Código postal inválido' })
      return
    }

    const cp = postalCode.replace(/\D/g, '')

    // Weight: 0.8 kg per item (average gaming product), capped at 25 kg
    const kg = Math.min(Math.max(totalItems * 0.8, 0.5), 25)

    // Try real APIs in parallel — fall back to zone-based if both fail
    const [andreaniRates, caRates] = await Promise.all([
      getAndreaniRates(cp, kg, declaredValue),
      getCorreoArgentinoRates(cp, kg),
    ])

    let rates: ShippingRate[]
    if (andreaniRates || caRates) {
      rates = [...(andreaniRates ?? []), ...(caRates ?? [])]
    } else {
      rates = calcFallbackRates(cp, kg)
    }

    // Sort by price ascending
    rates.sort((a, b) => a.price - b.price)

    res.json({ rates, postalCode: cp, weightKg: kg })
  } catch (err) {
    console.error('[getShippingRates]', err)
    res.status(500).json({ message: 'Error al calcular tarifas de envío' })
  }
}
