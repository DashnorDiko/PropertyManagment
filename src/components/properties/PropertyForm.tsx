"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import { Button } from "@/components/ui/Button";

type Occupancy = "vacant" | "occupied";

export type PropertyFormValues = {
  unit: string;
  floor: string;
  areaSqm: string;
  ownerName: string;
  monthlyCharge: string;
  occupancy: Occupancy;
  tenantName: string;
};

type PropertyFormProps = {
  mode: "create" | "edit";
  initialValues?: Partial<PropertyFormValues>;
};

type PropertyFormErrors = Partial<Record<keyof PropertyFormValues, string>>;

const defaultValues: PropertyFormValues = {
  unit: "",
  floor: "0",
  areaSqm: "",
  ownerName: "",
  monthlyCharge: "",
  occupancy: "vacant",
  tenantName: "",
};

function sanitizeInput(values: PropertyFormValues): PropertyFormValues {
  const sanitized: PropertyFormValues = {
    ...values,
    unit: values.unit.trim().toUpperCase(),
    ownerName: values.ownerName.trim(),
    tenantName: values.tenantName.trim(),
  };

  if (sanitized.occupancy === "vacant") {
    sanitized.tenantName = "";
  }

  return sanitized;
}

function validate(values: PropertyFormValues): PropertyFormErrors {
  const errors: PropertyFormErrors = {};

  if (!values.unit.trim()) {
    errors.unit = "Unit code is required.";
  }

  const floorNumber = Number(values.floor);
  if (!Number.isInteger(floorNumber) || floorNumber < -3 || floorNumber > 120) {
    errors.floor = "Floor must be a whole number between -3 and 120.";
  }

  const areaNumber = Number(values.areaSqm);
  if (!Number.isFinite(areaNumber) || areaNumber <= 0) {
    errors.areaSqm = "Area must be greater than 0.";
  }

  if (!values.ownerName.trim()) {
    errors.ownerName = "Owner name is required.";
  }

  const monthlyChargeNumber = Number(values.monthlyCharge);
  if (!Number.isFinite(monthlyChargeNumber) || monthlyChargeNumber < 0) {
    errors.monthlyCharge = "Monthly charge cannot be negative.";
  }

  if (values.occupancy === "occupied" && !values.tenantName.trim()) {
    errors.tenantName = "Tenant name is required when occupied.";
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

      if (field === "occupancy" && fieldValue === "vacant") {
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
      ? "Create a property record. Form submission is local until backend APIs are connected."
      : "Update property details. Validation mirrors create flow and is backend-ready.";

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <p className="text-sm text-slate-600">{helperMessage}</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700">Unit</span>
          <input
            value={values.unit}
            onChange={onFieldChange("unit")}
            placeholder="A-101"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none ring-indigo-300 transition focus:ring"
          />
          {errors.unit ? <p className="text-xs text-red-600">{errors.unit}</p> : null}
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700">Floor</span>
          <input
            type="number"
            value={values.floor}
            onChange={onFieldChange("floor")}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none ring-indigo-300 transition focus:ring"
          />
          {errors.floor ? <p className="text-xs text-red-600">{errors.floor}</p> : null}
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700">Area (m²)</span>
          <input
            type="number"
            step="0.1"
            min="0"
            value={values.areaSqm}
            onChange={onFieldChange("areaSqm")}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none ring-indigo-300 transition focus:ring"
          />
          {errors.areaSqm ? <p className="text-xs text-red-600">{errors.areaSqm}</p> : null}
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700">Owner Name</span>
          <input
            value={values.ownerName}
            onChange={onFieldChange("ownerName")}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none ring-indigo-300 transition focus:ring"
          />
          {errors.ownerName ? (
            <p className="text-xs text-red-600">{errors.ownerName}</p>
          ) : null}
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700">Monthly Charge (EUR)</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={values.monthlyCharge}
            onChange={onFieldChange("monthlyCharge")}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none ring-indigo-300 transition focus:ring"
          />
          {errors.monthlyCharge ? (
            <p className="text-xs text-red-600">{errors.monthlyCharge}</p>
          ) : null}
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700">Occupancy</span>
          <select
            value={values.occupancy}
            onChange={onFieldChange("occupancy")}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none ring-indigo-300 transition focus:ring"
          >
            <option value="vacant">Vacant</option>
            <option value="occupied">Occupied</option>
          </select>
        </label>
      </div>

      {values.occupancy === "occupied" ? (
        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700">Tenant Name</span>
          <input
            value={values.tenantName}
            onChange={onFieldChange("tenantName")}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none ring-indigo-300 transition focus:ring"
          />
          {errors.tenantName ? (
            <p className="text-xs text-red-600">{errors.tenantName}</p>
          ) : null}
        </label>
      ) : null}

      {isSubmitted && Object.keys(errors).length === 0 ? (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Form is valid and ready for backend integration.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit">{mode === "create" ? "Create Property" : "Save Changes"}</Button>
        <Link
          href="/properties"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
