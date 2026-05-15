import type { ComponentType } from 'react'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
}

/**
 * Template registry — maps template names to their React Email components.
 * Import and register new templates here after creating them in this directory.
 *
 * Example:
 *   import { template as welcomeTemplate } from './welcome'
 *   // then add to TEMPLATES: 'welcome': welcomeTemplate
 */
import { template as insuranceCover } from './insurance-cover'
import { template as bookingConfirmation } from './booking-confirmation'
import { template as abandonedCart } from './abandoned-cart'
import { template as idVerificationFailed } from './id-verification-failed'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'insurance-cover': insuranceCover,
  'booking-confirmation': bookingConfirmation,
  'abandoned-cart': abandonedCart,
  'id-verification-failed': idVerificationFailed,
}
