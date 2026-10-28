import { redirect } from "@remix-run/node";
import { TASTE_PATH } from "~/features/taste";

// Old address of the taste page
export const loader = () => redirect(TASTE_PATH, { status: 301 });
