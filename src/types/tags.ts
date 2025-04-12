export interface MetaTag {
    name: string;
    content: string;
}

export interface HeadData {
    title?: string;
    meta?: MetaTag[];
}