import { requestUrl } from "obsidian";
import { getValidAccessToken } from "../helper/storage/getValidAccessToken";

export const getGoogleCalendars = async (): Promise<void> => {
    const DEBUG = true;
    if (DEBUG) {

        const request = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${(await getValidAccessToken())}`
            },
        });

        const calendars = await request.json();
        console.log(calendars);
        return
    }

    const request = await requestUrl({
        url: "https://www.googleapis.com/calendar/v3/users/me/calendarList",
        method: "GET",
        headers: {
            "Authorization": `Bearer ${(await getValidAccessToken())}`
        },
        contentType: "application/json",
        throw: false
    });

    const calendars = request.json.items;
    console.log(calendars);

}