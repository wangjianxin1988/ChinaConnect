// @ts-nocheck
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    lang: string;
    user: import("@supabase/supabase-js").User | null;
    session: { access_token: string } | null;
  }
}
