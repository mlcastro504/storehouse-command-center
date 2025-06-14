import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName
}

// Set context defaults to undefined for strict use
const FormFieldContext = React.createContext<FormFieldContextValue | undefined>(undefined);
const FormItemContext = React.createContext<{ id: string } | undefined>(undefined);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const form = useFormContext?.(); // Defensive for SSR or out-of-form rendering

  // Check for fieldContext
  if (!fieldContext) {
    throw new Error("useFormField must be used within a <FormField>.");
  }
  // Check for form context
  if (!form) {
    throw new Error("useFormField must be used within a form context.");
  }
  const { getFieldState, formState } = form;

  // Defensive id fallback if itemContext or id missing
  const id = !!itemContext && typeof itemContext.id === "string"
    ? itemContext.id
    : "form-item-missing";

  const fieldState = getFieldState
    ? getFieldState(fieldContext.name, formState)
    : {};

  // Always include error in return value for compatibility
  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    error: fieldState?.error, // ensure error always present, possibly undefined
    ...fieldState,
  };
};

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId();
  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  )
});
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  let error, formItemId;
  try {
    const context = useFormField();
    error = context.error;
    formItemId = context.formItemId;
  } catch (err) {
    // If used out of context, fallback so it doesn't crash everything else
    error = undefined;
    formItemId = undefined;
  }

  return (
    <Label
      ref={ref}
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  let error, formItemId, formDescriptionId, formMessageId;
  try {
    const context = useFormField();
    error = context.error;
    formItemId = context.formItemId;
    formDescriptionId = context.formDescriptionId;
    formMessageId = context.formMessageId;
  } catch (err) {
    error = undefined;
    formItemId = undefined;
    formDescriptionId = undefined;
    formMessageId = undefined;
  }

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId || ""}`
          : `${formDescriptionId || ""} ${formMessageId || ""}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  let formDescriptionId;
  try {
    const context = useFormField();
    formDescriptionId = context.formDescriptionId;
  } catch (err) {
    formDescriptionId = undefined;
  }
  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
});
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  let error, formMessageId;
  try {
    const context = useFormField();
    error = context.error;
    formMessageId = context.formMessageId;
  } catch (err) {
    error = undefined;
    formMessageId = undefined;
  }
  const body = error ? String(error?.message) : children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  )
});
FormMessage.displayName = "FormMessage";

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
