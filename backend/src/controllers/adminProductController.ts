import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { sendEmail, emailTemplates } from '../services/emailService'

const prisma = new PrismaClient()

const slugify = (text: string) =>
  text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')

/* ── Create product ───────────────────────────────── */
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name, description, price, originalPrice,
      categorySlug, subcategory,
      condition, conditionScore, conditionDescription, conditionTags,
      image, images,
      badge, badgeColor,
      specs,
      sortOrder, isOffer, isFeatured,
      sendNewsletter,
    } = req.body

    if (!name?.trim() || !price || !categorySlug) {
      res.status(400).json({ message: 'Nombre, precio y categoría son requeridos.' })
      return
    }

    const category = await prisma.category.findUnique({ where: { slug: categorySlug } })
    if (!category) {
      res.status(400).json({ message: `Categoría "${categorySlug}" no encontrada.` })
      return
    }

    // Ensure unique slug
    let slug = slugify(name)
    const exists = await prisma.product.findUnique({ where: { slug } })
    if (exists) slug = `${slug}-${Date.now()}`

    const product = await prisma.product.create({
      data: {
        name:         name.trim(),
        slug,
        description:  description?.trim() || '',
        price:        Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        categoryId:   category.id,
        subcategory:  subcategory ?? null,
        condition:    condition ?? null,
        conditionScore:      conditionScore ? Number(conditionScore) : null,
        conditionDescription: conditionDescription?.trim() ?? null,
        conditionTags: JSON.stringify(conditionTags ?? []),
        image:      image?.trim() || 'https://placehold.co/600x600/111318/39ff14?text=Sin+Imagen',
        images:     JSON.stringify(images ?? []),
        badge:      badge?.trim() || null,
        badgeColor: badgeColor ?? 'primary',
        sortOrder:  sortOrder !== undefined ? Number(sortOrder) : 0,
        isOffer:    Boolean(isOffer),
        isFeatured: Boolean(isFeatured),
        specs: specs?.length
          ? { create: (specs as { icon: string; label: string; value: string; color?: string }[]) }
          : undefined,
      },
      include: { specs: true, category: true },
    })

    // Send newsletter if requested
    if (sendNewsletter) {
      try {
        const subscribers = await prisma.newsletterSubscriber.findMany({ select: { email: true } })
        if (subscribers.length > 0) {
          const tpl = emailTemplates.newProduct({
            productName:  product.name,
            productImage: product.image,
            productPrice: product.price,
            productSlug:  product.slug,
            description:  product.description || undefined,
          })
          await Promise.allSettled(
            subscribers.map(s => sendEmail(s.email, tpl.subject, tpl.html))
          )
          console.log(`[newsletter] Enviado a ${subscribers.length} suscriptores`)
        }
      } catch (newsletterErr) {
        console.error('[newsletter] Error al enviar:', newsletterErr)
        // No falla el endpoint si el mail falla
      }
    }

    res.status(201).json(product)
  } catch (err) {
    console.error('[createProduct]', err)
    res.status(500).json({ message: 'Error interno del servidor.' })
  }
}

/* ── Update product ───────────────────────────────── */
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const {
      name, description, price, originalPrice,
      subcategory, condition, conditionScore, conditionDescription, conditionTags,
      image, images, badge, badgeColor, inStock,
      sortOrder, isOffer, isFeatured,
      specs,
    } = req.body

    const product = await prisma.product.update({
      where: { id },
      data: {
        name:        name?.trim(),
        description: description?.trim() ?? undefined,
        price:       price ? Number(price) : undefined,
        originalPrice: originalPrice !== undefined ? (originalPrice ? Number(originalPrice) : null) : undefined,
        subcategory: subcategory ?? undefined,
        condition:   condition ?? undefined,
        conditionScore: conditionScore ? Number(conditionScore) : undefined,
        conditionDescription: conditionDescription?.trim() ?? undefined,
        conditionTags: conditionTags !== undefined ? JSON.stringify(conditionTags) : undefined,
        image:      image?.trim() ?? undefined,
        images:     images !== undefined ? JSON.stringify(images) : undefined,
        badge:      badge?.trim() || null,
        badgeColor: badgeColor ?? undefined,
        inStock:    inStock !== undefined ? Boolean(inStock) : undefined,
        sortOrder:  sortOrder !== undefined ? Number(sortOrder) : undefined,
        isOffer:    isOffer !== undefined ? Boolean(isOffer) : undefined,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : undefined,
      },
      include: { specs: true, category: true },
    })

    // If specs array is provided, replace all specs
    if (specs !== undefined) {
      await prisma.productSpec.deleteMany({ where: { productId: id } })
      if (specs.length > 0) {
        await prisma.productSpec.createMany({
          data: (specs as { icon: string; label: string; value: string; color?: string }[])
            .map(s => ({ ...s, productId: id })),
        })
      }
    }

    res.json(product)
  } catch (err) {
    console.error('[updateProduct]', err)
    res.status(500).json({ message: 'Error interno del servidor.' })
  }
}

/* ── Delete product ───────────────────────────────── */
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    await prisma.product.delete({ where: { id } })
    res.json({ message: 'Producto eliminado correctamente.' })
  } catch (err) {
    console.error('[deleteProduct]', err)
    res.status(500).json({ message: 'Error interno del servidor.' })
  }
}

/* ── List all products (admin view) ───────────────── */
export const listProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true, specs: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })
    res.json(products)
  } catch (err) {
    console.error('[listProducts]', err)
    res.status(500).json({ message: 'Error interno del servidor.' })
  }
}
