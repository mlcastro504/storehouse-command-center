import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreatePutAwayRule, useUpdatePutAwayRule } from '@/hooks/usePutAway';
import { PutAwayRule } from '@/types/putaway';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Trash2 } from 'lucide-react';

const conditionSchema = z.object({
  field: z.string().min(1),
  operator: z.enum(['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'in']),
  value: z.string().min(1),
});

const ruleSchema = z.object({
  rule_name: z.string().min(3, 'Rule name must be at least 3 characters'),
  description: z.string().optional(),
  priority: z.coerce.number().int().min(1, 'Priority must be at least 1'),
  is_active: z.boolean(),
  conditions: z.array(conditionSchema).min(1, 'At least one condition is required'),
  location_preference: z.enum(['ground_level', 'upper_shelf', 'cold_zone', 'dry_zone', 'any']),
});

type RuleFormData = z.infer<typeof ruleSchema>;

interface CreateOrEditRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule?: PutAwayRule;
}

export const CreateOrEditRuleDialog = ({ open, onOpenChange, rule }: CreateOrEditRuleDialogProps) => {
  const { t } = useTranslation('putaway');
  const createRule = useCreatePutAwayRule();
  const updateRule = useUpdatePutAwayRule();

  const form = useForm<RuleFormData>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      rule_name: '',
      description: '',
      priority: 10,
      is_active: true,
      conditions: [],
      location_preference: 'any',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'conditions',
  });

  useEffect(() => {
    if (rule) {
      form.reset({
        ...rule,
        conditions: rule.conditions.map(c => ({...c, value: String(c.value) }))
      });
    } else {
      form.reset({
        rule_name: '',
        description: '',
        priority: 10,
        is_active: true,
        conditions: [],
        location_preference: 'any',
      });
    }
  }, [rule, open, form]);

  const onSubmit = async (data: RuleFormData) => {
    try {
      const transformedData = {
        ...data,
        conditions: data.conditions.map(c => {
          const isNumericField = ['weight', 'expiry_date_soon'].includes(c.field);
          const numericValue = parseFloat(c.value);
          return {
            ...c,
            value: isNumericField && !isNaN(numericValue) ? numericValue : c.value,
          };
        }),
      };

      if (rule) {
        await updateRule.mutateAsync({ ...rule, ...transformedData });
      } else {
        await createRule.mutateAsync(transformedData);
      }
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the hook's onError callback
    }
  };

  const isPending = createRule.isPending || updateRule.isPending;

  const conditionFields = ['product_category', 'weight', 'special_requirement', 'expiry_date_soon'];
  const operators = ['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'in'];
  const locationPreferences = ['ground_level', 'upper_shelf', 'cold_zone', 'dry_zone', 'any'];


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {rule ? t('rules.edit_rule_title') : t('rules.create_rule_title')}
          </DialogTitle>
          <DialogDescription>{t('rules.subtitle_desc')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <FormField
                control={form.control}
                name="rule_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('rules.field_rule_name')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('rules.field_rule_name_placeholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('rules.field_description')}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t('rules.field_description_placeholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('rules.field_priority')}</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>{t('rules.field_priority_desc')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="location_preference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('rules.suggested_location')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a location type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locationPreferences.map(pref => (
                            <SelectItem key={pref} value={pref}>
                              {t(`rules.location_preferences.${pref}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>{t('rules.field_active')}</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div>
                <h4 className="text-sm font-medium mb-2">{t('rules.conditions')}</h4>
                <div className="space-y-4">
                  {fields.map((item, index) => (
                    <div key={item.id} className="flex items-start gap-2 p-3 border rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-grow">
                        <FormField
                          control={form.control}
                          name={`conditions.${index}.field`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">{t('rules.field_condition_field')}</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {conditionFields.map(f => (
                                    <SelectItem key={f} value={f}>{t(`rules.condition_fields.${f}`)}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`conditions.${index}.operator`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">{t('rules.field_condition_operator')}</FormLabel>
                               <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {operators.map(op => (
                                    <SelectItem key={op} value={op}>{t(`rules.operators.${op}`)}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`conditions.${index}.value`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">{t('rules.field_condition_value')}</FormLabel>
                              <FormControl><Input {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mt-6"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ field: 'product_category', operator: 'equals', value: '' })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t('rules.add_condition_button')}
                  </Button>
                </div>
              </div>

            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                {t('cancelDialog.close_button')}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? t('rules.saving_button') : (rule ? t('rules.save_changes_button') : t('rules.create_button'))}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
