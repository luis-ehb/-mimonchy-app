/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';

// Mimonchy usa siempre la paleta clara (crema/blanco), sin importar el modo
// oscuro del sistema del teléfono — el dueño del proyecto pidió que la app
// no se vea "tan negra" cuando el celular está en modo oscuro. Si más
// adelante se quiere ofrecer modo oscuro real, esto se puede volver a
// conectar a useColorScheme() detrás de un switch propio dentro de la app.
export function useTheme() {
  return Colors.light;
}
