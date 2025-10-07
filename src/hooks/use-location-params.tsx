"use client";

import { ParseOptions, StringifyOptions } from "query-string";
import queryString from "query-string";
import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const parseUrlOptions: ParseOptions = {
  parseNumbers: true,
  parseBooleans: true,
  arrayFormat: "bracket",
  arrayFormatSeparator: "|",
};

const stringifyOptions: StringifyOptions = {
  skipEmptyString: true,
  arrayFormat: "bracket",
  arrayFormatSeparator: "|",
};

export const useLocationParams = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = useMemo(() => {
    const parsed = queryString.parse(searchParams.toString(), parseUrlOptions);
    return parsed as Record<string, any>;
  }, [searchParams]);

  const push = (
    newQuery: Record<string, any>,
    options?: { update?: boolean; replace?: boolean },
  ) => {
    const update = options?.update ?? false;
    const replace = options?.replace ?? false;

    // 🔹 Hozirgi query bilan birlashtirish (update = true bo‘lsa)
    const finalQuery = update ? { ...query, ...newQuery } : newQuery;

    // 🔹 Agar tab = "list" bo‘lsa, URL dan query’ni butunlay olib tashlaymiz
    if (finalQuery.tab === "list") {
      if (replace) router.replace(pathname);
      else router.push(pathname);
      return;
    }

    const queryStr = queryString.stringify(finalQuery, stringifyOptions);
    const fullUrl = queryStr ? `${pathname}?${queryStr}` : pathname;

    if (replace) router.replace(fullUrl);
    else router.push(fullUrl);
  };

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || "";

  return {
    query,
    pathname,
    domain: origin,
    push,
  };
};
