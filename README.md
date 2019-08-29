# msaljs-sample

Example usage of msaljs in react in various scenarios.

//todo: this

## Structure

Each component is a view, essentially, that reflects a specific scenario:

- [GraphView](src/components/graph/GraphView.tsx) shows how to request an access token with a statically-assigned scope `https://graph.microsoft.com/User.Read`, configured in the application registration, using it to display your basic user data from `graph/me`.
- [Your API](src/components/power/PowerView.tsx) shows an Azure AD-protected API, running in an Azure Function, that requests scopes [dynamically](https://docs.microsoft.com/en-us/azure/active-directory/develop/azure-ad-endpoint-comparison#scopes-not-resources), that is, at runtime, instead of being set in the Azure AD application registration configuration.
- Static scopes redirects to [GraphView](src/components/graph/GraphView.tsx) since it's a staticly-scoped view
- Dynamic scopes redirects to [Your API](src/components/power/PowerView.tsx), since it's dynamically requested
- Group claim data shows your groups after `groupMembershipClaims` is added to the registration manifest
- AppRole shows your app roles after configuration &amp; assignment in Azure AD
- [ClaimsView](src/components/claims/ClaimsView.tsx) shows your `id_token`

## todo

- clean up structure
- add detail to views - remove additional menu boxes/items
