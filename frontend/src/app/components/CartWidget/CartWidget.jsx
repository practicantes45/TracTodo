"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FaShoppingCart, FaWhatsapp, FaTrash, FaTimes } from "react-icons/fa";
import styles from "./CartWidget.module.css";
import { useCart } from "../../../hooks/useCart";
import { formatearPrecio } from "../../../utils/priceUtils";
import { useWhatsAppContact } from "../../../hooks/useWhatsAppContact";

const CartWidget = () => {
  const { items, itemCount, total, removeItem, clearCart, updateQuantity } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [selectionReminder, setSelectionReminder] = useState(false);
  const [sending, setSending] = useState(false);
  const router = useRouter();

  const hasItems = items.length > 0;

  const {
    startContact: startAdvisorContact,
    selectedAdvisor,
    isReady,
  } = useWhatsAppContact({
    allowSelection: false,
    onRequireSelection: () => {
      setSelectionReminder(true);
      router.push('/#asesores');
    },
    getMessage: ({ payload, advisor }) => {
      if (payload?.customMessage) {
        return payload.customMessage;
      }
      return advisor.generalMessage;
    },
  });

  const summaryMessage = useMemo(() => {
    if (!selectedAdvisor || !hasItems) {
      return "";
    }

    const lines = items.map((item, index) => {
      const price = formatearPrecio(item.price);
      return `${index + 1}. ${item.name} (${item.quantity} x ${price})`;
    });

    const totalLine = `Total estimado: ${formatearPrecio(total)}`;
    return [
      `Hola ${selectedAdvisor.name.split(" ")[0]}, me gustaria solicitar el siguiente pedido:`,
      "",
      ...lines,
      "",
      totalLine,
      "Me ayudas a confirmar disponibilidad y tiempos? Muchas gracias.",
    ].join("\n");
  }, [items, selectedAdvisor, total, hasItems]);

  const handleSendCart = () => {
    if (!hasItems || !selectedAdvisor || !summaryMessage) {
      setSelectionReminder(true);
      router.push('/#asesores');
      return;
    }

    if (sending) {
      return;
    }

    setSending(true);
    startAdvisorContact({ customMessage: summaryMessage });
    clearCart();
    setIsOpen(false);
    setSelectionReminder(false);
    setTimeout(() => setSending(false), 800);
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setSelectionReminder(false);
    }
  };

  return (
    <div className={styles.cartContainer}>
      <button
        type="button"
        className={styles.fabButton}
        onClick={handleToggle}
        aria-label="Abrir carrito de compras"
      >
        <FaShoppingCart />
        {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
      </button>

      {isOpen && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>Carrito de compras</h3>
            <button
              type="button"
              className={styles.closeButton}
              onClick={handleToggle}
              aria-label="Cerrar carrito"
            >
              <FaTimes />
            </button>
          </div>

          {!hasItems ? (
            <p className={styles.emptyState}>Aun no agregas productos. Explora el catalogo y usa "Agregar al carrito".</p>
          ) : (
            <>
              <ul className={styles.itemList}>
                {items.map((item) => (
                  <li key={item.id} className={styles.itemRow}>
                    <div>
                      <p className={styles.itemName}>{item.name}</p>
                      <p className={styles.itemMeta}>
                        {formatearPrecio(item.price)} - Cantidad:
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(event) => updateQuantity(item.id, event.target.value)}
                          className={styles.quantityInput}
                          aria-label={`Cantidad para ${item.name}`}
                        />
                      </p>
                    </div>
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => removeItem(item.id)}
                      aria-label={`Quitar ${item.name} del carrito`}
                    >
                      <FaTrash />
                    </button>
                  </li>
                ))}
              </ul>

              <div className={styles.summaryRow}>
                <span>Total estimado</span>
                <strong>{formatearPrecio(total)}</strong>
              </div>

              {selectedAdvisor ? (
                <p className={styles.advisorNote}>
                  Este pedido se enviara a <strong>{selectedAdvisor.name}</strong> por WhatsApp.
                </p>
              ) : (
                <p className={styles.advisorNote}>
                  Selecciona tu asesor en la pagina de inicio para poder enviar este pedido por WhatsApp.
                </p>
              )}

              {selectionReminder && (
                <p className={styles.reminderAlert}>
                  Debes elegir a tu asesor en la seccion principal de TracTodo antes de completar el pedido.
                </p>
              )}

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.secondaryAction}
                  onClick={clearCart}
                  disabled={!hasItems}
                >
                  Vaciar carrito
                </button>
                <button
                  type="button"
                  className={styles.primaryAction}
                  onClick={handleSendCart}
                  disabled={!hasItems || !selectedAdvisor || !isReady || sending}
                >
                  <FaWhatsapp />
                  Enviar por WhatsApp
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CartWidget;
