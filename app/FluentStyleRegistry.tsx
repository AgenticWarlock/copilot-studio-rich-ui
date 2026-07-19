"use client";

import { ReactNode, useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { createDOMRenderer, RendererProvider, renderToStyleElements } from "@fluentui/react-components";

interface FluentStyleRegistryProps {
  children: ReactNode;
}

export function FluentStyleRegistry({ children }: FluentStyleRegistryProps) {
  const [renderer] = useState(() => createDOMRenderer());

  useServerInsertedHTML(() => {
    return <>{renderToStyleElements(renderer)}</>;
  });

  return <RendererProvider renderer={renderer}>{children}</RendererProvider>;
}
