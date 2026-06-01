"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import { Button } from "@/components/ui/Button";

type ParkingStatus = "free" | "occupied";
type AssigneeType = "tenant" | "independent";

export type ParkingFormValues = {
  spotCode: string;
  status: ParkingStatus;
  assigneeType: AssigneeType;
  propertyId: string;
  assigneeName: string;
  parkingCardNumber: string;
  price: string;
};

type PropertyOption = {
  id: string;
  unitName: string;
  tenantName: string;
  status: "vacant" | "occupied" | "sold";
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
  propertyId: "",
  assigneeName: "",
  parkingCardNumber: "",
  price: "",
};

function sanitizeInput(values: ParkingFormValues): ParkingFormValues {
  const sanitized: ParkingFormValues = {
    ...values,
    spotCode: values.spotCode.trim().toUpperCase(),
    assigneeName: values.assigneeName.trim(),
    parkingCardNumber: values.parkingCardNumber.trim().toUpperCase(),
  };

  if (sanitized.status === "free") {
    sanitized.propertyId = "";
    sanitized.assigneeName = "";
    sanitized.parkingCardNumber = "";
  }

  return sanitized;
}

function validate(values: ParkingFormValues): ParkingFormErrors {
  const errors: ParkingFormErrors = {};

  if (!values.spotCode.trim()) {
    errors.spotCode = "Kodi i vendit është i detyrueshëm.";
  }

  if (values.status === "occupied" && !values.assigneeName.trim()) {
    errors.assigneeName = "Emri i personit është i detyrueshëm për vendet e zëna.";
  }

  if (values.status === "occupied" && !values.parkingCardNumber.trim()) {
    errors.parkingCardNumber = "Numri i kartës së parkimit është i detyrueshëm për vendet e zëna.";
  }
  if (values.status === "occupied" && values.assigneeType === "tenant" && !values.propertyId) {
    errors.propertyId = "Zgjidh pronën për qiramarrësin.";
  }

  const priceNumber = Number(values.price);
  if (!Number.isFinite(priceNumber) || priceNumber < 0) {
    errors.price = "Çmimi duhet të jetë një vlerë jo negative.";
  }

  return errors;
}

export function ParkingForm({ mode, initialValues }: ParkingFormProps) {
  const router = useRouter();
  const mergedInitialValues = useMemo<ParkingFormValues>(
    () => ({ ...defaultValues, ...initialValues }),
    [initialValues],
  );

  const [values, setValues] = useState<ParkingFormValues>(mergedInitialValues);
  const [errors, setErrors] = useState<ParkingFormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [propertyOptions, setPropertyOptions] = useState<PropertyOption[]>([]);

  useEffect(() => {
    let isCancelled = false;
    async function loadProperties() {
      try {
        const response = await fetch("/api/properties");
        if (!response.ok) {
          return;
        }
        const body = (await response.json()) as { data?: PropertyOption[] };
        if (!isCancelled) {
          setPropertyOptions((body.data ?? []).filter((property) => property.status === "occupied"));
        }
      } catch {
        // Keep empty options on fetch errors.
      }
    }

    loadProperties();
    return () => {
      isCancelled = true;
    };
  }, []);

  const onFieldChange =
    (field: keyof ParkingFormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
      const fieldValue = event.target.value;
      const nextValues = {
        ...values,
        [field]: fieldValue,
      };

      if (field === "status" && fieldValue === "free") {
        nextValues.propertyId = "";
        nextValues.assigneeName = "";
        nextValues.parkingCardNumber = "";
      }
      if (field === "assigneeType" && fieldValue === "independent") {
        nextValues.propertyId = "";
      }
      if (field === "propertyId") {
        const selectedProperty = propertyOptions.find((property) => property.id === fieldValue);
        if (selectedProperty) {
          nextValues.assigneeName = selectedProperty.tenantName;
        }
      }

      setValues(nextValues);
      if (errors[field]) {
        setErrors((previous) => ({ ...previous, [field]: undefined }));
      }
    };

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const sanitizedValues = sanitizeInput(values);
    const validationErrors = validate(sanitizedValues);

    setValues(sanitizedValues);
    setErrors(validationErrors);
    setIsSubmitted(true);
    setSubmitError(null);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (mode === "edit") {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/parking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sanitizedValues),
      });

      if (!response.ok) {
        const responseBody = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;
        const message =
          responseBody?.message ??
          "Dështoi ruajtja e vendit të parkimit. Provo përsëri.";
        setSubmitError(message);
        return;
      }

      router.push("/parking");
      router.refresh();
    } catch {
      setSubmitError("Ndodhi një gabim në rrjet. Provo përsëri.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const helperMessage =
    mode === "create"
      ? "Krijo një vend parkimi me çmim dhe caktoje për qiramarrës ose person të pavarur. Ruajtja bëhet direkt në bazën e të dhënave."
      : "Përditëso caktimin e vendit, statusin, çmimin dhe të dhënat e kartës së parkimit.";

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-2xl border border-[var(--pm-border)]/80 bg-[var(--pm-surface)] p-5 shadow-sm"
    >
      <p className="text-sm text-[var(--pm-text-secondary)]">{helperMessage}</p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-medium text-[var(--pm-text-secondary)]">Kodi i Vendit</span>
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
          <span className="text-sm font-medium text-[var(--pm-text-secondary)]">Statusi</span>
          <select
            value={values.status}
            onChange={onFieldChange("status")}
            className="w-full rounded-lg border border-[var(--pm-border)] bg-[var(--pm-surface)] px-3 py-2 text-sm text-[var(--pm-text-primary)] outline-none ring-[var(--pm-info-strong)]/40 transition focus:ring"
          >
            <option value="free">I lirë</option>
            <option value="occupied">I zënë</option>
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-[var(--pm-text-secondary)]">Lloji i Caktimit</span>
          <select
            value={values.assigneeType}
            onChange={onFieldChange("assigneeType")}
            className="w-full rounded-lg border border-[var(--pm-border)] bg-[var(--pm-surface)] px-3 py-2 text-sm text-[var(--pm-text-primary)] outline-none ring-[var(--pm-info-strong)]/40 transition focus:ring"
          >
            <option value="tenant">Qiramarrës</option>
            <option value="independent">I pavarur</option>
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-[var(--pm-text-secondary)]">Prona e Qiramarrësit</span>
          <select
            value={values.propertyId}
            onChange={onFieldChange("propertyId")}
            disabled={values.assigneeType !== "tenant"}
            className="w-full rounded-lg border border-[var(--pm-border)] bg-[var(--pm-surface)] px-3 py-2 text-sm text-[var(--pm-text-primary)] outline-none ring-[var(--pm-info-strong)]/40 transition focus:ring disabled:cursor-not-allowed disabled:bg-[var(--pm-surface-soft)]"
          >
            <option value="">Zgjidh pronën</option>
            {propertyOptions.map((property) => (
              <option key={property.id} value={property.id}>
                {property.unitName} - {property.tenantName || "Pa qiramarrës"}
              </option>
            ))}
          </select>
          {errors.propertyId ? (
            <p className="text-xs text-[var(--pm-danger-strong)]">{errors.propertyId}</p>
          ) : null}
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-[var(--pm-text-secondary)]">Çmimi</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={values.price}
            onChange={onFieldChange("price")}
            placeholder="45"
            className="w-full rounded-lg border border-[var(--pm-border)] bg-[var(--pm-surface)] px-3 py-2 text-sm text-[var(--pm-text-primary)] outline-none ring-[var(--pm-info-strong)]/40 transition focus:ring"
          />
          {errors.price ? (
            <p className="text-xs text-[var(--pm-danger-strong)]">{errors.price}</p>
          ) : null}
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-[var(--pm-text-secondary)]">Personi i Caktuar</span>
          <input
            value={values.assigneeName}
            onChange={onFieldChange("assigneeName")}
            placeholder={values.status === "free" ? "Opsionale kur është i lirë" : "E detyrueshme"}
            className="w-full rounded-lg border border-[var(--pm-border)] bg-[var(--pm-surface)] px-3 py-2 text-sm text-[var(--pm-text-primary)] outline-none ring-[var(--pm-info-strong)]/40 transition focus:ring"
          />
          {errors.assigneeName ? (
            <p className="text-xs text-[var(--pm-danger-strong)]">{errors.assigneeName}</p>
          ) : null}
        </label>
      </div>

      <label className="space-y-1">
        <span className="text-sm font-medium text-[var(--pm-text-secondary)]">Numri i Kartës së Parkimit</span>
        <input
          value={values.parkingCardNumber}
          onChange={onFieldChange("parkingCardNumber")}
          placeholder={values.status === "free" ? "Opsionale kur është i lirë" : "E detyrueshme"}
          className="w-full rounded-lg border border-[var(--pm-border)] bg-[var(--pm-surface)] px-3 py-2 text-sm text-[var(--pm-text-primary)] outline-none ring-[var(--pm-info-strong)]/40 transition focus:ring"
        />
        {errors.parkingCardNumber ? (
          <p className="text-xs text-[var(--pm-danger-strong)]">{errors.parkingCardNumber}</p>
        ) : null}
      </label>

      {isSubmitted && Object.keys(errors).length === 0 ? (
        <p className="rounded-lg bg-[var(--pm-accent-soft)] px-3 py-2 text-sm text-[var(--pm-accent)]">
          {mode === "create"
            ? "Forma është e vlefshme. Po ruhet në sistem."
            : "Forma është e vlefshme dhe gati për ruajtje."}
        </p>
      ) : null}
      {submitError ? (
        <p className="rounded-lg bg-[var(--pm-danger-soft)] px-3 py-2 text-sm text-[var(--pm-danger-strong)]">
          {submitError}
        </p>
      ) : null}

      <div className="mt-1 flex flex-wrap items-center gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Duke ruajtur..."
            : mode === "create"
              ? "Krijo Vendin"
              : "Ruaj Ndryshimet"}
        </Button>
        <Link
          href="/parking"
          className="rounded-lg border border-[var(--pm-border)] px-4 py-2 text-sm font-medium text-[var(--pm-text-secondary)] transition hover:bg-[var(--pm-surface-soft)]"
        >
          Anulo
        </Link>
      </div>
    </form>
  );
}
