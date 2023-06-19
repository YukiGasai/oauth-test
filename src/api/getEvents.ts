import { requestUrl } from "obsidian";
import { getValidAccessToken } from "../helper/storage/getValidAccessToken";
import type { GoogleEvent } from "../helper/types";

export const getGoogleEvents = async (): Promise<GoogleEvent[]> => {

    const request = await requestUrl({
        url: "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        method: "GET",
        headers: {
            "Authorization": `Bearer ${(await getValidAccessToken())}`
        },
        contentType: "application/json",
        throw: false
    });

    const events: GoogleEvent[] = request.json.items;

    console.log(events);

    return events;

}