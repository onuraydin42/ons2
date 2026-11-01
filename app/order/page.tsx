import type { Metadata } from "next";

import OrderPortal from "@/components/order/OrderPortal";

/**
 * The trade portal.
 *
 * Reachable only by typing https://www.fluidounce.co/order — nothing on the
 * public site links here, the sitemap leaves it out, and the route is
 * excluded from indexing both here and in public/robots.txt.
 */
export const metadata: Metadata = {
  // The layout's title template adds "| FLUID OUNCE".
  title: "Place Order",
  robots: { index: false, follow: false },
};

export default function OrderPage() {
  return <OrderPortal />;
}
