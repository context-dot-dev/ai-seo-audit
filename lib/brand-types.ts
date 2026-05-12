export type BrandLogo = {
  url: string;
  type?: "icon" | "logo";
  mode?: "light" | "dark" | "has_opaque_background";
};

export type BrandBackdrop = {
  url: string;
  aspectRatio?: number;
};

export type BrandColor = {
  hex: string;
  name?: string;
};

export type BrandIndustry = {
  industry: string;
  subindustry: string;
};

export type BrandInfo = {
  domain: string;
  title: string | null;
  description: string | null;
  slogan: string | null;
  logos: BrandLogo[];
  backdrops: BrandBackdrop[];
  colors: BrandColor[];
  industries: BrandIndustry[];
};
