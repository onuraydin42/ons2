import type { Metadata } from "next";

import OrderPortal from "@/components/order/OrderPortal";

/**
 * The trade portal.
 *
 * Reachable only by typing https://www.fluidounce.co/order — nothing on the
 * public site links here, there is no sitemap entry, and the route is excluded
 * from indexing both here and in public/robots.txt.
 */
export const metadata: Metadata = {
  title: "Place Order | FLUID OUNCE",
  robots: { index: false, follow: false },
};

export default function OrderPage() {
  return <OrderPortal />;
}
