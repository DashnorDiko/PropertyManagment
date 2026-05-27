"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import { Button } from "@/components/ui/Button";

type ParkingStatus = "free" | "occupied";
type AssigneeType = "tenant" | "independent";

export type ParkingFormValues = {
  spotCode: string;
  status: ParkingStatus;
  assigneeType: AssigneeType;
  assigneeName: string;
  parkingCardNumber: string;
};

type ParkingFormProps = {
  mode: "create" | "edit";
  initialValues?: Partial<ParkingFormValues>;
};

type ParkingFormErrors = Partial<Record<keyof ParkingFormValues, string>>;

const defaultValues: ParkingFormValues = {
  spotCode: "",
  status: "free",
  assigneeType: "tenant",
  assigneeName: "",
  parkingCardNumber: "",
};

function sanitizeInput(values: ParkingFormValues): ParkingFormValues {
  const sanitized: ParkingFormValues = {
    ...values,
    spotCode: values.spotCode.trim().toUpperCase(),
    assigneeName: values.assigneeName.trim(),
    parkingCardNumber: values.parkingCardNumber.trim().toUpperCase(),
  };

  if (sanitized.status === "free") {
    sanitized.assigneeName = "";
    sanitized.parkingCardNumber = "";
  }

  return sanitized;
}

function validate(values: ParkingFormValues): ParkingFormErrors {
  const errors: ParkingFormErrors = {};

  if (!values.spotCode.trim()) {
    errors.spotCode = "Spot code is required.";
  }

  if (values.status === "occupied" && !values.assigneeName.trim()) {
    errors.assigneeName = "Assigned person name is required for occupied spots.";
  }

  if (values.status === "occupied" && !values.parkingCardNumber.trim()) {
    errors.parkingCardNumber = "Parking card number is required for occupied spots.";
  }

  return errors;
}

export function ParkingForm({ mode, initialValues }: ParkingFormProps) {
  const mergedInitialValues = useMemo<ParkingFormValues>(
    () => ({ ...defaultValues, ...initialValues }),
    [initialValues],
  );

  const [values, setValues] = useState<ParkingFormValues>(mergedInitialValues);
  const [errors, setErrors] = useState<ParkingFormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const onFieldChange =
    (field: keyof ParkingFormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
      const fieldValue = event.target.value;
      const nextValues = {
        ...values,
        [field]: fieldValue,
      };

      if (field === "status" && fieldValue === "free") {
        nextValues.assigneeName = "";
        nextValues.parkingCardNumber = "";
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
      ? "Create a parking spot and assign it either to a tenant or an independent person."
      : "Update parking spot assignment, status, and parking card details.";

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-2xl border border-[var(--pm-border)]/80 bg-[var(--pm-surface)] p-5 shadow-sm"
    >
      <p className="text-sm text-[var(--pm-text-secondary)]">{helperMessage}</p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-medium text-[var(--pm-text-secondary)]">Spot Code</span>
          <input
            value={values.spotCode}
            onChange={onFieldChange("spotCode")}
            placeholder="P-01"
            className="w-full rounded-lg border border-[var(--pm-border)] bg-[var(--pm-surface)] px-3 py-2 text-sm text-[var(--pm-text-primary)] outline-none ring-[var(--pm-info-strong)]/40 transition focus:ring"
          />
          {errors.spotCode ? (
            <p className="text-xs text-[var(--pm-danger-strong)]">{errors.spotCode}</p>
          ) : null}
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-[var(--pm-text-secondary)]">Status</span>
          <select
            value={values.status}
            onChange={onFieldChange("status")}
            className="w-full rounded-lg border border-[var(--pm-border)] bg-[var(--pm-surface)] px-3 py-2 text-sm text-[var(--pm-text-primary)] outline-none ring-[var(--pm-info-strong)]/40 transition focus:ring"
          >
            <option value="free">Free</option>
            <option value="occupied">Occupied</option>
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-[var(--pm-text-secondary)]">Assigned Type</span>
          <select
            value={values.assigneeType}
            onChange={onFieldChange("assigneeType")}
            className="w-full rounded-lg border border-[var(--pm-border)] bg-[var(--pm-surface)] px-3 py-2 text-sm text-[var(--pm-text-primary)] outline-none ring-[var(--pm-info-strong)]/40 transition focus:ring"
          >
            <option value="tenant">Tenant</option>
            <option value="independent">Independent</option>
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-[var(--pm-text-secondary)]">Assigned Person</span>
          <input
            value={values.assigneeName}
            onChange={onFieldChange("assigneeName")}
            placeholder={values.status === "free" ? "Optional while free" : "Required"}
            className="w-full rounded-lg border border-[var(--pm-border)] bg-[var(--pm-surface)] px-3 py-2 text-sm text-[var(--pm-text-primary)] outline-none ring-[var(--pm-info-strong)]/40 transition focus:ring"
          />
          {errors.assigneeName ? (
            <p className="text-xs text-[var(--pm-danger-strong)]">{errors.assigneeName}</p>
          ) : null}
        </label>
      </div>

      <label className="space-y-1">
        <span className="text-sm font-medium text-[var(--pm-text-secondary)]">Parking Card Number</span>
        <input
          value={values.parkingCardNumber}
          onChange={onFieldChange("parkingCardNumber")}
          placeholder={values.status === "free" ? "Optional while free" : "Required"}
          className="w-full rounded-lg border border-[var(--pm-border)] bg-[var(--pm-surface)] px-3 py-2 text-sm text-[var(--pm-text-primary)] outline-none ring-[var(--pm-info-strong)]/40 transition focus:ring"
        />
        {errors.parkingCardNumber ? (
          <p className="text-xs text-[var(--pm-danger-strong)]">{errors.parkingCardNumber}</p>
        ) : null}
      </label>

      {isSubmitted && Object.keys(errors).length === 0 ? (
        <p className="rounded-lg bg-[var(--pm-accent-soft)] px-3 py-2 text-sm text-[var(--pm-accent)]">
          Form is valid and ready for backend integration.
        </p>
      ) : null}

      <div className="mt-1 flex flex-wrap items-center gap-3 pt-2">
        <Button type="submit">{mode === "create" ? "Create Spot" : "Save Changes"}</Button>
        <Link
          href="/parking"
          className="rounded-lg border border-[var(--pm-border)] px-4 py-2 text-sm font-medium text-[var(--pm-text-secondary)] transition hover:bg-[var(--pm-surface-soft)]"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
