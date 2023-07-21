/*
    Helper function to make sure only allowed scopes are used in the authorization process

*/
export const scopeTest = (scopesString: string): boolean => {

    const scopes = scopesString.split(" ");

    // Allow only calendar scopes
    // Allow /calendar scope for compatibility with old clients
    const allowedScopes = ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/calendar.events", "https://www.googleapis.com/auth/calendar.readonly"];
    return scopes.every(scope => allowedScopes.indexOf(scope) > -1);
}