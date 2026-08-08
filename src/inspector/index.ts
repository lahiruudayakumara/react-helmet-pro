/**
 * react-helmet-pro browser dev inspector
 *
 * Development-only panel for inspecting live Helmet head state.
 * Automatically throws when imported in production (NODE_ENV === 'production').
 *
 * Usage (development-only dynamic import):
 * ```tsx
 * if (process.env.NODE_ENV !== 'production') {
 *   const { HelmetInspector } = await import('react-helmet-pro/inspector');
 * }
 * ```
 *
 * Or unconditionally in Vite/Next with conditional rendering:
 * ```tsx
 * import { HelmetInspector } from 'react-helmet-pro/inspector';
 * // Wrap with your own dev condition
 * {process.env.NODE_ENV !== 'production' && <HelmetInspector />}
 * ```
 */
export { HelmetInspector } from "./HelmetInspector";
export type { HelmetInspectorProps, InspectorHistoryEntry } from "./HelmetInspector";
