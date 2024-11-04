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
import { FiRefreshCw } from "react-icons/fi";
import { Alert } from "@/components/ui/alert";
import { FaExclamationTriangle } from "react-icons/fa";

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

const datetimeSchema = z
  .object({
    leftTimezone: z.string(),
    rightTimezone: z.string(),
    inputDatetime: z.string().refine((val) => DateTime.fromISO(val).isValid, {
      message:
        "Invalid datetime format. Please use ISO8601 format, e.g., 2024-10-28T05:10:34.125+07:00",
    }),
  })
  .refine(
    (data) => {
      if (hasTimezoneInfo(data.inputDatetime)) {
        return true;
      } else {
        return data.leftTimezone;
      }
    },
    {
      message:
        "From Timezone is required if input datetime does not include timezone",
      path: ["leftTimezone"],
    }
  );

type DatetimeFormValues = z.infer<typeof datetimeSchema>;

function hasTimezoneInfo(datetimeStr: string) {
  const timezoneRegex = /(Z|[+-][0-9]{2}:[0-9]{2})$/;
  return timezoneRegex.test(datetimeStr);
}

function DatetimeConverter() {
  const form = useForm({
    defaultValues: {
      leftTimezone: "UTC",
      rightTimezone: "Asia/Tokyo",
      inputDatetime: "2024-10-28T05:10:34.125Z",
    } as DatetimeFormValues,
    onSubmit: async ({ value }) => {
      console.log(value);
    },
    validatorAdapter: zodValidator(),
    validators: {
      onChange: datetimeSchema,
    },
  });

  const [outputDatetime, setOutputDatetime] = useState("");
  const [inputIncludesTimezone, setInputIncludesTimezone] = useState(false);

  const timezones = [
    { label: "UTC (Coordinated Universal Time)", value: "UTC" },
    { label: "JST (Japan Standard Time)", value: "Asia/Tokyo" },

    // North America
    { label: "EST (Eastern Standard Time)", value: "America/New_York" },
    { label: "CST (Central Standard Time)", value: "America/Chicago" },
    { label: "MST (Mountain Standard Time)", value: "America/Denver" },
    { label: "PST (Pacific Standard Time)", value: "America/Los_Angeles" },
    { label: "AST (Atlantic Standard Time)", value: "America/Halifax" },
    { label: "AKST (Alaska Standard Time)", value: "America/Anchorage" },
    { label: "HST (Hawaii Standard Time)", value: "Pacific/Honolulu" },

    // Europe
    { label: "GMT (Greenwich Mean Time)", value: "Europe/London" },
    { label: "BST (British Summer Time)", value: "Europe/London" },
    { label: "CET (Central European Time)", value: "Europe/Berlin" },
    { label: "CEST (Central European Summer Time)", value: "Europe/Berlin" },
    { label: "EET (Eastern European Time)", value: "Europe/Helsinki" },
    { label: "MSK (Moscow Time)", value: "Europe/Moscow" },

    // Asia
    { label: "IST (India Standard Time)", value: "Asia/Kolkata" },
    { label: "SGT (Singapore Time)", value: "Asia/Singapore" },
    { label: "HKT (Hong Kong Time)", value: "Asia/Hong_Kong" },
    { label: "KST (Korea Standard Time)", value: "Asia/Seoul" },
    { label: "CST (China Standard Time)", value: "Asia/Shanghai" },
    {
      label: "AWST (Australian Western Standard Time)",
      value: "Australia/Perth",
    },
    {
      label: "ACST (Australian Central Standard Time)",
      value: "Australia/Adelaide",
    },
    {
      label: "AEST (Australian Eastern Standard Time)",
      value: "Australia/Sydney",
    },
    {
      label: "AEDT (Australian Eastern Daylight Time)",
      value: "Australia/Melbourne",
    },

    // Oceania
    { label: "NZST (New Zealand Standard Time)", value: "Pacific/Auckland" },
    { label: "NZDT (New Zealand Daylight Time)", value: "Pacific/Auckland" },

    // Africa
    {
      label: "SAST (South Africa Standard Time)",
      value: "Africa/Johannesburg",
    },
    { label: "EAT (East Africa Time)", value: "Africa/Nairobi" },

    // Middle East
    { label: "AST (Arabia Standard Time)", value: "Asia/Riyadh" },
    { label: "GST (Gulf Standard Time)", value: "Asia/Dubai" },

    // Others
    { label: "PHT (Philippine Time)", value: "Asia/Manila" },
    { label: "WIB (Western Indonesia Time)", value: "Asia/Jakarta" },
    { label: "WITA (Central Indonesia Time)", value: "Asia/Makassar" },
    { label: "WIT (Eastern Indonesia Time)", value: "Asia/Jayapura" },

    // Add more timezones as needed
  ];

  const handleReverseTimezones = () => {
    const { leftTimezone, rightTimezone } = form.state.values;
    form.setFieldValue("leftTimezone", rightTimezone);
    form.setFieldValue("rightTimezone", leftTimezone);
  };

  useEffect(() => {
    const { inputDatetime } = form.state.values;
    setInputIncludesTimezone(hasTimezoneInfo(inputDatetime));
  }, [form.state.values, form.state.values.inputDatetime]);

  useEffect(() => {
    const { inputDatetime, leftTimezone, rightTimezone } = form.state.values;
    if (inputDatetime && rightTimezone) {
      let dt;
      if (inputIncludesTimezone) {
        dt = DateTime.fromISO(inputDatetime, { setZone: true });
      } else if (leftTimezone) {
        dt = DateTime.fromISO(inputDatetime, { zone: leftTimezone });
      } else {
        dt = DateTime.fromISO(inputDatetime);
      }
      if (!dt.isValid) {
        setOutputDatetime("Invalid input datetime");
        return;
      }
      const converted = dt.setZone(rightTimezone).toISO() || "";
      setOutputDatetime(converted);
    } else {
      setOutputDatetime("");
    }
  }, [form.state.values, inputIncludesTimezone]);

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Datetime Converter</h1>

      {/* General Explanation */}
      <p className="mb-4 text-gray-700">
        TLDR; Enter a datetime in ISO8601 format, select the "From Timezone" and
        "To Timezone", and click "Convert" to see the converted datetime. If
        your datetime includes timezone information, the "From Timezone"
        selection will be ignored.
      </p>

      {inputIncludesTimezone && (
        <Alert variant="default" className="mb-4">
          <div className="flex items-start">
            <FaExclamationTriangle className="w-5 h-5 mr-2 mt-1" />
            <div>
              <strong>Important Information:</strong> Since your input datetime
              includes timezone information, the "From Timezone" selection is
              disabled as it will be ignored during conversion.
            </div>
          </div>
        </Alert>
      )}

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
                    <SelectTrigger
                      id={field.name}
                      disabled={inputIncludesTimezone}
                    >
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
              onChange: z
                .string()
                .refine((val) => DateTime.fromISO(val).isValid, {
                  message:
                    "Invalid datetime format. Please use ISO8601 format, e.g., 2024-10-28T05:10:34.125+07:00",
                }),
            }}
            children={(field) => (
              <>
                <Label htmlFor={field.name}>Input Datetime (ISO8601):</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g., 2024-10-28T05:10:34.125+07:00"
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
          <h2 className="text-base font-semibold">Converted Datetime:</h2>
          <p className="mt-2">{outputDatetime}</p>
        </div>
      )}
    </div>
  );
}
