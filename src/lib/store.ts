import { cookieStorage, persist } from "@macfja/svelte-persistent-store";
import { writable } from "svelte/store";
import type { IconType } from "$lib/icon";
export const icotheme = persist<IconType>(writable('hand'), cookieStorage(), 'icontheme')