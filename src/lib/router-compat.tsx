// Compatibility shim that lets the existing UI code keep using a
// TanStack-Router-flavoured API (`Link to="/foo/$id" params={{id}}`,
// `useNavigate()({to, search})`, `useLocation().pathname`, `<Outlet/>`)
// while running on top of react-router-dom (Vite SPA on Vercel).

import {
  Link as RRLink,
  Outlet as RROutlet,
  useNavigate as useRRNavigate,
  useLocation as useRRLocation,
  useParams as useRRParams,
  useSearchParams,
} from "react-router-dom";
import { forwardRef, type ComponentPropsWithoutRef, type Ref } from "react";

export { RROutlet as Outlet };

/** Convert TanStack-style "/shop/$productId" + params into a real path. */
function resolvePath(to: string, params?: Record<string, string | number>) {
  if (!params) return to;
  let out = to;
  for (const [k, v] of Object.entries(params)) {
    out = out.replace(`$${k}`, String(v));
  }
  return out;
}

type AnyLinkProps = Omit<ComponentPropsWithoutRef<typeof RRLink>, "to"> & {
  to: string;
  params?: Record<string, string | number>;
  search?: Record<string, string | number | boolean | undefined>;
  // accepted for compatibility, ignored
  activeProps?: unknown;
  preload?: unknown;
};

export const Link = forwardRef(function Link(
  { to, params, search, activeProps: _ap, preload: _pl, ...rest }: AnyLinkProps,
  ref: Ref<HTMLAnchorElement>,
) {
  const path = resolvePath(to, params);
  const qs = search
    ? "?" +
      new URLSearchParams(
        Object.entries(search)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)]),
      ).toString()
    : "";
  return <RRLink ref={ref} to={`${path}${qs}`} {...rest} />;
});

type NavOpts = {
  to: string;
  params?: Record<string, string | number>;
  search?: Record<string, string | number | boolean | undefined>;
  replace?: boolean;
};

export function useNavigate() {
  const nav = useRRNavigate();
  return (opts: NavOpts | string) => {
    if (typeof opts === "string") {
      nav(opts);
      return;
    }
    const path = resolvePath(opts.to, opts.params);
    const qs = opts.search
      ? "?" +
        new URLSearchParams(
          Object.entries(opts.search)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)]),
        ).toString()
      : "";
    nav(`${path}${qs}`, { replace: opts.replace });
  };
}

export function useLocation() {
  const loc = useRRLocation();
  return loc;
}

export function useParams<T extends Record<string, string> = Record<string, string>>(): T {
  return useRRParams() as T;
}

export function useSearch<T extends Record<string, string>>(): T {
  const [sp] = useSearchParams();
  const obj: Record<string, string> = {};
  sp.forEach((v, k) => {
    obj[k] = v;
  });
  return obj as T;
}
