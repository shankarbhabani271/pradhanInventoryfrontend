import { toNestErrors, validateFieldsNatively } from "@hookform/resolvers";
import {
  appendErrors,
  type FieldError,
  type FieldErrors,
  type FieldValues,
  type Resolver,
  useForm,
  type UseFormProps,
  type UseFormReturn,
} from "react-hook-form";
import { z } from "zod";

export type ZodResolverOptions = {
  mode?: "async" | "sync";
  raw?: boolean;
};

const parseIssues = (
  issues: z.ZodIssue[],
  validateAllFieldCriteria: boolean,
) => {
  const errors: Record<string, FieldError> = {};
  const queue = [...issues];

  while (queue.length > 0) {
    const issue = queue[0];
    const path = issue.path.join(".") || "root";

    if (!errors[path]) {
      if (issue.code === "invalid_union" && "errors" in issue) {
        const firstUnionIssue = issue.errors?.[0]?.[0];

        errors[path] = {
          message: firstUnionIssue?.message ?? issue.message,
          type: firstUnionIssue?.code ?? issue.code,
        };
      } else {
        errors[path] = {
          message: issue.message,
          type: issue.code,
        };
      }
    }

    if (issue.code === "invalid_union" && "errors" in issue) {
      issue.errors.forEach((unionIssues) => {
        unionIssues.forEach((unionIssue) => {
          queue.push(unionIssue);
        });
      });
    }

    if (validateAllFieldCriteria) {
      const types = errors[path].types;
      const messages = types?.[issue.code];

      errors[path] = appendErrors(
        path,
        validateAllFieldCriteria,
        errors,
        issue.code,
        messages
          ? ([] as string[]).concat(messages as string | string[], issue.message)
          : issue.message,
      ) as FieldError;
    }

    queue.shift();
  }

  return errors;
};

export function zodResolver<TFieldValues extends FieldValues>(
  schema: z.ZodTypeAny,
  schemaOptions?: unknown,
  resolverOptions: ZodResolverOptions = {},
): Resolver<TFieldValues> {
  return async (values, _, options) => {
    try {
      const parser =
        resolverOptions.mode === "sync" ? schema.parse : schema.parseAsync;
      const result = await parser.call(schema, values, schemaOptions as never);

      if (options.shouldUseNativeValidation) {
        validateFieldsNatively({}, options);
      }

      return {
        errors: {},
        values: resolverOptions.raw ? values : (result as TFieldValues),
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = toNestErrors(
          parseIssues(
            error.issues,
            !options.shouldUseNativeValidation &&
              options.criteriaMode === "all",
          ) as FieldErrors,
          options,
        );

        return {
          values: {},
          errors: fieldErrors,
        };
      }

      throw error;
    }
  };
}

type UseZodFormProps<
  TFieldValues extends FieldValues,
  TContext
> = Omit<UseFormProps<TFieldValues, TContext>, "resolver"> & {
  schemaOptions?: unknown;
  resolverOptions?: ZodResolverOptions;
};

export function useZodForm<
  TFieldValues extends FieldValues,
  TContext = unknown,
  TTransformedValues extends FieldValues | undefined = TFieldValues,
>(
  schema: z.ZodTypeAny,
  options: UseZodFormProps<TFieldValues, TContext> = {},
): UseFormReturn<TFieldValues, TContext, TTransformedValues> {
  const {
    schemaOptions,
    resolverOptions,
    mode = "all",
    reValidateMode = "onChange",
    ...formOptions
  } = options;

  return useForm<TFieldValues, TContext, TTransformedValues>({
    ...formOptions,
    mode,
    reValidateMode,
    resolver: zodResolver(schema, schemaOptions, resolverOptions),
  });
}