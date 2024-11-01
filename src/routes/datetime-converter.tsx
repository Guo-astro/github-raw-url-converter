import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";
import type { FieldApi } from "@tanstack/react-form";
import { useState, useEffect } from "react";
import { DateTime } from "luxon";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FiRefreshCw } from "react-icons/fi"; // Import the reverse icon

// Import Shadcn UI components

export const Route = createFileRoute("/datetime-converter")({
  component: DatetimeConverter,
});

function FieldInfo({ field }: { field: FieldApi<any, any, any, any> }) {
  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <p className="text-red-500 text-sm">
          {field.state.meta.errors.join(",")}
        </p>
      ) : null}
      {field.state.meta.isValidating ? <p>Validating...</p> : null}
    </>
  );
}

const datetimeSchema = z.object({
  leftTimezone: z.string(),
  rightTimezone: z.string(),
  inputDatetime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid datetime format. Please use ISO8601 format.",
  }),
});

type DatetimeFormValues = z.infer<typeof datetimeSchema>;

function DatetimeConverter() {
  const form = useForm({
    defaultValues: {
      leftTimezone: "UTC",
      rightTimezone: "Asia/Tokyo",
      inputDatetime: "2024-10-28T05:10:34.125Z", // Added default value here
    } as DatetimeFormValues,
    onSubmit: async ({ value }) => {
      // Do something with form data
      console.log(value);
    },
    validatorAdapter: zodValidator(),
    validators: {
      onChange: datetimeSchema,
    },
  });

  const [outputDatetime, setOutputDatetime] = useState("");

  const timezones = [
    { label: "UTC", value: "UTC" },
    { label: "JST", value: "Asia/Tokyo" },
    // Add more timezones as needed
  ];

  // Function to reverse the timezones
  const handleReverseTimezones = () => {
    const { leftTimezone, rightTimezone } = form.state.values;
    form.setFieldValue("leftTimezone", rightTimezone);
    form.setFieldValue("rightTimezone", leftTimezone);
  };

  useEffect(() => {
    const { inputDatetime, leftTimezone, rightTimezone } = form.state.values;
    if (inputDatetime && leftTimezone && rightTimezone) {
      try {
        const dt = DateTime.fromISO(inputDatetime, { zone: leftTimezone });
        if (!dt.isValid) {
          setOutputDatetime("Invalid input datetime");
          return;
        }
        const converted = dt.setZone(rightTimezone).toISO() || "";
        setOutputDatetime(converted);
      } catch {
        setOutputDatetime("Error converting datetime");
      }
    } else {
      setOutputDatetime("");
    }
  }, [
    form.state.values,
    form.state.values.inputDatetime,
    form.state.values.leftTimezone,
    form.state.values.rightTimezone,
  ]);

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Datetime Converter</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <form.Field
              name="leftTimezone"
              children={(field) => (
                <>
                  <Label htmlFor={field.name}>From Timezone:</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value)}
                  >
                    <SelectTrigger id={field.name}>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldInfo field={field} />
                </>
              )}
            />
          </div>

          {/* Reverse Button */}
          <Button
            type="button"
            onClick={handleReverseTimezones}
            className="mb-4 mt-6"
          >
            <FiRefreshCw size={20} />
          </Button>

          <div className="flex-1">
            <form.Field
              name="rightTimezone"
              children={(field) => (
                <>
                  <Label htmlFor={field.name}>To Timezone:</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value)}
                  >
                    <SelectTrigger id={field.name}>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldInfo field={field} />
                </>
              )}
            />
          </div>
        </div>

        <div>
          <form.Field
            name="inputDatetime"
            validators={{
              onChange: z.string().refine((val) => !isNaN(Date.parse(val)), {
                message: "Invalid datetime format. Please use ISO8601 format.",
              }),
            }}
            children={(field) => (
              <>
                <Label htmlFor={field.name}>
                  Input Datetime YYYY-MM-DDThh:mm:ss (ISO8601):
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g., 2023-10-12T14:30:00"
                />
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit}>
              {isSubmitting ? "Converting..." : "Convert"}
            </Button>
          )}
        />
      </form>
      {outputDatetime && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Converted Datetime:</h2>
          <p className="mt-2">{outputDatetime}</p>
        </div>
      )}
    </div>
  );
}
