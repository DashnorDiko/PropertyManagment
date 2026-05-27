"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import type { Currency } from "@/lib/domain/types";

type Status = "vacant" | "occupied" | "sold";

export type PropertyFormValues = {
  unitName: string;
  locationSubtitle: string;
  rentAmount: string;
  rentCurrency: Currency;
  status: Status;
  tenantName: string;
};

type PropertyFormProps = {
  mode: "create" | "edit";
  initialValues?: Partial<PropertyFormValues>;
};

type PropertyFormErrors = Partial<Record<keyof PropertyFormValues, string>>;

const defaultValues: PropertyFormValues = {
  unitName: "",
  locationSubtitle: "",
  rentAmount: "",
  rentCurrency: "EUR",
  status: "vacant",
  tenantName: "",
};

function sanitizeInput(values: PropertyFormValues): PropertyFormValues {
  const sanitized: PropertyFormValues = {
    ...values,
    unitName: values.unitName.trim(),
    locationSubtitle: values.locationSubtitle.trim(),
    tenantName: values.tenantName.trim(),
  };

  if (sanitized.status === "vacant") {
    sanitized.tenantName = "";
  }

  return sanitized;
}

function validate(values: PropertyFormValues): PropertyFormErrors {
  const errors: PropertyFormErrors = {};

  if (!values.unitName.trim()) {
    errors.unitName = "Unit name is required.";
  }

  if (!values.locationSubtitle.trim()) {
    errors.locationSubtitle = "Location subtitle is required.";
  }

  const rentAmountNumber = Number(values.rentAmount);
  if (!Number.isFinite(rentAmountNumber) || rentAmountNumber < 0) {
    errors.rentAmount = "Rent cannot be negative.";
  }

  if ((values.status === "occupied" || values.status === "sold") && !values.tenantName.trim()) {
    errors.tenantName = "Tenant name is required when status is occupied or sold.";
  }

  return errors;
}

export function PropertyForm({ mode, initialValues }: PropertyFormProps) {
  const mergedInitialValues = useMemo<PropertyFormValues>(
    () => ({ ...defaultValues, ...initialValues }),
    [initialValues],
  );

  const [values, setValues] = useState<PropertyFormValues>(mergedInitialValues);
  const [errors, setErrors] = useState<PropertyFormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const onFieldChange =
    (field: keyof PropertyFormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
      const fieldValue = event.target.value;
      const nextValues = {
        ...values,
        [field]: fieldValue,
      };

      if (field === "status" && fieldValue === "vacant") {
        nextValues.tenantName = "";
      }

      setValues(nextValues);
      if (errors[field]) {
        setErrors((previous) => ({ ...previous, [field]: undefined }));
      }
    };

  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const sanitizedValues = sanitizeInput(values);
    const validationErrors = validate(sanitizedValues);

    setValues(sanitizedValues);
    setErrors(validationErrors);
    setIsSubmitted(true);
  };

  const helperMessage =
    mode === "create"
      ? "Create a property record with unit name, location subtitle, rent, and status. Submission is local until backend APIs are connected."
      : "Update unit details, status, and rent settings. Validation mirrors create flow and is backend-ready.";

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-2xl border border-[var(--pm-border)]/80 bg-[var(--pm-surface)] p-5 shadow-sm"
    >
      <p className="text-sm text-[var(--pm-text-secondary)]">{helperMessage}</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-medium text-[var(--pm-text-secondary)]">Unit Name</span>
          <input
            value={values.unitName}
            onChange={onFieldChange("unitName")}
            placeholder="Apartment 1"
            className="w-full rounded-lg border border-[var(--pm-border)] bg-[var(--pm-surface)] px-3 py-2 text-sm text-[var(--pm-text-primary)] outline-none ring-[var(--pm-info-strong)]/40 transition focus:ring"
          />
          {errors.unitName ? (
            <p className="text-xs text-[var(--pm-danger-strong)]">{errors.unitName}</p>
          ) : null}
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-[var(--pm-text-secondary)]">
            Location Subtitle
          </span>
          <input
            value={values.locationSubtitle}
            onChange={onFieldChange("locationSubtitle")}
            placeholder="Building A, Staircase 1, Floor 2"
            className="w-full rounded-lg border border-[var(--pm-border)] bg-[var(--pm-surface)] px-3 py-2 text-sm text-[var(--pm-text-primary)] outline-none ring-[var(--pm-info-strong)]/40 transition focus:ring"
          />
          {errors.locationSubtitle ? (
            <p className="text-xs text-[var(--pm-danger-strong)]">{errors.locationSubtitle}</p>
          ) : null}
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-[var(--pm-text-secondary)]">
            Rent Amount
          </span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.01"
              min="0"
              value={values.rentAmount}
              onChange={onFieldChange("rentAmount")}
              className="w-full rounded-lg border border-[var(--pm-border)] bg-[var(--pm-surface)] px-3 py-2 text-sm text-[var(--pm-text-primary)] outline-none ring-[var(--pm-info-strong)]/40 transition focus:ring"
            />
            <div className="inline-flex rounded-lg border border-[var(--pm-border)] bg-[var(--pm-surface-soft)] p-1">
              {(["EUR", "ALL"] as const).map((currency) => (
                <button
                  key={currency}
                  type="button"
                  onClick={() => {
                    setValues((current) => ({ ...current, rentCurrency: currency }));
                    if (errors.rentCurrency) {
                      setErrors((previous) => ({ ...previous, rentCurrency: undefined }));
                    }
                  }}
                  className={[
                    "min-w-14 rounded-md px-2.5 py-1.5 text-xs font-medium transition",
                    values.rentCurrency === currency
                      ? "bg-[var(--pm-accent)] text-white"
                      : "text-[var(--pm-text-secondary)] hover:bg-[var(--pm-surface)]",
                  ].join(" ")}
                >
                  {currency}
                </button>
              ))}
            </div>
          </div>
          {errors.rentAmount ? (
            <p className="text-xs text-[var(--pm-danger-strong)]">{errors.rentAmount}</p>
          ) : null}
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-[var(--pm-text-secondary)]">Status</span>
          <select
            value={values.status}
            onChange={onFieldChange("status")}
            className="w-full rounded-lg border border-[var(--pm-border)] bg-[var(--pm-surface)] px-3 py-2 text-sm text-[var(--pm-text-primary)] outline-none ring-[var(--pm-info-strong)]/40 transition focus:ring"
          >
            <option value="vacant">Vacant</option>
            <option value="occupied">Occupied</option>
            <option value="sold">Sold</option>
          </select>
        </label>
      </div>

      <label className="space-y-1">
        <span className="text-sm font-medium text-[var(--pm-text-secondary)]">Tenant Name</span>
        <input
          value={values.tenantName}
          onChange={onFieldChange("tenantName")}
          placeholder={values.status === "vacant" ? "Optional while vacant" : "Required"}
          className="w-full rounded-lg border border-[var(--pm-border)] bg-[var(--pm-surface)] px-3 py-2 text-sm text-[var(--pm-text-primary)] outline-none ring-[var(--pm-info-strong)]/40 transition focus:ring"
        />
        {errors.tenantName ? (
          <p className="text-xs text-[var(--pm-danger-strong)]">{errors.tenantName}</p>
        ) : null}
      </label>

      {isSubmitted && Object.keys(errors).length === 0 ? (
        <p className="rounded-lg bg-[var(--pm-accent-soft)] px-3 py-2 text-sm text-[var(--pm-accent)]">
          Form is valid and ready for backend integration.
        </p>
      ) : null}

      <div className="mt-1 flex flex-wrap items-center gap-3 pt-2">
        <Button type="submit">{mode === "create" ? "Create Property" : "Save Changes"}</Button>
        <Link
          href="/properties"
          className="rounded-lg border border-[var(--pm-border)] px-4 py-2 text-sm font-medium text-[var(--pm-text-secondary)] transition hover:bg-[var(--pm-surface-soft)]"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
