/**
 * Option sets and copy for the trade portal, matching the live order forms on
 * fluidounce.co word for word — labels, placeholders, option text and order.
 */

/* As listed live: New Jersey first. */
export const STATES = ["New Jersey", "New York", "Florida"] as const;

export const BOTTLES_PER_CASE = 6;

/* "1 Case-6 Bottles", "2 Case-12 Bottles", … — the live wording, unpluralised. */
export const CASE_OPTIONS = Array.from(
  { length: 20 },
  (_, i) => `${i + 1} Case-${(i + 1) * BOTTLES_PER_CASE} Bottles`,
);

/* A first order may also be an account set up with no cases yet. */
export const SETUP_ONLY_OPTION = "No Order Setup Account Only";
export const NEW_ACCOUNT_CASE_OPTIONS = [SETUP_ONLY_OPTION, ...CASE_OPTIONS];

/* The two kinds of account the portal serves. Each receives the bottle in a
 * different presentation, which is why the order form shows one or the other
 * as soon as a type is chosen. */
export const BUSINESS_TYPES = ["Liquor Store", "Restaurant"] as const;
export type BusinessType = (typeof BUSINESS_TYPES)[number];

export const PRESENTATION = {
  boxed: {
    src: "/images/editorial/boxx.webp",
    alt: "Fluid Ounce boxed presentation",
  },
  /* The turning bottle itself (components/BottleSpin), as in the opening. */
  bottle: {
    label: "Bottle rotating preview",
  },
} as const;

export const PRESENTATION_NOTE: Record<BusinessType, string> = {
  "Liquor Store": "Liquor Store partners receive the boxed presentation.",
  Restaurant: "Restaurant partners receive the signature bottle presentation.",
};

export const ORDER_COPY = {
  heading: "Place Order",
  order: "Order",
  reorder: "Reorder",
  back: "Go Back",
  state: "State",
  statePlaceholder: "Select state",
  businessType: "Business Type",
  businessName: "Name Of Business",
  businessNamePlaceholder: "Enter Business Name",
  cases: "Number Of Cases",
  casesPlaceholder: "Select an option",
  reorderCasesPlaceholder: "Select 1-20",
  casesNote: "Each case contains 6 bottles.",
  reorderCasesNote:
    "Boxed presentation is reserved for Liquor Store partners. Restaurant partners receive the bottle presentation.",
  deliveryDetails: "Delivery Details",
  address: "Delivery Address",
  city: "City",
  zip: "ZIP Code",
  contact: "Contact Person Name",
  email: "Contact Email",
  emailPlaceholder: "name@business.com",
  phone: "Phone Number",
  phonePlaceholder: "5551234567",
  instructions: "Additional Delivery Instructions",
  deliveryNote: "Delivery Note",
  deliveryNotePlaceholder: "Write your delivery instruction note here...",
  verification: "Business Verification",
  taxId: "Business Tax ID Number",
  taxIdPlaceholder: "Enter Business Tax ID Number",
  license: "Liquor License Number",
  licensePlaceholder: "Enter Liquor License Number",
  licenseNote: "Enter license number or upload image.",
  upload: "Upload Image",
  noFile: "No file selected",
  signature: "Signature",
  signatureNote: "Sign with mouse or touch.",
  clear: "Clear",
  signatureMissing: "Please sign here.",
  certification:
    "I here by certify that I am 21 years of age or older and I have the authority to order alcoholic beverages on behalf of the above-mentioned establishment.",
  submit: "Submit Order",
  submitting: "Submitting...",
  reviewFields: "Please review the highlighted fields.",
  submitted: "Your order request has been submitted.",
  close: "Close",
  /* What the live forms report when delivery fails. */
  orderFailed: "Could not submit inquiry: Submission failed",
  reorderFailed: "Could not submit order: Submission failed",
} as const;
