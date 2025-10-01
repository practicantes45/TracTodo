"use client";

import { usePathname } from "next/navigation";
import CartWidget from "./CartWidget";

const CartWidgetRoot = () => {
  const pathname = usePathname();

  if (!pathname) {
    return null;
  }

  const isProductosRoute = pathname.startsWith("/productos");

  if (!isProductosRoute) {
    return null;
  }

  return <CartWidget />;
};

export default CartWidgetRoot;
