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

/** Client-only hooks of other modules, by module (a Map: no prototype lookups such as 'constructor'). */
const MODULE_CLIENT_HOOKS = new Map([
  ['react-dom', new Set(['useFormStatus'])],
  [
    'next/navigation',
    new Set([
      'usePathname',
      'useRouter',
      'useSearchParams',
      'useParams',
      'useSelectedLayoutSegment',
      'useSelectedLayoutSegments',
      'useServerInsertedHTML',
    ]),
  ],
]);

/** MUI hooks: need a Client Component. MUI components ship their own 'use client'. */
const MUI_CLIENT_HOOKS = new Set(['useTheme', 'useMediaQuery', 'useColorScheme', 'useThemeProps']);

/**
 * MUI theme factories: a theme with functions cannot cross the server/client
 * boundary, so MUI puts createTheme in its own 'use client' file.
 */
const MUI_THEME_FACTORIES = new Set(['createTheme', 'extendTheme', 'responsiveFontSizes']);

/**
 * Exports that fail the build in a 'use client' page or layout (Next.js 15.5.29:
 * react_server_components.rs checks metadata/generateMetadata in [\\/](page|layout) files;
 * get-page-static-info.ts rejects 'use client' together with generateStaticParams).
 */
const BUILD_ERROR_EXPORTS = new Set(['metadata', 'generateMetadata', 'generateStaticParams']);

/**
 * Route segment config that is silently ignored in a 'use client' page. Verified by
 * a build: `dynamic = 'force-dynamic'` in a 'use client' page builds as static (○).
 * Not listed on purpose: runtime, preferredRegion and maxDuration are read
 * statically and do work there; revalidate, fetchCache and dynamicParams are not
 * verified, so they are not reported.
 */
const IGNORED_EXPORTS = new Set(['dynamic']);

module.exports = {
  BUILD_ERROR_EXPORTS,
  IGNORED_EXPORTS,
  MODULE_CLIENT_HOOKS,
  MUI_CLIENT_HOOKS,
  MUI_THEME_FACTORIES,
  REACT_CLIENT_HOOKS,
};
