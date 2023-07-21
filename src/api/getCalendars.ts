import { requestUrl } from "obsidian";
import { getValidAccessToken } from "../helper/storage/getValidAccessToken";

/*
    Function to get all google calendars of the user using the google calendar api.
    This function is only used for testing purposes.
*/
export const getGoogleCalendars = async (): Promise<void> => {
    //If debug is enabled use the fetch function to view the request in the dev console.
    const DEBUG = true;
    if (DEBUG) {
        const request = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${(await getValidAccessToken())}` //Make sure to always get a valid access token
            },
        });

        // Parse the result to get show the result as json object
        const calendars = await request.json();
        console.log(calendars);
        return
    }

    //If debug is disabled use the requestUrl function to hide the request form the dev console.
    const request = await requestUrl({
        url: "https://www.googleapis.com/calendar/v3/users/me/calendarList",
        method: "GET",
        headers: {
            "Authorization": `Bearer ${(await getValidAccessToken())}`
        },
        contentType: "application/json",
        throw: false
    });

    // Parsing the result is already done internally by the requestUrl function
    console.log(request.json);

}