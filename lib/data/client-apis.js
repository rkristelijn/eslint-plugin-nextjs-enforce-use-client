/**
 * @fileoverview Data: APIs that only work in Client Components.
 * Sources: https://react.dev/reference/rsc/use-client (hooks "excluding use and
 * useId"), https://nextjs.org/docs/app/api-reference/functions (next/navigation
 * client hooks), https://mui.com/material-ui/integrations/nextjs/ (MUI ships its
 * own 'use client'; only its hooks and createTheme need a client file).
 * @implements ADR-003
 */

'use strict';

/** React hooks that need a Client Component. `use` and `useId` also work on the server. */
const REACT_CLIENT_HOOKS = new Set([
  'useActionState',
  'useCallback',
  'useContext',
  'useDebugValue',
  'useDeferredValue',
  'useEffect',
  'useEffectEvent',
  'useImperativeHandle',
  'useInsertionEffect',
  'useLayoutEffect',
  'useMemo',
  'useOptimistic',
  'useReducer',
  'useRef',
  'useState',
  'useSyncExternalStore',
  'useTransition',
]);

/** Client-only hooks of other modules, by module. */
const MODULE_CLIENT_HOOKS = {
  'react-dom': new Set(['useFormStatus']),
  'next/navigation': new Set([
    'usePathname',
    'useRouter',
    'useSearchParams',
    'useParams',
    'useSelectedLayoutSegment',
    'useSelectedLayoutSegments',
    'useServerInsertedHTML',
  ]),
};

/** MUI hooks: need a Client Component. MUI components ship their own 'use client'. */
const MUI_CLIENT_HOOKS = new Set(['useTheme', 'useMediaQuery', 'useColorScheme', 'useThemeProps']);

/**
 * MUI theme factories: a theme with functions cannot cross the server/client
 * boundary, so MUI puts createTheme in its own 'use client' file.
 */
const MUI_THEME_FACTORIES = new Set(['createTheme', 'extendTheme', 'responsiveFontSizes']);

/** Route segment config exports: ignored in 'use client' files (verified on Next.js 15.5.29). */
const ROUTE_SEGMENT_CONFIG = new Set([
  'dynamic',
  'dynamicParams',
  'revalidate',
  'fetchCache',
  'runtime',
  'preferredRegion',
  'maxDuration',
  'experimental_ppr',
]);

/** Metadata exports: a build error in 'use client' files. */
const METADATA_EXPORTS = new Set(['metadata', 'generateMetadata', 'viewport', 'generateViewport']);

module.exports = {
  METADATA_EXPORTS,
  MODULE_CLIENT_HOOKS,
  MUI_CLIENT_HOOKS,
  MUI_THEME_FACTORIES,
  REACT_CLIENT_HOOKS,
  ROUTE_SEGMENT_CONFIG,
};
