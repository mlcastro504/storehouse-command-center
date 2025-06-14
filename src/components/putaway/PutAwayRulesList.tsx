
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePutAwayRules, useDeletePutAwayRule } from '@/hooks/usePutAway';
import { PutAwayRule } from '@/types/putaway';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, Plus, Eye, Trash2, AlertCircle, Cog } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CreateOrEditRuleDialog } from './CreateOrEditRuleDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export const PutAwayRulesList = () => {
  const { t } = useTranslation('putaway');
  const { data: rules, isLoading, error } = usePutAwayRules();
  const deleteRuleMutation = useDeletePutAwayRule();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<PutAwayRule | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<PutAwayRule | undefined>(undefined);

  const handleCreate = () => {
    setSelectedRule(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (rule: PutAwayRule) => {
    setSelectedRule(rule);
    setIsDialogOpen(true);
  };
  
  const handleDelete = (rule: PutAwayRule) => {
    setRuleToDelete(rule);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (ruleToDelete) {
      deleteRuleMutation.mutate(ruleToDelete.id);
      setIsDeleteDialogOpen(false);
      setRuleToDelete(undefined);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t('common:error')}</AlertTitle>
        <AlertDescription>{t('rules.error')}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{t('rules.subtitle')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('rules.subtitle_desc')}
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          {t('rules.new_rule_button')}
        </Button>
      </div>

      {rules && rules.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {rules.sort((a,b) => a.priority - b.priority).map((rule) => (
            <Card key={rule.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{rule.rule_name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {rule.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="outline">{t('rules.priority')} {rule.priority}</Badge>
                    {rule.is_active ? (
                      <Badge variant="default">{t('rules.status_active')}</Badge>
                    ) : (
                      <Badge variant="secondary">{t('rules.status_inactive')}</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium mb-2">{t('rules.conditions')}:</h4>
                    <div className="flex flex-wrap gap-1">
                      {rule.conditions.map((condition, index) => (
                        <Badge key={index} variant="outline" className="text-xs font-normal">
                          {t(`rules.condition_fields.${condition.field}`)} {t(`rules.operators.${condition.operator}`)} {condition.value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">{t('rules.suggested_location')}:</h4>
                    <Badge variant="secondary">{t(`rules.location_preferences.${rule.location_preference}`)}</Badge>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(rule)}>
                      <Eye className="h-4 w-4 mr-1" />
                      {t('rules.view_details_button')}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(rule)}>
                      <Settings className="h-4 w-4 mr-1" />
                      {t('rules.edit_button')}
                    </Button>
                     <Button size="sm" variant="destructive" onClick={() => handleDelete(rule)}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      {t('rules.delete_button')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg">
          <Cog className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold">{t('rules.no_rules_title')}</h3>
          <p className="text-sm">{t('rules.no_rules_description')}</p>
          <Button onClick={handleCreate} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            {t('rules.new_rule_button')}
          </Button>
        </div>
      )}

      <CreateOrEditRuleDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        rule={selectedRule}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('rules.delete_confirm_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('rules.delete_confirm_text', { ruleName: ruleToDelete?.rule_name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancelDialog.close_button')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleteRuleMutation.isPending}>
              {t('delete_button', 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};
