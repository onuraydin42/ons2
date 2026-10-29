/**
 * The small print, kept as data so the two legal pages share one layout.
 *
 * Every statement here describes how this site actually behaves — no cookies,
 * no analytics, an age gate that remembers nothing, forms delivered by a
 * third-party relay. If the site's behaviour changes, change these too.
 *
 * `{email}` in a paragraph renders as a mailto link to the contact address.
 */

export interface LegalSection {
  heading: string;
  body: string[];
}

export const LEGAL_UPDATED = "October 29, 2026";

export const TERMS: LegalSection[] = [
  {
    heading: "About these terms",
    body: [
      "This website is operated by FLUID OUNCE (“we”, “us”). By using it, you agree to these terms. If you do not agree, please do not use the site.",
    ],
  },
  {
    heading: "Legal drinking age",
    body: [
      "The site is intended only for people of legal drinking age where they live — 21 or older in the United States. If you are not of legal drinking age, please leave the site.",
    ],
  },
  {
    heading: "Nothing is sold here",
    body: [
      "This site is for information. We do not sell alcohol to consumers through it, and nothing on it is an offer to sell. FLUID OUNCE is available through licensed retailers and restaurants.",
    ],
  },
  {
    heading: "Trade orders",
    body: [
      "Order requests sent through our trade portal are for licensed businesses only. A request is not a binding order until we confirm it.",
      "Every order is subject to verification of the business’s licensing, to availability, and to the laws of the state where it will be delivered. We may decline any request.",
    ],
  },
  {
    heading: "Enjoy responsibly",
    body: ["Please drink responsibly, and never drink and drive."],
  },
  {
    heading: "Our content",
    body: [
      "Everything on this site — the FLUID OUNCE name and mark, the bottle and box designs, photography, film, illustrations and text — belongs to us or our licensors. You are welcome to share links to the site, but you may not copy, reproduce or use our content commercially without our written permission.",
    ],
  },
  {
    heading: "Accuracy",
    body: [
      "We take care that what we publish is accurate, but the site is provided “as is”. Product details, cocktail builds and imagery may change without notice.",
    ],
  },
  {
    heading: "Liability",
    body: [
      "To the fullest extent permitted by law, we are not liable for any indirect or consequential loss arising from your use of the site. Nothing in these terms limits any liability that cannot be limited by law.",
    ],
  },
  {
    heading: "Other services",
    body: [
      "Forms on this site are delivered by a third-party form service. We are not responsible for websites or services we link to but do not control.",
    ],
  },
  {
    heading: "Changes",
    body: [
      "We may update these terms from time to time. The date at the top of this page shows when they last changed, and continuing to use the site means you accept the current version.",
    ],
  },
  {
    heading: "Contact",
    body: ["Questions about these terms are welcome at {email}."],
  },
];

export const PRIVACY: LegalSection[] = [
  {
    heading: "In short",
    body: [
      "We collect only what you choose to send us, use it only to answer you or fulfil your order, and never sell it. This site sets no cookies and runs no analytics or advertising trackers.",
    ],
  },
  {
    heading: "When you simply browse",
    body: [
      "There are no cookies, analytics, tracking pixels or advertising scripts on this site. Your answer to the age question is not stored anywhere — it is forgotten as soon as you leave or reload the page.",
      "Like any website, our hosting provider may keep standard technical logs, such as IP address and browser type, for security and reliability.",
    ],
  },
  {
    heading: "When you send us something",
    body: [
      "If you join the newsletter, we receive your email address.",
      "If you send an order request through our trade portal, we receive the details you enter: business name and type, state, delivery address, contact name, email address and phone number, any delivery note, your business tax ID and liquor license numbers or the images you upload, and your signature.",
    ],
  },
  {
    heading: "How we use it",
    body: [
      "To process and deliver trade orders, to verify that a business is licensed to buy alcohol, to contact you about your order or enquiry, to send the newsletter you asked for, and to meet our legal, tax and regulatory obligations.",
    ],
  },
  {
    heading: "Who we share it with",
    body: [
      "Form submissions are delivered to our inbox by a form-delivery service acting on our behalf. We may share order details with the carriers and distributors needed to fulfil an order, or where the law requires it. We never sell or rent your information.",
    ],
  },
  {
    heading: "How long we keep it",
    body: [
      "For as long as we need it for the purpose you gave it — and, for orders, for as long as tax and alcohol-regulation record-keeping requires.",
    ],
  },
  {
    heading: "Your choices",
    body: [
      "You can ask to see, correct or delete the personal information we hold about you, or leave the newsletter at any time, by writing to {email}.",
    ],
  },
  {
    heading: "Age",
    body: [
      "This site is not intended for anyone under the legal drinking age, and we do not knowingly collect information from them.",
    ],
  },
  {
    heading: "Security",
    body: ["The site is served only over encrypted HTTPS connections."],
  },
  {
    heading: "Changes",
    body: ["If we change this policy, we will update the date at the top of this page."],
  },
  {
    heading: "Contact",
    body: ["Questions about your privacy are welcome at {email}."],
  },
];
