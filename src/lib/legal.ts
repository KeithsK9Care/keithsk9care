/**
 * Expand NAP placeholders in editable legal copy (privacy / terms).
 *
 * Lets the CMS copy stay editable while business contact details stay
 * single-sourced from site.json. Supported placeholders:
 *   {url}     -> linked site URL
 *   {address} -> full street address (plain text)
 *   {phone}   -> linked phone number
 *   {email}   -> linked email address
 * Other inline HTML (<strong>, links) in the copy is passed through as-is.
 */
interface SiteLike {
  url: string;
  phone: string;
  phoneIntl: string;
  email: string;
  address: { street: string; locality: string; region: string; postcode: string };
}

const link = (href: string, text: string) =>
  `<a href="${href}" class="text-teal-700 font-semibold">${text}</a>`;

export function expandPlaceholders(text: string, site: SiteLike): string {
  const address = `${site.address.street}, ${site.address.locality}, ${site.address.region} ${site.address.postcode}`;
  return text
    .replaceAll('{url}', link(site.url, site.url))
    .replaceAll('{address}', address)
    .replaceAll('{phone}', link(`tel:${site.phoneIntl}`, site.phone))
    .replaceAll('{email}', link(`mailto:${site.email}`, site.email));
}
