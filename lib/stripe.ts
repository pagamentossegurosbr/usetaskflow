import Stripe from 'stripe';

// Configuração do Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Tipos de eventos do Stripe
export const STRIPE_EVENTS = {
  CUSTOMER_SUBSCRIPTION_CREATED: 'customer.subscription.created',
  CUSTOMER_SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  CUSTOMER_SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
  PAYMENT_INTENT_SUCCEEDED: 'payment_intent.succeeded',
  PAYMENT_INTENT_FAILED: 'payment_intent.payment_failed',
} as const;

// Configurações de webhook
export const WEBHOOK_CONFIG = {
  endpointSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  tolerance: 300, // 5 minutos
};

// Utilitários para webhooks
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, secret);
}

// Funções para gestão de assinaturas
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error) {
    console.error('Erro ao buscar assinatura:', error);
    return null;
  }
}

export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
  try {
    return await stripe.subscriptions.cancel(subscriptionId);
  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error);
    return null;
  }
}

export async function updateSubscription(
  subscriptionId: string,
  updates: Stripe.SubscriptionUpdateParams
): Promise<Stripe.Subscription | null> {
  try {
    return await stripe.subscriptions.update(subscriptionId, updates);
  } catch (error) {
    console.error('Erro ao atualizar assinatura:', error);
    return null;
  }
}

// Funções para gestão de customers
export async function getCustomer(customerId: string): Promise<Stripe.Customer | null> {
  try {
    return await stripe.customers.retrieve(customerId) as Stripe.Customer;
  } catch (error) {
    console.error('Erro ao buscar customer:', error);
    return null;
  }
}

export async function createCustomer(params: Stripe.CustomerCreateParams): Promise<Stripe.Customer | null> {
  try {
    return await stripe.customers.create(params);
  } catch (error) {
    console.error('Erro ao criar customer:', error);
    return null;
  }
}

// Funções para gestão de payment intents
export async function createPaymentIntent(params: Stripe.PaymentIntentCreateParams): Promise<Stripe.PaymentIntent | null> {
  try {
    return await stripe.paymentIntents.create(params);
  } catch (error) {
    console.error('Erro ao criar payment intent:', error);
    return null;
  }
}

// Funções para gestão de invoices
export async function createInvoice(params: Stripe.InvoiceCreateParams): Promise<Stripe.Invoice | null> {
  try {
    return await stripe.invoices.create(params);
  } catch (error) {
    console.error('Erro ao criar invoice:', error);
    return null;
  }
}

// Funções para gestão de coupons
export async function createCoupon(params: Stripe.CouponCreateParams): Promise<Stripe.Coupon | null> {
  try {
    return await stripe.coupons.create(params);
  } catch (error) {
    console.error('Erro ao criar coupon:', error);
    return null;
  }
}

// Utilitários para formatação
export function formatStripeAmount(amount: number): string {
  return (amount / 100).toFixed(2);
}

export function parseStripeAmount(amount: string): number {
  return Math.round(parseFloat(amount) * 100);
}

// Validação de assinatura
export function isSubscriptionActive(subscription: Stripe.Subscription): boolean {
  return subscription.status === 'active' || subscription.status === 'trialing';
}

export function isSubscriptionCanceled(subscription: Stripe.Subscription): boolean {
  return subscription.status === 'canceled';
}

export function isSubscriptionPastDue(subscription: Stripe.Subscription): boolean {
  return subscription.status === 'past_due';
}

// Mapeamento de status do Stripe para nosso sistema
export function mapStripeStatusToSubscriptionStatus(stripeStatus: string): 'active' | 'canceled' | 'past_due' | 'incomplete' {
  switch (stripeStatus) {
    case 'active':
    case 'trialing':
      return 'active';
    case 'canceled':
      return 'canceled';
    case 'past_due':
      return 'past_due';
    default:
      return 'incomplete';
  }
}
