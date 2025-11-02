import { useMemo, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Select from "react-select";
import { toast } from "react-toastify";
import { createServiceReport } from "../api/reports";
import { getCustomers } from "../api/customers";
import { getSpares } from "../api/spares";

/** ---------- Cloudinary unsigned upload helper ---------- */
async function uploadToCloudinary(file, preset) {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", preset);
  data.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

  const res = await fetch(import.meta.env.VITE_CLOUDINARY_URL, {
    method: "POST",
    body: data,
  });

  const json = await res.json();
  if (!res.ok || !json?.secure_url) {
    throw new Error(json?.error?.message || "Cloudinary upload failed");
  }
  return json.secure_url;
}

/** ---------- Validation Schema ---------- */
const schema = yup.object({
  SerialReportNumber: yup.string().trim().required("Required"),
  Date: yup.string().required("Required"),
  Customer: yup.string().required("Required"),
  timeIn: yup.string().required("Required"),
  timeOut: yup.string().required("Required"),
  Quotation: yup.string().required("Required"),
  PurchaseOrder: yup.string().required("Required"),
  Inventory: yup.string().required("Required"),

  MachineType: yup
    .mixed()
    .oneOf(["CIJ", "LASER", "TTO", "PALLET", "TAPPING", "SCALE", "OTHER", ""])
    .required("Required"),
  otherMachineType: yup.string().when("MachineType", {
    is: (v) => v === "OTHER",
    then: (s) => s.required("Specify other machine type"),
    otherwise: (s) => s.strip(),
  }),
  headLife: yup.string().when("MachineType", {
    is: (v) => v === "TTO",
    then: (s) => s.required("Head life is required for TTO"),
    otherwise: (s) => s.strip(),
  }),
  powerONtime: yup.string().when("MachineType", {
    is: (v) => v === "CIJ",
    then: (s) => s.required("Required"),
    otherwise: (s) => s.strip(),
  }),
  JetRunningTime: yup.string().when("MachineType", {
    is: (v) => v === "CIJ",
    then: (s) => s.required("Required"),
    otherwise: (s) => s.strip(),
  }),
  ServiceDueDate: yup.string().nullable(),
  INKtype: yup.string().when("MachineType", {
    is: (v) => v === "CIJ",
    then: (s) => s.required("Required"),
    otherwise: (s) => s.strip(),
  }),
  SolventType: yup.string().when("MachineType", {
    is: (v) => v === "CIJ",
    then: (s) => s.required("Required"),
    otherwise: (s) => s.strip(),
  }),
  Model: yup.string().required("Required"),
  SerialNumber: yup.string().required("Required"),

  ServiceType: yup
    .mixed()
    .oneOf([
      "NEW_INSTALLATION",
      "DEMO",
      "SERVICE_CALL",
      "AMC",
      "WARRANTY",
      "FILTERS_REPLACMENT",
      "OTHER",
      "",
    ])
    .required("Required"),
  otherServiceType: yup.string().when("ServiceType", {
    is: (v) => v === "OTHER",
    then: (s) => s.required("Specify service type"),
    otherwise: (s) => s.strip(),
  }),
  Unicode: yup.string().when("ServiceType", {
    is: (v) => v === "NEW_INSTALLATION",
    then: (s) => s.required("Required"),
    otherwise: (s) => s.strip(),
  }),
  Configurationcode: yup.string().when("ServiceType", {
    is: (v) => v === "NEW_INSTALLATION",
    then: (s) => s.required("Required"),
    otherwise: (s) => s.strip(),
  }),

  description: yup.string().trim().required("Required"),

  JobCompleted: yup.mixed().oneOf(["yes", "no"]).required("Required"),
  JobcompleteReason: yup.string().when("JobCompleted", {
    is: (v) => v === "no",
    then: (s) => s.required("Required when not completed"),
    otherwise: (s) => s.strip(),
  }),

  customerPhoneNumber: yup.string().required("Required"),
  customerdesignation: yup.string().required("Required"),
  concernName: yup.string().required("Required"),

  spare: yup
    .array()
    .of(yup.string().required())
    .min(1, "Select at least one spare part"),

  serviceReportPicture: yup
    .mixed()
    .test("file-required", "Service report image is required", (v) => !!v?.[0]),
  deliveryNotePicture: yup
    .mixed()
    .test("file-required", "Delivery note image is required", (v) => !!v?.[0]),
});

export default function ServiceReport() {
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      ServiceType: "",
      MachineType: "",
    },
  });

  const machineType = watch("MachineType");
  const serviceType = watch("ServiceType");
  const jobCompleted = watch("JobCompleted");

  const [customers, setCustomers] = useState([]);
  const [spares, setSpares] = useState([]);

  const validImageTypes = useMemo(
    () => [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
      "image/heic",
      "image/heif",
    ],
    []
  );

  /** ---------- Submit Form ---------- */
  const onSubmit = async (values) => {
    console.log(values);
    try {
      const reportFile = values.serviceReportPicture?.[0];
      const deliveryFile = values.deliveryNotePicture?.[0];

      if (
        !validImageTypes.includes(reportFile?.type) ||
        !validImageTypes.includes(deliveryFile?.type)
      ) {
        toast.error("Invalid image format. Use JPG/PNG/WEBP/HEIC.");
        return;
      }

      const [reportUrl, deliveryUrl] = await Promise.all([
        uploadToCloudinary(
          reportFile,
          import.meta.env.VITE_UPLOAD_PRESET_REPORT
        ),
        uploadToCloudinary(
          deliveryFile,
          import.meta.env.VITE_UPLOAD_PRESET_DELIVERY
        ),
      ]);

      const payload = {
        ...values,
        ServiceDueDate: values.ServiceDueDate || null,
        region: localStorage.getItem("regionID"),
        engineerName: localStorage.getItem("userID"),
        serviceReportPicture: reportUrl,
        deliveryNotePicture: deliveryUrl,
      };

      console.log("📦 Final Payload:", payload);
      const res = await createServiceReport(payload);

      if (res?.data?.status === "success") {
        toast.success("Service report created successfully!");
        reset();
      } else {
        toast.error(res?.data?.message || "Failed to create report");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong");
    }
  };

  /** ---------- Load customers and spares ---------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, spareRes] = await Promise.all([
          getCustomers(),
          getSpares(),
        ]);
        setCustomers(custRes.data?.customers || []);
        setSpares(spareRes.data?.spares || []);
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
      }
    };
    fetchData();
  }, []);
  console.log("Form errors:", errors);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-6 md:p-8 max-w-5xl mx-auto bg-white rounded-xl shadow-lg space-y-6"
    >
      <h1 className="text-2xl font-bold text-indigo-600 text-center">
        Service Report
      </h1>

      {/* ===== Basic Info ===== */}
      <div className="grid sm:grid-cols-2 gap-4">
        <input
          {...register("SerialReportNumber")}
          placeholder="Serial Report Number*"
          className="border p-2 rounded w-full"
        />
        <input
          type="date"
          {...register("Date")}
          className="border p-2 rounded w-full"
        />
      </div>

      {/* ===== Customer Section ===== */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Controller
          name="Customer"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              isClearable
              isSearchable
              options={customers.map((c) => ({
                label: `${c.name} (${c.region?.code || "N/A"})`,
                value: c._id,
              }))}
              value={
                customers
                  .filter((c) => c._id === field.value)
                  .map((c) => ({
                    label: `${c.name} (${c.region?.code || "N/A"})`,
                    value: c._id,
                  }))[0] || null
              }
              onChange={(selectedOption) =>
                field.onChange(selectedOption ? selectedOption.value : "")
              }
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Select Customer*"
            />
          )}
        />
        {errors.Customer && (
          <p className="text-red-600 text-sm">{errors.Customer.message}</p>
        )}
        <input
          type="time"
          {...register("timeIn")}
          className="border p-2 rounded w-full"
        />
        <input
          type="time"
          {...register("timeOut")}
          className="border p-2 rounded w-full"
        />
      </div>
      {/* ===== Quotation, Purchase Order, Inventory ===== */}
      <div className="grid sm:grid-cols-3 gap-4">
        <input
          {...register("Quotation")}
          placeholder="Quotation*"
          className="border p-2 rounded w-full"
        />
        <input
          {...register("PurchaseOrder")}
          placeholder="Purchase Order*"
          className="border p-2 rounded w-full"
        />
        <input
          {...register("Inventory")}
          placeholder="Inventory*"
          className="border p-2 rounded w-full"
        />
      </div>

      {/* ===== Machine Details ===== */}
      <div className="grid sm:grid-cols-3 gap-4">
        <select
          {...register("MachineType")}
          className="border p-2 rounded w-full"
        >
          <option value="">Machine Type*</option>
          <option value="CIJ">CIJ</option>
          <option value="LASER">LASER</option>
          <option value="TTO">TTO</option>
          <option value="PALLET">PALLET</option>
          <option value="TAPPING">TAPPING</option>
          <option value="SCALE">SCALE</option>
          <option value="OTHER">OTHER</option>
        </select>
        <input
          {...register("Model")}
          placeholder="Model*"
          className="border p-2 rounded w-full"
        />
        <input
          {...register("SerialNumber")}
          placeholder="Serial Number*"
          className="border p-2 rounded w-full"
        />
      </div>

      {/* ===== Conditional Inputs ===== */}
      {machineType === "OTHER" && (
        <input
          {...register("otherMachineType")}
          placeholder="Specify other machine type*"
          className="border p-2 rounded w-full"
        />
      )}
      {machineType === "TTO" && (
        <input
          {...register("headLife")}
          placeholder="Head Life*"
          className="border p-2 rounded w-full"
        />
      )}
      {machineType === "CIJ" && (
        <div className="grid sm:grid-cols-2 gap-4">
          <input
            {...register("powerONtime")}
            placeholder="Power ON Time*"
            className="border p-2 rounded w-full"
          />
          <input
            {...register("JetRunningTime")}
            placeholder="Jet Running Time*"
            className="border p-2 rounded w-full"
          />
          <input
            type="date"
            {...register("ServiceDueDate")}
            className="border p-2 rounded w-full"
          />
          <input
            {...register("INKtype")}
            placeholder="Ink Type*"
            className="border p-2 rounded w-full"
          />
          <input
            {...register("SolventType")}
            placeholder="Solvent Type*"
            className="border p-2 rounded w-full"
          />
        </div>
      )}

      {/* ===== Service Type ===== */}
      <select
        {...register("ServiceType")}
        className="border p-2 rounded w-full"
      >
        <option value="">Service Type*</option>
        <option value="NEW_INSTALLATION">New Installation</option>
        <option value="DEMO">Demo</option>
        <option value="SERVICE_CALL">Service Call</option>
        <option value="AMC">AMC</option>
        <option value="WARRANTY">Warranty</option>
        <option value="FILTERS_REPLACMENT">Filters Replacement</option>
        <option value="OTHER">Other</option>
      </select>

      {serviceType === "OTHER" && (
        <input
          {...register("otherServiceType")}
          placeholder="Specify other service type*"
          className="border p-2 rounded w-full"
        />
      )}
      {serviceType === "NEW_INSTALLATION" && (
        <div className="grid sm:grid-cols-2 gap-4">
          <input
            {...register("Unicode")}
            placeholder="Unicode*"
            className="border p-2 rounded w-full"
          />
          <input
            {...register("Configurationcode")}
            placeholder="Configuration Code*"
            className="border p-2 rounded w-full"
          />
        </div>
      )}

      {/* ===== Description ===== */}
      <textarea
        {...register("description")}
        placeholder="Job done description*"
        rows={3}
        className="border p-2 rounded w-full"
      />

      {/* ===== Job Completion ===== */}
      <div>
        <p className="font-semibold mb-1">Job Completed?*</p>
        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input type="radio" value="yes" {...register("JobCompleted")} /> Yes
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" value="no" {...register("JobCompleted")} /> No
          </label>
        </div>
      </div>

      {jobCompleted === "no" && (
        <textarea
          {...register("JobcompleteReason")}
          placeholder="Reason for incomplete job*"
          rows={2}
          className="border p-2 rounded w-full"
        />
      )}

      {/* ===== Customer Contact ===== */}
      <div className="grid sm:grid-cols-3 gap-4">
        <input
          {...register("concernName")}
          placeholder="Concern Person Name*"
          className="border p-2 rounded w-full"
        />
        <input
          {...register("customerdesignation")}
          placeholder="Designation*"
          className="border p-2 rounded w-full"
        />
        <input
          {...register("customerPhoneNumber")}
          placeholder="Customer Number*"
          className="border p-2 rounded w-full"
        />
      </div>

      {/* ===== Spare Parts ===== */}
      <Controller
        name="spare"
        control={control}
        render={({ field }) => (
          <Select
            {...field}
            isMulti
            options={spares.map((s) => ({
              label: `${s.name} (${s.code})`,
              value: s._id,
            }))}
            value={spares
              .filter((s) => field.value?.includes(s._id))
              .map((s) => ({
                label: `${s.name} (${s.code})`,
                value: s._id,
              }))}
            onChange={(selected) =>
              field.onChange(selected.map((opt) => opt.value))
            }
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="Select Spare Parts*"
          />
        )}
      />

      {/* ===== File Uploads ===== */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label className="font-semibold">Service Report Picture*</label>
          <input
            type="file"
            accept="image/*"
            {...register("serviceReportPicture")}
            className="border p-2 rounded w-full mt-1"
          />
        </div>
        <div>
          <label className="font-semibold">Delivery Note Picture*</label>
          <input
            type="file"
            accept="image/*"
            {...register("deliveryNotePicture")}
            className="border p-2 rounded w-full mt-1"
          />
        </div>
      </div>

      {/* ===== Submit Button ===== */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition ${
          isSubmitting
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700"
        }`}
      >
        {isSubmitting ? "Submitting..." : "Submit Report"}
      </button>
    </form>
  );
}
