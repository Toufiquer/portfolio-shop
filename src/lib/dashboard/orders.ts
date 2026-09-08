/*
|-----------------------------------------
| setting up orders.ts for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 01 September, 2026
|-----------------------------------------
*/

export const orderStatuses = ["placed", "confirmed", "processing", "completed", "cancelled"] as const;

export type OrderStatus = (typeof orderStatuses)[number];

export type OrderCustomer = {
  userId: string;
  email: string;
  name: string;
  phone: string;
  address: string;
};

export type OrderItemSnapshot = {
  productId: string;
  sku: string;
  slug: string;
  name: string;
  primaryImage: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type Order = {
  id: string;
  customer: OrderCustomer;
  items: OrderItemSnapshot[];
  itemCount: number;
  subtotal: number;
  discount?: number;
  couponCode?: string;
  total: number;
  currency: "BDT";
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  statusUpdatedAt: Date;
};

export type OrderSettings = {
  key: "order-settings";
  orderLimitEnabled: boolean;
  orderLimitMinutes: number;
  orderLimitMaxOrders: number;
  updatedAt: Date;
  updatedBy: string;
};

export type CheckoutItemInput = { productId: string; quantity: number };
export type CheckoutCustomerInput = { phone?: string; address?: string };
export type CheckoutInput = { items: CheckoutItemInput[]; customer?: CheckoutCustomerInput; couponCode?: string };

export type OrderApiErrorCode =
  | "AUTH_REQUIRED"
  | "INVALID_CHECKOUT"
  | "MANIPULATED_CHECKOUT"
  | "PRODUCT_NOT_FOUND"
  | "PRODUCT_UNAVAILABLE"
  | "INVALID_QUANTITY"
  | "ORDER_LIMITED"
  | "CHECKOUT_IN_PROGRESS";

export type ParsedCheckout = {
  items: CheckoutItemInput[];
  customer: Required<CheckoutCustomerInput>;
  couponCode: string;
};

const isObject = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object";
const text = (value: unknown, max: number) =>
  typeof value === "string" && value.trim().length <= max ? value.trim() : null;

export function validatePhoneNumber(rawPhone: string): { isValid: boolean; error?: string } {
  const trimmed = rawPhone.trim();
  if (!trimmed) {
    return { isValid: false, error: "Phone number is required." };
  }

  if (trimmed.startsWith("+880")) {
    if (trimmed.length !== 14 || !/^\+880\d{10}$/.test(trimmed)) {
      return {
        isValid: false,
        error: "Phone number starting with +880 must have total 14 characters including + (e.g. +8801XXXXXXXXX).",
      };
    }
    return { isValid: true };
  }

  if (trimmed.startsWith("01")) {
    if (trimmed.length < 11 || !/^01\d+$/.test(trimmed)) {
      return {
        isValid: false,
        error: "Phone number starting with 01 must have a minimum of 11 digits (e.g. 01XXXXXXXXX).",
      };
    }
    return { isValid: true };
  }

  return {
    isValid: false,
    error: "Phone number must start with 01 (minimum 11 digits) or +880 (total 14 characters).",
  };
}

/** Accept only identifiers, quantities, and customer contact details with valid phone. */
export function parseCheckoutInput(body: unknown): ParsedCheckout | { code: OrderApiErrorCode; error: string } {
  if (!isObject(body) || !Array.isArray(body.items))
    return { code: "INVALID_CHECKOUT", error: "Provide at least one order item." };
  if (["price", "subtotal", "total", "discount", "currency"].some((field) => field in body))
    return { code: "MANIPULATED_CHECKOUT", error: "Prices and totals are calculated on the server." };
  if (!body.items.length || body.items.length > 25)
    return { code: "INVALID_CHECKOUT", error: "An order must contain between 1 and 25 items." };

  const quantities = new Map<string, number>();
  for (const rawItem of body.items) {
    if (!isObject(rawItem)) return { code: "INVALID_CHECKOUT", error: "Every order item must be valid." };
    if (["price", "total", "lineTotal", "unitPrice"].some((field) => field in rawItem))
      return { code: "MANIPULATED_CHECKOUT", error: "Prices and totals are calculated on the server." };
    const productId = text(rawItem.productId, 120);
    const quantity = rawItem.quantity;
    if (!productId) return { code: "INVALID_CHECKOUT", error: "Every order item needs a product identifier." };
    if (!Number.isInteger(quantity) || (quantity as number) < 1 || (quantity as number) > 100)
      return { code: "INVALID_QUANTITY", error: "Each requested quantity must be a whole number from 1 to 100." };
    quantities.set(productId, (quantities.get(productId) ?? 0) + (quantity as number));
  }
  if ([...quantities.values()].some((quantity) => quantity > 100))
    return { code: "INVALID_QUANTITY", error: "Each product quantity must not exceed 100." };

  const customer = isObject(body.customer) ? body.customer : {};
  const phone = customer.phone === undefined ? "" : text(customer.phone, 40);
  const address = customer.address === undefined ? "" : text(customer.address, 500);
  if (phone === null || address === null)
    return { code: "INVALID_CHECKOUT", error: "Customer contact details are invalid." };

  const phoneCheck = validatePhoneNumber(phone);
  if (!phoneCheck.isValid) {
    return { code: "INVALID_CHECKOUT", error: phoneCheck.error ?? "Invalid phone number." };
  }

  const couponCode = body.couponCode === undefined ? "" : text(body.couponCode, 60);
  if (couponCode === null) return { code: "INVALID_CHECKOUT", error: "Coupon code is invalid." };

  return {
    items: [...quantities].map(([productId, quantity]) => ({ productId, quantity })),
    customer: { phone: phone.trim(), address },
    couponCode: couponCode.toUpperCase(),
  };
}

export function serializeOrder(item: Order) {
  return {
    ...item,
    createdAt: item.createdAt.toISOString(),
    statusUpdatedAt: item.statusUpdatedAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export function serializeOrderSettings(item: OrderSettings) {
  return { ...item, updatedAt: item.updatedAt.toISOString() };
}
