import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

export type FulfillmentMode = 'delivery' | 'pickup';

export type Address = {
  id: string;
  label: string;
  addressLine: string;
};

// Direcciones mock del usuario (Fase 1: sin backend todavía). Ambas etiquetadas
// "Mi casa" a propósito, tal cual la referencia QUIK (dos ubicaciones guardadas
// bajo la misma etiqueta).
export const MOCK_ADDRESSES: Address[] = [
  {
    id: 'casa-1',
    label: 'Mi casa',
    addressLine: '9HR3+W3G, Avenida Venezuela, Cabimas 4013, Zulia, Venezuela',
  },
  {
    id: 'casa-2',
    label: 'Mi casa',
    addressLine: 'J98Q+3Q3, Maracaibo 4001, Zulia, Venezuela',
  },
];

// Overlay de carga simulada al cambiar entre Delivery/Pickup o de dirección
// (no hay backend real todavía, así que se simula con un timeout corto).
const OVERLAY_DURATION_MS = 1100;

export type LoadingOverlayState = {
  icon: string;
  message: string;
} | null;

type FulfillmentContextValue = {
  fulfillment: FulfillmentMode;
  addresses: Address[];
  currentAddress: Address;
  showAddressModal: boolean;
  loadingOverlay: LoadingOverlayState;
  selectFulfillment: (mode: FulfillmentMode) => void;
  openAddressModal: () => void;
  closeAddressModal: () => void;
  selectAddress: (id: string) => void;
};

const FulfillmentContext = createContext<FulfillmentContextValue | undefined>(undefined);

// Estado compartido de Delivery/Pickup y dirección de entrega: se consume
// tanto desde la pantalla principal (index.tsx) como desde el carrito
// (cart.tsx), así el modo y la dirección se mantienen consistentes en toda
// la app y el modal/overlay se muestran una sola vez a nivel global.
export function FulfillmentProvider({ children }: { children: ReactNode }) {
  // Predeterminado siempre en Delivery.
  const [fulfillment, setFulfillment] = useState<FulfillmentMode>('delivery');
  const [currentAddressId, setCurrentAddressId] = useState(MOCK_ADDRESSES[0].id);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [loadingOverlay, setLoadingOverlay] = useState<LoadingOverlayState>(null);
  const overlayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (overlayTimeoutRef.current) {
        clearTimeout(overlayTimeoutRef.current);
      }
    };
  }, []);

  const currentAddress =
    MOCK_ADDRESSES.find((address) => address.id === currentAddressId) ?? MOCK_ADDRESSES[0];

  // Cambiar entre Delivery y Pickup: cada modo simula su propia carga
  // ("Seleccionando dirección..." al pasar a Pickup, "Configurando dirección..."
  // al volver a Delivery), como en la referencia QUIK.
  const selectFulfillment = (mode: FulfillmentMode) => {
    if (mode === fulfillment || loadingOverlay) return;

    // Por si el modal de direcciones estaba abierto: se cierra antes de
    // mostrar el overlay de carga, para que nunca se vean los dos a la vez.
    setShowAddressModal(false);

    setLoadingOverlay(
      mode === 'pickup'
        ? { icon: '🎯', message: 'Seleccionando dirección...' }
        : { icon: '⚙️', message: 'Configurando dirección...' }
    );

    overlayTimeoutRef.current = setTimeout(() => {
      setFulfillment(mode);
      setLoadingOverlay(null);
    }, OVERLAY_DURATION_MS);
  };

  const openAddressModal = () => {
    // Si hay un overlay de carga en curso (cambiando Delivery/Pickup, por
    // ejemplo), no se abre el modal encima — evita que ambos se vean a la vez
    // (el modal semitransparente quedaba flotando sobre el overlay oscuro).
    if (loadingOverlay) return;
    setShowAddressModal(true);
  };
  const closeAddressModal = () => setShowAddressModal(false);

  // Elegir otra dirección guardada desde el modal: simula "Cambiando dirección..."
  // antes de aplicar el cambio. Si se toca la que ya está activa, solo cierra.
  const selectAddress = (id: string) => {
    setShowAddressModal(false);

    if (id === currentAddressId || loadingOverlay) return;

    setLoadingOverlay({ icon: '🔁', message: 'Cambiando dirección...' });

    overlayTimeoutRef.current = setTimeout(() => {
      setCurrentAddressId(id);
      setLoadingOverlay(null);
    }, OVERLAY_DURATION_MS);
  };

  const value = useMemo(
    () => ({
      fulfillment,
      addresses: MOCK_ADDRESSES,
      currentAddress,
      showAddressModal,
      loadingOverlay,
      selectFulfillment,
      openAddressModal,
      closeAddressModal,
      selectAddress,
    }),
    [fulfillment, currentAddress, showAddressModal, loadingOverlay],
  );

  return <FulfillmentContext.Provider value={value}>{children}</FulfillmentContext.Provider>;
}

export function useFulfillment() {
  const ctx = useContext(FulfillmentContext);
  if (!ctx) {
    throw new Error('useFulfillment debe usarse dentro de un FulfillmentProvider');
  }
  return ctx;
}
