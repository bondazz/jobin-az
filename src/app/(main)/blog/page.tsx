import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bloq | Jobin.az - Karyera Məqalələri və İş Axtarışı Məsləhətləri",
  description: "Karyera inkişafı, iş axtarışı, CV yazma, müsahibə hazırlığı və əmək bazarı haqqında ən son məqalələr. Jobin.az bloqu ilə karyeranızı inkişaf etdirin.",
  keywords: ["karyera", "iş axtarışı", "CV", "müsahibə", "əmək bazarı", "bloq", "məqalə"],
  openGraph: {
    title: "Bloq | Jobin.az - Karyera Məqalələri",
    description: "Karyera inkişafı və iş axtarışı haqqında məqalələr",
    type: "website",
    url: "https://Jobin.az/blog",
  },
};

export default function BlogPage() {
  // This page just provides metadata, the layout handles rendering BlogClient
  return null;
}
