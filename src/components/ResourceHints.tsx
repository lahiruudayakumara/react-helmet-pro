import React from "react";
import type {
  DnsPrefetchProps,
  ModulePreloadProps,
  PreconnectProps,
  PrefetchProps,
  PreloadProps,
} from "../types/resourceHints";
import { buildResourceHintLink } from "../utils/resourceHints";
import { Helmet } from "./Helmet";

export const Preload: React.FC<PreloadProps> = (props) => (
  <Helmet link={[buildResourceHintLink({ ...props, rel: "preload" })]} />
);

export const ModulePreload: React.FC<ModulePreloadProps> = (props) => (
  <Helmet link={[buildResourceHintLink({ ...props, rel: "modulepreload" })]} />
);

export const Preconnect: React.FC<PreconnectProps> = (props) => (
  <Helmet link={[buildResourceHintLink({ ...props, rel: "preconnect" })]} />
);

export const DnsPrefetch: React.FC<DnsPrefetchProps> = (props) => (
  <Helmet link={[buildResourceHintLink({ href: props.href, rel: "dns-prefetch" })]} />
);

export const Prefetch: React.FC<PrefetchProps> = (props) => (
  <Helmet link={[buildResourceHintLink({ ...props, rel: "prefetch" })]} />
);
