import { requestUrl } from "obsidian";
import { getAccessToken } from "../helper/storage/localStorageHelper";
import type { GoogleEvent } from "../helper/types";

export const getGoogleEvents = async (): Promise<GoogleEvent[]> => {

    const request = await requestUrl({
        url: "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        method: "GET",
        headers: {
            "application/json": "Content-Type",
            "Authorization": `Bearer ${(await getAccessToken())}`
        },
        throw: false
    });

    const events: GoogleEvent[] = request.json.items;

    console.log(events);

    return events;

}