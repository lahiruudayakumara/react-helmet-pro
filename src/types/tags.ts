export interface MetaTag {
    name?: string;
    content: string;
    property?: string;
}

export interface HeadData {
    title?: string;
    meta?: MetaTag[];
    link?: { rel: string; href: string }[];
    script?: { src: string; async?: boolean; defer?: boolean }[];
    htmlAttributes?: { [key: string]: string };
}