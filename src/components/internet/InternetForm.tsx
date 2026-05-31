"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import { Button } from "@/components/ui/Button";

type InternetStatus = "free" | "occupied";
type AssigneeType = "tenant" | "independent";

export type InternetFormValues = {
  serviceCode: string;
  status: InternetStatus;
  assigneeType: AssigneeType;
  assigneeName: string;
  modemSerialNumber: string;
  price: string;
};

type InternetFormProps = {
  mode: "create" | "edit";
  initialValues?: Partial<InternetFormValues>;
};

type InternetFormErrors = Partial<Record<keyof InternetFormValues, string>>;

const defaultValues: InternetFormValues = {
  serviceCode: "",
  status: "free",
  assigneeType: "tenant",
  assigneeName: "",
  modemSerialNumber: "",
  price: "",
};

function sanitizeInput(values: InternetFormValues): InternetFormValues {
  const sanitized: InternetFormValues = {
    ...values,
    serviceCode: values.serviceCode.trim().toUpperCase(),
    assigneeName: values.assigneeName.trim(),
    modemSerialNumber: values.modemSerialNumber.trim().toUpperCase(),
  };

  if (sanitized.status === "free") {
    sanitized.assigneeName = "";
    sanitized.modemSerialNumber = "";
  }

  return sanitized;
}

function validate(values: InternetFormValues): InternetFormErrors {
  const errors: InternetFormErrors = {};

  if (!values.serviceCode.trim()) {
    errors.serviceCode = "Kodi i shërbimit është i detyrueshëm.";
  }

  if (values.status === "occupied" && !values.assigneeName.trim()) {
    errors.assigneeName = "Emri i personit është i detyrueshëm kur shërbimi është i zënë.";
  }

  if (values.status === "occupied" && !values.modemSerialNumber.trim()) {
    errors.modemSerialNumber = "Numri i modemit është i detyrueshëm kur shërbimi është i zënë.";
  }

  const priceNumber = Number(values.price);
  if (!Number.isFinite(priceNumber) || priceNumber < 0) {
    errors.price = "Çmimi duhet të jetë një vlerë jo negative.";
  }

  return errors;
}

export function InternetForm({ mode, initialValues }: InternetFormProps) {
  const router = useRouter();
  const mergedInitialValues = useMemo<InternetFormValues>(
    () => ({ ...defaultValues, ...initialValues }),
    [initialValues],
  );

  const [values, setValues] = useState<InternetFormValues>(mergedInitialValues);
  const [errors, setErrors] = useState<InternetFormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onFieldChange =
    (field: keyof InternetFormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
      const fieldValue = event.target.value;
      const nextValues = {
        ...values,
        [field]: fieldValue,
      };

      if (field === "status" && fieldValue === "free") {
        nextValues.assigneeName = "";
        nextValues.modemSerialNumber = "";
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
      const response = await fetch("/api/internet", {
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
          "Dështoi ruajtja e shërbimit të internetit. Provo përsëri.";
        setSubmitError(message);
        return;
      }

      router.push("/internet");
      router.refresh();
    } catch {
      setSubmitError("Ndodhi një gabim në rrjet. Provo përsëri.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const helperMessage =
    mode === "create"
      ? "Krijo një shërbim interneti me çmim dhe caktoje për qiramarrës ose person të pavarur. Ruajtja bëhet direkt në bazën e të dhënave."
      : "Përditëso caktimin e shërbimit, statusin, çmimin dhe numrin e modemit.";

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-2xl border border-[var(--pm-border)]/80 bg-[var(--pm-surface)] p-5 shadow-sm"
    >
      <p className="text-sm text-[var(--pm-text-secondary)]">{helperMessage}</p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-medium text-[var(--pm-text-secondary)]">Kodi i Shërbimit</span>
          <input
            value={values.serviceCode}
            onChange={onFieldChange("serviceCode")}
            placeholder="NET-01"
            className="w-full rounded-lg border border-[var(--pm-border)] bg-[var(--pm-surface)] px-3 py-2 text-sm text-[var(--pm-text-primary)] outline-none ring-[var(--pm-info-strong)]/40 transition focus:ring"
          />
          {errors.serviceCode ? (
            <p className="text-xs text-[var(--pm-danger-strong)]">{errors.serviceCode}</p>
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
          <span className="text-sm font-medium text-[var(--pm-text-secondary)]">Çmimi</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={values.price}
            onChange={onFieldChange("price")}
            placeholder="25"
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

        <label className="space-y-1">
          <span className="text-sm font-medium text-[var(--pm-text-secondary)]">Numri i Modemit</span>
          <input
            value={values.modemSerialNumber}
            onChange={onFieldChange("modemSerialNumber")}
            placeholder={values.status === "free" ? "Opsionale kur është i lirë" : "E detyrueshme"}
            className="w-full rounded-lg border border-[var(--pm-border)] bg-[var(--pm-surface)] px-3 py-2 text-sm text-[var(--pm-text-primary)] outline-none ring-[var(--pm-info-strong)]/40 transition focus:ring"
          />
          {errors.modemSerialNumber ? (
            <p className="text-xs text-[var(--pm-danger-strong)]">{errors.modemSerialNumber}</p>
          ) : null}
        </label>
      </div>

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
              ? "Krijo Shërbimin"
              : "Ruaj Ndryshimet"}
        </Button>
        <Link
          href="/internet"
          className="rounded-lg border border-[var(--pm-border)] px-4 py-2 text-sm font-medium text-[var(--pm-text-secondary)] transition hover:bg-[var(--pm-surface-soft)]"
        >
          Anulo
        </Link>
      </div>
    </form>
  );
}
