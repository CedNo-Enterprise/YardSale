import { getDictionary } from "@/i18n/dictionaries";
import type { Address } from "@/lib/api/types";
import { SelectField, TextField } from "./fields";

const COUNTRIES = ["CA", "US", "FR", "GB"] as const;

/**
 * The address block used by both a sale and a buyer's home address. Field names
 * match what `addressFrom` reads out of the FormData on the server.
 */
export async function AddressFieldset({
  defaults,
  required = true,
  legend,
}: {
  defaults?: Address;
  required?: boolean;
  legend?: string;
}) {
  const dict = await getDictionary();

  return (
    <fieldset className="border-t border-haze pt-5">
      <legend className="display pr-3 text-lg text-ink">{legend ?? dict.address.legend}</legend>

      <div className="mt-3 flex flex-col gap-4">
        <TextField
          id="line1"
          name="line1"
          label={dict.address.line1}
          required={required}
          maxLength={120}
          autoComplete="address-line1"
          defaultValue={defaults?.line1}
        />

        <TextField
          id="line2"
          name="line2"
          label={dict.address.line2}
          optionalLabel={dict.common.optional}
          maxLength={120}
          autoComplete="address-line2"
          defaultValue={defaults?.line2}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="city"
            name="city"
            label={dict.address.city}
            required={required}
            maxLength={80}
            autoComplete="address-level2"
            defaultValue={defaults?.city}
          />
          <TextField
            id="state"
            name="state"
            label={dict.address.state}
            required={required}
            maxLength={80}
            autoComplete="address-level1"
            defaultValue={defaults?.state}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="postal_code"
            name="postal_code"
            label={dict.address.postalCode}
            required={required}
            maxLength={16}
            autoComplete="postal-code"
            defaultValue={defaults?.postal_code}
          />
          <SelectField
            id="country"
            name="country"
            label={dict.address.country}
            required={required}
            defaultValue={defaults?.country ?? "CA"}
            autoComplete="country"
          >
            {COUNTRIES.map((code) => (
              <option key={code} value={code}>
                {dict.countries[code]}
              </option>
            ))}
          </SelectField>
        </div>
      </div>
    </fieldset>
  );
}
