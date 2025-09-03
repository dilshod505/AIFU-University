"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
  FormField as RHFField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Rule } from "antd/es/form";
import type { UploadListType } from "antd/es/upload/interface";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Eye,
  EyeOff,
  FileText,
  ImageIcon,
  Info,
  Mail,
  Palette,
  Phone,
  Redo,
  Save,
  Search,
  Shield,
  Sparkles,
  Target,
  Timer,
  Undo,
  X,
  Zap,
} from "lucide-react";
import {
  type CSSProperties,
  type FC,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { UseFormReturn } from "react-hook-form";
import { CustomCheckbox } from "./checkbox";
import { FancyFileInput } from "./fancy-file-input";

export type ListItemContainer = {
  children: ReactNode;
  field: FormField;
  index: number;
  remove: () => void;
};

export type SelectMode = "multiple" | "tags" | undefined;

export type FieldDependency = {
  field: string;
  value: any;
  condition?:
    | "equals"
    | "not_equals"
    | "contains"
    | "greater_than"
    | "less_than";
};

export type FieldAnimation = {
  type?: "slide" | "fade" | "scale" | "bounce";
  duration?: number;
  delay?: number;
};

export type FieldMask = {
  pattern: string;
  placeholder?: string;
  definitions?: Record<string, RegExp>;
};

export type FormStep = {
  title: string;
  description?: string;
  fields: string[];
  validation?: boolean;
};

export type FormField = {
  label?: string | ReactNode;
  description?: string;
  addonBefore?: string;
  addonAfter?: string;
  listLabel?: string;
  labelContainer?: string;
  name: string;
  type?: string;
  rules?: Rule[] | undefined;
  className?: string;
  options?: { label: string | ReactNode; value: string | boolean | number }[];
  mode?: SelectMode;
  showSelectAll?: boolean;
  dynamic?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
  loading?: boolean;
  defaultValue?: any;
  accept?: string;
  span?: number;
  autoSize?: boolean;
  childFields?: FormField[];
  addButton?: string | ReactNode;
  collapse?: boolean;
  ListItemContainer?: FC<ListItemContainer>;
  colStyle?: CSSProperties;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  xxl?: number;
  // NEW: Row span support
  rowXs?: number;
  rowSm?: number;
  rowMd?: number;
  rowLg?: number;
  rowXl?: number;
  rowXxl?: number;
  listType?: UploadListType;
  fileMultiple?: boolean;
  showTime?: boolean;
  onChange?: any;
  onSearch?: any;
  fileType?: "image" | "file" | "video" | "audio";
  icon?: ReactNode;
  required?: boolean;
  dependencies?: FieldDependency[];
  group?: string;
  showPasswordToggle?: boolean;
  // NEW: Advanced features
  animation?: FieldAnimation;
  mask?: FieldMask;
  debounceMs?: number;
  conditionalStyle?: Record<string, string>;
  template?: string;
  cloneable?: boolean;
  searchable?: boolean;
  priority?: number;
  disabled?: boolean;
  autoComplete?: string;
  validationPreview?: boolean;
  customValidation?: (value: any) => string | null;
  maxLength?: number;
  minLength?: number;
};

export type FormGroup = {
  title: string;
  description?: string;
  fields: string[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  animation?: FieldAnimation;
  conditional?: FieldDependency[];
};

export type AutoSaveConfig = {
  enabled: boolean;
  interval?: number;
  showIndicator?: boolean;
  onSave?: (data: any) => Promise<void>;
};

interface AutoFormProps {
  fields: FormField[];
  groups?: FormGroup[];
  steps?: FormStep[];
  form: UseFormReturn<any>;
  onSubmit: (data: any) => void;
  loading?: boolean;
  className?: string;
  submitText?: string;
  resetText?: string;
  cancelText?: string;
  showResetButton?: boolean;
  showSaveButton?: boolean;
  persistFormState?: boolean;
  formId?: string;
  onFieldChange?: (fieldName: string, value: any) => void;
  // NEW: Advanced features
  autoSave?: AutoSaveConfig;
  showProgress?: boolean;
  enableAnimations?: boolean;
  enableSearch?: boolean;
  enableUndo?: boolean;
  theme?: "default" | "minimal" | "modern" | "glassmorphism";
  maxUndoSteps?: number;
  virtualScrolling?: boolean;
  analyticsEnabled?: boolean;
  footer?: ReactNode;
  defaultValues?: any;
  disabled?: boolean;
}

export const AutoForm: FC<AutoFormProps> = ({
  fields,
  groups,
  steps,
  form,
  onSubmit,
  loading = false,
  className,
  submitText = "Submit",
  resetText = "Reset",
  showResetButton = false,
  showSaveButton = true,
  persistFormState = false,
  formId = "auto-form",
  onFieldChange,
  autoSave = { enabled: false },
  showProgress = false,
  enableAnimations = true,
  enableSearch = false,
  enableUndo = false,
  theme = "default",
  maxUndoSteps = 10,
  footer = true,
  defaultValues,
  disabled = false,
}) => {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set()
  );
  const [showPasswords, setShowPasswords] = useState<Set<string>>(new Set());
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [clonedFields, setClonedFields] = useState<Record<string, number>>({});

  // Static mapping for grid classes (including row spans)
  const gridClasses: Record<string, string> = {
    // Column spans
    "col-span-1": "col-span-1",
    "col-span-2": "col-span-2",
    "col-span-3": "col-span-3",
    "col-span-4": "col-span-4",
    "col-span-5": "col-span-5",
    "col-span-6": "col-span-6",
    "col-span-7": "col-span-7",
    "col-span-8": "col-span-8",
    "col-span-9": "col-span-9",
    "col-span-10": "col-span-10",
    "col-span-11": "col-span-11",
    "col-span-12": "col-span-12",

    "sm:col-span-1": "sm:col-span-1",
    "sm:col-span-2": "sm:col-span-2",
    "sm:col-span-3": "sm:col-span-3",
    "sm:col-span-4": "sm:col-span-4",
    "sm:col-span-5": "sm:col-span-5",
    "sm:col-span-6": "sm:col-span-6",
    "sm:col-span-7": "sm:col-span-7",
    "sm:col-span-8": "sm:col-span-8",
    "sm:col-span-9": "sm:col-span-9",
    "sm:col-span-10": "sm:col-span-10",
    "sm:col-span-11": "sm:col-span-11",
    "sm:col-span-12": "sm:col-span-12",

    "md:col-span-1": "md:col-span-1",
    "md:col-span-2": "md:col-span-2",
    "md:col-span-3": "md:col-span-3",
    "md:col-span-4": "md:col-span-4",
    "md:col-span-5": "md:col-span-5",
    "md:col-span-6": "md:col-span-6",
    "md:col-span-7": "md:col-span-7",
    "md:col-span-8": "md:col-span-8",
    "md:col-span-9": "md:col-span-9",
    "md:col-span-10": "md:col-span-10",
    "md:col-span-11": "md:col-span-11",
    "md:col-span-12": "md:col-span-12",

    "lg:col-span-1": "lg:col-span-1",
    "lg:col-span-2": "lg:col-span-2",
    "lg:col-span-3": "lg:col-span-3",
    "lg:col-span-4": "lg:col-span-4",
    "lg:col-span-5": "lg:col-span-5",
    "lg:col-span-6": "lg:col-span-6",
    "lg:col-span-7": "lg:col-span-7",
    "lg:col-span-8": "lg:col-span-8",
    "lg:col-span-9": "lg:col-span-9",
    "lg:col-span-10": "lg:col-span-10",
    "lg:col-span-11": "lg:col-span-11",
    "lg:col-span-12": "lg:col-span-12",

    "xl:col-span-1": "xl:col-span-1",
    "xl:col-span-2": "xl:col-span-2",
    "xl:col-span-3": "xl:col-span-3",
    "xl:col-span-4": "xl:col-span-4",
    "xl:col-span-5": "xl:col-span-5",
    "xl:col-span-6": "xl:col-span-6",
    "xl:col-span-7": "xl:col-span-7",
    "xl:col-span-8": "xl:col-span-8",
    "xl:col-span-9": "xl:col-span-9",
    "xl:col-span-10": "xl:col-span-10",
    "xl:col-span-11": "xl:col-span-11",
    "xl:col-span-12": "xl:col-span-12",

    "2xl:col-span-1": "2xl:col-span-1",
    "2xl:col-span-2": "2xl:col-span-2",
    "2xl:col-span-3": "2xl:col-span-3",
    "2xl:col-span-4": "2xl:col-span-4",
    "2xl:col-span-5": "2xl:col-span-5",
    "2xl:col-span-6": "2xl:col-span-6",
    "2xl:col-span-7": "2xl:col-span-7",
    "2xl:col-span-8": "2xl:col-span-8",
    "2xl:col-span-9": "2xl:col-span-9",
    "2xl:col-span-10": "2xl:col-span-10",
    "2xl:col-span-11": "2xl:col-span-11",
    "2xl:col-span-12": "2xl:col-span-12",

    // Row spans
    "row-span-1": "row-span-1",
    "row-span-2": "row-span-2",
    "row-span-3": "row-span-3",
    "row-span-4": "row-span-4",
    "row-span-5": "row-span-5",
    "row-span-6": "row-span-6",

    "sm:row-span-1": "sm:row-span-1",
    "sm:row-span-2": "sm:row-span-2",
    "sm:row-span-3": "sm:row-span-3",
    "sm:row-span-4": "sm:row-span-4",
    "sm:row-span-5": "sm:row-span-5",
    "sm:row-span-6": "sm:row-span-6",

    "md:row-span-1": "md:row-span-1",
    "md:row-span-2": "md:row-span-2",
    "md:row-span-3": "md:row-span-3",
    "md:row-span-4": "md:row-span-4",
    "md:row-span-5": "md:row-span-5",
    "md:row-span-6": "md:row-span-6",

    "lg:row-span-1": "lg:row-span-1",
    "lg:row-span-2": "lg:row-span-2",
    "lg:row-span-3": "lg:row-span-3",
    "lg:row-span-4": "lg:row-span-4",
    "lg:row-span-5": "lg:row-span-5",
    "lg:row-span-6": "lg:row-span-6",

    "xl:row-span-1": "xl:row-span-1",
    "xl:row-span-2": "xl:row-span-2",
    "xl:row-span-3": "xl:row-span-3",
    "xl:row-span-4": "xl:row-span-4",
    "xl:row-span-5": "xl:row-span-5",
    "xl:row-span-6": "xl:row-span-6",

    "2xl:row-span-1": "2xl:row-span-1",
    "2xl:row-span-2": "2xl:row-span-2",
    "2xl:row-span-3": "2xl:row-span-3",
    "2xl:row-span-4": "2xl:row-span-4",
    "2xl:row-span-5": "2xl:row-span-5",
    "2xl:row-span-6": "2xl:row-span-6",
  } as const;

  // Theme configurations
  const themeClasses = {
    default: "bg-background border border-border",
    minimal: "bg-transparent border-0 shadow-none",
    modern:
      "bg-gradient-to-br from-background to-muted/20 border border-border/50 backdrop-blur-sm",
    glassmorphism:
      "bg-background/80 backdrop-blur-md border border-white/20 shadow-xl",
  };

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave.enabled) return;

    const interval = setInterval(async () => {
      if (form.formState.isDirty) {
        setAutoSaveStatus("saving");
        try {
          const formData = form.getValues();
          if (autoSave.onSave) {
            await autoSave.onSave(formData);
          } else if (persistFormState) {
            localStorage.setItem(
              `form-state-${formId}`,
              JSON.stringify(formData)
            );
          }
          setAutoSaveStatus("saved");
          setTimeout(() => setAutoSaveStatus("idle"), 2000);
        } catch (error) {
          setAutoSaveStatus("error");
          setTimeout(() => setAutoSaveStatus("idle"), 3000);
        }
      }
    }, autoSave.interval || 30000);

    return () => clearInterval(interval);
  }, [autoSave, form, formId, persistFormState]);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;

    const currentData = form.getValues();
    const previousData = undoStack[undoStack.length - 1];

    setRedoStack((prev) => [...prev, currentData]);
    setUndoStack((prev) => prev.slice(0, -1));

    Object.keys(previousData).forEach((key) => {
      form.setValue(key, previousData[key]);
    });
  }, [undoStack, form]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;

    const currentData = form.getValues();
    const nextData = redoStack[redoStack.length - 1];

    setUndoStack((prev) => [...prev, currentData]);
    setRedoStack((prev) => prev.slice(0, -1));

    Object.keys(nextData).forEach((key) => {
      form.setValue(key, nextData[key]);
    });
  }, [redoStack, form]);

  // Load persisted form state
  useEffect(() => {
    if (persistFormState && typeof window !== "undefined") {
      const saved = localStorage.getItem(`form-state-${formId}`);
      if (saved) {
        try {
          const parsedState = JSON.parse(saved);
          Object.keys(parsedState).forEach((key) => {
            form.setValue(key, parsedState[key]);
          });
        } catch (error) {
          console.error("Failed to load form state:", error);
        }
      }
    }
  }, [persistFormState, formId, form]);

  // Save form state on change
  useEffect(() => {
    if (persistFormState && typeof window !== "undefined") {
      const subscription = form.watch((data: any) => {
        localStorage.setItem(`form-state-${formId}`, JSON.stringify(data));
      });
      return () => subscription.unsubscribe();
    }
  }, [persistFormState, formId, form]);

  // Get responsive classes with row span support
  const getGridClass = (field: FormField) => {
    const classes = ["w-full"];

    // Helper function to get grid class safely
    const getClass = (
      breakpoint: string,
      span: number,
      type: "col" | "row"
    ): string | null => {
      if (
        span < 1 ||
        (type === "col" && span > 12) ||
        (type === "row" && span > 6)
      )
        return null;

      const prefix = breakpoint === "xs" ? "" : `${breakpoint}:`;
      const key = `${prefix}${type}-span-${span}`;

      return gridClasses[key as keyof typeof gridClasses] || null;
    };

    // Add column classes
    if (field.xs) classes.push(getClass("xs", field.xs, "col") || "");
    if (field.sm) classes.push(getClass("sm", field.sm, "col") || "");
    if (field.md) classes.push(getClass("md", field.md, "col") || "");
    if (field.lg) classes.push(getClass("lg", field.lg, "col") || "");
    if (field.xl) classes.push(getClass("xl", field.xl, "col") || "");
    if (field.xxl) classes.push(getClass("2xl", field.xxl, "col") || "");

    // Add row classes
    if (field.rowXs) classes.push(getClass("xs", field.rowXs, "row") || "");
    if (field.rowSm) classes.push(getClass("sm", field.rowSm, "row") || "");
    if (field.rowMd) classes.push(getClass("md", field.rowMd, "row") || "");
    if (field.rowLg) classes.push(getClass("lg", field.rowLg, "row") || "");
    if (field.rowXl) classes.push(getClass("xl", field.rowXl, "row") || "");
    if (field.rowXxl) classes.push(getClass("2xl", field.rowXxl, "row") || "");

    // Default to full width if no responsive classes specified
    if (
      !field.xs &&
      !field.sm &&
      !field.md &&
      !field.lg &&
      !field.xl &&
      !field.xxl
    ) {
      classes.push("col-span-12");
    }

    // Add animations
    if (enableAnimations && field.animation) {
      const animationClasses = {
        slide: "transition-all duration-300 ease-in-out",
        fade: "transition-opacity duration-300 ease-in-out",
        scale: "transition-transform duration-300 ease-in-out hover:scale-105",
        bounce:
          "transition-transform duration-300 ease-in-out hover:animate-bounce",
      };
      classes.push(animationClasses[field.animation.type || "fade"]);
    }

    return cn(...classes.filter(Boolean), field.className);
  };

  // Check field dependencies
  const isFieldVisible = (field: FormField) => {
    if (!field.dependencies) return true;

    return field.dependencies.every((dep) => {
      const depValue = form.watch(dep.field);
      const condition = dep.condition || "equals";

      switch (condition) {
        case "equals":
          return depValue === dep.value;
        case "not_equals":
          return depValue !== dep.value;
        case "contains":
          return Array.isArray(depValue) ? depValue.includes(dep.value) : false;
        case "greater_than":
          return Number(depValue) > Number(dep.value);
        case "less_than":
          return Number(depValue) < Number(dep.value);
        default:
          return true;
      }
    });
  };

  // Apply input mask
  const applyMask = (value: string, mask: FieldMask): string => {
    if (!mask.pattern) return value;

    let maskedValue = "";
    let valueIndex = 0;

    for (let i = 0; i < mask.pattern.length && valueIndex < value.length; i++) {
      const patternChar = mask.pattern[i];
      const valueChar = value[valueIndex];

      if (patternChar === "9" && /\d/.test(valueChar)) {
        maskedValue += valueChar;
        valueIndex++;
      } else if (patternChar === "A" && /[A-Za-z]/.test(valueChar)) {
        maskedValue += valueChar;
        valueIndex++;
      } else if (patternChar === "*" && /[A-Za-z0-9]/.test(valueChar)) {
        maskedValue += valueChar;
        valueIndex++;
      } else if (!/[9A*]/.test(patternChar)) {
        maskedValue += patternChar;
      } else {
        valueIndex++;
      }
    }

    return maskedValue;
  };

  // Get field icon with enhanced logic
  const getFieldIcon = (field: FormField) => {
    if (field.icon) return field.icon;

    const iconMap = {
      email: <Mail className="w-4 h-4" />,
      password: <Eye className="w-4 h-4" />,
      tel: <Phone className="w-4 h-4" />,
      date: <Calendar className="w-4 h-4" />,
      textarea: <FileText className="w-4 h-4" />,
      file: <ImageIcon className="w-4 h-4" />,
      number: <Target className="w-4 h-4" />,
      range: <Slider className="w-4 h-4" />,
      switch: <Zap className="w-4 h-4" />,
      color: <Palette className="w-4 h-4" />,
      default: <span className="hidden"></span>,
    };

    return iconMap[field.type as keyof typeof iconMap] || iconMap.default;
  };

  // Clone field functionality
  const cloneField = (field: FormField) => {
    const cloneCount = clonedFields[field.name] || 0;
    const newFieldName = `${field.name}_clone_${cloneCount + 1}`;

    setClonedFields((prev) => ({
      ...prev,
      [field.name]: cloneCount + 1,
    }));

    // Add cloned field logic here
    console.log(`Cloning field: ${field.name} as ${newFieldName}`);
  };

  // Enhanced field rendering with new features
  const renderField = (field: FormField) => {
    if (!isFieldVisible(field)) return null;

    // Filter fields based on search
    if (
      enableSearch &&
      searchQuery &&
      !field.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !field.label?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return null;
    }

    return (
      <RHFField
        key={field.name}
        control={form.control as any}
        name={field.name}
        render={({ field: rf, fieldState }) => (
          <FormItem
            className={cn(
              "space-y-2 relative group",
              enableAnimations && "transition-all duration-200 ease-in-out",
              fieldState.error && "animate-pulse"
            )}
          >
            {field.label && field.type !== "checkbox" && (
              <FormLabel className="flex gap-2 items-center transition-colors group-hover:text-primary">
                {getFieldIcon(field)}
                <span className="truncate">{field.label}</span>
                {field.required && (
                  <p className="text-base text-red-500 animate-pulse">*</p>
                )}
                {fieldState.error && (
                  <AlertCircle className="w-4 h-4 animate-bounce text-destructive" />
                )}
                {!fieldState.error && rf.value && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                {field.cloneable && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="p-0 w-6 h-6 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => cloneField(field)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                )}
              </FormLabel>
            )}

            {field.description && (
              <FormDescription className="flex gap-1 items-center">
                <Info className="w-3 h-3" />
                {field.description}
              </FormDescription>
            )}

            {field.validationPreview && field.customValidation && (
              <div className="text-xs text-muted-foreground">
                <Shield className="inline mr-1 w-3 h-3" />
                Validation rules apply
              </div>
            )}

            <FormControl>
              {(() => {
                const baseInputProps = {
                  ...rf,
                  className: cn(
                    "transition-all duration-200 ease-in-out",
                    fieldState.error && "border-destructive animate-shake",
                    "focus:ring-2 focus:ring-primary/20",
                    field.conditionalStyle &&
                      fieldState.error &&
                      field.conditionalStyle.error,
                    field.conditionalStyle &&
                      !fieldState.error &&
                      rf.value &&
                      field.conditionalStyle.success
                  ),
                  onChange: (e: any) => {
                    let value = e.target ? e.target.value : e;

                    // Apply mask if specified
                    if (field.mask && typeof value === "string") {
                      value = applyMask(value, field.mask);
                    }

                    // Custom validation
                    if (field.customValidation) {
                      const error = field.customValidation(value);
                      if (error) {
                        form.setError(field.name, { message: error });
                      } else {
                        form.clearErrors(field.name);
                      }
                    }

                    rf.onChange(value);
                    onFieldChange?.(field.name, value);
                  },
                };

                switch (field.type) {
                  case "textarea":
                    return (
                      <Textarea
                        placeholder={field.placeholder}
                        disabled={field.disabled}
                        rows={field.rows || 3}
                        {...baseInputProps}
                        className={cn(field.className, "resize-none")}
                      />
                    );

                  case "select":
                    return (
                      <Select
                        value={form.watch(field.name) ?? ""} // ensure it's always defined
                        onValueChange={(value) => {
                          baseInputProps.onChange(value);
                          form.setValue(field.name, value);
                        }}
                        defaultValue={form.watch(field.name) ?? ""}
                        disabled={field.disabled}
                      >
                        <SelectTrigger
                          className={field.className + " w-full truncate"}
                        >
                          <SelectValue placeholder={field.placeholder} />
                        </SelectTrigger>
                        <SelectContent
                          style={{ zIndex: "50 !important" }}
                          className="w-full z-50"
                        >
                          {field.options?.map((opt) => (
                            <SelectItem
                              className={cn(
                                field.className,
                                "w-[90vw] md:w-full whitespace-pre-line z-50"
                              )}
                              key={opt.value.toString()}
                              value={opt.value.toString()}
                            >
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    );

                  case "checkbox":
                    return (
                      <div className="flex justify-between items-center p-3 rounded-md border transition-colors hover:bg-muted/50">
                        {field.label && (
                          <span className="text-sm font-medium">
                            {field.label}
                          </span>
                        )}
                        <CustomCheckbox
                          checked={!!rf.value}
                          disabled={field.disabled}
                          onCheckedChange={(checked) =>
                            baseInputProps.onChange(checked)
                          }
                        />
                      </div>
                    );

                  case "switch":
                    return (
                      <div className="flex justify-between items-center p-3 rounded-md border transition-colors hover:bg-muted/50">
                        {field.label && (
                          <span className="text-sm font-medium">
                            {field.label}
                          </span>
                        )}
                        <Switch
                          className={field.className}
                          checked={!!rf.value}
                          disabled={field.disabled}
                          onCheckedChange={(checked) =>
                            baseInputProps.onChange(checked)
                          }
                        />
                      </div>
                    );

                  case "range":
                    return (
                      <div className="space-y-2">
                        <Slider
                          value={[rf.value || field.min || 0]}
                          onValueChange={(values) =>
                            baseInputProps.onChange(values[0])
                          }
                          disabled={field.disabled}
                          min={field.min || 0}
                          max={field.max || 100}
                          step={field.step || 1}
                          className={cn(field.className, "w-full")}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{field.min || 0}</span>
                          <span className="font-medium">
                            {rf.value || field.min || 0}
                          </span>
                          <span>{field.max || 100}</span>
                        </div>
                      </div>
                    );

                  case "number":
                    return field.addonBefore || field.addonAfter ? (
                      <div className="flex w-full">
                        {field.addonBefore && (
                          <div className="flex justify-center items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                            {field.addonBefore}
                          </div>
                        )}
                        <Input
                          type="number"
                          min={field.min}
                          max={field.max}
                          maxLength={field.maxLength}
                          minLength={field.minLength}
                          step={field.step}
                          defaultValue={field.defaultValue}
                          placeholder={field.placeholder}
                          disabled={field.disabled}
                          {...baseInputProps}
                          onChange={(e) => {
                            const value = e.target.valueAsNumber; // Input qiymatini raqam sifatida olish
                            if (field.max !== undefined && value > field.max) {
                              e.target.value = field.max.toString(); // Agar qiymat max dan katta bo'lsa, max ga tenglashtirish
                            } else if (
                              field.min !== undefined &&
                              value < field.min
                            ) {
                              e.target.value = field.min.toString(); // Agar qiymat min dan kichik bo'lsa, min ga tenglashtirish
                            }
                          }}
                          className={cn(
                            field.className,
                            "w-full",
                            field.addonBefore && "rounded-l-none",
                            field.addonAfter && "rounded-r-none"
                          )}
                        />
                        {field.addonAfter && (
                          <div className="flex justify-center items-center px-3 rounded-r-md border border-l-0 border-input bg-muted text-muted-foreground">
                            {field.addonAfter}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Input
                        type="number"
                        min={field.min}
                        max={field.max}
                        maxLength={field.maxLength}
                        minLength={field.minLength}
                        step={field.step}
                        defaultValue={field.defaultValue}
                        placeholder={field.placeholder}
                        disabled={field.disabled}
                        {...baseInputProps}
                        onChange={(e) => {
                          const value = e.target.valueAsNumber;
                          if (field.max !== undefined && value > field.max) {
                            e.target.value = field.max.toString();
                          } else if (
                            field.min !== undefined &&
                            value < field.min
                          ) {
                            e.target.value = field.min.toString();
                          }
                        }}
                        className={cn(field.className, "w-full")}
                      />
                    );

                  case "password":
                    return (
                      <div className="relative">
                        <Input
                          type={
                            showPasswords.has(field.name) ? "text" : "password"
                          }
                          defaultValue={field.defaultValue}
                          placeholder={field.placeholder}
                          disabled={field.disabled}
                          {...baseInputProps}
                          className={cn(field.className, "pr-10")}
                        />
                        {field.showPasswordToggle !== false && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute top-0 right-0 px-3 py-2 h-full hover:bg-transparent"
                            onClick={() => {
                              setShowPasswords((prev) => {
                                const newSet = new Set(prev);
                                if (newSet.has(field.name)) {
                                  newSet.delete(field.name);
                                } else {
                                  newSet.add(field.name);
                                }
                                return newSet;
                              });
                            }}
                          >
                            {showPasswords.has(field.name) ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    );

                  case "file":
                    return (
                      <FancyFileInput
                        accept={field.accept}
                        multiple={field.fileMultiple}
                        fileType={field.fileType}
                        value={rf.value}
                        onChange={(value) => baseInputProps.onChange(value)}
                        label={field.label?.toString() || "Choose file"}
                        disabled={field.disabled}
                      />
                    );

                  case "color":
                    return (
                      <div className="flex gap-2 items-center">
                        <Input
                          type="color"
                          value={rf.value || "#000000"}
                          disabled={field.disabled}
                          defaultValue={field.defaultValue}
                          onChange={(e) =>
                            baseInputProps.onChange(e.target.value)
                          }
                          className="p-1 w-16 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          disabled={field.disabled}
                          defaultValue={field.defaultValue}
                          onChange={(e) =>
                            baseInputProps.onChange(e.target.value)
                          }
                          placeholder="#000000"
                          className={cn(field.className, "flex-1")}
                        />
                      </div>
                    );

                  case "date":
                    return (
                      <Input
                        type="date"
                        disabled={field.disabled}
                        defaultValue={field.defaultValue}
                        {...baseInputProps}
                        className={cn(field.className)}
                      />
                    );

                  case "email":
                    return field.addonBefore || field.addonAfter ? (
                      <div className="flex">
                        {field.addonBefore && (
                          <div className="flex justify-center items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                            {field.addonBefore}
                          </div>
                        )}
                        <Input
                          type="email"
                          defaultValue={field.defaultValue}
                          disabled={field.disabled}
                          placeholder={field.placeholder}
                          autoComplete={field.autoComplete || "email"}
                          {...baseInputProps}
                          className={cn(
                            field.className,
                            field.addonBefore && "rounded-l-none",
                            field.addonAfter && "rounded-r-none"
                          )}
                        />
                        {field.addonAfter && (
                          <div className="flex justify-center items-center px-3 rounded-r-md border border-l-0 border-input bg-muted text-muted-foreground">
                            {field.addonAfter}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Input
                        type="email"
                        defaultValue={field.defaultValue}
                        disabled={field.disabled}
                        placeholder={field.placeholder}
                        autoComplete={field.autoComplete || "email"}
                        {...baseInputProps}
                        className={cn(field.className)}
                      />
                    );

                  case "tel":
                    return field.addonBefore || field.addonAfter ? (
                      <div className="flex">
                        {field.addonBefore && (
                          <div className="flex justify-center items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                            {field.addonBefore}
                          </div>
                        )}
                        <Input
                          type="tel"
                          defaultValue={field.defaultValue}
                          disabled={field.disabled}
                          placeholder={field.placeholder}
                          autoComplete={field.autoComplete || "tel"}
                          {...baseInputProps}
                          className={cn(
                            field.className,
                            field.addonBefore && "rounded-l-none",
                            field.addonAfter && "rounded-r-none"
                          )}
                        />
                        {field.addonAfter && (
                          <div className="flex justify-center items-center px-3 rounded-r-md border border-l-0 border-input bg-muted text-muted-foreground">
                            {field.addonAfter}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Input
                        type="tel"
                        defaultValue={field.defaultValue}
                        disabled={field.disabled}
                        placeholder={field.placeholder}
                        autoComplete={field.autoComplete || "tel"}
                        {...baseInputProps}
                        className={cn(field.className)}
                      />
                    );

                  default:
                    return field.addonBefore || field.addonAfter ? (
                      <div className="flex">
                        {field.addonBefore && (
                          <div className="flex justify-center items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                            {field.addonBefore}
                          </div>
                        )}
                        <Input
                          defaultValue={field.defaultValue}
                          disabled={field.disabled}
                          placeholder={field.placeholder}
                          readOnly={field.readOnly}
                          autoComplete={field.autoComplete}
                          {...baseInputProps}
                          className={cn(
                            field.className,
                            field.addonBefore && "rounded-l-none",
                            field.addonAfter && "rounded-r-none"
                          )}
                        />
                        {field.addonAfter && (
                          <div className="flex justify-center items-center px-3 rounded-r-md border border-l-0 border-input bg-muted text-muted-foreground">
                            {field.addonAfter}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Input
                        disabled={field.disabled}
                        placeholder={field.placeholder}
                        readOnly={field.readOnly}
                        autoComplete={field.autoComplete}
                        {...baseInputProps}
                        className={cn(field.className)}
                      />
                    );
                }
              })()}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  // Calculate form progress
  const calculateProgress = () => {
    if (!showProgress) return 0;

    const totalFields = fields.length;
    const filledFields = fields.filter((field) => {
      const value = form.watch(field.name);
      return value !== undefined && value !== "" && value !== null;
    }).length;

    return Math.round((filledFields / totalFields) * 100);
  };

  // Multi-step form navigation
  const nextStep = () => {
    if (steps && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Get current step fields
  const getCurrentStepFields = () => {
    if (!steps) return fields;

    const currentStepData = steps[currentStep];
    return fields.filter((field) =>
      currentStepData.fields.includes(field.name)
    );
  };

  // Auto-save indicator
  const renderAutoSaveIndicator = () => {
    if (!autoSave.enabled || !autoSave.showIndicator) return null;

    const statusConfig = {
      idle: {
        icon: <Clock className="w-3 h-3" />,
        text: "Auto-save enabled",
        color: "text-muted-foreground",
      },
      saving: {
        icon: <Timer className="w-3 h-3 animate-spin" />,
        text: "Saving...",
        color: "text-blue-500",
      },
      saved: {
        icon: <CheckCircle className="w-3 h-3" />,
        text: "Saved",
        color: "text-green-500",
      },
      error: {
        icon: <AlertCircle className="w-3 h-3" />,
        text: "Save failed",
        color: "text-red-500",
      },
    };

    const config = statusConfig[autoSaveStatus];

    return (
      <div className={cn("flex items-center gap-1 text-xs", config.color)}>
        {config.icon}
        {config.text}
      </div>
    );
  };

  // Render form content with enhanced features
  const renderFormContent = () => {
    const fieldsToRender = steps ? getCurrentStepFields() : fields;

    if (groups && groups.length > 0) {
      return groups.map((group) => {
        const groupFields = fieldsToRender.filter(
          (field) =>
            group.fields.includes(field.name) || field.group === group.title
        );

        if (groupFields.length === 0) return null;

        const isCollapsed = collapsedGroups.has(group.title);

        return (
          <Card
            key={group.title}
            className={cn("col-span-12", themeClasses[theme])}
          >
            <CardHeader
              className={cn(
                "cursor-pointer transition-all duration-200",
                group.collapsible && "hover:bg-muted/50",
                enableAnimations && "hover:scale-[1.02]"
              )}
              onClick={() => {
                if (group.collapsible) {
                  setCollapsedGroups((prev) => {
                    const newSet = new Set(prev);
                    if (newSet.has(group.title)) {
                      newSet.delete(group.title);
                    } else {
                      newSet.add(group.title);
                    }
                    return newSet;
                  });
                }
              }}
            >
              <CardTitle className="flex justify-between items-center">
                <span className="flex gap-2 items-center">
                  <Sparkles className="w-5 h-5" />
                  {group.title}
                </span>
                {group.collapsible && (
                  <Button variant="ghost" size="sm">
                    {isCollapsed ? "Show" : "Hide"}
                  </Button>
                )}
              </CardTitle>
              {group.description && (
                <p className="text-sm text-muted-foreground">
                  {group.description}
                </p>
              )}
            </CardHeader>

            {!isCollapsed && (
              <CardContent>
                <div className="grid grid-cols-12 auto-rows-min gap-4">
                  {groupFields.map((field) => (
                    <div key={field.name} className={getGridClass(field)}>
                      {renderField(field)}
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        );
      });
    }

    return fieldsToRender.map((field) => (
      <div key={field.name} className={getGridClass(field)}>
        {renderField(field)}
      </div>
    ));
  };

  return (
    <div className="space-y-6" id={formId}>
      {/* Header with progress and controls */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          {showProgress && (
            <div className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span>Form Progress</span>
                <span>{calculateProgress()}%</span>
              </div>
              <Progress value={calculateProgress()} className="w-64" />
            </div>
          )}

          {steps && (
            <div className="flex gap-2 items-center text-sm text-muted-foreground">
              <span>
                Step {currentStep + 1} of {steps.length}
              </span>
              <span>•</span>
              <span>{steps[currentStep]?.title}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 items-center">
          {renderAutoSaveIndicator()}

          {enableSearch && (
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search fields..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-48"
              />
            </div>
          )}

          {enableUndo && (
            <div className="flex gap-1 items-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={undo}
                disabled={undoStack.length === 0}
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={redo}
                disabled={redoStack.length === 0}
              >
                <Redo className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main form */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn(
            "grid grid-cols-12 auto-rows-min gap-4",
            themeClasses[theme],
            "p-6 rounded-lg",
            className
          )}
        >
          {renderFormContent()}

          {/* Form actions */}
          {footer && (
            <div className="col-span-12">
              <Separator className="my-4" />
              <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                  {steps && currentStep > 0 && (
                    <Button type="button" variant="outline" onClick={prevStep}>
                      <ChevronLeft className="mr-2 w-4 h-4" />
                      Previous
                    </Button>
                  )}
                </div>

                <div className="flex gap-2 items-center">
                  {showResetButton && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        form.reset();
                        if (persistFormState && typeof window !== "undefined") {
                          localStorage.removeItem(`form-state-${formId}`);
                        }
                      }}
                      disabled={loading}
                    >
                      <X className="mr-2 w-4 h-4" />
                      {resetText || "Reset"}
                    </Button>
                  )}

                  {showSaveButton && persistFormState && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        if (persistFormState && typeof window !== "undefined") {
                          const formData = form.getValues();
                          localStorage.setItem(
                            `form-state-${formId}`,
                            JSON.stringify(formData)
                          );
                        }
                      }}
                      disabled={loading || disabled}
                    >
                      <Save className="mr-2 w-4 h-4" />
                      Save Draft
                    </Button>
                  )}

                  {steps && currentStep < steps.length - 1 ? (
                    <Button type="button" onClick={nextStep}>
                      Next
                      <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                  ) : showSaveButton ? (
                    <Button type="submit" disabled={loading || disabled}>
                      {loading && (
                        <Clock className="mr-2 w-4 h-4 animate-spin" />
                      )}
                      {submitText}
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};
